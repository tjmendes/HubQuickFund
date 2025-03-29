import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { getUniswapPoolData, getSushiswapPairData } from './dex';
import { comparePrices } from './cex';
import { profitTracker } from './profitTracker';

// Configuração do provedor Ethereum
const provider = new ethers.providers.AlchemyProvider(
  blockchainConfig.alchemy.network,
  blockchainConfig.alchemy.apiKey
);

// Interface ABI simplificada para flash loans
const FLASH_LOAN_ABI = [
  'function flashLoan(address[] calldata assets, uint256[] calldata amounts, bytes calldata params)'
];

// Endereços dos contratos (exemplo)
const AAVE_LENDING_POOL = '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9';
const FLASH_LOAN_CONTRACT = '0x...'; // Endereço do seu contrato de flash loan

// Função para executar flash loan
export const executeFlashLoan = async (asset, amount, path, buyPrice, sellPrice) => {
  try {
    const flashLoanContract = new ethers.Contract(
      FLASH_LOAN_CONTRACT,
      FLASH_LOAN_ABI,
      provider
    );

    const tx = await flashLoanContract.flashLoan(
      [asset],
      [amount],
      ethers.utils.defaultAbiCoder.encode(['address[]'], [path])
    );

    const receipt = await tx.wait();
    
    // Registrar a operação no rastreador de lucros
    const operationResult = await profitTracker.addOperation({
      asset,
      amount: ethers.utils.formatEther(amount),
      buyPrice,
      sellPrice,
      gasUsed: receipt.gasUsed.toString(),
      success: true
    });

    return {
      receipt,
      operationResult
    };
  } catch (error) {
    console.error('Erro ao executar flash loan:', error);
    
    // Registrar operação falha
    await profitTracker.addOperation({
      asset,
      amount: ethers.utils.formatEther(amount),
      buyPrice,
      sellPrice,
      gasUsed: '0',
      success: false
    });
    
    throw error;
  }
};

// Função para identificar oportunidades de arbitragem
export const findArbitrageOpportunities = async (symbol) => {
  try {
    // Obter preços de CEXs
    const cexPrices = await comparePrices(symbol);

    // Obter dados de DEXs
    const uniswapData = await getUniswapPoolData(symbol);
    const sushiswapData = await getSushiswapPairData(symbol);

    // Calcular diferenças de preço
    const opportunities = [];
    const exchanges = Object.entries(cexPrices);

    for (let i = 0; i < exchanges.length; i++) {
      for (let j = i + 1; j < exchanges.length; j++) {
        const [exchange1, price1] = exchanges[i];
        const [exchange2, price2] = exchanges[j];
        const priceDiff = Math.abs(price1 - price2);
        const profitPercentage = (priceDiff / price1) * 100;

        if (profitPercentage > 0.5) { // Mínimo de 0.5% de diferença
          opportunities.push({
            buyExchange: price1 < price2 ? exchange1 : exchange2,
            sellExchange: price1 < price2 ? exchange2 : exchange1,
            profitPercentage,
            buyPrice: Math.min(price1, price2),
            sellPrice: Math.max(price1, price2)
          });
        }
      }
    }

    return opportunities;
  } catch (error) {
    console.error('Erro ao buscar oportunidades de arbitragem:', error);
    throw error;
  }
};

// Função para executar múltiplos flash loans
export const executeMultipleFlashLoans = async (opportunities) => {
  try {
    const results = [];
    for (const opportunity of opportunities) {
      const result = await executeFlashLoan(
        opportunity.asset,
        opportunity.amount,
        [opportunity.buyExchange, opportunity.sellExchange],
        opportunity.buyPrice,
        opportunity.sellPrice
      );
      
      results.push(result);

      // Aguardar 1 minuto entre operações
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
    
    return {
      results,
      summary: profitTracker.getOperationsSummary()
    };
  } catch (error) {
    console.error('Erro ao executar múltiplos flash loans:', error);
    throw error;
  }
};