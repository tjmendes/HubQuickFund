import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';
import { profitTracker } from './profitTracker';

// Configurações dos protocolos DeFi
const DEFI_PROTOCOLS = {
  aave: {
    v3: {
      mainnet: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      polygon: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
      optimism: '0x794a61358D6845594F94dc1DB02A252b5b4814aD'
    }
  },
  compound: {
    v3: {
      mainnet: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
      polygon: '0x92Bb03137F8F5937c7A743F8C0B7e55E485E4B24'
    }
  }
};

// Função para obter as melhores taxas de empréstimo
export const getBestLendingRates = async (asset, amount) => {
  const opportunities = [];
  
  for (const [protocol, versions] of Object.entries(DEFI_PROTOCOLS)) {
    for (const [version, networks] of Object.entries(versions)) {
      for (const [network, address] of Object.entries(networks)) {
        try {
          const provider = new ethers.providers.JsonRpcProvider(
            network === 'mainnet' 
              ? `https://eth-mainnet.alchemyapi.io/v2/${blockchainConfig.alchemy.apiKey}`
              : network === 'polygon'
              ? 'https://polygon-rpc.com'
              : 'https://mainnet.optimism.io'
          );
          
          const lendingPool = new ethers.Contract(
            address,
            ['function getReserveData(address asset) view returns (tuple(uint256 liquidityRate, uint256 variableBorrowRate))'],
            provider
          );
          
          const reserveData = await lendingPool.getReserveData(asset);
          
          opportunities.push({
            protocol,
            version,
            network,
            lendingRate: ethers.utils.formatUnits(reserveData.liquidityRate, 27),
            borrowRate: ethers.utils.formatUnits(reserveData.variableBorrowRate, 27)
          });
        } catch (error) {
          console.error(
            `Erro ao obter taxas de ${protocol} ${version} em ${network}:`,
            error
          );
        }
      }
    }
  }
  
  return opportunities.sort((a, b) => b.lendingRate - a.lendingRate);
};

// Função para executar empréstimo e reinvestimento
export const executeLendingStrategy = async (asset, amount, strategy) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      strategy.network === 'mainnet'
        ? `https://eth-mainnet.alchemyapi.io/v2/${blockchainConfig.alchemy.apiKey}`
        : strategy.network === 'polygon'
        ? 'https://polygon-rpc.com'
        : 'https://mainnet.optimism.io'
    );
    
    const lendingPool = new ethers.Contract(
      DEFI_PROTOCOLS[strategy.protocol][strategy.version][strategy.network],
      [
        'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
        'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)'
      ],
      provider
    );
    
    // Executar empréstimo
    const tx = await lendingPool.borrow(
      asset,
      ethers.utils.parseUnits(amount.toString(), 18),
      2, // Taxa variável
      0, // Código de referência
      strategy.onBehalfOf || provider.getSigner().getAddress()
    );
    
    const receipt = await tx.wait();
    
    // Registrar operação
    await profitTracker.addOperation({
      asset,
      amount: amount.toString(),
      borrowRate: strategy.borrowRate,
      lendingRate: strategy.lendingRate,
      gasUsed: receipt.gasUsed.toString(),
      success: true
    });
    
    return {
      transactionHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed.toString(),
      status: receipt.status
    };
  } catch (error) {
    console.error('Erro ao executar estratégia de empréstimo:', error);
    throw error;
  }
};

// Função para calcular retorno estimado do reinvestimento
export const calculateReinvestmentReturn = async (asset, amount, period) => {
  try {
    const rates = await getBestLendingRates(asset, amount);
    const bestRate = rates[0];
    
    const annualReturn = amount * parseFloat(bestRate.lendingRate);
    const periodReturn = (annualReturn / 365) * period; // Retorno diário
    
    return {
      estimatedReturn: periodReturn,
      annualizedReturn: annualReturn,
      bestProtocol: {
        name: bestRate.protocol,
        version: bestRate.version,
        network: bestRate.network,
        lendingRate: bestRate.lendingRate
      }
    };
  } catch (error) {
    console.error('Erro ao calcular retorno do reinvestimento:', error);
    throw error;
  }
};