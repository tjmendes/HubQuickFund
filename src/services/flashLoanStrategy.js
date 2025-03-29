import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { executeFlashLoan } from './flashLoan';
import { getUniswapPoolData, getSushiswapPairData } from './dex';
import { comparePrices } from './cex';
import { profitTracker } from './profitTracker';
import { gasOptimizer } from './gasOptimizer';
import { whaleTracker } from './whaleTracker';
import { predictiveAnalytics } from './predictiveAnalytics';

class FlashLoanStrategy {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(blockchainConfig.infura.url);
    this.minProfitThreshold = ethers.utils.parseEther('0.1'); // 0.1 ETH mínimo de lucro
    this.maxConcurrentExecutions = 3; // Número máximo de execuções paralelas
    this.activeExecutions = new Set();
    this.opportunityScores = new Map();
  }

  async executeParallelFlashLoans(opportunities) {
    try {
      const validatedOpportunities = await this._validateAndScoreOpportunities(opportunities);
      const bestOpportunities = this._selectBestOpportunities(validatedOpportunities);
      
      const executionPromises = bestOpportunities.map(opportunity =>
        this._executeFlashLoanSafely(opportunity)
      );
      
      const results = await Promise.allSettled(executionPromises);
      return this._processExecutionResults(results);
    } catch (error) {
      console.error('Erro na execução paralela de flash loans:', error);
      throw error;
    }
  }

  async _validateAndScoreOpportunities(opportunities) {
    const validatedOpportunities = [];
    
    for (const opportunity of opportunities) {
      const score = await this._calculateOpportunityScore(opportunity);
      if (score > 0) {
        validatedOpportunities.push({
          ...opportunity,
          score
        });
      }
    }
    
    return validatedOpportunities;
  }

  async _calculateOpportunityScore(opportunity) {
    try {
      const {
        asset,
        amount,
        sourceExchange,
        targetExchange
      } = opportunity;
      
      // Análise de baleias
      const whaleActivity = await whaleTracker.analyzeWhaleActivity(asset);
      
      // Análise preditiva
      const marketPrediction = await predictiveAnalytics.predictPriceMovement(asset);
      
      // Otimização de gas
      const estimatedGas = await gasOptimizer.estimateFlashLoanGas({
        asset,
        amount,
        sourceExchange,
        targetExchange
      });
      
      // Cálculo do score baseado em múltiplos fatores
      const profitScore = parseFloat(ethers.utils.formatEther(opportunity.expectedProfit));
      const gasScore = 1 - (parseFloat(ethers.utils.formatEther(estimatedGas)) / profitScore);
      const whaleScore = whaleActivity.confidence;
      const marketScore = marketPrediction.confidence;
      
      return (
        profitScore * 0.4 +
        gasScore * 0.3 +
        whaleScore * 0.15 +
        marketScore * 0.15
      );
    } catch (error) {
      console.error('Erro ao calcular score da oportunidade:', error);
      return 0;
    }
  }

  _selectBestOpportunities(opportunities) {
    return opportunities
      .sort((a, b) => b.score - a.score)
      .slice(0, this.maxConcurrentExecutions);
  }

  async _executeFlashLoanSafely(opportunity) {
    if (this.activeExecutions.size >= this.maxConcurrentExecutions) {
      throw new Error('Limite máximo de execuções paralelas atingido');
    }
    
    const executionId = `${opportunity.asset}-${Date.now()}`;
    this.activeExecutions.add(executionId);
    
    try {
      // Verificar liquidez antes da execução
      await this._verifyLiquidity(opportunity);
      
      // Otimizar gas price
      const gasPrice = await gasOptimizer.getOptimalGasPrice();
      
      // Executar flash loan
      const result = await executeFlashLoan(
        opportunity.asset,
        opportunity.amount,
        [
          opportunity.sourceExchange,
          opportunity.targetExchange
        ],
        opportunity.buyPrice,
        opportunity.sellPrice
      );
      
      // Registrar resultado
      await this._trackExecution(opportunity, result);
      
      return result;
    } catch (error) {
      console.error(`Erro na execução ${executionId}:`, error);
      throw error;
    } finally {
      this.activeExecutions.delete(executionId);
    }
  }

  async _verifyLiquidity(opportunity) {
    const { asset, amount, sourceExchange, targetExchange } = opportunity;
    
    const [sourceLiquidity, targetLiquidity] = await Promise.all([
      this._checkExchangeLiquidity(sourceExchange, asset),
      this._checkExchangeLiquidity(targetExchange, asset)
    ]);
    
    if (sourceLiquidity.lt(amount) || targetLiquidity.lt(amount)) {
      throw new Error('Liquidez insuficiente para executar flash loan');
    }
  }

  async _checkExchangeLiquidity(exchange, asset) {
    if (exchange.includes('uniswap')) {
      const poolData = await getUniswapPoolData(asset);
      return poolData.liquidity;
    } else if (exchange.includes('sushiswap')) {
      const pairData = await getSushiswapPairData(asset);
      return pairData.liquidity;
    }
    return ethers.utils.parseEther('1000.0'); // Valor padrão para outras exchanges
  }

  async _trackExecution(opportunity, result) {
    await profitTracker.addOperation({
      asset: opportunity.asset,
      amount: ethers.utils.formatEther(opportunity.amount),
      profit: ethers.utils.formatEther(result.profit || 0),
      gasUsed: ethers.utils.formatEther(result.gasUsed || 0),
      success: result.success
    });
  }

  _processExecutionResults(results) {
    const summary = {
      successful: 0,
      failed: 0,
      totalProfit: ethers.constants.Zero,
      totalGasUsed: ethers.constants.Zero
    };
    
    results.forEach(result => {
      if (result.status === 'fulfilled') {
        summary.successful++;
        if (result.value.profit) {
          summary.totalProfit = summary.totalProfit.add(result.value.profit);
        }
        if (result.value.gasUsed) {
          summary.totalGasUsed = summary.totalGasUsed.add(result.value.gasUsed);
        }
      } else {
        summary.failed++;
      }
    });
    
    return summary;
  }

  getExecutionStats() {
    return {
      activeExecutions: this.activeExecutions.size,
      maxConcurrent: this.maxConcurrentExecutions,
      opportunityScores: Array.from(this.opportunityScores.entries())
    };
  }
}

export const flashLoanStrategy = new FlashLoanStrategy();
  try {
    const opportunities = [];
    const gasPrices = await gasOptimizer.getGasPrices();
    
    // Verificar preços em diferentes DEXs
    const [uniswapData, sushiswapData] = await Promise.all([
      getUniswapPoolData(asset),
      getSushiswapPairData(asset)
    ]);
    
    // Obter preços de CEXs
    const cexPrices = await comparePrices(asset);
    
    // Analisar oportunidades entre DEXs e CEXs
    for (const [dex1, price1] of Object.entries({ uniswap: uniswapData.price, sushiswap: sushiswapData.price })) {
      for (const [dex2, price2] of Object.entries(cexPrices)) {
        const priceDiff = Math.abs(price1 - price2);
        const profitPercentage = (priceDiff / price1) * 100;
        
        if (profitPercentage > FLASH_LOAN_STRATEGY.minProfitMargin) {
          opportunities.push({
            sourceExchange: price1 < price2 ? dex1 : dex2,
            targetExchange: price1 < price2 ? dex2 : dex1,
            profitPercentage,
            estimatedProfit: priceDiff * parseFloat(ethers.utils.formatEther(FLASH_LOAN_STRATEGY.minLiquidity)),
            gasPrice: gasPrices.mainnet?.gasPrice || '0'
          });
        }
      }
    }
    
    return opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
  } catch (error) {
    console.error('Erro ao buscar oportunidades de flash loans:', error);
    throw error;
  }
};

// Função para executar flash loans repetitivos
export const executeRepetitiveFlashLoans = async (asset, opportunities) => {
  const results = [];
  const provider = new ethers.providers.AlchemyProvider(
    blockchainConfig.alchemy.network,
    blockchainConfig.alchemy.apiKey
  );
  
  for (const opportunity of opportunities) {
    try {
      // Verificar se o gas está dentro do limite aceitável
      const currentGasPrice = await provider.getGasPrice();
      const gasPriceGwei = parseFloat(ethers.utils.formatUnits(currentGasPrice, 'gwei'));
      
      if (gasPriceGwei > FLASH_LOAN_STRATEGY.gasThreshold) {
        console.log('Gas price too high, waiting for better conditions...');
        continue;
      }
      
      // Executar flash loan
      const result = await executeFlashLoan(
        asset,
        FLASH_LOAN_STRATEGY.minLiquidity,
        [
          opportunity.sourceExchange,
          opportunity.targetExchange
        ],
        opportunity.buyPrice,
        opportunity.sellPrice
      );
      
      results.push({
        ...result,
        profitPercentage: opportunity.profitPercentage,
        gasPrice: gasPriceGwei
      });
      
      // Aguardar intervalo antes da próxima operação
      await new Promise(resolve => setTimeout(resolve, FLASH_LOAN_STRATEGY.maxWaitTime));
    } catch (error) {
      console.error('Erro ao executar flash loan repetitivo:', error);
    }
  }
  
  return {
    results,
    summary: profitTracker.getOperationsSummary()
  };
};

// Função para monitorar liquidez e identificar oportunidades
export const monitorLiquidityOpportunities = async (asset, interval = 30000) => {
  try {
    const checkLiquidity = async () => {
      const [uniswapData, sushiswapData] = await Promise.all([
        getUniswapPoolData(asset),
        getSushiswapPairData(asset)
      ]);
      
      const lowLiquidityPools = [];
      
      if (uniswapData.liquidity.lt(FLASH_LOAN_STRATEGY.minLiquidity)) {
        lowLiquidityPools.push({
          dex: 'Uniswap',
          currentLiquidity: ethers.utils.formatEther(uniswapData.liquidity),
          requiredLiquidity: ethers.utils.formatEther(FLASH_LOAN_STRATEGY.minLiquidity)
        });
      }
      
      if (sushiswapData.liquidity.lt(FLASH_LOAN_STRATEGY.minLiquidity)) {
        lowLiquidityPools.push({
          dex: 'Sushiswap',
          currentLiquidity: ethers.utils.formatEther(sushiswapData.liquidity),
          requiredLiquidity: ethers.utils.formatEther(FLASH_LOAN_STRATEGY.minLiquidity)
        });
      }
      
      return lowLiquidityPools;
    };
    
    // Primeira verificação
    const initialCheck = await checkLiquidity();
    
    // Configurar monitoramento contínuo
    setInterval(checkLiquidity, interval);
    
    return initialCheck;
  } catch (error) {
    console.error('Erro ao monitorar oportunidades de liquidez:', error);
    throw error;
  }
};