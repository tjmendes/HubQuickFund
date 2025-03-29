/**
 * Script para configuração do banco de dados Aurora
 * Este arquivo configura a conexão com o banco de dados Aurora
 * e cria as tabelas necessárias para o funcionamento do sistema
 */

const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Configurações do banco de dados Aurora para ambiente de produção
const dbConfig = {
  host: process.env.DB_HOST || 'quickfundhub-production.cluster-xyz.us-east-1.rds.amazonaws.com',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'quickfundhub_production',
  user: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 100, // Aumentado para suportar mais conexões simultâneas em produção
  queueLimit: 50, // Configurado para enfileirar até 50 conexões
  connectTimeout: 60000, // Timeout de conexão aumentado para 60 segundos
  acquireTimeout: 60000, // Timeout de aquisição aumentado para 60 segundos
  timeout: 60000, // Timeout geral aumentado para 60 segundos
  enableKeepAlive: true, // Manter conexões ativas
  keepAliveInitialDelay: 10000 // Delay inicial para keep-alive de 10 segundos
};

/**
 * Função para criar conexão com o banco de dados
 */
async function createConnection() {
  try {
    console.log('Conectando ao banco de dados Aurora...');
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });
    
    console.log('Conexão estabelecida com sucesso!');
    return connection;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    throw error;
  }
}

/**
 * Função para criar o banco de dados se não existir
 */
async function createDatabase(connection) {
  try {
    console.log(`Criando banco de dados '${dbConfig.database}' se não existir...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);
    console.log(`Banco de dados '${dbConfig.database}' selecionado com sucesso!`);
  } catch (error) {
    console.error('Erro ao criar banco de dados:', error);
    throw error;
  }
}

/**
 * Função para criar tabelas necessárias
 */
async function createTables(connection) {
  try {
    console.log('Criando tabelas necessárias...');
    
    // Tabela de usuários
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de operações
    await connection.query(`
      CREATE TABLE IF NOT EXISTS operations (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        type VARCHAR(50) NOT NULL,
        exchange VARCHAR(50) NOT NULL,
        amount DECIMAL(20, 8) NOT NULL,
        profit DECIMAL(20, 8) NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Tabela de lucros
    await connection.query(`
      CREATE TABLE IF NOT EXISTS profits (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        operation_id VARCHAR(36) NOT NULL,
        amount DECIMAL(20, 8) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (operation_id) REFERENCES operations(id)
      )
    `);
    
    // Tabela de configurações de usuário
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        user_id VARCHAR(36) PRIMARY KEY,
        mobile_data_limit INT DEFAULT 20480,
        notification_enabled BOOLEAN DEFAULT TRUE,
        auto_optimization_enabled BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    console.log('Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    throw error;
  }
}

/**
 * Função principal para configurar o banco de dados
 */
async function setupDatabase() {
  let connection;
  
  try {
    // Criar conexão
    connection = await createConnection();
    
    // Criar banco de dados
    await createDatabase(connection);
    
    // Criar tabelas
    await createTables(connection);
    
    console.log('Configuração do banco de dados Aurora concluída com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro durante a configuração do banco de dados:', error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexão com o banco de dados encerrada.');
    }
  }
}

// Exportar funções
module.exports = {
  setupDatabase,
  createConnection,
  dbConfig
};

// Se este arquivo for executado diretamente
if (require.main === module) {
  setupDatabase()
    .then(success => {
      if (success) {
        console.log('Script de configuração do banco de dados executado com sucesso!');
        process.exit(0);
      } else {
        console.error('Falha ao executar script de configuração do banco de dados!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Erro não tratado:', error);
      process.exit(1);
    });
}