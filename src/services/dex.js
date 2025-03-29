
import { request, gql } from 'graphql-request';
import { dexConfig } from '../config/api';

const { uniswap, sushiswap } = dexConfig;

// Queries GraphQL para Uniswap
const UNISWAP_POOL_DATA = gql`
  query getPoolData($poolId: ID!) {
    pool(id: $poolId) {
      id
      token0Price
      token1Price
      volumeUSD
      liquidity
    }
  }
`;

// Queries GraphQL para SushiSwap
const SUSHISWAP_PAIR_DATA = gql`
  query getPairData($pairId: ID!) {
    pair(id: $pairId) {
      id
      token0Price
      token1Price
      volumeUSD
      reserveUSD
    }
  }
`;

// Função para obter dados de pool do Uniswap
export const getUniswapPoolData = async (poolId) => {
  try {
    const data = await request(
      uniswap.graphUrl,
      UNISWAP_POOL_DATA,
      { poolId }
    );
    return data.pool;
  } catch (error) {
    console.error('Erro ao obter dados do Uniswap:', error);
    throw error;
  }
};

// Função para obter dados de par do SushiSwap
export const getSushiswapPairData = async (pairId) => {
  try {
    const data = await request(
      sushiswap.graphUrl,
      SUSHISWAP_PAIR_DATA,
      { pairId }
    );
    return data.pair;
  } catch (error) {
    console.error('Erro ao obter dados do SushiSwap:', error);
    throw error;
  }
};

// Função para calcular métricas agregadas
export const getAggregatedDexMetrics = async (uniswapPoolId, sushiswapPairId) => {
  try {
    const [uniswapData, sushiswapData] = await Promise.all([
      getUniswapPoolData(uniswapPoolId),
      getSushiswapPairData(sushiswapPairId)
    ]);

    return {
      totalLiquidity: parseFloat(uniswapData.liquidity) + parseFloat(sushiswapData.reserveUSD),
      totalVolume: parseFloat(uniswapData.volumeUSD) + parseFloat(sushiswapData.volumeUSD),
      priceComparison: {
        uniswap: parseFloat(uniswapData.token0Price),
        sushiswap: parseFloat(sushiswapData.token0Price)
      }
    };
  } catch (error) {
    console.error('Erro ao calcular métricas agregadas:', error);
    throw error;
  }
};