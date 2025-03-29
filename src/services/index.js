import authService from './authService';
import blockchainService from './blockchain';
import dexService from './dex';
import cexService from './cex';
import exchangeService from './exchange';
import flashLoanService from './flashLoan';
import cryptoArbitrageService from './cryptoArbitrage';
import defiLendingService from './defiLending';
import yieldFarmingStakingService from './yieldFarmingStaking';
import marketAnalyticsService from './marketAnalytics';
import sentimentAnalysisService from './sentimentAnalysis';
import profitTrackerService from './profitTracker';
import subscriptionService from './subscriptionService';
import quickAIService from './quickAIService';
import eliteWhaleTrackerService from './eliteWhaleTracker';
import blockchainInfraMonitorService from './blockchainInfraMonitor';
import btgPactualService from './btgPactualService';
import traditionalMarketService from './traditionalMarketService';
import marketNotificationService from './marketNotificationService';

export {
  authService,
  blockchainService,
  dexService,
  cexService,
  exchangeService,
  flashLoanService,
  cryptoArbitrageService,
  defiLendingService,
  yieldFarmingStakingService,
  marketAnalyticsService,
  sentimentAnalysisService,
  profitTrackerService,
  subscriptionService,
  quickAIService,
  eliteWhaleTrackerService,
  blockchainInfraMonitorService,
  btgPactualService,
  traditionalMarketService,
  marketNotificationService
};

// Função para inicializar todos os serviços
export const initializeAllServices = async () => {
  try {
    console.log('Inicializando todos os serviços...');
    
    // Inicializar serviços em paralelo
    await Promise.all([
      complianceService.initialize(),
      deepLearningService.initialize(),
      iotService.initialize()
    ]);
    
    // Inicializar serviço de integração após os outros serviços
    await integrationService.initialize();
    
    console.log('Todos os serviços inicializados com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar serviços:', error);
    return false;
  }
};

// Função para obter status de todos os serviços
export const getAllServicesStatus = () => {
  return integrationService.getServicesStatus();
};

// Função para otimizar todos os serviços
export const optimizeAllServices = async () => {
  try {
    // Sincronizar todos os serviços
    const syncResults = await integrationService.syncAllServices();
    
    // Otimizar rede IoT
    const iotResults = await iotService.optimizeNetworkTopology();
    
    // Otimizar modelos de deep learning
    const dlResults = await deepLearningService.optimizeHyperParameters();
    
    return {
      timestamp: Date.now(),
      syncResults,
      iotResults,
      dlResults
    };
  } catch (error) {
    console.error('Erro ao otimizar serviços:', error);
    throw error;
  }
};