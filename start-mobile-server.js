500/**
 * Script para iniciar o servidor dedicado para dispositivos móveis
 * Este arquivo inicia o servidor que gerencia as operações contínuas
 * e otimização constante para smartphones
 */

const { mobileServerConfig, startMobileServer, optimizePerformance, monitorDataUsage } = require('./mobile-server-config');
const { generateMobileApp } = require('./generate-mobile-app');
const { sendApkByEmail } = require('./mobile-server-config');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

// Intervalo de otimização em milissegundos (1 minuto)
const OPTIMIZATION_INTERVAL = 60000;

/**
 * Função principal para iniciar o servidor móvel
 */
async function main() {
  try {
    console.log('=== QuickFundHub Mobile Server ===');
    console.log('Iniciando servidor dedicado para dispositivos móveis...');
    
    // Iniciar servidor
    startMobileServer();
    
    // Configurar otimização contínua a cada minuto
    setInterval(() => {
      console.log(`[${new Date().toISOString()}] Executando otimização automática...`);
      optimizePerformance();
    }, OPTIMIZATION_INTERVAL);
    
    // Configurar monitoramento de uso de dados
    setInterval(() => {
      console.log(`[${new Date().toISOString()}] Monitorando uso de dados...`);
      monitorDataUsage();
    }, OPTIMIZATION_INTERVAL * 5); // A cada 5 minutos
    
    // Configurar geração e envio do APK diariamente às 00:00
    cron.schedule('0 0 * * *', async () => {
      console.log(`[${new Date().toISOString()}] Gerando nova versão do APK...`);
      
      // Gerar APK
      const apkGenerated = await generateMobileApp();
      
      if (apkGenerated) {
        console.log('APK gerado com sucesso!');
        
        // Enviar APK por email
        sendApkByEmail();
      } else {
        console.error('Falha ao gerar APK!');
      }
    });
    
    console.log('Servidor móvel iniciado com sucesso!');
    console.log(`Otimização automática configurada a cada ${OPTIMIZATION_INTERVAL / 1000} segundos.`);
    console.log('Pressione Ctrl+C para encerrar.');
  } catch (error) {
    console.error('Erro ao iniciar servidor móvel:', error);
    process.exit(1);
  }
}

// Executar função principal
main();