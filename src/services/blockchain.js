import { ethers } from 'ethers';
import { blockchainConfig } from '../config/api';

const { alchemy, infura } = blockchainConfig;

// Alchemy provider
export const alchemyProvider = new ethers.providers.AlchemyProvider(
  alchemy.network,
  alchemy.apiKey
);

// Infura provider
export const infuraProvider = new ethers.providers.InfuraProvider(
  infura.network,
  {
    projectId: infura.projectId,
    projectSecret: infura.projectSecret
  }
);

// Função para obter o saldo de um endereço
export const getAddressBalance = async (address, provider = alchemyProvider) => {
  try {
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Erro ao obter saldo:', error);
    throw error;
  }
};

// Função para obter o preço do gas
export const getGasPrice = async (provider = alchemyProvider) => {
  try {
    const gasPrice = await provider.getGasPrice();
    return ethers.utils.formatUnits(gasPrice, 'gwei');
  } catch (error) {
    console.error('Erro ao obter preço do gas:', error);
    throw error;
  }
};

// Função para obter informações do bloco mais recente
export const getLatestBlock = async (provider = alchemyProvider) => {
  try {
    const block = await provider.getBlock('latest');
    return block;
  } catch (error) {
    console.error('Erro ao obter bloco mais recente:', error);
    throw error;
  }
};