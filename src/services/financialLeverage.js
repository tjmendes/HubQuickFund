import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { profitTracker } from './profitTracker';
import { gasOptimizer } from './gasOptimizer';

/**
 * Classe para estratégias de alavancagem financeira avançada
 * Implementa diferentes técnicas de alavancagem para maximizar retornos
 * em mercados de criptomoedas
 */
class FinancialLeverage {
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
        maxAllocation: 0.2 // 20% do portfólio
      },
      moderate: {
        maxLeverage: 5,
        stopLoss: 0.1, // 10%
        takeProfit: 0.2, // 20%
        maxAllocation: 0.3 // 30% do portfólio
      },
      aggressive: {
        maxLeverage: 10,
        stopLoss: 0.15, // 15%
        takeProfit: 0.3, // 30%
        maxAllocation: 0.4 // 40% do portfólio
      }
    };
    this.leverageTypes = {
      operational: {
        description: 'Alavancagem operacional usando custos fixos para amplificar efeitos de variações nas receitas',
        riskLevel: 'moderate',
        minCapital: 5000 // USD
      },
      market: {
        description: 'Alavancagem de mercado usando derivativos como opções e futuros',
        riskLevel: 'aggressive',
        minCapital: 10000 // USD
      },
      personal: {
        description: 'Alavancagem pessoal usando empréstimos para investimentos',
        riskLevel: 'aggressive',
        minCapital: 20000 // USD
      }
    };
    this.updateInterval = 60000; // 1 minuto
    this.lastUpdate = Date.now();
  }

  /**
   * Inicializa o sistema de alavancagem financeira
   * @returns {Promise<boolean>} - Status da inicialização
   */
  async initialize() {
    try {
      console.log('Inicializando sistema de alavancagem financeira...');
      
      // Iniciar monitoramento contínuo
      this.startContinuousMonitoring();
      
      console.log('Sistema de alavancagem financeira inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar sistema de alavancagem financeira:', error);
      return false;
    }
  }

  /**
   * Inicia monitoramento contínuo das posições alavancadas
   */
  startContinuousMonitoring() {
    console.log('Iniciando monitoramento contínuo de posições alavancadas...');
    
    // Monitorar a cada minuto
    setInterval(async () => {
      try {
        // Atualizar status das posições ativas
        await this.updateActivePositions();
        
        // Verificar condições de stop loss e take profit
        await this.checkStopLossAndTakeProfit();
        
        this.lastUpdate = Date.now();
      } catch (error) {
        console.error('Erro no monitoramento contínuo de alavancagem:', error);
      }
    }, this.updateInterval);
  }

  /**
   * Atualiza o status das posições ativas
   * @returns {Promise<void>}
   */
  async updateActivePositions() {
    try {
      console.log('Atualizando status das posições alavancadas ativas...');
      
      // Iterar sobre todas as posições ativas
      for (const [positionId, position] of this.activePositions.entries()) {
        // Obter preço atual do ativo
        const currentPrice = await this.getCurrentPrice(position.asset);
        
        // Calcular valor atual da posição
        const initialValue = position.entryPrice * position.amount;
        const currentValue = currentPrice * position.amount;
        
        // Calcular lucro/prejuízo
        const unrealizedPnL = currentValue - initialValue;
        const unrealizedPnLPercentage = unrealizedPnL / initialValue;
        
        // Calcular lucro/prejuízo alavancado
        const leveragedPnL = unrealizedPnL * position.leverage;
        const leveragedPnLPercentage = unrealizedPnLPercentage * position.leverage;
        
        // Calcular valor da liquidação
        const liquidationPrice = this.calculateLiquidationPrice(position);
        
        // Atualizar posição
        position.currentPrice = currentPrice;
        position.currentValue = currentValue;
        position.unrealizedPnL = unrealizedPnL;
        position.unrealizedPnLPercentage = unrealizedPnLPercentage;
        position.leveragedPnL = leveragedPnL;
        position.leveragedPnLPercentage = leveragedPnLPercentage;
        position.liquidationPrice = liquidationPrice;
        position.lastUpdate = Date.now();
        
        // Calcular risco atual
        position.riskLevel = this.calculatePositionRisk(position);
        
        // Atualizar posição no mapa
        this.activePositions.set(positionId, position);
        
        console.log(`Posição ${positionId} atualizada: P&L = ${leveragedPnLPercentage.toFixed(2)}%, Preço atual = ${currentPrice}`);
      }
      
      console.log('Status das posições alavancadas atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar status das posições alavancadas:', error);
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
        // Verificar se atingiu stop loss
        if (position.leveragedPnLPercentage <= -position.stopLoss) {
          console.log(`Stop loss atingido para posição ${positionId}. P&L: ${position.leveragedPnLPercentage.toFixed(2)}%`);
          await this.closePosition(positionId, 'stop_loss');
          continue;
        }
        
        // Verificar se atingiu take profit
        if (position.leveragedPnLPercentage >= position.takeProfit) {
          console.log(`Take profit atingido para posição ${positionId}. P&L: ${position.leveragedPnLPercentage.toFixed(2)}%`);
          await this.closePosition(positionId, 'take_profit');
          continue;
        }
        
        // Verificar se está próximo da liquidação
        const liquidationProximity = (position.currentPrice - position.liquidationPrice) / position.currentPrice;
        if (liquidationProximity < 0.05) { // Menos de 5% de distância da liquidação
          console.log(`ALERTA: Posição ${positionId} próxima da liquidação! Distância: ${(liquidationProximity * 100).toFixed(2)}%`);
        }
      }
      
      console.log('Verificação de stop loss e take profit concluída');
    } catch (error) {
      console.error('Erro ao verificar condições de stop loss e take profit:', error);
    }
  }

  /**
   * Calcula o preço de liquidação de uma posição
   * @param {Object} position - Posição alavancada
   * @returns {number} - Preço de liquidação
   */
  calculateLiquidationPrice(position) {
    // Fórmula simplificada para cálculo do preço de liquidação
    // Em produção, isso seria mais complexo e consideraria taxas, margens, etc.
    
    if (position.direction === 'long') {
      // Para posições long, o preço de liquidação é menor que o preço de entrada
      return position.entryPrice * (1 - (1 / position.leverage));
    } else {
      // Para posições short, o preço de liquidação é maior que o preço de entrada
      return position.entryPrice * (1 + (1 / position.leverage));
    }
  }

  /**
   * Calcula o nível de risco atual de uma posição
   * @param {Object} position - Posição alavancada
   * @returns {string} - Nível de risco (low, medium, high, critical)
   */
  calculatePositionRisk(position) {
    // Calcular distância até a liquidação
    const liquidationDistance = Math.abs(position.currentPrice - position.liquidationPrice) / position.currentPrice;
    
    // Determinar nível de risco com base na distância até a liquidação
    if (liquidationDistance < 0.05) {
      return 'critical';
    } else if (liquidationDistance < 0.1) {
      return 'high';
    } else if (liquidationDistance < 0.2) {
      return 'medium';
    } else {
      return 'low';
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
      'USDT': 1,
      'USDC': 1,
      'BNB': 400,
      'XRP': 0.5,
      'ADA': 0.4,
      'DOGE': 0.1,
      'SOL': 100,
      'DOT': 15,
      'AVAX': 30,
      'MATIC': 1.2,
      'LINK': 15,
      'UNI': 5
    };
    
    const basePrice = basePrices[asset] || 1;
    
    // Adicionar variação aleatória de -2% a +2%
    const variation = (Math.random() * 0.04) - 0.02;
    return basePrice * (1 + variation);
  }

  /**
   * Cria uma nova posição alavancada
   * @param {string} asset - Símbolo do ativo
   * @param {number} amount - Quantidade do ativo
   * @param {number} leverage - Multiplicador de alavancagem
   * @param {string} direction - Direção da posição (long/short)
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} - Detalhes da posição criada
   */
  async createLeveragedPosition(asset, amount, leverage, direction, options = {}) {
    try {
      console.log(`Criando posição alavancada ${direction} para ${amount} ${asset} com ${leverage}x de alavancagem...`);
      
      // Validar parâmetros
      if (amount <= 0) {
        throw new Error('A quantidade deve ser maior que zero');
      }
      
      if (leverage <= 1) {
        throw new Error('A alavancagem deve ser maior que 1');
      }
      
      if (direction !== 'long' && direction !== 'short') {
        throw new Error('A direção deve ser "long" ou "short"');
      }
      
      // Obter preço atual do ativo
      const currentPrice = await this.getCurrentPrice(asset);
      
      // Determinar perfil de risco com base na alavancagem
      let riskProfile;
      if (leverage <= 2) {
        riskProfile = this.riskProfiles.conservative;
      } else if (leverage <= 5) {
        riskProfile = this.riskProfiles.moderate;
      } else {
        riskProfile = this.riskProfiles.aggressive;
      }
      
      // Definir stop loss e take profit
      const stopLoss = options.stopLoss || riskProfile.stopLoss;
      const takeProfit = options.takeProfit || riskProfile.takeProfit;
      
      // Gerar ID único para a posição
      const positionId = `${direction}-${asset}-${leverage}x-${Date.now()}`;
      
      // Criar objeto da posição
      const position = {
        id: positionId,
        asset,
        amount,
        leverage,
        direction,
        entryPrice: currentPrice,
        currentPrice,
        stopLoss,
        takeProfit,
        liquidationPrice: this.calculateLiquidationPrice({
          entryPrice: currentPrice,
          leverage,
          direction
        }),
        initialValue: currentPrice * amount,
        currentValue: currentPrice * amount,
        unrealizedPnL: 0,
        unrealizedPnLPercentage: 0,
        leveragedPnL: 0,
        leveragedPnLPercentage: 0,
        riskLevel: 'low',
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
      
      console.log(`Posição alavancada criada com sucesso: ${positionId}`);
      return position;
    } catch (error) {
      console.error('Erro ao criar posição alavancada:', error);
      throw error;
    }
  }

  /**
   * Fecha uma posição alavancada existente
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
        direction: position.direction,
        entryPrice: position.entryPrice,
        exitPrice: position.currentPrice,
        initialValue: position.initialValue,
        finalValue: position.currentValue,
        pnl: position.unrealizedPnL,
        pnlPercentage: position.unrealizedPnLPercentage,
        leveragedPnl: position.leveragedPnL,
        leveragedPnlPercentage: position.leveragedPnLPercentage,
        duration: (Date.now() - position.startDate) / (1000 * 60 * 60), // em horas
        closedAt: Date.now(),
        reason
      };
      
      // Adicionar ao histórico
      this.positionHistory.push({
        action: 'close',
        timestamp: Date.now(),
        position: { ...position },
        result
      });
      
      // Remover da lista de posições ativas
      this.activePositions.delete(positionId);
      
      // Registrar lucro/prejuízo no rastreador de lucros
      if (result.leveragedPnl !== 0) {
        profitTracker.addProfit({
          source: 'leveraged_trading',
          asset: position.asset,
          amount: result.leveragedPnl,
          timestamp: Date.now()
        });
      }
      
      console.log(`Posição ${positionId} fechada com sucesso. P&L: ${result.leveragedPnlPercentage.toFixed(2)}%`);
      return result;
    } catch (error) {
      console.error(`Erro ao fechar posição ${positionId}:`, error);
      throw error;
    }
  }

  /**
   * Implementa estratégia de alavancagem operacional
   * @param {string} asset - Símbolo do ativo
   * @param {number} amount - Quantidade do ativo
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} - Resultado da estratégia
   */
  async executeOperationalLeverage(asset, amount, options = {}) {
    try {
      console.log(`Executando estratégia de alavancagem operacional para ${amount} ${asset}...`);
      
      // Verificar capital mínimo
      const currentPrice = await this.getCurrentPrice(asset);
      const investmentValue = currentPrice * amount;
      
      if (investmentValue < this.leverageTypes.operational.minCapital) {
        throw new Error(`Capital insuficiente. Mínimo requerido: ${this.leverageTypes.operational.minCapital} USD`);
      }
      
      // Definir custos fixos (simulado)
      const fixedCosts = options.fixedCosts || (investmentValue * 0.3); // 30% do investimento em custos fixos
      
      // Calcular alavancagem operacional
      const operationalLeverage = 1 + (fixedCosts / investmentValue);
      
      // Criar posição alavancada
      const position = await this.createLeveragedPosition(asset, amount, operationalLeverage, 'long', {
        ...options,
        leverageType: 'operational',
        fixedCosts,
        description: this.leverageTypes.operational.description
      });
      
      return {
        success: true,
        position,
        operationalLeverage,
        fixedCosts,
        strategy: 'operational_leverage',
        expectedAmplification: `${operationalLeverage.toFixed(2)}x amplificação de resultados`
      };
    } catch (error) {
      console.error(`Erro ao executar alavancagem operacional para ${asset}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Implementa estratégia de alavancagem de mercado com derivativos
   * @param {string} asset - Símbolo do ativo
   * @param {number} amount - Quantidade do ativo
   * @param {number} leverage - Multiplicador de alavancagem
   * @param {string} direction - Direção da posição (long/short)
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} - Resultado da estratégia
   */
  async executeMarketLeverage(asset, amount, leverage, direction, options = {}) {
    try {
      console.log(`Executando estratégia de alavancagem de mercado para ${amount} ${asset} com ${leverage}x...`);
      
      // Verificar capital mínimo
      const currentPrice = await this.getCurrentPrice(asset);
      const investmentValue = currentPrice * amount;
      
      if (investmentValue < this.leverageTypes.market.minCapital) {
        throw new Error(`Capital insuficiente. Mínimo requerido: ${this.leverageTypes.market.minCapital} USD`);
      }
      
      // Verificar alavancagem máxima
      if (leverage > this.riskProfiles.aggressive.maxLeverage) {
        throw new Error(`Alavancagem máxima excedida. Máximo permitido: ${this.riskProfiles.aggressive.maxLeverage}x`);
      }
      
      // Definir tipo de derivativo
      const derivativeType = options.derivativeType || 'futures'; // futures, options, perpetual
      
      // Criar posição alavancada
      const position = await this.createLeveragedPosition(asset, amount, leverage, direction, {
        ...options,
        leverageType: 'market',
        derivativeType,
        description: this.leverageTypes.market.description
      });
      
      return {
        success: true,
        position,
        derivativeType,
        strategy: 'market_leverage',
        expectedAmplification: `${leverage.toFixed(2)}x amplificação de resultados`
      };
    } catch (error) {
      console.error(`Erro ao executar alavancagem de mercado para ${asset}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Implementa estratégia de alavancagem pessoal para investimentos
   * @param {string} asset - Símbolo do ativo
   * @param {number} amount - Quantidade do ativo
   * @param {number} loanAmount - Valor do empréstimo
   * @param {number} interestRate - Taxa de juros anual
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} - Resultado da estratégia
   */
  async executePersonalLeverage(asset, amount, loanAmount, interestRate, options = {}) {
    try {
      console.log(`Executando estratégia de alavancagem pessoal para ${amount} ${asset} com empréstimo de ${loanAmount} USD...`);
      
      // Verificar capital mínimo
      const currentPrice = await this.getCurrentPrice(asset);
      const ownCapital = currentPrice * amount;
      
      if (ownCapital < this.leverageTypes.personal.minCapital) {
        throw new Error(`Capital próprio insuficiente. Mínimo requerido: ${this.leverageTypes.personal.minCapital} USD`);
      }
      
      // Calcular alavancagem total
      const totalCapital = ownCapital + loanAmount;
      const leverage = totalCapital / ownCapital;
      
      // Calcular custo mensal do empréstimo
      const monthlyInterest = loanAmount * (interestRate / 12);
      
      // Calcular quantidade total de ativos que podem ser comprados
      const totalAmount = amount + (loanAmount / currentPrice);
      
      // Criar posição alavancada
      const position = await this.createLeveragedPosition(asset, totalAmount, leverage, 'long', {
        ...options,
        leverageType: 'personal',
        loanAmount,
        interestRate,
        monthlyInterest,
        ownCapital,
        description: this.leverageTypes.personal.description
      });
      
      return {
        success: true,
        position,
        ownCapital,
        loanAmount,
        totalCapital,
        leverage,
        monthlyInterest,
        strategy: 'personal_leverage',
        breakEvenMonthlyReturn: monthlyInterest / totalCapital,
        expectedAmplification: `${leverage.toFixed(2)}x amplificação de resultados`
      };
    } catch (error) {
      console.error(`Erro ao executar alavancagem pessoal para ${asset}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Implementa estratégia de venda a descoberto (short selling)
   * @param {string} asset - Símbolo do ativo
   * @param {number} amount - Quantidade do ativo
   * @param {number} leverage - Multiplicador de alavancagem
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} - Resultado da estratégia
   */
  async executeShortSelling(asset, amount, leverage = 1, options = {}) {
    try {
      console.log(`Executando estratégia de venda a descoberto para ${amount} ${asset} com ${leverage}x de alavancagem...`);
      
      // Verificar capital mínimo
      const currentPrice = await this.getCurrentPrice(asset);
      const investmentValue = currentPrice * amount;
      
      if (investmentValue < this.leverageTypes.market.minCapital) {
        throw new Error(`Capital insuficiente. Mínimo requerido: ${this.leverageTypes.market.minCapital} USD`);
      }
      
      // Definir taxa de empréstimo do ativo (simulado)
      const borrowingFee = options.borrowingFee || 0.02; // 2% ao ano
      const dailyBorrowingFee = borrowingFee / 365;
      
      // Criar posição alavancada (short)
      const position = await this.createLeveragedPosition(asset, amount, leverage, 'short', {
        ...options,
        borrowingFee,
        dailyBorrowingFee,
        description: 'Venda a descoberto (short selling)'
      });
      
      return {
        success: true,
        position,
        borrowingFee,
        dailyBorrowingFee,
        strategy: 'short_selling',
        dailyCost: (currentPrice * amount * dailyBorrowingFee),
        expectedProfit: `Lucro se ${asset} cair abaixo de ${position.entryPrice * (1 - (dailyBorrowingFee * 30))}`
      };
    } catch (error) {
      console.error(`Erro ao executar venda a descoberto para ${asset}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtém estatísticas de desempenho das estratégias de alavancagem
   * @returns {Object} - Estatísticas de desempenho
   */
  getPerformanceStats() {
    // Calcular estatísticas gerais
    const totalPositions = this.positionHistory.filter(h => h.action === 'create').length;
    const closedPositions = this.positionHistory.filter(h => h.action === 'close').length;
    
    // Calcular lucro total
    const totalPnL = this.positionHistory
      .filter(h => h.action === 'close')
      .reduce((sum, h) => sum + h.result.leveragedPnl, 0);
    
    // Calcular taxa de sucesso
    const successfulPositions = this.positionHistory
      .filter(h => h.action === 'close' && h.result.leveragedPnl > 0)
      .length;
    
    const successRate = closedPositions > 0 ? successfulPositions / closedPositions : 0;
    
    // Calcular estatísticas por tipo de alavancagem
    const leverageTypeStats = {};
    
    for (const history of this.positionHistory.filter(h => h.action === 'close')) {
      const leverageType = history.position.options?.leverageType || 'unknown';
      
      if (!leverageTypeStats[leverageType]) {
        leverageTypeStats[leverageType] = {
          count: 0,
          totalPnL: 0,
          successCount: 0
        };
      }
      
      leverageTypeStats[leverageType].count++;
      leverageTypeStats[leverageType].totalPnL += history.result.leveragedPnl;
      
      if (history.result.leveragedPnl > 0) {
        leverageTypeStats[leverageType].successCount++;
      }
    }
    
    // Calcular taxas de sucesso por tipo
    for (const type in leverageTypeStats) {
      leverageTypeStats[type].successRate = leverageTypeStats[type].count > 0 ?