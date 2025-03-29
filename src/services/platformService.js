/**
 * Serviço de integração multiplataforma
 * Este arquivo gerencia a detecção e inicialização de serviços específicos para cada plataforma
 */

// Importar serviços específicos de cada plataforma
import { isNativePlatform as isCapacitorNative, initializeCapacitorServices } from './capacitorService';
import { isNativePlatform as isReactNativeNative, initializeReactNativeServices } from './reactNativeService';
import { isLambdaEnvironment, initializeAWSServices } from './awsLambdaService';

// Serviços de negócio
import { profitTracker } from './profitTracker';
import { continuousOptimizationService } from './continuousOptimizationService';

/**
 * Detecta a plataforma atual
 */
export const detectPlatform = () => {
  // Verificar se estamos em ambiente AWS Lambda
  if (isLambdaEnvironment()) {
    return 'aws';
  }
  
  // Verificar se estamos em um dispositivo móvel com Capacitor
  if (isCapacitorNative()) {
    return 'capacitor';
  }
  
  // Verificar se estamos em um dispositivo móvel com React Native
  if (isReactNativeNative()) {
    return 'react-native';
  }
  
  // Se não for nenhuma das plataformas acima, estamos em ambiente web
  return 'web';
};

/**
 * Inicializa os serviços específicos da plataforma atual
 */
export const initializePlatformServices = async () => {
  const platform = detectPlatform();
  console.log(`Plataforma detectada: ${platform}`);
  
  let initialized = false;
  
  switch (platform) {
    case 'aws':
      // Inicializar serviços AWS
      initialized = await initializeAWSServices();
      break;
    
    case 'capacitor':
      // Inicializar serviços Capacitor
      initialized = await initializeCapacitorServices();
      break;
    
    case 'react-native':
      // Inicializar serviços React Native
      initialized = await initializeReactNativeServices();
      break;
    
    case 'web':
      // Inicializar serviços Web
      initialized = await initializeWebServices();
      break;
    
    default:
      console.warn(`Plataforma desconhecida: ${platform}`);
      initialized = false;
  }
  
  if (initialized) {
    console.log(`Serviços da plataforma ${platform} inicializados com sucesso`);
  } else {
    console.error(`Falha ao inicializar serviços da plataforma ${platform}`);
  }
  
  return initialized;
};

/**
 * Inicializa os serviços específicos para ambiente web
 */
const initializeWebServices = async () => {
  try {
    // Configurar distribuição de lucros
    await setupProfitDistribution(
      '08806839616', // PIX CPF
      '0x57E0b47bA8308F1A40f95bB4D3aA867cd1C08760', // USDT ERC20
      'ltc1qdxwcq4n5ep7rthfyhpwaluwtpn99h5dl3zncdx' // LTC
    );
    
    // Iniciar serviço de otimização contínua
    startContinuousOptimizationWeb();
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar serviços web:', error);
    return false;
  }
};

/**
 * Inicia o serviço de otimização contínua para ambiente web
 */
const startContinuousOptimizationWeb = () => {
  try {
    // Executar otimização a cada 15 minutos
    setInterval(async () => {
      try {
        // Verificar se a aba está ativa
        if (document.visibilityState === 'visible') {
          console.log('Executando otimização em ambiente web...');
          
          // Executar otimização
          const result = await continuousOptimizationService.optimize();
          
          // Verificar se houve lucro
          if (result && result.profit > 0) {
            // Mostrar notificação sobre o lucro gerado (se permitido)
            if (Notification.permission === 'granted') {
              new Notification('Lucro Gerado!', {
                body: `O QuickFundHub gerou $${result.profit.toFixed(2)} de lucro para você.`,
                icon: '/favicon.ico'
              });
            }
            
            // Registrar o lucro
            await profitTracker.trackProfit({
              amount: result.profit,
              source: result.source,
              timestamp: new Date().toISOString(),
              details: result.details
            });
          }
        }
      } catch (error) {
        console.error('Erro durante otimização web:', error);
      }
    }, 900000); // 15 minutos
    
    return true;
  } catch (error) {
    console.error('Erro ao iniciar otimização web:', error);
    return false;
  }
};

/**
 * Configura o sistema de distribuição de lucros para as carteiras especificadas
 */
const setupProfitDistribution = async (pixCpf, usdtWallet, ltcWallet) => {
  try {
    // Salvar informações das carteiras no localStorage
    localStorage.setItem('profit_distribution', JSON.stringify({
      pix: pixCpf,
      usdt: usdtWallet,
      ltc: ltcWallet,
      threshold: 300000, // Limite de 300 mil dólares para pagamento via PIX
      lastDistribution: null
    }));
    
    // Configurar listener para distribuição automática de lucros
    profitTracker.addProfitListener(async (totalProfit) => {
      // Verificar se é hora de distribuir os lucros
      const shouldDistribute = await shouldDistributeProfit();
      if (shouldDistribute) {
        await distributeProfits(totalProfit);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao configurar distribuição de lucros:', error);
    return false;
  }
};

/**
 * Verifica se é hora de distribuir os lucros
 */
const shouldDistributeProfit = async () => {
  try {
    // Obter configuração de distribuição
    const value = localStorage.getItem('profit_distribution');
    if (!value) return false;
    
    const distribution = JSON.parse(value);
    const lastDistribution = distribution.lastDistribution ? new Date(distribution.lastDistribution) : null;
    
    // Se nunca houve distribuição ou a última foi há mais de 30 dias
    if (!lastDistribution || (new Date() - lastDistribution) > 30 * 24 * 60 * 60 * 1000) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar distribuição de lucros:', error);
    return false;
  }
};

/**
 * Distribui os lucros para as carteiras configuradas
 */
const distributeProfits = async (totalProfit) => {
  try {
    // Obter configuração de distribuição
    const value = localStorage.getItem('profit_distribution');
    if (!value) return false;
    
    const distribution = JSON.parse(value);
    
    // Determinar método de pagamento com base no valor
    const paymentMethod = totalProfit <= distribution.threshold ? 'pix' : 'crypto';
    
    // Registrar a distribuição
    const distributionRecord = {
      amount: totalProfit,
      timestamp: new Date().toISOString(),
      method: paymentMethod,
      destination: paymentMethod === 'pix' ? distribution.pix : {
        usdt: distribution.usdt,
        ltc: distribution.ltc
      },
      status: 'pending'
    };
    
    // Salvar registro de distribuição
    localStorage.setItem('last_distribution', JSON.stringify(distributionRecord));
    
    // Atualizar data da última distribuição
    distribution.lastDistribution = new Date().toISOString();
    localStorage.setItem('profit_distribution', JSON.stringify(distribution));
    
    // Mostrar notificação sobre a distribuição (se permitido)
    if (Notification.permission === 'granted') {
      new Notification('Distribuição de Lucros', {
        body: `Uma distribuição de $${totalProfit.toFixed(2)} foi iniciada para sua ${paymentMethod === 'pix' ? 'conta PIX' : 'carteira crypto'}.`,
        icon: '/favicon.ico'
      });
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao distribuir lucros:', error);
    return false;
  }
};