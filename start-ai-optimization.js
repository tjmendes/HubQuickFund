/**
 * Script para iniciar o serviço de IA para otimizações em tempo real
 * Este arquivo inicia o serviço de IA que otimiza operações e maximiza lucros
 */

const aiService = require('./ai-optimization-service');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Verificar ambiente
const isProduction = process.env.NODE_ENV === 'production' || process.env.PRODUCTION === 'true';

// Função principal
async function startAIOptimizationService() {
  try {
    console.log(`Iniciando serviço de IA para otimizações em tempo real (Ambiente: ${isProduction ? 'Produção' : 'Desenvolvimento'})...`);
    
    // Iniciar serviço de IA
    await aiService.start();
    
    console.log('Serviço de IA para otimizações em tempo real iniciado com sucesso!');
    console.log('O sistema está agora otimizando operações e maximizando lucros em tempo real.');
    
    // Manter o processo em execução
    process.stdin.resume();
    
    // Manipular encerramento do processo
    process.on('SIGINT', async () => {
      console.log('\nRecebido sinal de interrupção. Encerrando serviço de IA...');
      await aiService.stop();
      console.log('Serviço de IA encerrado com sucesso.');
      process.exit(0);
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao iniciar serviço de IA para otimizações em tempo real:', error);
    return false;
  }
}

// Se este arquivo for executado diretamente
if (require.main === module) {
  startAIOptimizationService()
    .then(success => {
      if (!success) {
        console.error('Falha ao iniciar serviço de IA para otimizações em tempo real!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Erro não tratado:', error);
      process.exit(1);
    });
}