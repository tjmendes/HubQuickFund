import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { gasOptimizer } from './gasOptimizer';
import { profitTracker } from './profitTracker';

class Exchange {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(blockchainConfig.infura.url);
    this.transactions = [];
  }

  async manualWithdrawal({
    privateKey,
    toAddress,
    amount,
    tokenContract
  }) {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contract = new ethers.Contract(
        tokenContract,
        [
          'function transfer(address to, uint256 value) returns (bool)',
          'function balanceOf(address account) view returns (uint256)',
          'function decimals() view returns (uint8)'
        ],
        wallet
      );

      // Verificar saldo
      const balance = await contract.balanceOf(wallet.address);
      const decimals = await contract.decimals();
      const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals);

      if (balance.lt(amountInWei)) {
        throw new Error('Saldo insuficiente para saque');
      }

      // Otimizar gas
      const gasPrice = await gasOptimizer.getOptimalGasPrice();
      const gasLimit = await contract.estimateGas.transfer(toAddress, amountInWei);

      // Executar transação
      const tx = await contract.transfer(toAddress, amountInWei, {
        gasPrice,
        gasLimit: gasLimit.mul(12).div(10) // 20% buffer
      });

      // Aguardar confirmações
      const receipt = await tx.wait(2);

      // Registrar operação
      const operation = {
        type: 'withdrawal',
        hash: receipt.transactionHash,
        amount: amount.toString(),
        from: wallet.address,
        to: toAddress,
        gasUsed: receipt.gasUsed.toString(),
        timestamp: Date.now()
      };

      this.transactions.push(operation);
      await profitTracker.addOperation({
        asset: tokenContract,
        amount: amount.toString(),
        buyPrice: 0,
        sellPrice: 0,
        gasUsed: receipt.gasUsed.toString(),
        success: true
      });

      return {
        success: true,
        transaction: operation
      };
    } catch (error) {
      console.error('Erro no saque manual:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  getTransactionHistory() {
    return this.transactions;
  }

  async validateAddress(address) {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  }
}

export const exchange = new Exchange();