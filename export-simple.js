/**
 * Script simplificado para exportar o projeto QuickFundHub para ambiente de produção
 * Este script prepara o projeto para ser enviado ao repositório GitHub
 */

import fs from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configurações do repositório
const REPO_URL = 'https://github.com/tjmendes/quickai.git';
// Usar HTTPS com token de acesso pessoal para autenticação automática
// Formato: https://<TOKEN>@github.com/usuario/repositorio.git
const REPO_URL_WITH_TOKEN = process.env.GITHUB_TOKEN ? 
  `https://${process.env.GITHUB_TOKEN}@github.com/tjmendes/quickai.git` : 
  REPO_URL;

// Função principal
async function exportSimple() {
  try {
    console.log('Iniciando exportação simplificada do QuickFundHub para ambiente de produção...');
    
    // Passo 1: Verificar dependências
    console.log('\nVerificando dependências...');
    checkDependencies();
    
    // Passo 2: Executar build de produção
    console.log('\nExecutando build de produção...');
    buildForProduction();
    
    // Passo 3: Exportar para GitHub
    console.log('\nExportando para GitHub...');
    exportToGitHub();
    
    console.log('\n===== EXPORTAÇÃO CONCLUÍDA COM SUCESSO =====');
    console.log(`O projeto QuickFundHub foi exportado para ${REPO_URL}`);
    console.log('O sistema está pronto para execução em produção.');
    
    return true;
  } catch (error) {
    console.error('Erro durante a exportação:', error);
    return false;
  }
}

/**
 * Verificar dependências necessárias
 */
function checkDependencies() {
  try {
    // Verificar se o Git está instalado
    execSync('git --version', { stdio: 'ignore' });
    console.log('✓ Git instalado');
    
    // Verificar se o Node.js está instalado
    execSync('node --version', { stdio: 'ignore' });
    console.log('✓ Node.js instalado');
    
    // Verificar se o npm está instalado
    execSync('npm --version', { stdio: 'ignore' });
    console.log('✓ npm instalado');
    
    // Verificar dependências do projeto
    console.log('Atualizando dependências do projeto...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✓ Dependências do projeto atualizadas');
  } catch (error) {
    console.error('Erro ao verificar dependências:', error);
    throw new Error('Falha ao verificar dependências necessárias');
  }
}

/**
 * Executar build de produção
 */
function buildForProduction() {
  try {
    // Executar build de produção
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✓ Build de produção concluído');
  } catch (error) {
    console.error('Erro ao executar build de produção:', error);
    throw new Error('Falha ao executar build de produção');
  }
}

/**
 * Exportar para GitHub
 */
function exportToGitHub() {
  try {
    // Verificar se o diretório .git existe
    if (!fs.existsSync('.git')) {
      // Inicializar repositório Git
      execSync('git init', { stdio: 'inherit' });
      console.log('✓ Repositório Git inicializado');
      
      // Adicionar remote com URL que inclui token (se disponível)
      execSync(`git remote add origin ${REPO_URL_WITH_TOKEN}`, { stdio: 'inherit' });
      console.log(`✓ Remote adicionado: ${REPO_URL}`);
    } else {
      console.log('✓ Repositório Git já inicializado');
      
      // Verificar se o remote já existe
      try {
        execSync('git remote get-url origin', { stdio: 'ignore' });
      } catch (e) {
        // Se o remote não existir, adicionar
        execSync(`git remote add origin ${REPO_URL_WITH_TOKEN}`, { stdio: 'inherit' });
        console.log(`✓ Remote adicionado: ${REPO_URL}`);
      }
      
      // Atualizar URL do remote se necessário
      execSync(`git remote set-url origin ${REPO_URL_WITH_TOKEN}`, { stdio: 'inherit' });
      console.log(`✓ URL do remote atualizada: ${REPO_URL}`);
    }
    
    // Configurar credenciais para HTTPS (evita pedir senha)
    console.log('Configurando credenciais para HTTPS...');
    try {
      // Configurar para armazenar credenciais
      execSync('git config --global credential.helper store', { stdio: 'inherit' });
      console.log('✓ Configuração de armazenamento de credenciais ativada');
    } catch (credError) {
      console.warn('Aviso: Não foi possível configurar o armazenamento de credenciais');
    }
    
    // Adicionar todos os arquivos
    execSync('git add .', { stdio: 'inherit' });
    console.log('✓ Arquivos adicionados ao stage');
    
    // Commit
    try {
      execSync('git commit -m "Exportação para produção"', { stdio: 'inherit' });
      console.log('✓ Commit realizado');
    } catch (commitError) {
      // Se não houver alterações para commit
      if (commitError.message.includes('nothing to commit')) {
        console.log('✓ Nenhuma alteração para commit');
      } else {
        // Configurar usuário e email se necessário
        try {
          execSync('git config --global user.email "tjmendes@gmail.com"', { stdio: 'inherit' });
          execSync('git config --global user.name "Tiago Mendes"', { stdio: 'inherit' });
          console.log('✓ Configurações de usuário Git definidas');
          
          // Tentar commit novamente
          execSync('git commit -m "Exportação para produção"', { stdio: 'inherit' });
          console.log('✓ Commit realizado após configuração de usuário');
        } catch (e) {
          throw commitError;
        }
      }
    }
    
    // Push
    console.log('Enviando para GitHub...');
    try {
      // Tentar push para master
      execSync('git push -u origin master', { stdio: 'inherit' });
    } catch (pushError) {
      // Se falhar, tentar com main (nome padrão mais recente para branch principal)
      console.log('Tentando branch main em vez de master...');
      try {
        execSync('git branch -M main', { stdio: 'inherit' });
        execSync('git push -u origin main', { stdio: 'inherit' });
      } catch (mainPushError) {
        // Se ainda falhar, tentar forçar o push
        console.log('Tentando push com força...');
        execSync('git push -u origin master --force', { stdio: 'inherit' });
      }
    }
    console.log('✓ Push realizado com sucesso');
    
    return true;
  } catch (error) {
    console.error('Erro ao exportar para GitHub:', error);
    throw new Error('Falha ao exportar para GitHub');
  }
}

// Executar função principal
exportSimple();