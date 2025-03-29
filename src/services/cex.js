import axios from 'axios';
import { cexConfig } from '../config/api';

const { binance, coinbase, kucoin, kraken, mexc, gateio, bybit, bitget } = cexConfig;

// Configuração do cliente Binance
const binanceClient = axios.create({
  baseURL: 'https://api.binance.com',
  headers: {
    'X-MBX-APIKEY': binance.apiKey
  }
});

// Configuração do cliente Coinbase
const coinbaseClient = axios.create({
  baseURL: 'https://api.coinbase.com/v2',
  headers: {
    'CB-ACCESS-KEY': coinbase.apiKey,
    'CB-ACCESS-SIGN': '', // Será preenchido em cada requisição
    'CB-ACCESS-TIMESTAMP': ''
  }
});

// Funções para Binance
export const getBinancePrice = async (symbol) => {
  try {
    const response = await binanceClient.get(`/api/v3/ticker/price`, {
      params: { symbol }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter preço da Binance:', error);
    throw error;
  }
};

export const getBinanceOrderBook = async (symbol, limit = 10) => {
  try {
    const response = await binanceClient.get(`/api/v3/depth`, {
      params: { symbol, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter order book da Binance:', error);
    throw error;
  }
};

// Funções para Coinbase
export const getCoinbasePrice = async (symbol) => {
  try {
    const response = await coinbaseClient.get(`/prices/${symbol}/spot`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter preço da Coinbase:', error);
    throw error;
  }
};

export const getCoinbaseOrderBook = async (symbol) => {
  try {
    const response = await coinbaseClient.get(`/products/${symbol}/book`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter order book da Coinbase:', error);
    throw error;
  }
};

// Configuração dos clientes das novas exchanges
const kucoinClient = axios.create({
  baseURL: 'https://api.kucoin.com',
  headers: {
    'KC-API-KEY': kucoin.apiKey,
    'KC-API-SIGN': '', // Será preenchido em cada requisição
    'KC-API-TIMESTAMP': '',
    'KC-API-PASSPHRASE': ''
  }
});

const krakenClient = axios.create({
  baseURL: 'https://api.kraken.com/0',
  headers: {
    'API-Key': kraken.apiKey,
    'API-Sign': '' // Será preenchido em cada requisição
  }
});

const mexcClient = axios.create({
  baseURL: 'https://api.mexc.com',
  headers: {
    'X-MEXC-APIKEY': mexc.apiKey
  }
});

const gateioClient = axios.create({
  baseURL: 'https://api.gateio.ws/api/v4',
  headers: {
    'KEY': gateio.apiKey,
    'SIGN': '' // Será preenchido em cada requisição
  }
});

const bybitClient = axios.create({
  baseURL: 'https://api.bybit.com',
  headers: {
    'X-BAPI-API-KEY': bybit.apiKey,
    'X-BAPI-SIGN': '', // Será preenchido em cada requisição
    'X-BAPI-TIMESTAMP': ''
  }
});

const bitgetClient = axios.create({
  baseURL: 'https://api.bitget.com',
  headers: {
    'ACCESS-KEY': bitget.apiKey,
    'ACCESS-SIGN': '', // Será preenchido em cada requisição
    'ACCESS-TIMESTAMP': ''
  }
});

// Funções para KuCoin
export const getKucoinPrice = async (symbol) => {
  try {
    const response = await kucoinClient.get(`/api/v1/market/orderbook/level1`, {
      params: { symbol }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter preço da KuCoin:', error);
    throw error;
  }
};

// Funções para Kraken
export const getKrakenPrice = async (symbol) => {
  try {
    const response = await krakenClient.get(`/public/Ticker`, {
      params: { pair: symbol }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter preço da Kraken:', error);
    throw error;
  }
};

// Funções para MEXC
export const getMexcPrice = async (symbol) => {
  try {
    const response = await mexcClient.get(`/api/v3/ticker/price`, {
      params: { symbol }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter preço da MEXC:', error);
    throw error;
  }
};

// Funções para Gate.io
export const getGateioPrice = async (symbol) => {
  try {
    const response = await gateioClient.get(`/spot/tickers`, {
      params: { currency_pair: symbol }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter preço da Gate.io:', error);
    throw error;
  }
};

// Funções para Bybit
export const getBybitPrice = async (symbol) => {
  try {
    const response = await bybitClient.get(`/v5/market/tickers`, {
      params: { category: 'spot', symbol }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter preço da Bybit:', error);
    throw error;
  }
};

// Funções para Bitget
export const getBitgetPrice = async (symbol) => {
  try {
    const response = await bitgetClient.get(`/api/spot/v1/market/ticker`, {
      params: { symbol }
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao obter preço da Bitget:', error);
    throw error;
  }
};

// Função para comparar preços entre exchanges
export const comparePrices = async (symbol) => {
  try {
    const [
      binanceData,
      coinbaseData,
      kucoinData,
      krakenData,
      mexcData,
      gateioData,
      bybitData,
      bitgetData
    ] = await Promise.all([
      getBinancePrice(symbol),
      getCoinbasePrice(symbol),
      getKucoinPrice(symbol),
      getKrakenPrice(symbol),
      getMexcPrice(symbol),
      getGateioPrice(symbol),
      getBybitPrice(symbol),
      getBitgetPrice(symbol)
    ]);

    return {
      binance: parseFloat(binanceData.price),
      coinbase: parseFloat(coinbaseData.data.amount),
      kucoin: parseFloat(kucoinData.data.price),
      kraken: parseFloat(Object.values(krakenData.result)[0].c[0]),
      mexc: parseFloat(mexcData.price),
      gateio: parseFloat(gateioData[0].last),
      bybit: parseFloat(bybitData.result.list[0].lastPrice),
      bitget: parseFloat(bitgetData.data.close)
    };
  } catch (error) {
    console.error('Erro ao comparar preços:', error);
    throw error;
  }
};