import dotenv from 'dotenv';

dotenv.config();

export const blockchainConfig = {
  alchemy: {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: process.env.ALCHEMY_NETWORK
  },
  infura: {
    projectId: process.env.INFURA_PROJECT_ID,
    projectSecret: process.env.INFURA_PROJECT_SECRET
  }
};

export const dexConfig = {
  uniswap: {
    graphUrl: process.env.UNISWAP_GRAPH_URL
  },
  sushiswap: {
    graphUrl: process.env.SUSHISWAP_GRAPH_URL
  }
};

export const cexConfig = {
  binance: {
    apiKey: process.env.BINANCE_API_KEY,
    apiSecret: process.env.BINANCE_API_SECRET
  },
  coinbase: {
    apiKey: process.env.COINBASE_API_KEY,
    apiSecret: process.env.COINBASE_API_SECRET
  },
  kucoin: {
    apiKey: process.env.KUCOIN_API_KEY,
    apiSecret: process.env.KUCOIN_API_SECRET
  },
  kraken: {
    apiKey: process.env.KRAKEN_API_KEY,
    apiSecret: process.env.KRAKEN_API_SECRET
  },
  mexc: {
    apiKey: process.env.MEXC_API_KEY,
    apiSecret: process.env.MEXC_API_SECRET
  },
  gateio: {
    apiKey: process.env.GATEIO_API_KEY,
    apiSecret: process.env.GATEIO_API_SECRET
  },
  bybit: {
    apiKey: process.env.BYBIT_API_KEY,
    apiSecret: process.env.BYBIT_API_SECRET
  },
  bitget: {
    apiKey: process.env.BITGET_API_KEY,
    apiSecret: process.env.BITGET_API_SECRET
  }
};