import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { profitTracker } from './profitTracker';
import { sentimentAnalysis } from './sentimentAnalysis';

class EliteWhaleTracker {
  constructor() {
    this.eliteWallets = new Set();
    this.tradingPatterns = new Map();
    this.minWhaleTransaction = ethers.utils.parseEther('100.0');
    this.provider = new ethers.providers.JsonRpcProvider(blockchainConfig.infura.url);
  }

  async startTracking(asset) {
    try {
      // Monitorar transferências significativas
      const filter = {
        address: asset,
        topics: [
          ethers.utils.id("Transfer(address,address,uint256)")
        ]
      };

      this.provider.on(filter, async (log) => {
        const transaction = await this.provider.getTransaction(log.transactionHash);
        await this.analyzeTransaction(transaction, asset);
      });

      return true;
    } catch (error) {
      console.error('Erro ao iniciar monitoramento de baleias:', error);
      return false;
    }
  }

  async analyzeTransaction(transaction, asset) {
    try {
      const value = ethers.BigNumber.from(transaction.value);
      
      if (value.gte(this.minWhaleTransaction)) {
        // Analisar padrão de trading
        const pattern = await this.identifyTradingPattern(transaction);
        
        if (pattern.isElite) {
          this.eliteWallets.add(transaction.from);
          await this.updateTradingPattern(transaction.from, pattern);
          
          // Integrar com análise de sentimento
          const sentiment = await sentimentAnalysis.analyzeSentiment(asset);
          
          // Registrar operação elite
          const eliteOperation = {
            whale: transaction.from,
            transaction: transaction.hash,
            value: ethers.utils.formatEther(value),
            pattern: pattern.type,
            sentiment: sentiment?.score || 0,
            timestamp: Date.now()
          };
          
          await this.notifyEliteMovement(eliteOperation);
        }
      }
    } catch (error) {
      console.error('Erro ao analisar transação de baleia:', error);
    }
  }

  async identifyTradingPattern(transaction) {
    const historicalTrades = await this.getHistoricalTrades(transaction.from);
    
    const pattern = {
      isElite: false,
      type: 'unknown',
      confidence: 0
    };
    
    if (historicalTrades.length < 5) return pattern;
    
    // Análise de padrões
    const successRate = this.calculateSuccessRate(historicalTrades);
    const avgProfit = this.calculateAverageProfit(historicalTrades);
    const tradingFrequency = this.calculateTradingFrequency(historicalTrades);
    
    // Classificar trader
    if (successRate > 0.7 && avgProfit > 0.05) {
      pattern.isElite = true;
      pattern.type = this.classifyTradingStyle(historicalTrades);
      pattern.confidence = successRate * 100;
    }
    
    return pattern;
  }

  async getHistoricalTrades(address) {
    // Simulação - Em produção, integrar com APIs on-chain
    return [];
  }

  calculateSuccessRate(trades) {
    if (trades.length === 0) return 0;
    const successfulTrades = trades.filter(trade => trade.profit > 0);
    return successfulTrades.length / trades.length;
  }

  calculateAverageProfit(trades) {
    if (trades.length === 0) return 0;
    const totalProfit = trades.reduce((sum, trade) => sum + trade.profit, 0);
    return totalProfit / trades.length;
  }

  calculateTradingFrequency(trades) {
    if (trades.length < 2) return 0;
    const timespan = trades[trades.length - 1].timestamp - trades[0].timestamp;
    return trades.length / (timespan / (24 * 60 * 60 * 1000)); // Trades por dia
  }

  classifyTradingStyle(trades) {
    // Análise de estilo de trading baseada em padrões
    const holdingTimes = trades.map(trade => trade.exitTime - trade.entryTime);
    const avgHoldingTime = holdingTimes.reduce((a, b) => a + b, 0) / holdingTimes.length;
    
    if (avgHoldingTime < 300000) return 'scalper'; // 5 minutos
    if (avgHoldingTime < 3600000) return 'dayTrader'; // 1 hora
    return 'swingTrader';
  }

  async updateTradingPattern(address, pattern) {
    this.tradingPatterns.set(address, {
      ...pattern,
      lastUpdate: Date.now()
    });
  }

  async notifyEliteMovement(operation) {
    // Em produção, implementar sistema de notificações
    console.log('Movimento de baleia elite detectado:', operation);
  }

  getEliteWallets() {
    return Array.from(this.eliteWallets);
  }

  getTradingPatterns() {
    return Array.from(this.tradingPatterns.entries()).map(([address, pattern]) => ({
      address,
      ...pattern
    }));
  }
}

export const eliteWhaleTracker = new EliteWhaleTracker();