import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';

// Configurações para diferentes redes
const NETWORKS = {
  mainnet: {
    name: 'Ethereum Mainnet',
    rpc: `https://eth-mainnet.alchemyapi.io/v2/${blockchainConfig.alchemy.apiKey}`,
    chainId: 1,
    gasStationApi: 'https://ethgasstation.info/api/ethgasAPI.json'
  },
  polygon: {
    name: 'Polygon',
    rpc: 'https://polygon-rpc.com',
    chainId: 137,
    gasStationApi: 'https://gasstation-mainnet.matic.network/v2'
  },
  optimism: {
    name: 'Optimism',
    rpc: 'https://mainnet.optimism.io',
    chainId: 10
  },
  arbitrum: {
    name: 'Arbitrum One',
    rpc: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161
  },
  avalanche: {
    name: 'Avalanche C-Chain',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: 43114
  }
};

// Classe para otimização de gas
export class GasOptimizer {
  constructor() {
    this.providers = {};
    this.historicalData = {};
    this.initializeProviders();
    this.startHistoricalDataCollection();
  }

  // Inicializar providers para cada rede
  initializeProviders() {
    for (const [network, config] of Object.entries(NETWORKS)) {
      this.providers[network] = new ethers.providers.JsonRpcProvider(config.rpc);
    }
  }

  // Obter preços de gas em todas as redes
  async getGasPrices() {
    const gasPrices = {};

    for (const [network, provider] of Object.entries(this.providers)) {
      try {
        const gasPrice = await provider.getGasPrice();
        const gasPriceGwei = ethers.utils.formatUnits(gasPrice, 'gwei');

        gasPrices[network] = {
          network: NETWORKS[network].name,
          gasPrice: gasPriceGwei,
          timestamp: Date.now()
        };
      } catch (error) {
        console.error(`Erro ao obter preço do gas na rede ${network}:`, error);
      }
    }

    return gasPrices;
  }

  // Estimar custo de transação em diferentes redes
  async estimateTransactionCost(to, data, value = '0') {
    const estimates = {};

    for (const [network, provider] of Object.entries(this.providers)) {
      try {
        const gasPrice = await provider.getGasPrice();
        const gasLimit = await provider.estimateGas({
          to,
          data,
          value: ethers.utils.parseEther(value)
        });

        const cost = gasPrice.mul(gasLimit);
        estimates[network] = {
          network: NETWORKS[network].name,
          costWei: cost.toString(),
          costEth: ethers.utils.formatEther(cost),
          gasLimit: gasLimit.toString(),
          gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei')
        };
      } catch (error) {
        console.error(`Erro ao estimar custo na rede ${network}:`, error);
      }
    }

    return estimates;
  }

  // Encontrar a rede mais econômica para uma transação
  async findCheapestNetwork(to, data, value = '0') {
    const estimates = await this.estimateTransactionCost(to, data, value);
    let cheapestNetwork = null;
    let lowestCost = ethers.constants.MaxUint256;

    for (const [network, estimate] of Object.entries(estimates)) {
      const cost = ethers.BigNumber.from(estimate.costWei);
      if (cost.lt(lowestCost)) {
        lowestCost = cost;
        cheapestNetwork = {
          network,
          ...estimate
        };
      }
    }

    return cheapestNetwork;
  }

  // Verificar congestionamento da rede
  async checkNetworkCongestion(network) {
    try {
      const provider = this.providers[network];
      const gasPrice = await provider.getGasPrice();
      const gasPriceGwei = parseFloat(ethers.utils.formatUnits(gasPrice, 'gwei'));

      // Definir níveis de congestionamento
      return {
        network: NETWORKS[network].name,
        congestionLevel: gasPriceGwei < 50 ? 'Baixo' :
                        gasPriceGwei < 100 ? 'Médio' : 'Alto',
        gasPrice: gasPriceGwei,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Erro ao verificar congestionamento da rede ${network}:`, error);
      throw error;
    }
  }

  // Coletar dados históricos de gas
  async startHistoricalDataCollection() {
    setInterval(async () => {
      for (const network of Object.keys(this.providers)) {
        try {
          const gasPrice = await this.providers[network].getGasPrice();
          if (!this.historicalData[network]) {
            this.historicalData[network] = [];
          }
          this.historicalData[network].push({
            timestamp: Date.now(),
            price: ethers.utils.formatUnits(gasPrice, 'gwei')
          });
          // Manter apenas últimas 24 horas de dados
          const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
          this.historicalData[network] = this.historicalData[network]
            .filter(data => data.timestamp > oneDayAgo);
        } catch (error) {
          console.error(`Erro ao coletar dados históricos para ${network}:`, error);
        }
      }
    }, 5 * 60 * 1000); // Coletar a cada 5 minutos
  }

  // Prever preços futuros de gas
  predictGasPrice(network, timeframe = '1h') {
    const data = this.historicalData[network];
    if (!data || data.length < 12) { // Mínimo de 1 hora de dados
      return null;
    }

    // Calcular tendência usando média móvel
    const prices = data.map(d => parseFloat(d.price));
    const movingAverage = prices.slice(-12).reduce((a, b) => a + b, 0) / 12;
    const trend = movingAverage > prices[prices.length - 1] ? 'descendente' : 'ascendente';

    return {
      currentPrice: prices[prices.length - 1],
      predictedPrice: movingAverage,
      trend,
      confidence: this._calculateConfidence(prices)
    };
  }

  _calculateConfidence(prices) {
    const variance = prices.reduce((acc, price) => {
      const diff = price - prices[prices.length - 1];
      return acc + (diff * diff);
    }, 0) / prices.length;
    return Math.max(0, 100 - Math.sqrt(variance));
  }

  // Sugerir melhor momento para transação com análise preditiva
  async suggestTransactionTiming(network) {
    try {
      const congestion = await this.checkNetworkCongestion(network);
      const prediction = this.predictGasPrice(network);
      const currentHour = new Date().getHours();

      let suggestion = 'Momento favorável para transação';
      let confidence = 'Alta';

      if (prediction) {
        if (prediction.trend === 'descendente' && prediction.confidence > 70) {
          suggestion = 'Aguardar redução prevista nas próximas horas';
          confidence = 'Alta';
        } else if (congestion.congestionLevel === 'Alto' && prediction.trend === 'ascendente') {
          suggestion = 'Adiar transação - alta probabilidade de aumento nas taxas';
          confidence = 'Média';
        }
      }

      return {
        ...congestion,
        prediction: prediction ? {
          expectedPrice: prediction.predictedPrice.toFixed(2),
          trend: prediction.trend,
          confidence: `${prediction.confidence.toFixed(1)}%`
        } : null,
        suggestion,
        confidence,
        bestHours: currentHour >= 22 || currentHour <= 4 ?
          'Horário atual é favorável (baixo congestionamento)' :
          'Considerar executar entre 22h e 4h'
      };
    } catch (error) {
      console.error(`Erro ao sugerir timing para transação na rede ${network}:`, error);
      throw error;
    }
  }
}

// Instância global do otimizador
export const gasOptimizer = new GasOptimizer();