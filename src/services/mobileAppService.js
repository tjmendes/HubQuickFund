/**
 * Serviço para gerenciamento do aplicativo móvel
 * Este arquivo contém funções para download e envio do APK por email
 */

import axios from 'axios';
import { isNativePlatform } from './capacitorService';

/**
 * Função para obter o caminho do APK gerado
 */
export const getApkPath = async () => {
  try {
    const response = await axios.get('/api/mobile/apk-path');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter caminho do APK:', error);
    throw error;
  }
};

/**
 * Função para enviar o APK por email
 */
export const sendApkByEmail = async (email) => {
  try {
    const response = await axios.post('/api/mobile/send-apk', { email });
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar APK por email:', error);
    throw error;
  }
};

/**
 * Função para verificar se o APK está disponível
 */
export const isApkAvailable = async () => {
  try {
    const response = await axios.get('/api/mobile/apk-status');
    return response.data.available;
  } catch (error) {
    console.error('Erro ao verificar disponibilidade do APK:', error);
    return false;
  }
};

/**
 * Função para gerar o APK
 */
export const generateApk = async () => {
  try {
    const response = await axios.post('/api/mobile/generate-apk');
    return response.data;
  } catch (error) {
    console.error('Erro ao gerar APK:', error);
    throw error;
  }
};

/**
 * Função para obter instruções de instalação
 */
export const getInstallationInstructions = async (deviceType = 'android') => {
  try {
    const response = await axios.get(`/api/mobile/installation-instructions?deviceType=${deviceType}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter instruções de instalação:', error);
    throw error;
  }
};