import { ethers } from 'ethers';
import { getGasPrice } from './blockchain';

class ProfitTracker {
  constructor() {
    this.operations = [];
    this.totalProfit = ethers.BigNumber.from(0);
    this.totalFees = ethers.BigNumber.from(0);
    this.initialOperationsCount = 5;
    this.feesPaid = false;
    this.metrics = {
      dailyProfits: {},
      weeklyProfits: {},
      monthlyProfits: {},
      roi: 0,
      successRate: 0,
      averageProfit: ethers.BigNumber.from(0)
    };
  }

  async addOperation({
    asset,
    amount,
    buyPrice,
    sellPrice,
    gasUsed,
    success
  }) {
    const gasPrice = await getGasPrice();
    const gasCost = ethers.BigNumber.from(gasUsed).mul(ethers.utils.parseUnits(gasPrice, 'gwei'));
    
    const profit = success ? 
      ethers.utils.parseEther(String(sellPrice - buyPrice)) : 
      ethers.BigNumber.from(0);

    const operation = {
      timestamp: Date.now(),
      asset,
      amount,
      buyPrice,
      sellPrice,
      gasUsed,
      gasCost,
      profit,
      success,
      feesCovered: this.feesPaid,
      roi: this._calculateROI(profit, gasCost)
    };

    this.operations.push(operation);
    this.totalProfit = this.totalProfit.add(profit);
    this.totalFees = this.totalFees.add(gasCost);

    // Atualizar métricas
    this._updateMetrics(operation);

    // Verifica se já pode começar a pagar as taxas
    if (!this.feesPaid && this.operations.length >= this.initialOperationsCount) {
      this.feesPaid = this.totalProfit.gt(this.totalFees);
    }
    
    // Calcular distribuição de lucros
    const profitDistribution = this.calculateProfitDistribution(profit);
    
    // Processar pagamento PIX se a operação for bem-sucedida e puder distribuir lucro
    let pixPaymentResult = null;
    if (success && this.canDistributeProfit() && profitDistribution.forPixPayment.gt(0)) {
      pixPaymentResult = await this.processPixPayment(profitDistribution.forPixPayment);
      operation.pixPayment = pixPaymentResult;
    }

    return {
      operation,
      canDistributeProfit: this.canDistributeProfit(),
      profitDistribution: profitDistribution,
      pixPaymentResult: pixPaymentResult,
      metrics: this._getMetricsSummary()
    };
  }

  canDistributeProfit() {
    return this.feesPaid && this.totalProfit.gt(this.totalFees);
  }

  calculateProfitDistribution(operationProfit) {
    if (!this.canDistributeProfit()) {
      return {
        forFees: operationProfit,
        forDistribution: ethers.BigNumber.from(0),
        forPixPayment: ethers.BigNumber.from(0)
      };
    }

    // Reserva 30% para taxas futuras
    const forFees = operationProfit.mul(30).div(100);
    // Reserva 5% para pagamentos via PIX
    const forPixPayment = operationProfit.mul(5).div(100);
    // O restante para distribuição
    const forDistribution = operationProfit.sub(forFees).sub(forPixPayment);

    return { forFees, forDistribution, forPixPayment };
  }
  
  async processPixPayment(amount) {
    try {
      console.log(`Processando pagamento PIX de ${ethers.utils.formatEther(amount)} ETH para CPF: 08806839616`);
      
      // Aqui seria implementada a integração com a API de pagamentos PIX
      // Por enquanto, apenas registramos o pagamento
      const pixPayment = {
        timestamp: Date.now(),
        amount: amount,
        cpf: "08806839616",
        status: "processed"
      };
      
      // Registrar o pagamento no histórico
      if (!this.pixPayments) {
        this.pixPayments = [];
      }
      this.pixPayments.push(pixPayment);
      
      return {
        success: true,
        payment: pixPayment
      };
    } catch (error) {
      console.error('Erro ao processar pagamento PIX:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  _calculateROI(profit, gasCost) {
    if (gasCost.isZero()) return 0;
    return parseFloat(ethers.utils.formatEther(profit)) / 
           parseFloat(ethers.utils.formatEther(gasCost)) * 100;
  }

  _updateMetrics(operation) {
    const date = new Date(operation.timestamp);
    const dayKey = date.toISOString().split('T')[0];
    const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

    // Atualizar lucros diários
    this.metrics.dailyProfits[dayKey] = (this.metrics.dailyProfits[dayKey] || ethers.BigNumber.from(0))
      .add(operation.profit);

    // Atualizar lucros semanais
    this.metrics.weeklyProfits[weekKey] = (this.metrics.weeklyProfits[weekKey] || ethers.BigNumber.from(0))
      .add(operation.profit);

    // Atualizar lucros mensais
    this.metrics.monthlyProfits[monthKey] = (this.metrics.monthlyProfits[monthKey] || ethers.BigNumber.from(0))
      .add(operation.profit);

    // Atualizar ROI médio
    this.metrics.roi = this.operations.reduce((acc, op) => acc + op.roi, 0) / this.operations.length;

    // Atualizar taxa de sucesso
    const successfulOps = this.operations.filter(op => op.success).length;
    this.metrics.successRate = (successfulOps / this.operations.length) * 100;

    // Atualizar lucro médio
    this.metrics.averageProfit = this.totalProfit.div(ethers.BigNumber.from(this.operations.length));
  }

  _getMetricsSummary() {
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];
    const thisWeekKey = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`;
    const thisMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

    return {
      daily: {
        profit: ethers.utils.formatEther(this.metrics.dailyProfits[todayKey] || ethers.BigNumber.from(0)),
        change: this._calculateProfitChange('daily', todayKey)
      },
      weekly: {
        profit: ethers.utils.formatEther(this.metrics.weeklyProfits[thisWeekKey] || ethers.BigNumber.from(0)),
        change: this._calculateProfitChange('weekly', thisWeekKey)
      },
      monthly: {
        profit: ethers.utils.formatEther(this.metrics.monthlyProfits[thisMonthKey] || ethers.BigNumber.from(0)),
        change: this._calculateProfitChange('monthly', thisMonthKey)
      },
      roi: this.metrics.roi.toFixed(2),
      successRate: this.metrics.successRate.toFixed(2),
      averageProfit: ethers.utils.formatEther(this.metrics.averageProfit)
    };
  }

  _calculateProfitChange(period, currentKey) {
    const profits = period === 'daily' ? this.metrics.dailyProfits :
                   period === 'weekly' ? this.metrics.weeklyProfits :
                   this.metrics.monthlyProfits;

    const keys = Object.keys(profits).sort();
    const currentIndex = keys.indexOf(currentKey);
    if (currentIndex <= 0) return 0;

    const currentProfit = profits[currentKey] || ethers.BigNumber.from(0);
    const previousProfit = profits[keys[currentIndex - 1]] || ethers.BigNumber.from(0);

    if (previousProfit.isZero()) return 0;

    const change = ((parseFloat(ethers.utils.formatEther(currentProfit)) -
                    parseFloat(ethers.utils.formatEther(previousProfit))) /
                   parseFloat(ethers.utils.formatEther(previousProfit))) * 100;

    return change.toFixed(2);
  }

  getOperationsSummary() {
    return {
      totalOperations: this.operations.length,
      successfulOperations: this.operations.filter(op => op.success).length,
      totalProfit: ethers.utils.formatEther(this.totalProfit),
      totalFees: ethers.utils.formatEther(this.totalFees),
      feesPaid: this.feesPaid,
      canDistributeProfit: this.canDistributeProfit(),
      metrics: this._getMetricsSummary()
    };
  }
}

export const profitTracker = new ProfitTracker();