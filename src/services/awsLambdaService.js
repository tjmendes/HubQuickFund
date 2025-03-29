/**
 * Serviço para integração com AWS Lambda
 * Este arquivo gerencia a funcionalidade específica para execução na nuvem AWS
 */

import axios from 'axios';
import { profitTracker } from './profitTracker';
import { continuousOptimizationService } from './continuousOptimizationService';

// Configuração da API Gateway
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'https://api.quickfundhub.com';

/**
 * Verifica se o ambiente atual é AWS Lambda
 */
export const isLambdaEnvironment = () => {
  return !!process.env.AWS_LAMBDA_FUNCTION_NAME;
};

/**
 * Inicializa a conexão com a AWS
 */
export const initializeAWSConnection = async () => {
  try {
    // Verificar se estamos em ambiente Lambda
    if (isLambdaEnvironment()) {
      console.log('Executando em ambiente AWS Lambda');
      return true;
    }
    
    // Verificar conexão com API Gateway
    const response = await axios.get(`${API_GATEWAY_URL}/health`);
    return response.status === 200;
  } catch (error) {
    console.error('Erro ao inicializar conexão com AWS:', error);
    return false;
  }
};

/**
 * Invoca uma função Lambda
 */
export const invokeLambdaFunction = async (functionName, payload) => {
  try {
    const response = await axios.post(`${API_GATEWAY_URL}/functions/${functionName}`, payload);
    return response.data;
  } catch (error) {
    console.error(`Erro ao invocar função Lambda ${functionName}:`, error);
    return null;
  }
};

/**
 * Inicia o serviço de otimização contínua na AWS
 */
export const startContinuousOptimizationOnAWS = async () => {
  try {
    // Verificar se estamos em ambiente Lambda
    if (isLambdaEnvironment()) {
      // Se estamos no Lambda, executar otimização diretamente
      return await continuousOptimizationService.optimize();
    }
    
    // Se não estamos no Lambda, invocar a função Lambda
    const result = await invokeLambdaFunction('quickfundhub-optimization', {
      action: 'optimize',
      timestamp: new Date().toISOString()
    });
    
    // Verificar se houve lucro
    if (result && result.profit > 0) {
      // Registrar o lucro
      await profitTracker.trackProfit({
        amount: result.profit,
        source: result.source,
        timestamp: new Date().toISOString(),
        details: result.details
      });
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao iniciar otimização na AWS:', error);
    return null;
  }
};

/**
 * Configura o sistema de distribuição de lucros na AWS
 */
export const setupProfitDistributionOnAWS = async (pixCpf, usdtWallet, ltcWallet) => {
  try {
    // Configurar distribuição de lucros na AWS
    const result = await invokeLambdaFunction('quickfundhub-profit-distribution', {
      action: 'setup',
      pix: pixCpf,
      usdt: usdtWallet,
      ltc: ltcWallet,
      threshold: 300000 // Limite de 300 mil dólares para pagamento via PIX
    });
    
    return result && result.success;
  } catch (error) {
    console.error('Erro ao configurar distribuição de lucros na AWS:', error);
    return false;
  }
};

/**
 * Distribui os lucros para as carteiras configuradas via AWS
 */
export const distributeProfitsOnAWS = async (totalProfit) => {
  try {
    // Distribuir lucros via AWS
    const result = await invokeLambdaFunction('quickfundhub-profit-distribution', {
      action: 'distribute',
      amount: totalProfit,
      timestamp: new Date().toISOString()
    });
    
    return result && result.success;
  } catch (error) {
    console.error('Erro ao distribuir lucros na AWS:', error);
    return false;
  }
};

/**
 * Configura o CloudWatch para monitoramento
 */
export const setupCloudWatchMonitoring = async () => {
  try {
    // Configurar monitoramento no CloudWatch
    const result = await invokeLambdaFunction('quickfundhub-monitoring', {
      action: 'setup',
      metrics: [
        'Profit',
        'Transactions',
        'APILatency',
        'ErrorRate'
      ],
      alarms: {
        highErrorRate: {
          threshold: 5,
          evaluationPeriods: 3
        },
        lowProfit: {
          threshold: 0.1,
          evaluationPeriods: 24
        }
      }
    });
    
    return result && result.success;
  } catch (error) {
    console.error('Erro ao configurar monitoramento no CloudWatch:', error);
    return false;
  }
};

/**
 * Inicializa todos os serviços AWS
 */
export const initializeAWSServices = async () => {
  try {
    // Inicializar conexão com AWS
    const connected = await initializeAWSConnection();
    if (!connected) {
      console.warn('Não foi possível conectar à AWS. Usando modo local.');
      return false;
    }
    
    // Configurar monitoramento
    await setupCloudWatchMonitoring();
    
    // Configurar distribuição de lucros
    await setupProfitDistributionOnAWS(
      '08806839616', // PIX CPF
      '0x57E0b47bA8308F1A40f95bB4D3aA867cd1C08760', // USDT ERC20
      'ltc1qdxwcq4n5ep7rthfyhpwaluwtpn99h5dl3zncdx' // LTC
    );
    
    // Iniciar serviço de otimização contínua
    const optimizationResult = await startContinuousOptimizationOnAWS();
    
    console.log('Serviços AWS inicializados com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar serviços AWS:', error);
    return false;
  }
};