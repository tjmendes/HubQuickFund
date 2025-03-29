import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { profitTracker } from './profitTracker';
import { gasOptimizer } from './gasOptimizer';
import { predictiveAnalytics } from './predictiveAnalytics';
import { sequentialFlashLoan, executeStablecoinSequence, executeCryptoSequence } from './sequentialFlashLoan';
import { defiIntegration, executeStablecoinArbitrage, executeLendingAndReinvestment } from './defiIntegration';
import { sentimentAnalysis } from './sentimentAnalysis';
import { whaleTracker } from './whaleTracker';

/**
 * Classe para estratégias avançadas de arbitragem multi-modal
 * Combina flash loans sequenciais, integração DeFi e análise preditiva
 * para maximizar lucros em diferentes condições de mercado
 */
class MultiStrategyArbitrage {
  constructor() {
    this.provider = new ethers.providers.AlchemyProvider(
      blockchainConfig.alchemy.network,
      blockchainConfig.alchemy.apiKey
    );
    this.activeStrategies = new Map();
    this.strategyResults = [];
    this.marketConditions = {
      volatility: 'medium', // low, medium, high
      trend: 'neutral', // bullish, bearish, neutral
      liquidity: 'high' // low, medium, high
    };
    this.riskProfile = {
      maxRiskPerOperation: 0.05, // 5% de risco máximo por operação
      maxConcurrentOperations: 5, // Máximo de operações simultâneas
      stablecoinRatio: 0.6, // 60% em stablecoins para estabilidade
      cryptoRatio: 0.4 // 40% em criptomoedas para maior retorno
    };
  }

  /**
   * Inicializa o sistema de arbitragem multi-estratégia
   * @returns {Promise<boolean>} - Status da inicialização
   */
  async initialize() {
    try {
      console.log('Inicializando sistema de arbitragem multi-estratégia...');
      
      // Atualizar condições de mercado
      await this.updateMarketConditions();
      
      // Iniciar monitoramento contínuo
      this.startContinuousMonitoring();
      
      console.log('Sistema de arbitragem multi-estratégia inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar sistema de arbitragem multi-estratégia:', error);
      return false;
    }
  }

  /**
   * Atualiza as condições de mercado com base em análises
   * @returns {Promise<Object>} - Condições atualizadas do mercado
   */
  async updateMarketConditions() {
    try {
      // Obter dados de sentimento para principais ativos
      const assets = ['ETH', 'BTC', 'USDC', 'USDT', 'DAI'];
      const sentimentData = await Promise.all(
        assets.map(asset => sentimentAnalysis.analyzeSentiment(asset))
      );
      
      // Obter dados de movimentação de baleias
      const whaleData = await Promise.all(
        assets.map(asset => whaleTracker.getRecentMovements(asset))
      );
      
      // Obter previsões de mercado
      const predictions = await Promise.all(
        assets.map(asset => predictiveAnalytics.predictPriceMovement(asset))
      );
      
      // Calcular volatilidade média
      const volatilityScores = predictions.map(p => p.volatility || 0.5);
      const avgVolatility = volatilityScores.reduce((sum, score) => sum + score, 0) / volatilityScores.length;
      
      // Determinar tendência geral
      const sentimentScores = sentimentData.map(s => s.score || 0);
      const avgSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
      
      // Determinar liquidez com base em atividade de baleias
      const whaleActivity = whaleData.map(w => w.length || 0);
      const totalWhaleActivity = whaleActivity.reduce((sum, count) => sum + count, 0);
      
      // Atualizar condições de mercado
      this.marketConditions = {
        volatility: avgVolatility < 0.3 ? 'low' : avgVolatility > 0.7 ? 'high' : 'medium',
        trend: avgSentiment < -0.2 ? 'bearish' : avgSentiment > 0.2 ? 'bullish' : 'neutral',
        liquidity: totalWhaleActivity < 5 ? 'low' : totalWhaleActivity > 20 ? 'high' : 'medium'
      };
      
      console.log('Condições de mercado atualizadas:', this.marketConditions);
      return this.marketConditions;
    } catch (error) {
      console.error('Erro ao atualizar condições de mercado:', error);
      return this.marketConditions;
    }
  }

  /**
   * Inicia monitoramento contínuo de oportunidades
   */
  startContinuousMonitoring() {
    console.log('Iniciando monitoramento contínuo de oportunidades...');
    
    // Monitorar a cada 30 segundos
    setInterval(async () => {
      try {
        // Atualizar condições de mercado a cada 5 minutos
        const currentTime = Date.now();
        if (!this.lastMarketUpdate || currentTime - this.lastMarketUpdate > 300000) {
          await this.updateMarketConditions();
          this.lastMarketUpdate = currentTime;
        }
        
        // Selecionar estratégia com base nas condições de mercado
        const bestStrategy = this.selectBestStrategy();
        
        // Executar estratégia selecionada
        await this.executeStrategy(bestStrategy);
      } catch (error) {
        console.error('Erro no monitoramento contínuo:', error);
      }
    }, 30000);
  }

  /**
   * Seleciona a melhor estratégia com base nas condições de mercado
   * @returns {string} - Nome da estratégia selecionada
   */
  selectBestStrategy() {
    const { volatility, trend, liquidity } = this.marketConditions;
    
    // Estratégias para diferentes condições de mercado
    if (volatility === 'high' && liquidity === 'high') {
      // Alta volatilidade + alta liquidez = flash loans sequenciais
      return 'sequential_flash_loans';
    } else if (volatility === 'low' && trend !== 'neutral') {
      // Baixa volatilidade + tendência clara = empréstimos DeFi
      return 'defi_lending';
    } else if (liquidity === 'low' && volatility !== 'high') {
      // Baixa liquidez + volatilidade não alta = arbitragem de stablecoins
      return 'stablecoin_arbitrage';
    } else if (trend === 'bullish' && volatility !== 'low') {
      // Tendência de alta + volatilidade não baixa = arbitragem de criptomoedas
      return 'crypto_arbitrage';
    } else {
      // Condições mistas = estratégia balanceada
      return 'balanced_strategy';
    }
  }

  /**
   * Executa a estratégia selecionada
   * @param {string} strategy - Nome da estratégia a ser executada
   * @returns {Promise<Object>} - Resultado da execução
   */
  async executeStrategy(strategy) {
    try {
      console.log(`Executando estratégia: ${strategy}`);
      
      // Verificar se já existe uma estratégia ativa do mesmo tipo
      if (this.activeStrategies.has(strategy)) {
        console.log(`Estratégia ${strategy} já está em execução`);
        return null;
      }
      
      // Registrar estratégia como ativa
      this.activeStrategies.set(strategy, {
        startTime: Date.now(),
        status: 'running'
      });
      
      let result;
      
      // Executar estratégia específica
      switch (strategy) {
        case 'sequential_flash_loans':
          result = await this.executeSequentialFlashLoans();
          break;
        case 'defi_lending':
          result = await this.executeDeFiLending();
          break;
        case 'stablecoin_arbitrage':
          result = await this.executeStablecoinArbitrage();
          break;
        case 'crypto_arbitrage':
          result = await this.executeCryptoArbitrage();
          break;
        case 'balanced_strategy':
          result = await this.executeBalancedStrategy();
          break;
        default:
          throw new Error(`Estratégia desconhecida: ${strategy}`);
      }
      
      // Registrar resultado
      this.strategyResults.push({
        strategy,
        timestamp: Date.now(),
        result,
        marketConditions: { ...this.marketConditions }
      });
      
      // Remover da lista de estratégias ativas
      this.activeStrategies.delete(strategy);
      
      console.log(`Estratégia ${strategy} concluída com sucesso`);
      return result;
    } catch (error) {
      console.error(`Erro ao executar estratégia ${strategy}:`, error);
      
      // Remover da lista de estratégias ativas em caso de erro
      this.activeStrategies.delete(strategy);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Executa estratégia de flash loans sequenciais
   * @returns {Promise<Object>} - Resultado da execução
   */
  async executeSequentialFlashLoans() {
    try {
      // Selecionar ativos com base no perfil de risco
      const stablecoins = ['USDC', 'USDT', 'DAI'];
      const cryptos = ['ETH', 'WBTC', 'MATIC'];
      
      // Distribuir operações conforme perfil de risco
      const stablecoinOps = Math.ceil(this.riskProfile.maxConcurrentOperations * this.riskProfile.stablecoinRatio);
      const cryptoOps = Math.floor(this.riskProfile.maxConcurrentOperations * this.riskProfile.cryptoRatio);
      
      // Executar operações em paralelo
      const operations = [];
      
      // Operações com stablecoins
      for (let i = 0; i < stablecoinOps; i++) {
        const stablecoin = stablecoins[i % stablecoins.length];
        operations.push(executeStablecoinSequence(stablecoin, '10000'));
      }
      
      // Operações com criptomoedas
      for (let i = 0; i < cryptoOps; i++) {
        const crypto = cryptos[i % cryptos.length];
        operations.push(executeCryptoSequence(crypto, '1.0'));
      }
      
      // Aguardar conclusão de todas as operações
      const results = await Promise.allSettled(operations);
      
      // Calcular estatísticas
      const successfulOps = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const totalProfit = results
        .filter(r => r.status === 'fulfilled' && r.value.success)
        .reduce((sum, r) => sum + (r.value.netProfit || 0), 0);
      
      return {
        success: successfulOps > 0,
        totalOperations: operations.length,
        successfulOperations: successfulOps,
        totalProfit,
        details: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason })
      };
    } catch (error) {
      console.error('Erro ao executar flash loans sequenciais:', error);
      throw error;
    }
  }

  /**
   * Executa estratégia de empréstimos DeFi
   * @returns {Promise<Object>} - Resultado da execução
   */
  async executeDeFiLending() {
    try {
      // Selecionar ativos para empréstimo
      const assets = ['USDC', 'DAI', 'ETH'];
      const amounts = ['50000', '50000', '10'];
      const durations = [7, 14, 30]; // Dias
      
      // Executar operações em paralelo
      const operations = [];
      
      for (let i = 0; i < assets.length; i++) {
        operations.push(executeLendingAndReinvestment(assets[i], amounts[i], durations[i]));
      }
      
      // Aguardar conclusão de todas as operações
      const results = await Promise.allSettled(operations);
      
      // Calcular estatísticas
      const successfulOps = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success').length;
      const totalProfit = results
        .filter(r => r.status === 'fulfilled' && r.value.status === 'success')
        .reduce((sum, r) => sum + parseFloat(r.value.profit || 0), 0);
      
      return {
        success: successfulOps > 0,
        totalOperations: operations.length,
        successfulOperations: successfulOps,
        totalProfit,
        details: results.map(r => r.status === 'fulfilled' ? r.value : { status: 'failed', error: r.reason })
      };
    } catch (error) {
      console.error('Erro ao executar empréstimos DeFi:', error);
      throw error;
    }
  }

  /**
   * Executa estratégia de arbitragem de stablecoins
   * @returns {Promise<Object>} - Resultado da execução
   */
  async executeStablecoinArbitrage() {
    try {
      // Selecionar stablecoins para arbitragem
      const stablecoins = ['USDC', 'USDT', 'DAI', 'BUSD'];
      const amounts = ['100000', '100000', '100000', '100000'];
      
      // Executar operações em paralelo
      const operations = [];
      
      for (let i = 0; i < stablecoins.length; i++) {
        operations.push(executeStablecoinArbitrage(stablecoins[i], amounts[i]));
      }
      
      // Aguardar conclusão de todas as operações
      const results = await Promise.allSettled(operations);
      
      // Calcular estatísticas
      const successfulOps = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success').length;
      const totalProfit = results
        .filter(r => r.status === 'fulfilled' && r.value.status === 'success')
        .reduce((sum, r) => sum + parseFloat(r.value.profit || 0), 0);
      
      return {
        success: successfulOps > 0,
        totalOperations: operations.length,
        successfulOperations: successfulOps,
        totalProfit,
        details: results.map(r => r.status === 'fulfilled' ? r.value : { status: 'failed', error: r.reason })
      };
    } catch (error) {
      console.error('Erro ao executar arbitragem de stablecoins:', error);
      throw error;
    }
  }

  /**
   * Executa estratégia de arbitragem de criptomoedas
   * @returns {Promise<Object>} - Resultado da execução
   */
  async executeCryptoArbitrage() {
    try {
      // Selecionar criptomoedas para arbitragem
      const cryptos = ['ETH', 'WBTC', 'MATIC', 'AVAX'];
      const amounts = ['10', '0.5', '5000', '100'];
      
      // Executar operações em paralelo
      const operations = [];
      
      for (let i = 0; i < cryptos.length; i++) {
        // Usar flash loans sequenciais para criptomoedas
        operations.push(executeCryptoSequence(cryptos[i], amounts[i]));
      }
      
      // Aguardar conclusão de todas as operações
      const results = await Promise.allSettled(operations);
      
      // Calcular estatísticas
      const successfulOps = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const totalProfit = results
        .filter(r => r.status === 'fulfilled' && r.value.success)
        .reduce((sum, r) => sum + (r.value.netProfit || 0), 0);
      
      return {
        success: successfulOps > 0,
        totalOperations: operations.length,
        successfulOperations: successfulOps,
        totalProfit,
        details: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason })
      };
    } catch (error) {
      console.error('Erro ao executar arbitragem de criptomoedas:', error);
      throw error;
    }
  }

  /**
   * Executa estratégia balanceada (combinação de várias estratégias)
   * @returns {Promise<Object>} - Resultado da execução
   */
  async executeBalancedStrategy() {
    try {
      // Executar uma combinação de estratégias
      const operations = [
        // 40% em stablecoins
        executeStablecoinArbitrage('USDC', '50000'),
        executeStablecoinSequence('USDT', '50000'),
        
        // 30% em empréstimos DeFi
        executeLendingAndReinvestment('DAI', '30000', 14),
        
        // 30% em criptomoedas
        executeCryptoSequence('ETH', '5.0'),
        executeCryptoSequence('WBTC', '0.25')
      ];
      
      // Aguardar conclusão de todas as operações
      const results = await Promise.allSettled(operations);
      
      // Calcular estatísticas
      const successfulOps = results.filter(r => r.status === 'fulfilled' && (r.value.success || r.value.status === 'success')).length;
      
      // Calcular lucro total (considerando diferentes formatos de retorno)
      const totalProfit = results
        .filter(r => r.status === 'fulfilled')
        .reduce((sum, r) => {
          if (r.value.success && r.value.netProfit) {
            return sum + r.value.netProfit;
          } else if (r.value.status === 'success' && r.value.profit) {
            return sum + parseFloat(r.value.profit);
          }
          return sum;
        }, 0);
      
      return {
        success: successfulOps > 0,
        totalOperations: operations.length,
        successfulOperations: successfulOps,
        totalProfit,
        details: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason })
      };
    } catch (error) {
      console.error('Erro ao executar estratégia balanceada:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de desempenho das estratégias
   * @returns {Object} - Estatísticas de desempenho
   */
  getPerformanceStats() {
    // Calcular estatísticas gerais
    const totalExecutions = this.strategyResults.length;
    const successfulExecutions = this.strategyResults.filter(r => r.result && (r.result.success || r.result.status === 'success')).length;
    
    // Calcular lucro total
    const totalProfit = this.strategyResults.reduce((sum, r) => {
      if (r.result && r.result.totalProfit) {
        return sum + r.result.totalProfit;
      }
      return sum;
    }, 0);
    
    // Calcular desempenho por estratégia
    const strategyStats = {};
    
    for (const result of this.strategyResults) {
      const { strategy } = result;
      
      if (!strategyStats[strategy]) {
        strategyStats[strategy] = {
          executions: 0,
          successful: 0,
          totalProfit: 0
        };
      }
      
      strategyStats[strategy].executions++;
      
      if (result.result && (result.result.success || result.result.status === 'success')) {
        strategyStats[strategy].successful++;
        strategyStats[strategy].totalProfit += result.result.totalProfit || 0;
      }
    }
    
    return {
      totalExecutions,
      successfulExecutions,
      successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0,
      totalProfit,
      activeStrategies: Array.from(this.activeStrategies.keys()),
      strategyStats,
      currentMarketConditions: this.marketConditions
    };
  }
}

export const multiStrategyArbitrage = new MultiStrategyArbitrage();

/**
 * Inicializa e executa o sistema de arbitragem multi-estratégia
 * @returns {Promise<boolean>} - Status da inicialização
 */
export const initializeMultiStrategySystem = async () => {
  try {
    return await multiStrategyArbitrage.initialize();
  } catch (error) {
    console.error('Erro ao inicializar sistema multi-estratégia:', error);
    return false;
  }
};

/**
 * Executa uma estratégia específica manualmente
 * @param {string} strategy - Nome da estratégia a ser executada
 * @returns {Promise<Object>} - Resultado da execução
 */
export const executeSpecificStrategy = async (strategy) => {
  try {
    return await multiStrategyArbitrage.executeStrategy(strategy);
  } catch (error) {
    console.error(`Erro ao executar estratégia ${strategy}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Obtém estatísticas de desempenho do sistema
 * @returns {Object} - Estatísticas de desempenho
 */
export const getSystemPerformance = () => {
  return multiStrategyArbitrage.getPerformanceStats();
};