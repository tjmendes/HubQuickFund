import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { profitTracker } from './profitTracker';
import { gasOptimizer } from './gasOptimizer';

// Configurações para monitoramento de baleias
const WHALE_CONFIG = {
    minTransactionValue: ethers.utils.parseEther('100.0'), // Valor mínimo para considerar transação de baleia
    trackingInterval: 60000, // Intervalo de monitoramento (1 minuto)
    significantMovement: 2.0, // Movimento significativo de preço (2%)
    maxCopyDelay: 5000 // Atraso máximo para copiar operação (5 segundos)
};

// Classe para análise e cópia de operações de baleias
export class WhaleTracker {
    constructor() {
        this.provider = new ethers.providers.AlchemyProvider(
            blockchainConfig.alchemy.network,
            blockchainConfig.alchemy.apiKey
        );
        this.trackedAddresses = new Set();
        this.transactionHistory = [];
    }

    // Identificar e monitorar endereços de baleias
    async identifyWhales(token) {
        try {
            const filter = {
                address: token,
                topics: [
                    ethers.utils.id("Transfer(address,address,uint256)")
                ]
            };

            this.provider.on(filter, async (log) => {
                const transaction = await this.provider.getTransaction(log.transactionHash);
                const value = ethers.BigNumber.from(transaction.value);

                if (value.gte(WHALE_CONFIG.minTransactionValue)) {
                    this.trackedAddresses.add(transaction.from);
                    await this.analyzeWhaleTransaction(transaction);
                }
            });

        } catch (error) {
            console.error('Erro ao identificar baleias:', error);
        }
    }

    // Analisar transação de baleia
    async analyzeWhaleTransaction(transaction) {
        try {
            const transactionData = {
                hash: transaction.hash,
                from: transaction.from,
                to: transaction.to,
                value: ethers.utils.formatEther(transaction.value),
                timestamp: Date.now(),
                gasPrice: ethers.utils.formatUnits(transaction.gasPrice, 'gwei')
            };

            this.transactionHistory.push(transactionData);

            // Identificar padrões de trading
            const tradingPattern = this.identifyTradingPattern(transactionData);
            if (tradingPattern) {
                await this.copyWhaleStrategy(tradingPattern);
            }

        } catch (error) {
            console.error('Erro ao analisar transação de baleia:', error);
        }
    }

    // Identificar padrões de trading
    identifyTradingPattern(transaction) {
        const recentTransactions = this.transactionHistory
            .filter(tx => tx.from === transaction.from)
            .slice(-10); // Analisa últimas 10 transações

        if (recentTransactions.length < 2) return null;

        // Calcular média de valores e intervalos
        const avgValue = recentTransactions.reduce(
            (sum, tx) => sum + parseFloat(tx.value), 0
        ) / recentTransactions.length;

        const timeIntervals = recentTransactions
            .slice(1)
            .map((tx, i) => tx.timestamp - recentTransactions[i].timestamp);

        const avgInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;

        return {
            address: transaction.from,
            averageValue: avgValue,
            averageInterval: avgInterval,
            transactionCount: recentTransactions.length,
            lastTransaction: transaction
        };
    }

    // Copiar estratégia de baleia
    async copyWhaleStrategy(pattern) {
        try {
            const gasPrices = await gasOptimizer.getGasPrices();
            const optimalGasPrice = gasPrices.mainnet?.gasPrice || '0';

            // Verificar se é viável copiar a operação
            if (parseFloat(optimalGasPrice) > parseFloat(pattern.lastTransaction.gasPrice) * 1.5) {
                console.log('Gas price too high for copying whale strategy');
                return;
            }

            // Registrar operação no tracker
            await profitTracker.addOperation({
                type: 'whale_copy',
                asset: pattern.lastTransaction.to,
                amount: pattern.averageValue.toString(),
                timestamp: Date.now(),
                whaleAddress: pattern.address,
                success: true
            });

        } catch (error) {
            console.error('Erro ao copiar estratégia de baleia:', error);
        }
    }

    // Obter relatório de atividades de baleias
    getWhaleActivityReport() {
        return {
            trackedWhales: this.trackedAddresses.size,
            totalTransactions: this.transactionHistory.length,
            recentActivity: this.transactionHistory.slice(-5), // Últimas 5 atividades
            timestamp: Date.now()
        };
    }
}

// Instância global do rastreador de baleias
export const whaleTracker = new WhaleTracker();