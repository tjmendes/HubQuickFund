import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { executeFlashLoan } from './flashLoan';
import { profitTracker } from './profitTracker';
import { gasOptimizer } from './gasOptimizer';
import { predictiveAnalytics } from './predictiveAnalytics';
import { getBestLendingRates } from './defiLending';

// Configurações para flash loans sequenciais
const SEQUENTIAL_CONFIG = {
  maxSequentialLoans: 5, // Número máximo de empréstimos sequenciais
  minProfitPerLoan: 0.2, // Margem mínima de lucro por empréstimo (0.2%)
  maxWaitBetweenLoans: 15000, // Tempo máximo de espera entre empréstimos (15 segundos)
  gasThreshold: 50, // Limite de gas em gwei para execução
  stablecoinPairs: [
    { base: 'USDC', quote: 'USDT' },
    { base: 'USDC', quote: 'DAI' },
    { base: 'USDT', quote: 'DAI' },
    { base: 'USDC', quote: 'BUSD' },
    { base: 'USDT', quote: 'BUSD' }
  ],
  cryptoPairs: [
    { base: 'ETH', quote: 'WBTC' },
    { base: 'ETH', quote: 'MATIC' },
    { base: 'ETH', quote: 'AVAX' },
    { base: 'WBTC', quote: 'MATIC' },
    { base: 'WBTC', quote: 'AVAX' }
  ]
};

/**
 * Classe para gerenciar flash loans sequenciais
 * Permite executar múltiplos flash loans em sequência para maximizar lucros
 * em diferentes oportunidades de mercado
 */
class SequentialFlashLoan {
  constructor() {
    this.provider = new ethers.providers.AlchemyProvider(
      blockchainConfig.alchemy.network,
      blockchainConfig.alchemy.apiKey
    );
    this.activeSequences = new Map();
    this.sequenceResults = [];
    this.lastGasCheck = Date.now();
    this.gasCheckInterval = 60000; // 1 minuto
    this.currentGasPrice = null;
  }

  /**
   * Inicia uma sequência de flash loans
   * @param {string} initialAsset - Ativo inicial para o primeiro flash loan
   * @param {string} initialAmount - Quantidade inicial para o primeiro flash loan
   * @param {Array} opportunities - Lista de oportunidades identificadas
   * @returns {Promise<Object>} - Resultado da sequência de flash loans
   */
  async startSequence(initialAsset, initialAmount, opportunities) {
    try {
      console.log(`Iniciando sequência de flash loans para ${initialAsset}...`);
      
      // Gerar ID único para esta sequência
      const sequenceId = `seq-${initialAsset}-${Date.now()}`;
      
      // Verificar se o gas está em um nível aceitável
      await this.checkGasPrice();
      
      if (this.currentGasPrice > SEQUENTIAL_CONFIG.gasThreshold) {
        console.log(`Gas price muito alto (${this.currentGasPrice} gwei). Abortando sequência.`);
        return { success: false, reason: 'high_gas_price' };
      }
      
      // Registrar sequência ativa
      this.activeSequences.set(sequenceId, {
        asset: initialAsset,
        amount: initialAmount,
        opportunities: opportunities.slice(0, SEQUENTIAL_CONFIG.maxSequentialLoans),
        currentStep: 0,
        startTime: Date.now(),
        results: []
      });
      
      // Executar sequência
      const result = await this.executeSequence(sequenceId);
      
      // Remover da lista de sequências ativas
      this.activeSequences.delete(sequenceId);
      
      // Adicionar ao histórico de resultados
      this.sequenceResults.push({
        sequenceId,
        initialAsset,
        initialAmount,
        steps: result.steps,
        totalProfit: result.totalProfit,
        totalGasUsed: result.totalGasUsed,
        success: result.success,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error('Erro ao iniciar sequência de flash loans:', error);
      return { success: false, reason: 'execution_error', error: error.message };
    }
  }

  /**
   * Executa uma sequência de flash loans
   * @param {string} sequenceId - ID da sequência
   * @returns {Promise<Object>} - Resultado da sequência
   */
  async executeSequence(sequenceId) {
    const sequence = this.activeSequences.get(sequenceId);
    if (!sequence) {
      throw new Error(`Sequência ${sequenceId} não encontrada`);
    }
    
    const results = [];
    let currentAsset = sequence.asset;
    let currentAmount = sequence.amount;
    let totalProfit = ethers.constants.Zero;
    let totalGasUsed = ethers.constants.Zero;
    let success = true;
    
    // Executar cada flash loan na sequência
    for (let i = 0; i < sequence.opportunities.length; i++) {
      const opportunity = sequence.opportunities[i];
      
      try {
        // Atualizar passo atual
        sequence.currentStep = i + 1;
        
        // Verificar gas novamente antes de cada execução
        await this.checkGasPrice();
        if (this.currentGasPrice > SEQUENTIAL_CONFIG.gasThreshold) {
          console.log(`Gas price muito alto (${this.currentGasPrice} gwei). Interrompendo sequência.`);
          success = false;
          break;
        }
        
        // Executar flash loan
        console.log(`Executando flash loan ${i + 1}/${sequence.opportunities.length} para ${currentAsset}...`);
        const result = await executeFlashLoan(
          currentAsset,
          currentAmount,
          [
            opportunity.buyExchange,
            opportunity.sellExchange
          ],
          opportunity.buyPrice,
          opportunity.sellPrice
        );
        
        // Calcular lucro e gas usado
        const profit = result.operationResult?.profit || ethers.constants.Zero;
        const gasUsed = result.receipt?.gasUsed || ethers.constants.Zero;
        
        // Atualizar totais
        totalProfit = totalProfit.add(profit);
        totalGasUsed = totalGasUsed.add(gasUsed);
        
        // Registrar resultado
        results.push({
          step: i + 1,
          asset: currentAsset,
          amount: currentAmount,
          profit: ethers.utils.formatEther(profit),
          gasUsed: gasUsed.toString(),
          success: true
        });
        
        // Atualizar asset e amount para o próximo flash loan
        if (i < sequence.opportunities.length - 1) {
          // Simular conversão de ativos (em produção, isso seria baseado no resultado real)
          currentAsset = sequence.opportunities[i + 1].asset;
          
          // Adicionar lucro ao montante para o próximo flash loan
          const profitEth = parseFloat(ethers.utils.formatEther(profit));
          const newAmount = parseFloat(ethers.utils.formatEther(currentAmount)) + profitEth;
          currentAmount = ethers.utils.parseEther(newAmount.toString());
          
          // Aguardar um curto período antes do próximo flash loan
          await new Promise(resolve => setTimeout(resolve, Math.random() * SEQUENTIAL_CONFIG.maxWaitBetweenLoans));
        }
      } catch (error) {
        console.error(`Erro no flash loan ${i + 1}:`, error);
        
        // Registrar falha
        results.push({
          step: i + 1,
          asset: currentAsset,
          amount: currentAmount,
          profit: '0',
          gasUsed: '0',
          success: false,
          error: error.message
        });
        
        success = false;
        break;
      }
    }
    
    // Calcular estatísticas finais
    const totalProfitEth = parseFloat(ethers.utils.formatEther(totalProfit));
    const totalGasUsedEth = parseFloat(ethers.utils.formatEther(totalGasUsed.mul(this.currentGasPrice || 1)));
    const netProfit = totalProfitEth - totalGasUsedEth;
    
    // Registrar resultado no rastreador de lucros
    await profitTracker.addOperation({
      type: 'sequential_flash_loan',
      asset: sequence.asset,
      amount: ethers.utils.formatEther(sequence.amount),
      profit: totalProfitEth.toString(),
      gasUsed: totalGasUsed.toString(),
      netProfit: netProfit.toString(),
      steps: results.length,
      success
    });
    
    return {
      sequenceId,
      steps: results,
      totalProfit: totalProfitEth,
      totalGasUsed: totalGasUsed.toString(),
      netProfit,
      success
    };
  }

  /**
   * Verifica o preço atual do gas
   */
  async checkGasPrice() {
    // Verificar gas apenas a cada intervalo para evitar chamadas excessivas
    if (Date.now() - this.lastGasCheck > this.gasCheckInterval || !this.currentGasPrice) {
      try {
        const gasPrice = await this.provider.getGasPrice();
        this.currentGasPrice = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
        this.lastGasCheck = Date.now();
      } catch (error) {
        console.error('Erro ao verificar preço do gas:', error);
        // Manter o último preço conhecido em caso de erro
      }
    }
    return this.currentGasPrice;
  }

  /**
   * Identifica oportunidades para flash loans sequenciais
   * @param {Array} assets - Lista de ativos para analisar
   * @returns {Promise<Array>} - Lista de sequências de oportunidades
   */
  async identifySequentialOpportunities(assets) {
    try {
      const sequentialOpportunities = [];
      
      // Para cada ativo, identificar possíveis sequências
      for (const asset of assets) {
        // Obter previsões de mercado para o ativo
        const prediction = await predictiveAnalytics.predictPriceMovement(asset);
        
        // Identificar pares de stablecoins com oportunidades
        if (SEQUENTIAL_CONFIG.stablecoinPairs.some(pair => pair.base === asset || pair.quote === asset)) {
          const stablecoinSequence = await this.buildStablecoinSequence(asset, prediction);
          if (stablecoinSequence.length > 0) {
            sequentialOpportunities.push({
              initialAsset: asset,
              type: 'stablecoin',
              opportunities: stablecoinSequence,
              expectedProfit: stablecoinSequence.reduce((sum, opp) => sum + opp.expectedProfit, 0),
              riskLevel: 'low'
            });
          }
        }
        
        // Identificar pares de criptomoedas com oportunidades
        if (SEQUENTIAL_CONFIG.cryptoPairs.some(pair => pair.base === asset || pair.quote === asset)) {
          const cryptoSequence = await this.buildCryptoSequence(asset, prediction);
          if (cryptoSequence.length > 0) {
            sequentialOpportunities.push({
              initialAsset: asset,
              type: 'crypto',
              opportunities: cryptoSequence,
              expectedProfit: cryptoSequence.reduce((sum, opp) => sum + opp.expectedProfit, 0),
              riskLevel: 'medium'
            });
          }
        }
      }
      
      // Ordenar por lucro esperado
      return sequentialOpportunities.sort((a, b) => b.expectedProfit - a.expectedProfit);
    } catch (error) {
      console.error('Erro ao identificar oportunidades sequenciais:', error);
      return [];
    }
  }

  /**
   * Constrói uma sequência de oportunidades para stablecoins
   * @param {string} asset - Stablecoin inicial
   * @param {Object} prediction - Previsão de mercado
   * @returns {Promise<Array>} - Sequência de oportunidades
   */
  async buildStablecoinSequence(asset, prediction) {
    try {
      const sequence = [];
      const pairs = SEQUENTIAL_CONFIG.stablecoinPairs.filter(pair => 
        pair.base === asset || pair.quote === asset
      );
      
      // Obter taxas de empréstimo para stablecoins
      const lendingRates = await getBestLendingRates(asset, '1000');
      
      // Construir sequência baseada em pares de stablecoins
      for (const pair of pairs) {
        // Simular oportunidade (em produção, isso seria baseado em dados reais)
        const priceDiff = Math.random() * 0.5; // 0-0.5% de diferença
        if (priceDiff > SEQUENTIAL_CONFIG.minProfitPerLoan) {
          sequence.push({
            asset: pair.base === asset ? pair.quote : pair.base,
            buyExchange: 'uniswap',
            sellExchange: 'sushiswap',
            buyPrice: 1.0,
            sellPrice: 1.0 + priceDiff / 100,
            expectedProfit: priceDiff,
            confidence: prediction.confidence || 0.7
          });
          
          // Limitar tamanho da sequência
          if (sequence.length >= SEQUENTIAL_CONFIG.maxSequentialLoans) {
            break;
          }
        }
      }
      
      return sequence;
    } catch (error) {
      console.error('Erro ao construir sequência de stablecoins:', error);
      return [];
    }
  }

  /**
   * Constrói uma sequência de oportunidades para criptomoedas
   * @param {string} asset - Criptomoeda inicial
   * @param {Object} prediction - Previsão de mercado
   * @returns {Promise<Array>} - Sequência de oportunidades
   */
  async buildCryptoSequence(asset, prediction) {
    try {
      const sequence = [];
      const pairs = SEQUENTIAL_CONFIG.cryptoPairs.filter(pair => 
        pair.base === asset || pair.quote === asset
      );
      
      // Construir sequência baseada em pares de criptomoedas
      for (const pair of pairs) {
        // Simular oportunidade (em produção, isso seria baseado em dados reais)
        const priceDiff = Math.random() * 1.0; // 0-1.0% de diferença
        if (priceDiff > SEQUENTIAL_CONFIG.minProfitPerLoan) {
          sequence.push({
            asset: pair.base === asset ? pair.quote : pair.base,
            buyExchange: 'uniswap',
            sellExchange: 'binance',
            buyPrice: 100.0, // Preço simulado
            sellPrice: 100.0 * (1 + priceDiff / 100),
            expectedProfit: priceDiff,
            confidence: prediction.confidence || 0.6
          });
          
          // Limitar tamanho da sequência
          if (sequence.length >= SEQUENTIAL_CONFIG.maxSequentialLoans) {
            break;
          }
        }
      }
      
      return sequence;
    } catch (error) {
      console.error('Erro ao construir sequência de criptomoedas:', error);
      return [];
    }
  }

  /**
   * Obtém estatísticas das sequências executadas
   * @returns {Object} - Estatísticas das sequências
   */
  getSequenceStats() {
    const totalSequences = this.sequenceResults.length;
    const successfulSequences = this.sequenceResults.filter(seq => seq.success).length;
    const totalProfit = this.sequenceResults.reduce((sum, seq) => sum + (seq.totalProfit || 0), 0);
    const averageSteps = this.sequenceResults.reduce((sum, seq) => sum + seq.steps.length, 0) / Math.max(1, totalSequences);
    
    return {
      totalSequences,
      successfulSequences,
      successRate: totalSequences > 0 ? (successfulSequences / totalSequences) * 100 : 0,
      totalProfit,
      averageSteps,
      activeSequences: this.activeSequences.size
    };
  }
}

export const sequentialFlashLoan = new SequentialFlashLoan();

/**
 * Executa uma sequência de flash loans otimizada para stablecoins
 * @param {string} initialStablecoin - Stablecoin inicial (USDC, USDT, DAI)
 * @param {string} amount - Quantidade inicial
 * @returns {Promise<Object>} - Resultado da sequência
 */
export const executeStablecoinSequence = async (initialStablecoin, amount) => {
  try {
    // Identificar oportunidades específicas para stablecoins
    const opportunities = await sequentialFlashLoan.identifySequentialOpportunities([initialStablecoin]);
    
    if (opportunities.length === 0 || !opportunities[0].opportunities.length) {
      return { success: false, reason: 'no_opportunities' };
    }
    
    // Executar sequência
    return await sequentialFlashLoan.startSequence(
      initialStablecoin,
      ethers.utils.parseUnits(amount, 6), // Assumindo 6 decimais para stablecoins
      opportunities[0].opportunities
    );
  } catch (error) {
    console.error('Erro ao executar sequência de stablecoins:', error);
    return { success: false, reason: 'execution_error', error: error.message };
  }
};

/**
 * Executa uma sequência de flash loans otimizada para criptomoedas
 * @param {string} initialCrypto - Criptomoeda inicial (ETH, WBTC, etc)
 * @param {string} amount - Quantidade inicial
 * @returns {Promise<Object>} - Resultado da sequência
 */
export const executeCryptoSequence = async (initialCrypto, amount) => {
  try {
    // Identificar oportunidades específicas para criptomoedas
    const opportunities = await sequentialFlashLoan.identifySequentialOpportunities([initialCrypto]);
    
    if (opportunities.length === 0 || !opportunities[0].opportunities.length) {
      return { success: false, reason: 'no_opportunities' };
    }
    
    // Executar sequência
    return await sequentialFlashLoan.startSequence(
      initialCrypto,
      ethers.utils.parseEther(amount), // 18 decimais para a maioria das criptomoedas
      opportunities[0].opportunities
    );
  } catch (error) {
    console.error('Erro ao executar sequência de criptomoedas:', error);
    return { success: false, reason: 'execution_error', error: error.message };
  }
};