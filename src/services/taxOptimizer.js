import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { profitTracker } from './profitTracker';
import { gasOptimizer } from './gasOptimizer';

class TaxOptimizer {
  constructor() {
    this.transactions = [];
    this.layer2Networks = {
      arbitrum: {
        rpc: 'https://arb1.arbitrum.io/rpc',
        bridgeContract: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a',
        minValue: ethers.utils.parseEther('0.1')
      },
      optimism: {
        rpc: 'https://mainnet.optimism.io',
        bridgeContract: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
        minValue: ethers.utils.parseEther('0.1')
      }
    };
  }

  async optimizeTransaction(transaction) {
    try {
      const gasPrices = await this._getNetworkGasPrices();
      const bestNetwork = this._selectBestNetwork(gasPrices, transaction.value);
      
      if (!bestNetwork) {
        return {
          success: false,
          message: 'Nenhuma rede adequada encontrada para otimização'
        };
      }

      const optimizedTx = {
        ...transaction,
        network: bestNetwork.name,
        estimatedGas: bestNetwork.gasPrice,
        estimatedSavings: this._calculateSavings(
          transaction.value,
          bestNetwork.gasPrice
        )
      };

      this.transactions.push(optimizedTx);
      return {
        success: true,
        optimizedTransaction: optimizedTx
      };
    } catch (error) {
      console.error('Erro na otimização de taxas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async _getNetworkGasPrices() {
    const prices = {};
    
    for (const [network, config] of Object.entries(this.layer2Networks)) {
      try {
        const provider = new ethers.providers.JsonRpcProvider(config.rpc);
        const gasPrice = await provider.getGasPrice();
        prices[network] = {
          name: network,
          gasPrice: gasPrice,
          config: config
        };
      } catch (error) {
        console.error(`Erro ao obter preço do gas em ${network}:`, error);
      }
    }
    
    return prices;
  }

  _selectBestNetwork(gasPrices, transactionValue) {
    let bestNetwork = null;
    let lowestCost = ethers.constants.MaxUint256;
    
    for (const [network, data] of Object.entries(gasPrices)) {
      const totalCost = this._calculateTotalCost(
        transactionValue,
        data.gasPrice,
        data.config
      );
      
      if (totalCost.lt(lowestCost)) {
        lowestCost = totalCost;
        bestNetwork = data;
      }
    }
    
    return bestNetwork;
  }

  _calculateTotalCost(value, gasPrice, networkConfig) {
    const estimatedGas = ethers.BigNumber.from('250000'); // Gas estimado para bridge
    const gasCost = gasPrice.mul(estimatedGas);
    
    if (value.lt(networkConfig.minValue)) {
      return ethers.constants.MaxUint256;
    }
    
    return gasCost;
  }

  _calculateSavings(value, optimizedGasPrice) {
    const mainnetGasPrice = ethers.utils.parseUnits('50', 'gwei'); // Preço médio do gas na mainnet
    const estimatedGas = ethers.BigNumber.from('250000');
    
    const mainnetCost = mainnetGasPrice.mul(estimatedGas);
    const optimizedCost = optimizedGasPrice.mul(estimatedGas);
    
    return ethers.utils.formatEther(mainnetCost.sub(optimizedCost));
  }

  async generateTaxReport(startDate, endDate) {
    const relevantTransactions = this.transactions.filter(
      tx => tx.timestamp >= startDate && tx.timestamp <= endDate
    );
    
    const report = {
      period: {
        start: new Date(startDate).toISOString(),
        end: new Date(endDate).toISOString()
      },
      totalTransactions: relevantTransactions.length,
      totalGasSaved: relevantTransactions.reduce(
        (acc, tx) => acc + parseFloat(tx.estimatedSavings),
        0
      ),
      networkDistribution: this._calculateNetworkDistribution(relevantTransactions),
      averageSavingsPerTransaction: this._calculateAverageSavings(relevantTransactions)
    };
    
    return report;
  }

  _calculateNetworkDistribution(transactions) {
    const distribution = {};
    
    transactions.forEach(tx => {
      distribution[tx.network] = (distribution[tx.network] || 0) + 1;
    });
    
    return distribution;
  }

  _calculateAverageSavings(transactions) {
    if (transactions.length === 0) return 0;
    
    const totalSavings = transactions.reduce(
      (acc, tx) => acc + parseFloat(tx.estimatedSavings),
      0
    );
    
    return totalSavings / transactions.length;
  }
}

export const taxOptimizer = new TaxOptimizer();