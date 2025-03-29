import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { profitTracker } from './profitTracker';
import { gasOptimizer } from './gasOptimizer';
import { predictiveAnalytics } from './predictiveAnalytics';

/**
 * Classe para estratégias de venda a descoberto (short selling)
 * Implementa técnicas para lucrar com a queda de preços de criptomoedas
 * através de posições vendidas
 */
class ShortSelling {
  constructor() {
    this.provider = new ethers.providers.AlchemyProvider(
      blockchainConfig.alchemy.network,
      blockchainConfig.alchemy.apiKey
    );
    this.activePositions = new Map();
    this.positionHistory = [];
    this.riskProfiles = {
      conservative: {
        maxLeverage: 2,
        stopLoss: 0.05, // 5%
        takeProfit: 0.1, // 10%
        maxAllocation: 0.1 // 10% do portfólio
      },
      moderate: {
        maxLeverage: 3,
        stopLoss: 0.1, // 10%
        takeProfit: 0.15, // 15%
        maxAllocation: 0.2 // 20% do portfólio
      },
      aggressive: {
        maxLeverage: 5,
        stopLoss: 0.15, // 15%
        takeProfit: 0.25, // 25%
        maxAllocation: 0.3 // 30% do portfólio
      }
    };
    this.shortableAssets = [
      'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'SOL', 'DOGE', 'DOT', 'AVAX', 'MATIC'
    ];
    this.borrowingFees = {
      'BTC': 0.01, // 1% ao ano
      'ETH': 0.015, // 1.5% ao ano
      'BNB': 0.02, // 2% ao ano
      'XRP': 0.025, // 2.5% ao ano
      'ADA': 0.03, // 3% ao ano
      'SOL': 0.025, // 2.5% ao ano
      'DOGE': 0.035, // 3.5% ao ano
      'DOT': 0.03, // 3% ao ano
      'AVAX': 0.025, // 2.5% ao ano
      'MATIC': 0.03 // 3% ao ano
    };
    this.updateInterval = 60000; // 1 minuto
    this.lastUpdate = Date.now();
  }

  /**
   * Inicializa o sistema de venda a descoberto
   * @returns {Promise<boolean>} - Status da inicialização
   */
  async initialize() {
    try {
      console.log('Inicializando sistema de venda a descoberto...');
      
      // Iniciar monitoramento contínuo
      this.startContinuousMonitoring();
      
      console.log('Sistema de venda a descoberto inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar sistema de venda a descoberto:', error);
      return false;
    }
  }

  /**
   * Inicia monitoramento contínuo das posições vendidas
   */
  startContinuousMonitoring() {
    console.log('Iniciando monitoramento contínuo de posições vendidas...');
    
    // Monitorar a cada minuto
    setInterval(async () => {
      try {
        // Atualizar status das posições ativas
        await this.updateActivePositions();
        
        // Verificar condições de stop loss e take profit
        await this.checkStopLossAndTakeProfit();
        
        // Verificar oportunidades de venda a descoberto
        await this.scanForShortOpportunities();
        
        this.lastUpdate = Date.now();
      } catch (error) {
        console.error('Erro no monitoramento contínuo de venda a descoberto:', error);
      }
    }, this.updateInterval);
  }

  /**
   * Atualiza o status das posições ativas
   * @returns {Promise<void>}
   */
  async updateActivePositions() {
    try {
      console.log('Atualizando status das posições vendidas ativas...');
      
      // Iterar sobre todas as posições ativas
      for (const [positionId, position] of this.activePositions.entries()) {
        // Obter preço atual do ativo
        const currentPrice = await this.getCurrentPrice(position.asset);
        
        // Calcular lucro/prejuízo
        const priceDifference = position.entryPrice - currentPrice;
        const unrealizedPnL = priceDifference * position.amount;
        const unrealizedPnLPercentage = priceDifference / position.entryPrice;
        
        // Calcular lucro/prejuízo alavancado
        const leveragedPnL = unrealizedPnL * position.leverage;
        const leveragedPnLPercentage = unrealizedPnLPercentage * position.leverage;
        
        // Calcular custos de empréstimo acumulados
        const daysSinceEntry = (Date.now() - position.startDate) / (1000 * 60 * 60 * 24);
        const borrowingCost = position.entryPrice * position.amount * position.borrowingFee * (daysSinceEntry / 365);
        
        // Calcular lucro/prejuízo líquido
        const netPnL = leveragedPnL - borrowingCost;
        const netPnLPercentage = (netPnL / (position.entryPrice * position.amount)) * 100;
        
        // Atualizar posição
        position.currentPrice = currentPrice;
        position.unrealizedPnL = unrealizedPnL;
        position.unrealizedPnLPercentage = unrealizedPnLPercentage;
        position.leveragedPnL = leveragedPnL;
        position.leveragedPnLPercentage = leveragedPnLPercentage;
        position.borrowingCost = borrowingCost;
        position.netPnL = netPnL;
        position.netPnLPercentage = netPnLPercentage;
        position.lastUpdate = Date.now();
        
        // Atualizar posição no mapa
        this.activePositions.set(positionId, position);
        
        console.log(`Posição ${positionId} atualizada: P&L = ${netPnLPercentage.toFixed(2)}%, Preço atual = ${currentPrice}`);
      }
      
      console.log('Status das posições vendidas atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status das posições vendidas:', error);
    }
  }

  /**
   * Verifica condições de stop loss e take profit
   * @returns {Promise<void>}
   */
  async checkStopLossAndTakeProfit() {
    try {
      console.log('Verificando condições de stop loss e take profit...');
      
      // Iterar sobre todas as posições ativas
      for (const [positionId, position] of this.activePositions.entries()) {
        // Para posições vendidas, o stop loss é atingido quando o preço sobe
        if (position.leveragedPnLPercentage <= -position.stopLoss) {
          console.log(`Stop loss atingido para posição ${positionId}. P&L: ${position.netPnLPercentage.toFixed(2)}%`);
          await this.closePosition(positionId, 'stop_loss');
          continue;
        }
        
        // Para posições vendidas, o take profit é atingido quando o preço cai
        if (position.leveragedPnLPercentage >= position.takeProfit) {
          console.log(`Take profit atingido para posição ${positionId}. P&L: ${position.netPnLPercentage.toFixed(2)}%`);
          await this.closePosition(positionId, 'take_profit');
          continue;
        }
      }
      
      console.log('Verificação de stop loss e take profit concluída');
    } catch (error) {
      console.error('Erro ao verificar condições de stop loss e take profit:', error);
    }
  }

  /**
   * Escaneia o mercado em busca de oportunidades de venda a descoberto
   * @returns {Promise<Array>} - Lista de oportunidades encontradas
   */
  async scanForShortOpportunities() {
    try {
      console.log('Escaneando mercado em busca de oportunidades de venda a descoberto...');
      
      const opportunities = [];
      
      // Analisar cada ativo disponível para venda a descoberto
      for (const asset of this.shortableAssets) {
        // Obter dados de preço e análise técnica
        const priceData = await this.getPriceData(asset);
        const technicalAnalysis = await this.getTechnicalAnalysis(asset);
        
        // Obter análise de sentimento
        const sentimentAnalysis = await this.getSentimentAnalysis(asset);
        
        // Obter previsão de preço
        const pricePrediction = await predictiveAnalytics.predictPriceMovement(asset);
        
        // Verificar sinais de venda a descoberto
        const shortSignals = this.analyzeShortSignals(asset, priceData, technicalAnalysis, sentimentAnalysis, pricePrediction);
        
        // Se houver sinais suficientes, adicionar à lista de oportunidades
        if (shortSignals.score >= 7) { // Pontuação mínima de 7/10
          opportunities.push({
            asset,
            currentPrice: priceData.price,
            signals: shortSignals.signals,
            score: shortSignals.score,
            recommendation: shortSignals.score >= 9 ? 'strong_sell' : 'sell',
            expectedDownside: shortSignals.expectedDownside,
            timeframe: shortSignals.timeframe,
            borrowingFee: this.borrowingFees[asset] || 0.02
          });
        }
      }
      
      // Ordenar oportunidades pela pontuação (decrescente)
      opportunities.sort((a, b) => b.score - a.score);
      
      if (opportunities.length > 0) {
        console.log(`Encontradas ${opportunities.length} oportunidades de venda a descoberto`);
      } else {
        console.log('Nenhuma oportunidade de venda a descoberto encontrada');
      }
      
      return opportunities;
    } catch (error) {
      console.error('Erro ao escanear oportunidades de venda a descoberto:', error);
      return [];
    }
  }

  /**
   * Obtém dados de preço de um ativo (simulado)
   * @param {string} asset - Símbolo do ativo
   * @returns {Promise<Object>} - Dados de preço
   */
  async getPriceData(asset) {
    // Em produção, isso seria substituído por chamadas reais às APIs
    // Simulação de dados de preço
    
    // Preços base simulados para diferentes ativos
    const basePrices = {
      'BTC': 60000,
      'ETH': 3000,
      'BNB': 400,
      'XRP': 0.5,
      'ADA': 0.4,
      'SOL': 100,
      'DOGE': 0.1,
      'DOT': 15,
      'AVAX': 30,
      'MATIC': 1.2
    };
    
    const basePrice = basePrices[asset] || 1;
    
    // Adicionar variação aleatória de -2% a +2%
    const variation = (Math.random() * 0.04) - 0.02;
    const currentPrice = basePrice * (1 + variation);
    
    // Gerar dados de preço simulados
    return {
      asset,
      price: currentPrice,
      change24h: (Math.random() * 0.1) - 0.05, // -5% a +5%
      volume24h: basePrice * 1000000 * (Math.random() + 0.5), // Volume proporcional ao preço
      high24h: currentPrice * (1 + (Math.random() * 0.03)), // +0% a +3%
      low24h: currentPrice * (1 - (Math.random() * 0.03)), // -0% a -3%
      timestamp: Date.now()
    };
  }

  /**
   * Obtém análise técnica de um ativo (simulado)
   * @param {string} asset - Símbolo do ativo
   * @returns {Promise<Object>} - Análise técnica
   */
  async getTechnicalAnalysis(asset) {
    // Em produção, isso seria substituído por análise técnica real
    // Simulação de análise técnica
    
    // Gerar indicadores técnicos aleatórios
    const rsi = Math.random() * 100; // 0-100
    const macd = (Math.random() * 2) - 1; // -1 a +1
    const ema20 = await this.getCurrentPrice(asset) * (1 + ((Math.random() * 0.1) - 0.05)); // ±5% do preço atual
    const ema50 = await this.getCurrentPrice(asset) * (1 + ((Math.random() * 0.15) - 0.075)); // ±7.5% do preço atual
    const ema200 = await this.getCurrentPrice(asset) * (1 + ((Math.random() * 0.2) - 0.1)); // ±10% do preço atual
    const bollingerUpper = await this.getCurrentPrice(asset) * 1.05; // +5% do preço atual
    const bollingerLower = await this.getCurrentPrice(asset) * 0.95; // -5% do preço atual
    
    return {
      asset,
      rsi,
      macd,
      ema: {
        ema20,
        ema50,
        ema200
      },
      bollingerBands: {
        upper: bollingerUpper,
        lower: bollingerLower
      },
      signals: {
        rsiOverbought: rsi > 70,
        macdBearish: macd < 0,
        priceAboveEma20: await this.getCurrentPrice(asset) > ema20,
        priceAboveEma50: await this.getCurrentPrice(asset) > ema50,
        priceAboveEma200: await this.getCurrentPrice(asset) > ema200,
        priceAboveBollingerUpper: await this.getCurrentPrice(asset) > bollingerUpper
      },
      timestamp: Date.now()
    };
  }

  /**
   * Obtém análise de sentimento de um ativo (simulado)
   * @param {string} asset - Símbolo do ativo
   * @returns {Promise<Object>} - Análise de sentimento
   */
  async getSentimentAnalysis(asset) {
    // Em produção, isso seria substituído por análise de sentimento real
    // Simulação de análise de sentimento
    
    // Gerar sentimento aleatório (-1 a +1)
    const sentiment = (Math.random() * 2) - 1;
    
    return {
      asset,
      sentiment,
      sentimentCategory: sentiment < -0.3 ? 'bearish' : sentiment > 0.3 ? 'bullish' : 'neutral',
      confidence: 0.7 + (Math.random() * 0.3), // 0.7-1.0
      sources: {
        twitter: (Math.random() * 2) - 1,
        reddit: (Math.random() * 2) - 1,
        news: (Math.random() * 2) - 1
      },
      timestamp: Date.now()
    };
  }

  /**
   * Analisa sinais para venda a descoberto
   * @param {string} asset - Símbolo do ativo
   * @param {Object} priceData - Dados de preço
   * @param {Object} technicalAnalysis - Análise técnica
   * @param {Object} sentimentAnalysis - Análise de sentimento
   * @param {Object} pricePrediction - Previsão de preço
   * @returns {Object} - Análise de sinais
   */
  analyzeShortSignals(asset, priceData, technicalAnalysis, sentimentAnalysis, pricePrediction) {
    const signals = [];
    let score = 0;
    
    // Analisar sinais técnicos
    if (technicalAnalysis.signals.rsiOverbought) {
      signals.push('RSI em condição de sobrecompra');
      score += 2;
    }
    
    if (technicalAnalysis.signals.macdBearish) {
      signals.push('MACD com sinal de baixa');
      score += 1.5;
    }
    
    if (technicalAnalysis.signals.priceAboveEma20) {
      signals.push('Preço acima da EMA de 20 períodos');
      score += 0.5;
    }
    
    if (technicalAnalysis.signals.priceAboveEma50) {
      signals.push('Preço acima da EMA de 50 períodos');
      score += 1;
    }
    
    if (technicalAnalysis.signals.priceAboveEma200) {
      signals.push('Preço acima da EMA de 200 períodos');
      score += 1.5;
    }
    
    if (technicalAnalysis.signals.priceAboveBollingerUpper) {
      signals.push('Preço acima da banda superior de Bollinger');
      score += 2;
    }
    
    // Analisar sentimento
    if (sentimentAnalysis.sentimentCategory === 'bearish') {
      signals.push('Sentimento de mercado negativo');
      score += 1.5;
    } else if (sentimentAnalysis.sentimentCategory === 'bullish') {
      signals.push('Sentimento de mercado positivo (contra-indicação)');
      score -= 1.5;
    }
    
    // Analisar previsão de preço
    if (pricePrediction.direction === 'down') {
      signals.push('Previsão de queda de preço');
      score += 2 * pricePrediction.confidence;
    } else if (pricePrediction.direction === 'up') {
      signals.push('Previsão de alta de preço (contra-indicação)');
      score -= 2 * pricePrediction.confidence;
    }
    
    // Limitar score entre 0 e 10
    score = Math.max(0, Math.min(10, score));
    
    // Estimar potencial de queda
    const expectedDownside = this.estimateDownsidePotential(asset, technicalAnalysis, pricePrediction);
    
    // Determinar timeframe recomendado
    const timeframe = this.determineTimeframe(score, technicalAnalysis, pricePrediction);
    
    return {
      signals,
      score,
      expectedDownside,
      timeframe
    };
  }

  /**
   * Estima o potencial de queda de um ativo
   * @param {string} asset - Símbolo do ativo
   * @param {Object} technicalAnalysis - Análise técnica
   * @param {Object} pricePrediction - Previsão de preço
   * @returns {Object} - Potencial de queda estimado
   */
  estimateDownsidePotential(asset, technicalAnalysis, pricePrediction) {
    // Em produção, isso seria uma análise mais sofisticada
    // Simulação de estimativa de potencial de queda
    
    let downsidePercentage;
    
    if (pricePrediction.direction === 'down') {
      // Usar previsão se disponível
      downsidePercentage = Math.abs(pricePrediction.expectedChange);
    } else {
      // Caso contrário, estimar com base na análise técnica
      if (technicalAnalysis.signals.rsiOverbought && technicalAnalysis.signals.priceAboveBollingerUpper) {
        // Condições extremas de sobrecompra
        downsidePercentage = 0.1 + (Math.random() * 0.1); // 10-20%
      } else if (technicalAnalysis.signals.priceAboveEma200) {
        // Acima da tendência de longo prazo
        downsidePercentage = 0.05 + (Math.random() * 0.05); // 5-10%
      } else {
        // Condições moderadas
        downsidePercentage = 0.02 + (Math.random() * 0.03); // 2-5%
      }
    }
    
    // Calcular preço alvo
    const currentPrice = technicalAnalysis.ema.ema20; // Usar EMA20 como referência de preço atual
    const targetPrice = currentPrice * (1 - downsidePercentage);
    
    return {
      percentage: downsidePercentage,
      currentPrice,
      targetPrice
    };
  }

  /**
   * Determina o timeframe recomendado para a operação
   * @param {number} score - Pontuação da análise
   * @param {Object} technicalAnalysis - Análise técnica
   * @param {Object} pricePrediction - Previsão de preço
   * @returns {string} - Timeframe recomendado
   */
  determineTimeframe(score, technicalAnalysis, pricePrediction) {
    // Determinar timeframe com base na pontuação e sinais
    if (score >= 9) {
      // Sinais muito fortes - operação de curto prazo
      return 'short_term'; // 1-7 dias
    } else if (score >= 7) {
      // Sinais fortes - operação de médio prazo
      return 'medium_term'; // 1-4 semanas
    } else {
      // Sinais moderados - operação de longo prazo
      return 'long_term'; // 1-3 meses
    }
  }

  /**
   * Obtém o preço atual de um ativo (simulado)
   * @param {string} asset - Símbolo do ativo
   * @returns {Promise<number>} - Preço atual
   */
  async getCurrentPrice(asset) {
    // Em produção, isso seria substituído por chamadas reais às APIs
    // Simulação de preço atual
    
    // Preços base simulados para diferentes ativos
    const basePrices = {
      'BTC': 60000,
      'ETH': 3000,
      'BNB': 400,
      'XRP': 0.5,
      'ADA': 0.4,
      'SOL': 100,
      'DOGE': 0.1,
      'DOT': 15,
      'AVAX': 30,
      'MATIC': 1.2
    };
    
    const basePrice = basePrices[asset] || 1;
    
    // Adicionar variação aleatória de -2% a +2%
    const variation = (Math.random() * 0.04) - 0.02;
    return basePrice * (1 + variation);
  }

  /**
   * Cria uma nova posição vendida (short)
   * @param {string} asset - Símbolo do ativo
   * @param {number} amount - Quantidade do ativo
   * @param {number} leverage - Multiplicador de alavancagem
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} - Detalhes da posição criada
   */
  async createShortPosition(asset, amount, leverage = 1, options = {}) {
    try {
      console.log(`Criando posição vendida para ${amount} ${asset} com ${leverage}x de alavancagem...`);
      
      // Validar parâmetros
      if (amount <= 0) {
        throw new Error('A quantidade deve ser maior que zero');
      }
      
      if (leverage <= 0) {
        throw new Error('A alavancagem deve ser maior que zero');
      }
      
      if (!this.shortableAssets.includes(asset)) {
        throw new Error(`Ativo ${asset} não disponível para venda a descoberto`);
      }
      
      // Obter preço atual do ativo
      const currentPrice = await this.getCurrentPrice(asset);
      
      // Determinar perfil de risco com base na alavancagem
      let riskProfile;
      if (leverage <= 2) {
        riskProfile = this.riskProfiles.conservative;
      } else if (leverage <= 3) {
        riskProfile = this.riskProfiles.moderate;
      } else {
        riskProfile = this.riskProfiles.aggressive;
      }
      
      // Definir stop loss e take profit
      const stopLoss = options.stopLoss || riskProfile.stopLoss;
      const takeProfit = options.takeProfit || riskProfile.takeProfit;
      
      // Definir taxa de empréstimo
      const borrowingFee = this.borrowingFees[asset] || 0.02; // 2% ao ano por padrão
      
      // Gerar ID único para a posição
      const positionId = `short-${asset}-${leverage}x-${Date.now()}`;
      
      // Criar objeto da posição
      const position = {
        id: positionId,
        type: 'short',
        asset,
        amount,
        leverage,
        entryPrice: currentPrice,
        currentPrice,
        stopLoss,
        takeProfit,
        borrowingFee,
        initialValue: currentPrice * amount,
        unrealizedPnL: 0,
        unrealizedPnLPercentage: 0,
        leveragedPnL: 0,
        leveragedPnLPercentage: 0,
        borrowingCost: 0,
        netPnL: 0,
        netPnLPercentage: 0,
        startDate: Date.now(),
        lastUpdate: Date.now(),
        status: 'active',
        options
      };
      
      // Adicionar à lista de posições ativas
      this.activePositions.set(positionId, position);
      
      // Adicionar ao histórico
      this.positionHistory.push({
        action: 'create',
        timestamp: Date.now(),
        position: { ...position }
      });
      
      console.log(`Posição vendida criada com sucesso: ${positionId}`);
      return position;
    } catch (error) {
      console.error('Erro ao criar posição vendida:', error);
      throw error;
    }
  }

  /**
   * Fecha uma posição vendida existente
   * @param {string} positionId - ID da posição a ser fechada
   * @param {string} reason - Motivo do fechamento
   * @returns {Promise<Object>} - Resultado do fechamento
   */
  async closePosition(positionId, reason = 'manual') {
    try {
      console.log(`Fechando posição ${positionId}...`);
      
      // Verificar se a posição existe
      if (!this.activePositions.has(positionId)) {
        throw new Error(`Posição ${positionId} não encontrada`);
      }
      
      // Obter posição
      const position = this.activePositions.get(positionId);
      
      // Calcular resultado final
      const result = {
        positionId,
        asset: position.asset,
        amount: position.amount,
        leverage: position.leverage,
        entryPrice: position.entryPrice,
        exitPrice: position.currentPrice,
        initialValue: position.initialValue,
        pnl: position.unrealizedPnL,
        pnlPercentage: position.unrealizedPnLPercentage,
        leveragedPnl: position.leveragedPnL,
        leveragedPnlPercentage: position.leveragedPnLPercentage,
        borrowingCost: position.borrowingCost,
        netPnl: position.netPnL