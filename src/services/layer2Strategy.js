import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { executeFlashLoan } from './flashLoan';
import { getUniswapPoolData, getSushiswapPairData } from './dex';
import { comparePrices } from './cex';
import { profitTracker } from './profitTracker';
import { gasOptimizer } from './gasOptimizer';

// Configurações para redes Layer 2
const LAYER2_CONFIG = {
  polygon: {
    rpc: 'https://polygon-rpc.com',
    flashLoanPool: '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf',
    minProfitMargin: 0.3, // 0.3% margem mínima para Polygon
    gasMultiplier: 1.0,
    bridgeAddress: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    averageBlockTime: 2.5, // segundos
    averageGasPrice: 30 // gwei
  },
  optimism: {
    rpc: 'https://mainnet.optimism.io',
    flashLoanPool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    minProfitMargin: 0.4, // 0.4% margem mínima para Optimism
    gasMultiplier: 0.8,
    bridgeAddress: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
    averageBlockTime: 0.5, // segundos
    averageGasPrice: 0.001 // gwei
  },
  arbitrum: {
    rpc: 'https://arb1.arbitrum.io/rpc',
    flashLoanPool: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    minProfitMargin: 0.35, // 0.35% margem mínima para Arbitrum
    gasMultiplier: 0.7,
    bridgeAddress: '0x011B6E24FfB0B5f5fCc564cf4183C5BBBc96D515',
    averageBlockTime: 0.25, // segundos
    averageGasPrice: 0.1 // gwei
  },
  zkSync: {
    rpc: 'https://mainnet.era.zksync.io',
    flashLoanPool: '0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4',
    minProfitMargin: 0.25, // 0.25% margem mínima para zkSync
    gasMultiplier: 0.5,
    bridgeAddress: '0xaBEA9132b05A70803a4E85094fD0e1800777fBEF',
    averageBlockTime: 0.2, // segundos
    averageGasPrice: 0.05 // gwei
  }
};

// Classe para estratégias em Layer 2
export class Layer2Strategy {
  constructor() {
    this.providers = {};
    this.lastGasPrices = {};
    this.lastUpdate = Date.now();
    this.updateInterval = 60000; // 1 minuto
    this.initializeProviders();
  }
  
  // Inicializar providers para cada rede
  initializeProviders() {
    for (const [network, config] of Object.entries(LAYER2_CONFIG)) {
      this.providers[network] = new ethers.providers.JsonRpcProvider(config.rpc);
    }
  }
  
  // Analisar oportunidades em Layer 2 com otimização de gas
  async analyzeLayer2Opportunities(asset, amount = '1.0') {
    try {
      console.log(`Analisando oportunidades em Layer 2 para ${asset}...`);
      const opportunities = [];
      
      // Atualizar preços de gas se necessário
      if (Date.now() - this.lastUpdate > this.updateInterval) {
        await this.updateGasPrices();
      }
      
      // Analisar cada rede Layer 2
      for (const [network, config] of Object.entries(LAYER2_CONFIG)) {
        try {
          const provider = this.providers[network];
          
          // Verificar preços em DEXs da rede
          const [uniswapData, sushiswapData] = await Promise.all([
            getUniswapPoolData(asset, network),
            getSushiswapPairData(asset, network)
          ]);
          
          // Obter preços de CEXs para comparação
          const cexPrices = await comparePrices(asset);
          
          // Calcular custo de gas na rede
          const gasPrice = this.lastGasPrices[network] || await provider.getGasPrice();
          const gasLimit = 250000; // Estimativa para operação de swap
          const gasCost = gasPrice.mul(gasLimit);
          const gasCostEth = parseFloat(ethers.utils.formatEther(gasCost));
          
          // Aplicar multiplicador de gas específico da rede
          const adjustedGasCost = gasCostEth * config.gasMultiplier;
          
          // Analisar diferenças de preço entre DEXs e CEXs
          const dexPrices = {
            uniswap: uniswapData.price,
            sushiswap: sushiswapData.price
          };
          
          // Calcular oportunidades entre DEXs e CEXs
          for (const [dex, dexPrice] of Object.entries(dexPrices)) {
            for (const [cex, cexPrice] of Object.entries(cexPrices)) {
              const priceDiff = Math.abs(dexPrice - cexPrice);
              const profitPercentage = (priceDiff / Math.min(dexPrice, cexPrice)) * 100;
              
              // Verificar se a oportunidade é lucrativa considerando o custo de gas
              if (profitPercentage > config.minProfitMargin) {
                const potentialProfit = priceDiff * parseFloat(amount);
                const netProfit = potentialProfit - adjustedGasCost;
                
                if (netProfit > 0) {
                  opportunities.push({
                    network,
                    sourceExchange: dexPrice < cexPrice ? dex : cex,
                    targetExchange: dexPrice < cexPrice ? cex : dex,
                    buyPrice: Math.min(dexPrice, cexPrice),
                    sellPrice: Math.max(dexPrice, cexPrice),
                    profitPercentage,
                    netProfit,
                    gasCost: adjustedGasCost,
                    amount: parseFloat(amount),
                    timestamp: Date.now(),
                    layer2Benefits: {
                      gasReduction: (1 - config.gasMultiplier) * 100, // % de redução de gas
                      speedImprovement: config.averageBlockTime, // tempo de bloco em segundos
                      bridgeFee: 0.001 // taxa de bridge estimada (0.1%)
                    }
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error(`Erro ao analisar oportunidades em ${network}:`, error);
        }
      }
      
      // Ordenar oportunidades por lucratividade
      const sortedOpportunities = opportunities.sort((a, b) => b.profitPercentage - a.profitPercentage);
      
      // Atualizar timestamp da última atualização
      this.lastUpdate = Date.now();
      
      return sortedOpportunities;
    } catch (error) {
      console.error('Erro ao analisar oportunidades em Layer 2:', error);
      return [];
    }
  }
  
  // Atualizar preços de gas em todas as redes
  async updateGasPrices() {
    try {
      const updatePromises = Object.entries(LAYER2_CONFIG).map(async ([network, config]) => {
        try {
          const provider = this.providers[network];
          const gasPrice = await provider.getGasPrice();
          this.lastGasPrices[network] = gasPrice;
          return { network, gasPrice };
        } catch (error) {
          console.error(`Erro ao atualizar preço de gas em ${network}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(updatePromises);
      return results.filter(result => result !== null);
    } catch (error) {
      console.error('Erro ao atualizar preços de gas:', error);
      return [];
    }
  }
  
  // Executar arbitragem em Layer 2
  async executeLayer2Arbitrage(asset, opportunity) {
    try {
      const network = opportunity.network;
      const config = LAYER2_CONFIG[network];
      
      if (!config) {
        throw new Error(`Configuração não encontrada para rede ${network}`);
      }
      
      console.log(`Executando arbitragem em ${network} para ${asset}...`);
      
      // Verificar condições de gas
      const gasPrice = this.lastGasPrices[network] || await this.providers[network].getGasPrice();
      const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
      
      // Executar flash loan na rede Layer 2
      const flashLoanResult = await executeFlashLoan(
        asset,
        ethers.utils.parseEther(opportunity.amount.toString()),
        [
          opportunity.sourceExchange,
          opportunity.targetExchange,
          config.flashLoanPool
        ],
        opportunity.buyPrice,
        opportunity.sellPrice
      );
      
      // Registrar operação no rastreador de lucros
      await profitTracker.addOperation({
        asset,
        amount: opportunity.amount.toString(),
        buyPrice: opportunity.buyPrice,
        sellPrice: opportunity.sellPrice,
        gasUsed: flashLoanResult.receipt.gasUsed.toString(),
        success: true,
        profit: opportunity.netProfit,
        network,
        type: 'layer2_arbitrage'
      });
      
      return {
        success: true,
        profit: opportunity.netProfit,
        receipt: flashLoanResult.receipt,
        network,
        gasPrice: gasPriceGwei,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Erro ao executar arbitragem em Layer 2:`, error);
      
      // Registrar operação falha
      await profitTracker.addOperation({
        asset,
        amount: opportunity.amount.toString(),
        buyPrice: opportunity.buyPrice,
        sellPrice: opportunity.sellPrice,
        gasUsed: '0',
        success: false,
        profit: 0,
        network: opportunity.network,
        type: 'layer2_arbitrage',
        error: error.message
      });
      
      return {
        success: false,
        reason: 'layer2_execution_error',
        error: error.message
      };
    }
  }
  
  // Calcular melhor rota para transação entre redes
  async calculateBestCrossChainRoute(asset, amount, sourceNetwork, targetNetwork) {
    try {
      const sourceConfig = LAYER2_CONFIG[sourceNetwork];
      const targetConfig = LAYER2_CONFIG[targetNetwork];
      
      if (!sourceConfig || !targetConfig) {
        throw new Error('Configuração de rede não encontrada');
      }
      
      // Obter preços de gas em ambas as redes
      const [sourceGasPrice, targetGasPrice] = await Promise.all([
        this.lastGasPrices[sourceNetwork] || this.providers[sourceNetwork].getGasPrice(),
        this.lastGasPrices[targetNetwork] || this.providers[targetNetwork].getGasPrice()
      ]);
      
      // Calcular custos de bridge
      const sourceBridgeCost = parseFloat(ethers.utils.formatEther(sourceGasPrice.mul(300000))); // Estimativa
      const targetBridgeCost = parseFloat(ethers.utils.formatEther(targetGasPrice.mul(100000))); // Estimativa
      const totalBridgeCost = sourceBridgeCost + targetBridgeCost;
      
      // Obter preços do ativo em ambas as redes
      const sourcePrice = await this.getAssetPrice(asset, sourceNetwork);
      const targetPrice = await this.getAssetPrice(asset, targetNetwork);
      
      // Calcular potencial lucro
      const priceDiff = Math.abs(sourcePrice - targetPrice);
      const potentialProfit = priceDiff * parseFloat(amount);
      const netProfit = potentialProfit - totalBridgeCost;
      
      return {
        sourceNetwork,
        targetNetwork,
        sourcePrice,
        targetPrice,
        priceDiff,
        bridgeCost: totalBridgeCost,
        potentialProfit,
        netProfit,
        isProfit: netProfit > 0,
        estimatedTime: sourceConfig.averageBlockTime + targetConfig.averageBlockTime + 60, // segundos
        route: {
          steps: [
            { type: 'bridge', from: sourceNetwork, to: targetNetwork, fee: sourceBridgeCost },
            { type: 'swap', network: targetNetwork, fee: targetBridgeCost }
          ]
        }
      };
    } catch (error) {
      console.error('Erro ao calcular melhor rota cross-chain:', error);
      return null;
    }
  }
  
  // Obter preço de um ativo em uma rede específica
  async getAssetPrice(asset, network) {
    try {
      // Em produção, integrar com oráculos de preço
      // Simulação para desenvolvimento
      const basePrice = 1000; // Preço base
      const networkMultipliers = {
        polygon: 0.995,
        optimism: 1.005,
        arbitrum: 1.002,
        zkSync: 1.008
      };
      
      return basePrice * (networkMultipliers[network] || 1);
    } catch (error) {
      console.error(`Erro ao obter preço de ${asset} em ${network}:`, error);
      return 0;
    }
  }
}

// Exportar instância da classe
export const layer2Strategy = new Layer2Strategy();

// Função para executar arbitragem em Layer 2
export const executeLayer2Arbitrage = async (asset, opportunities) => {
  const results = [];
  
  for (const opportunity of opportunities) {
    try {
      const config = LAYER2_CONFIG[opportunity.network];
      const provider = new ethers.providers.JsonRpcProvider(config.rpc);
      
      // Verificar condições de gas
      const gasPrice = await provider.getGasPrice();
      const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));
      
      // Executar flash loan na rede Layer 2
      const result = await executeFlashLoan(
        asset,
        ethers.utils.parseEther('1.0'), // 1 unidade do ativo
        [
          opportunity.sourceExchange,
          opportunity.targetExchange,
          config.flashLoanPool
        ],
        opportunity.buyPrice,
        opportunity.sellPrice
      );
      
      results.push({
        ...result,
        network: opportunity.network,
        profitPercentage: opportunity.profitPercentage,
        gasPrice: gasPriceGwei
      });
      
      // Aguardar confirmações
      await provider.waitForTransaction(result.receipt.transactionHash, 2);
    } catch (error) {
      console.error(`Erro na arbitragem em ${opportunity.network}:`, error);
    }
  }
  
  return {
    results,
    summary: profitTracker.getOperationsSummary()
  };
};

// Função para monitorar liquidez em Layer 2
export const monitorLayer2Liquidity = async (asset, interval = 30000) => {
  const liquidityData = {};
  
  const checkLiquidity = async () => {
    for (const [network, config] of Object.entries(LAYER2_CONFIG)) {
      try {
        const [uniswapData, sushiswapData] = await Promise.all([
          getUniswapPoolData(asset),
          getSushiswapPairData(asset)
        ]);
        
        liquidityData[network] = {
          timestamp: Date.now(),
          uniswap: {
            liquidity: ethers.utils.formatEther(uniswapData.liquidity),
            price: uniswapData.price
          },
          sushiswap: {
            liquidity: ethers.utils.formatEther(sushiswapData.liquidity),
            price: sushiswapData.price
          }
        };
      } catch (error) {
        console.error(`Erro ao monitorar liquidez em ${network}:`, error);
      }
    }
    
    return liquidityData;
  };
  
  // Primeira verificação
  const initialData = await checkLiquidity();
  
  // Configurar monitoramento contínuo
  setInterval(checkLiquidity, interval);
  
  return initialData;
};