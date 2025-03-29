import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { profitTracker } from './profitTracker';
import { gasOptimizer } from './gasOptimizer';
import { sentimentAnalysis } from './sentimentAnalysis';

class SmartOrderRouter {
  constructor() {
    this.routes = new Map();
    this.latencyMetrics = new Map();
    this.provider = new ethers.providers.JsonRpcProvider(blockchainConfig.infura.url);
    this.minLiquidity = ethers.utils.parseEther('1.0');
    this.maxSlippage = 0.5; // 0.5% slippage máximo
  }

  async findOptimalRoute({
    asset,
    amount,
    exchanges,
    maxHops = 2
  }) {
    try {
      // Análise de mercado e sentimento
      const sentiment = await sentimentAnalysis.analyzeSentiment(asset);
      const marketConditions = await this._analyzeMarketConditions(asset);
      
      // Calcular rotas possíveis
      const possibleRoutes = this._generateRoutes(exchanges, maxHops);
      const optimalRoutes = [];
      
      for (const route of possibleRoutes) {
        const routeMetrics = await this._calculateRouteMetrics({
          route,
          amount,
          asset,
          sentiment,
          marketConditions
        });
        
        if (this._isRouteViable(routeMetrics)) {
          optimalRoutes.push({
            route: route,
            metrics: routeMetrics
          });
        }
      }
      
      // Ordenar rotas por eficiência
      optimalRoutes.sort((a, b) => 
        b.metrics.efficiency - a.metrics.efficiency
      );
      
      return optimalRoutes[0] || null;
    } catch (error) {
      console.error('Erro ao encontrar rota ótima:', error);
      return null;
    }
  }

  async _calculateRouteMetrics({
    route,
    amount,
    asset,
    sentiment,
    marketConditions
  }) {
    const metrics = {
      latency: 0,
      cost: ethers.BigNumber.from(0),
      liquidity: ethers.BigNumber.from(0),
      slippage: 0,
      efficiency: 0
    };
    
    // Calcular métricas para cada hop
    for (let i = 0; i < route.length - 1; i++) {
      const fromExchange = route[i];
      const toExchange = route[i + 1];
      
      // Latência
      metrics.latency += await this._getExchangeLatency(fromExchange, toExchange);
      
      // Custo (gas + taxas)
      const hopCost = await this._calculateHopCost(fromExchange, toExchange);
      metrics.cost = metrics.cost.add(hopCost);
      
      // Liquidez
      const hopLiquidity = await this._getHopLiquidity(fromExchange, toExchange, asset);
      metrics.liquidity = metrics.liquidity.add(hopLiquidity);
      
      // Slippage
      metrics.slippage += await this._calculateSlippage(fromExchange, toExchange, amount);
    }
    
    // Calcular eficiência geral
    metrics.efficiency = this._calculateEfficiencyScore({
      metrics,
      sentiment,
      marketConditions
    });
    
    return metrics;
  }

  async _getExchangeLatency(fromExchange, toExchange) {
    const key = `${fromExchange}-${toExchange}`;
    return this.latencyMetrics.get(key) || 100; // Default 100ms
  }

  async _calculateHopCost(fromExchange, toExchange) {
    const gasPrice = await gasOptimizer.getOptimalGasPrice();
    const estimatedGas = ethers.BigNumber.from('150000'); // Gas estimado por hop
    return gasPrice.mul(estimatedGas);
  }

  async _getHopLiquidity(fromExchange, toExchange, asset) {
    // Simulação - Em produção, integrar com APIs das exchanges
    return ethers.utils.parseEther('100.0');
  }

  async _calculateSlippage(fromExchange, toExchange, amount) {
    // Simulação - Em produção, calcular baseado em order books
    return 0.1; // 0.1% slippage estimado
  }

  _generateRoutes(exchanges, maxHops) {
    const routes = [];
    
    const generatePath = (current, visited, path) => {
      if (path.length > maxHops) return;
      
      if (path.length > 0) {
        routes.push([...path]);
      }
      
      for (const exchange of exchanges) {
        if (!visited.has(exchange)) {
          visited.add(exchange);
          path.push(exchange);
          generatePath(exchange, visited, path);
          path.pop();
          visited.delete(exchange);
        }
      }
    };
    
    generatePath(null, new Set(), []);
    return routes;
  }

  _isRouteViable(metrics) {
    return (
      metrics.liquidity.gte(this.minLiquidity) &&
      metrics.slippage <= this.maxSlippage &&
      metrics.efficiency > 0
    );
  }

  _calculateEfficiencyScore({
    metrics,
    sentiment,
    marketConditions
  }) {
    const latencyScore = 1 / (1 + metrics.latency / 1000); // Normalizar latência
    const costScore = 1 / (1 + parseFloat(ethers.utils.formatEther(metrics.cost)));
    const liquidityScore = parseFloat(ethers.utils.formatEther(metrics.liquidity)) / 100;
    const slippageScore = 1 - metrics.slippage;
    
    // Pesos para cada fator
    const weights = {
      latency: 0.2,
      cost: 0.3,
      liquidity: 0.25,
      slippage: 0.15,
      sentiment: 0.05,
      market: 0.05
    };
    
    return (
      latencyScore * weights.latency +
      costScore * weights.cost +
      liquidityScore * weights.liquidity +
      slippageScore * weights.slippage +
      (sentiment?.score || 0) * weights.sentiment +
      marketConditions * weights.market
    );
  }

  async _analyzeMarketConditions(asset) {
    // Simulação - Em produção, implementar análise real
    return Math.random() * 2 - 1; // -1 a 1
  }

  updateLatencyMetrics(fromExchange, toExchange, latency) {
    const key = `${fromExchange}-${toExchange}`;
    this.latencyMetrics.set(key, latency);
  }

  getRouteStatistics() {
    return {
      totalRoutes: this.routes.size,
      averageLatency: Array.from(this.latencyMetrics.values())
        .reduce((a, b) => a + b, 0) / this.latencyMetrics.size,
      activeExchanges: new Set(
        Array.from(this.routes.keys())
          .flatMap(route => route.split('-'))
      ).size
    };
  }
}

export const smartOrderRouter = new SmartOrderRouter();