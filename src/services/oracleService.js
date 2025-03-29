import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { gasOptimizer } from './gasOptimizer';

// Configurações do Chainlink
const CHAINLINK_FEEDS = {
  mainnet: {
    ETH_USD: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    BTC_USD: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    LINK_USD: '0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c'
  },
  polygon: {
    ETH_USD: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
    BTC_USD: '0xc907E116054Ad103354f2D350FD2514433D57F6f',
    LINK_USD: '0xd9FFdb71EbE7496cC440152d43986Aae0AB76665'
  },
  optimism: {
    ETH_USD: '0x13e3Ee699D1909E989722E753853AE30b17e08c5',
    BTC_USD: '0xD702DD976Fb76Fffc2D3963D037dfDae5b04E593',
    LINK_USD: '0x6d5689Ad4C1806D1BA095AEc89fE5f5e5EF5b5E1'
  }
};

// ABI simplificado para price feeds do Chainlink
const CHAINLINK_AGGREGATOR_ABI = [
  'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals() external view returns (uint8)'
];

// Classe para gerenciamento de oráculos
export class OracleService {
  constructor() {
    this.providers = {};
    this.priceFeeds = {};
    this.initializeProviders();
  }

  // Inicializar providers para cada rede
  initializeProviders() {
    for (const network of Object.keys(CHAINLINK_FEEDS)) {
      const rpcUrl = network === 'mainnet'
        ? `https://eth-mainnet.alchemyapi.io/v2/${blockchainConfig.alchemy.apiKey}`
        : network === 'polygon'
        ? 'https://polygon-rpc.com'
        : 'https://mainnet.optimism.io';

      this.providers[network] = new ethers.providers.JsonRpcProvider(rpcUrl);
    }
  }

  // Obter preço atual de um ativo
  async getAssetPrice(network, asset) {
    try {
      const feedAddress = CHAINLINK_FEEDS[network][asset];
      if (!feedAddress) {
        throw new Error(`Price feed não encontrado para ${asset} em ${network}`);
      }

      const priceFeed = new ethers.Contract(
        feedAddress,
        CHAINLINK_AGGREGATOR_ABI,
        this.providers[network]
      );

      const [roundData, decimals] = await Promise.all([
        priceFeed.latestRoundData(),
        priceFeed.decimals()
      ]);

      const price = roundData.answer.toString() / Math.pow(10, decimals);
      const timestamp = roundData.updatedAt.toNumber();

      return {
        price,
        timestamp,
        network,
        asset
      };
    } catch (error) {
      console.error(`Erro ao obter preço para ${asset} em ${network}:`, error);
      throw error;
    }
  }

  // Obter preços em múltiplas redes
  async getMultiNetworkPrices(asset) {
    const prices = {};
    const networks = Object.keys(CHAINLINK_FEEDS);

    await Promise.all(
      networks.map(async (network) => {
        try {
          const priceData = await this.getAssetPrice(network, asset);
          prices[network] = priceData;
        } catch (error) {
          console.warn(`Falha ao obter preço em ${network}:`, error);
        }
      })
    );

    return prices;
  }

  // Verificar desvio de preços entre redes
  async checkPriceDeviation(asset, threshold = 0.5) {
    const prices = await this.getMultiNetworkPrices(asset);
    const priceValues = Object.values(prices).map(p => p.price);
    
    const maxPrice = Math.max(...priceValues);
    const minPrice = Math.min(...priceValues);
    const deviation = ((maxPrice - minPrice) / minPrice) * 100;

    return {
      asset,
      deviation,
      prices,
      exceedsThreshold: deviation > threshold,
      timestamp: Date.now()
    };
  }

  // Monitorar preços e alertar sobre oportunidades
  async monitorPriceOpportunities(asset, interval = 60000) {
    const checkPrices = async () => {
      try {
        const deviation = await this.checkPriceDeviation(asset);
        if (deviation.exceedsThreshold) {
          // Verificar custos de gas antes de sugerir operação
          const gasCosts = await gasOptimizer.getGasPrices();
          
          return {
            ...deviation,
            gasCosts,
            recommendation: this.generateTradeRecommendation(deviation, gasCosts)
          };
        }
      } catch (error) {
        console.error('Erro ao monitorar preços:', error);
      }
    };

    // Primeira verificação
    const initialCheck = await checkPrices();
    
    // Configurar monitoramento contínuo
    setInterval(checkPrices, interval);

    return initialCheck;
  }

  // Gerar recomendação de trade baseada em desvios de preço e custos de gas
  generateTradeRecommendation(deviation, gasCosts) {
    const networks = Object.keys(deviation.prices);
    const recommendations = [];

    for (let i = 0; i < networks.length; i++) {
      for (let j = i + 1; j < networks.length; j++) {
        const network1 = networks[i];
        const network2 = networks[j];
        const price1 = deviation.prices[network1].price;
        const price2 = deviation.prices[network2].price;
        
        const priceDiff = Math.abs(price1 - price2);
        const gasCost1 = parseFloat(gasCosts[network1]?.gasPrice || 0);
        const gasCost2 = parseFloat(gasCosts[network2]?.gasPrice || 0);

        if (priceDiff > 0) {
          recommendations.push({
            buyNetwork: price1 < price2 ? network1 : network2,
            sellNetwork: price1 < price2 ? network2 : network1,
            priceDifference: priceDiff,
            potentialProfit: priceDiff - (gasCost1 + gasCost2),
            estimatedGasCosts: {
              [network1]: gasCost1,
              [network2]: gasCost2
            }
          });
        }
      }
    }

    return recommendations.sort((a, b) => b.potentialProfit - a.potentialProfit);
  }
}

// Instância global do serviço de oráculos
export const oracleService = new OracleService();