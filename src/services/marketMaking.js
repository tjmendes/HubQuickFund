import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { getUniswapPoolData, getSushiswapPairData } from './dex';
import { comparePrices } from './cex';
import { profitTracker } from './profitTracker';

// Configurações para estratégias de market making
const MARKET_MAKING_CONFIG = {
  minSpreadPercentage: 0.2, // Spread mínimo de 0.2%
  maxOrderSize: ethers.utils.parseEther('1.0'), // Tamanho máximo da ordem
  minLiquidity: ethers.utils.parseEther('10.0'), // Liquidez mínima necessária
  updateInterval: 30000, // Intervalo de atualização (30 segundos)
  priceImpactLimit: 0.5 // Limite de impacto no preço (0.5%)
};

// Função para calcular spreads ótimos
const calculateOptimalSpreads = async (symbol) => {
  try {
    const prices = await comparePrices(symbol);
    const [uniswapData, sushiswapData] = await Promise.all([
      getUniswapPoolData(symbol),
      getSushiswapPairData(symbol)
    ]);

    // Calcular spread médio do mercado
    const spreads = Object.values(prices).map((price, index, arr) => {
      if (index === 0) return 0;
      return Math.abs(price - arr[index - 1]) / arr[index - 1] * 100;
    });

    const averageSpread = spreads.reduce((a, b) => a + b, 0) / spreads.length;
    
    return {
      bidSpread: averageSpread * 0.8, // 80% do spread médio
      askSpread: averageSpread * 1.2, // 120% do spread médio
      basePrice: prices.binance // Usando Binance como referência
    };
  } catch (error) {
    console.error('Erro ao calcular spreads ótimos:', error);
    throw error;
  }
};

// Função para criar ordens de market making
export const createMarketMakingOrders = async (symbol, amount) => {
  try {
    const { bidSpread, askSpread, basePrice } = await calculateOptimalSpreads(symbol);
    
    // Calcular preços de compra e venda
    const bidPrice = basePrice * (1 - bidSpread / 100);
    const askPrice = basePrice * (1 + askSpread / 100);
    
    // Verificar liquidez disponível
    const orderSize = ethers.BigNumber.from(amount)
      .lt(MARKET_MAKING_CONFIG.maxOrderSize) 
      ? amount 
      : MARKET_MAKING_CONFIG.maxOrderSize;
    
    // Registrar operação no tracker
    await profitTracker.addOperation({
      asset: symbol,
      amount: ethers.utils.formatEther(orderSize),
      buyPrice: bidPrice,
      sellPrice: askPrice,
      gasUsed: '0',
      success: true
    });
    
    return {
      bidOrder: {
        price: bidPrice,
        size: orderSize,
        side: 'buy'
      },
      askOrder: {
        price: askPrice,
        size: orderSize,
        side: 'sell'
      },
      estimatedSpread: askSpread - bidSpread
    };
  } catch (error) {
    console.error('Erro ao criar ordens de market making:', error);
    throw error;
  }
};

// Função para análise preditiva de preços
export const predictPriceMovement = async (symbol, timeframe = '1h') => {
  try {
    const prices = await comparePrices(symbol);
    const priceArray = Object.values(prices);
    
    // Calcular médias móveis
    const sma20 = calculateSMA(priceArray, 20);
    const sma50 = calculateSMA(priceArray, 50);
    
    // Calcular volatilidade
    const volatility = calculateVolatility(priceArray);
    
    // Determinar tendência
    const trend = sma20 > sma50 ? 'up' : 'down';
    
    return {
      currentPrice: priceArray[priceArray.length - 1],
      predictedDirection: trend,
      confidence: calculateConfidence(volatility, Math.abs(sma20 - sma50)),
      volatility,
      timeframe
    };
  } catch (error) {
    console.error('Erro na análise preditiva:', error);
    throw error;
  }
};

// Funções auxiliares para análise técnica
const calculateSMA = (prices, period) => {
  return prices
    .slice(-period)
    .reduce((sum, price) => sum + price, 0) / period;
};

const calculateVolatility = (prices) => {
  const returns = prices.map((price, i) => {
    if (i === 0) return 0;
    return (price - prices[i - 1]) / prices[i - 1];
  });
  
  const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  
  return Math.sqrt(
    returns
      .map(ret => Math.pow(ret - avgReturn, 2))
      .reduce((sum, squared) => sum + squared, 0) / returns.length
  );
};

const calculateConfidence = (volatility, trendStrength) => {
  // Normalizar valores entre 0 e 1
  const normalizedVol = Math.min(volatility, 0.1) / 0.1;
  const normalizedStrength = Math.min(trendStrength, 100) / 100;
  
  // Calcular confiança (quanto menor a volatilidade e maior a força da tendência, maior a confiança)
  return (1 - normalizedVol) * normalizedStrength * 100;
};