// Serviço para rastrear os lucros dos usuários e calcular a taxa de 5%
import { ethers } from 'ethers';

class UserProfitService {
  constructor() {
    // Inicializa o armazenamento local para lucros dos usuários se não existir
    if (!localStorage.getItem('userProfits')) {
      localStorage.setItem('userProfits', JSON.stringify({}));
    }
  }

  // Registrar um novo lucro para um usuário
  async recordProfit(userId, operationData) {
    try {
      const userProfits = JSON.parse(localStorage.getItem('userProfits'));
      
      // Inicializa o registro do usuário se não existir
      if (!userProfits[userId]) {
        userProfits[userId] = {
          totalProfit: '0',
          totalFee: '0',
          operations: []
        };
      }
      
      // Calcula a taxa de 5% sobre o lucro
      const profitAmount = ethers.BigNumber.from(operationData.profit || '0');
      const feeAmount = profitAmount.mul(5).div(100); // 5% do lucro
      
      // Cria o registro da operação
      const operation = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        asset: operationData.asset,
        amount: operationData.amount,
        buyPrice: operationData.buyPrice,
        sellPrice: operationData.sellPrice,
        profit: profitAmount.toString(),
        fee: feeAmount.toString(),
        netProfit: profitAmount.sub(feeAmount).toString(),
        details: operationData.details || {}
      };
      
      // Adiciona a operação ao registro do usuário
      userProfits[userId].operations.push(operation);
      
      // Atualiza o lucro total e a taxa total
      const totalProfit = ethers.BigNumber.from(userProfits[userId].totalProfit);
      const totalFee = ethers.BigNumber.from(userProfits[userId].totalFee);
      
      userProfits[userId].totalProfit = totalProfit.add(profitAmount).toString();
      userProfits[userId].totalFee = totalFee.add(feeAmount).toString();
      
      // Salva as alterações
      localStorage.setItem('userProfits', JSON.stringify(userProfits));
      
      return {
        operation,
        totalProfit: userProfits[userId].totalProfit,
        totalFee: userProfits[userId].totalFee
      };
    } catch (error) {
      console.error('Erro ao registrar lucro:', error);
      throw error;
    }
  }

  // Obter o histórico de lucros de um usuário
  getUserProfitHistory(userId) {
    try {
      const userProfits = JSON.parse(localStorage.getItem('userProfits'));
      return userProfits[userId] || { totalProfit: '0', totalFee: '0', operations: [] };
    } catch (error) {
      console.error('Erro ao obter histórico de lucros:', error);
      return { totalProfit: '0', totalFee: '0', operations: [] };
    }
  }

  // Obter estatísticas de lucro de um usuário
  getUserProfitStats(userId) {
    try {
      const userProfitHistory = this.getUserProfitHistory(userId);
      const operations = userProfitHistory.operations;
      
      if (operations.length === 0) {
        return {
          totalProfit: '0',
          totalFee: '0',
          netProfit: '0',
          operationsCount: 0,
          averageProfit: '0',
          highestProfit: '0',
          lowestProfit: '0',
          profitsByAsset: {}
        };
      }
      
      // Calcula estatísticas
      let highestProfit = ethers.BigNumber.from(operations[0].profit);
      let lowestProfit = ethers.BigNumber.from(operations[0].profit);
      const profitsByAsset = {};
      
      operations.forEach(op => {
        const profit = ethers.BigNumber.from(op.profit);
        
        // Atualiza maior e menor lucro
        if (profit.gt(highestProfit)) {
          highestProfit = profit;
        }
        if (profit.lt(lowestProfit)) {
          lowestProfit = profit;
        }
        
        // Agrupa por ativo
        if (!profitsByAsset[op.asset]) {
          profitsByAsset[op.asset] = {
            totalProfit: '0',
            operationsCount: 0
          };
        }
        
        const assetProfit = ethers.BigNumber.from(profitsByAsset[op.asset].totalProfit);
        profitsByAsset[op.asset].totalProfit = assetProfit.add(profit).toString();
        profitsByAsset[op.asset].operationsCount += 1;
      });
      
      // Calcula o lucro médio
      const totalProfit = ethers.BigNumber.from(userProfitHistory.totalProfit);
      const averageProfit = operations.length > 0 
        ? totalProfit.div(operations.length).toString() 
        : '0';
      
      // Calcula o lucro líquido (após a taxa)
      const totalFee = ethers.BigNumber.from(userProfitHistory.totalFee);
      const netProfit = totalProfit.sub(totalFee).toString();
      
      return {
        totalProfit: userProfitHistory.totalProfit,
        totalFee: userProfitHistory.totalFee,
        netProfit,
        operationsCount: operations.length,
        averageProfit,
        highestProfit: highestProfit.toString(),
        lowestProfit: lowestProfit.toString(),
        profitsByAsset
      };
    } catch (error) {
      console.error('Erro ao calcular estatísticas de lucro:', error);
      return {
        totalProfit: '0',
        totalFee: '0',
        netProfit: '0',
        operationsCount: 0,
        averageProfit: '0',
        highestProfit: '0',
        lowestProfit: '0',
        profitsByAsset: {}
      };
    }
  }

  // Gerar relatório de lucros para um período específico
  generateProfitReport(userId, startDate, endDate) {
    try {
      const userProfitHistory = this.getUserProfitHistory(userId);
      const operations = userProfitHistory.operations;
      
      // Filtra operações pelo período especificado
      const filteredOperations = operations.filter(op => {
        const opDate = new Date(op.timestamp);
        return opDate >= startDate && opDate <= endDate;
      });
      
      if (filteredOperations.length === 0) {
        return {
          period: {
            start: startDate.toISOString(),
            end: endDate.toISOString()
          },
          totalProfit: '0',
          totalFee: '0',
          netProfit: '0',
          operationsCount: 0,
          operations: []
        };
      }
      
      // Calcula totais para o período
      let periodTotalProfit = ethers.BigNumber.from('0');
      let periodTotalFee = ethers.BigNumber.from('0');
      
      filteredOperations.forEach(op => {
        periodTotalProfit = periodTotalProfit.add(ethers.BigNumber.from(op.profit));
        periodTotalFee = periodTotalFee.add(ethers.BigNumber.from(op.fee));
      });
      
      const periodNetProfit = periodTotalProfit.sub(periodTotalFee);
      
      return {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        totalProfit: periodTotalProfit.toString(),
        totalFee: periodTotalFee.toString(),
        netProfit: periodNetProfit.toString(),
        operationsCount: filteredOperations.length,
        operations: filteredOperations
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de lucros:', error);
      return {
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        totalProfit: '0',
        totalFee: '0',
        netProfit: '0',
        operationsCount: 0,
        operations: []
      };
    }
  }
}

export default new UserProfitService();