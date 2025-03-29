/**
 * Serviço para integração com o Capacitor
 * Este arquivo gerencia a funcionalidade específica para dispositivos móveis
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { BackgroundTask } from '@capacitor/background-task';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { Storage } from '@capacitor/storage';
import { PushNotifications } from '@capacitor/push-notifications';

// Serviços de negócio
import { profitTracker } from './profitTracker';
import { continuousOptimizationService } from './continuousOptimizationService';

/**
 * Verifica se o aplicativo está rodando em um dispositivo móvel nativo
 */
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Obtém informações sobre o dispositivo atual
 */
export const getDeviceInfo = async () => {
  try {
    const info = await Device.getInfo();
    const battery = await Device.getBatteryInfo();
    const id = await Device.getId();
    
    return {
      platform: info.platform,
      model: info.model,
      operatingSystem: info.operatingSystem,
      osVersion: info.osVersion,
      manufacturer: info.manufacturer,
      isVirtual: info.isVirtual,
      webViewVersion: info.webViewVersion,
      batteryLevel: battery.batteryLevel,
      isCharging: battery.isCharging,
      deviceId: id.uuid
    };
  } catch (error) {
    console.error('Erro ao obter informações do dispositivo:', error);
    return null;
  }
};

/**
 * Verifica o status da conexão de rede
 */
export const checkNetworkStatus = async () => {
  try {
    const status = await Network.getStatus();
    return status;
  } catch (error) {
    console.error('Erro ao verificar status da rede:', error);
    return { connected: false, connectionType: 'none' };
  }
};

/**
 * Registra um listener para mudanças no status da rede
 */
export const addNetworkListener = (callback) => {
  try {
    const handler = Network.addListener('networkStatusChange', (status) => {
      callback(status);
    });
    return handler;
  } catch (error) {
    console.error('Erro ao adicionar listener de rede:', error);
    return null;
  }
};

/**
 * Inicializa o sistema de notificações locais
 */
export const initializeLocalNotifications = async () => {
  try {
    if (isNativePlatform()) {
      await LocalNotifications.requestPermissions();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao inicializar notificações locais:', error);
    return false;
  }
};

/**
 * Envia uma notificação local
 */
export const sendLocalNotification = async (title, body, id = Math.floor(Math.random() * 10000)) => {
  try {
    if (!isNativePlatform()) return false;
    
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id,
          schedule: { at: new Date(Date.now() + 1000) },
          sound: 'beep.wav',
          attachments: null,
          actionTypeId: '',
          extra: null
        }
      ]
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao enviar notificação local:', error);
    return false;
  }
};

/**
 * Inicializa o sistema de notificações push
 */
export const initializePushNotifications = async () => {
  try {
    if (!isNativePlatform()) return false;
    
    // Solicitar permissão
    const result = await PushNotifications.requestPermissions();
    if (result.receive === 'granted') {
      // Registrar para receber notificações push
      await PushNotifications.register();
      
      // Configurar listeners
      PushNotifications.addListener('registration', (token) => {
        console.log('Token de push notification:', token.value);
        // Aqui você pode enviar o token para seu backend
        savePushToken(token.value);
      });
      
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Erro no registro de push notifications:', error);
      });
      
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Notificação recebida:', notification);
      });
      
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Ação em notificação realizada:', notification);
      });
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao inicializar notificações push:', error);
    return false;
  }
};

/**
 * Salva o token de push notification no armazenamento local
 */
export const savePushToken = async (token) => {
  try {
    await Storage.set({
      key: 'push_token',
      value: token
    });
    return true;
  } catch (error) {
    console.error('Erro ao salvar token de push:', error);
    return false;
  }
};

/**
 * Registra uma tarefa em segundo plano
 */
export const registerBackgroundTask = async (taskId, callback) => {
  try {
    if (!isNativePlatform()) return false;
    
    BackgroundTask.beforeExit(async () => {
      // Executar a tarefa em segundo plano
      await callback();
      
      // Notificar que a tarefa foi concluída
      BackgroundTask.finish({ taskId });
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao registrar tarefa em segundo plano:', error);
    return false;
  }
};

/**
 * Inicia o serviço de otimização contínua em segundo plano
 */
export const startContinuousOptimizationService = async () => {
  try {
    if (!isNativePlatform()) return false;
    
    // Verificar status da rede antes de iniciar
    const networkStatus = await checkNetworkStatus();
    if (!networkStatus.connected) {
      console.warn('Sem conexão com a internet. O serviço será iniciado quando a conexão for restabelecida.');
      
      // Adicionar listener para iniciar quando a conexão for restabelecida
      addNetworkListener((status) => {
        if (status.connected) {
          startBackgroundOptimization();
        }
      });
      
      return false;
    }
    
    return await startBackgroundOptimization();
  } catch (error) {
    console.error('Erro ao iniciar serviço de otimização contínua:', error);
    return false;
  }
};

/**
 * Inicia a otimização em segundo plano
 */
const startBackgroundOptimization = async () => {
  try {
    // Registrar tarefa em segundo plano para otimização contínua
    await registerBackgroundTask('optimization', async () => {
      // Executar otimização
      const result = await continuousOptimizationService.optimize();
      
      // Verificar se houve lucro
      if (result && result.profit > 0) {
        // Enviar notificação sobre o lucro gerado
        await sendLocalNotification(
          'Lucro Gerado!',
          `O QuickFundHub gerou $${result.profit.toFixed(2)} de lucro para você.`
        );
        
        // Registrar o lucro
        await profitTracker.trackProfit({
          amount: result.profit,
          source: result.source,
          timestamp: new Date().toISOString(),
          details: result.details
        });
      }
    });
    
    // Agendar execução periódica (a cada 15 minutos)
    setInterval(async () => {
      await BackgroundTask.schedule({
        taskId: 'optimization',
        delayMs: 900000 // 15 minutos
      });
    }, 900000);
    
    return true;
  } catch (error) {
    console.error('Erro ao iniciar otimização em segundo plano:', error);
    return false;
  }
};

/**
 * Configura o sistema de distribuição de lucros para as carteiras especificadas
 */
export const setupProfitDistribution = async (pixCpf, usdtWallet, ltcWallet) => {
  try {
    // Salvar informações das carteiras no armazenamento local
    await Storage.set({
      key: 'profit_distribution',
      value: JSON.stringify({
        pix: pixCpf,
        usdt: usdtWallet,
        ltc: ltcWallet,
        threshold: 300000, // Limite de 300 mil dólares para pagamento via PIX
        lastDistribution: null
      })
    });
    
    // Configurar listener para distribuição automática de lucros
    profitTracker.addProfitListener(async (totalProfit) => {
      // Verificar se é hora de distribuir os lucros
      const shouldDistribute = await shouldDistributeProfit();
      if (shouldDistribute) {
        await distributeProfits(totalProfit);
      }
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao configurar distribuição de lucros:', error);
    return false;
  }
};

/**
 * Verifica se é hora de distribuir os lucros
 */
const shouldDistributeProfit = async () => {
  try {
    // Obter configuração de distribuição
    const { value } = await Storage.get({ key: 'profit_distribution' });
    if (!value) return false;
    
    const distribution = JSON.parse(value);
    const lastDistribution = distribution.lastDistribution ? new Date(distribution.lastDistribution) : null;
    
    // Se nunca houve distribuição ou a última foi há mais de 30 dias
    if (!lastDistribution || (new Date() - lastDistribution) > 30 * 24 * 60 * 60 * 1000) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao verificar distribuição de lucros:', error);
    return false;
  }
};

/**
 * Distribui os lucros para as carteiras configuradas
 */
const distributeProfits = async (totalProfit) => {
  try {
    // Obter configuração de distribuição
    const { value } = await Storage.get({ key: 'profit_distribution' });
    if (!value) return false;
    
    const distribution = JSON.parse(value);
    
    // Determinar método de pagamento com base no valor
    const paymentMethod = totalProfit <= distribution.threshold ? 'pix' : 'crypto';
    
    // Registrar a distribuição
    const distributionRecord = {
      amount: totalProfit,
      timestamp: new Date().toISOString(),
      method: paymentMethod,
      destination: paymentMethod === 'pix' ? distribution.pix : {
        usdt: distribution.usdt,
        ltc: distribution.ltc
      },
      status: 'pending'
    };
    
    // Salvar registro de distribuição
    await Storage.set({
      key: 'last_distribution',
      value: JSON.stringify(distributionRecord)
    });
    
    // Atualizar data da última distribuição
    distribution.lastDistribution = new Date().toISOString();
    await Storage.set({
      key: 'profit_distribution',
      value: JSON.stringify(distribution)
    });
    
    // Enviar notificação sobre a distribuição
    await sendLocalNotification(
      'Distribuição de Lucros',
      `Uma distribuição de $${totalProfit.toFixed(2)} foi iniciada para sua ${paymentMethod === 'pix' ? 'conta PIX' : 'carteira crypto'}.`
    );
    
    return true;
  } catch (error) {
    console.error('Erro ao distribuir lucros:', error);
    return false;
  }
};

/**
 * Inicializa todos os serviços do Capacitor
 */
export const initializeCapacitorServices = async () => {
  try {
    if (!isNativePlatform()) return false;
    
    // Inicializar notificações locais
    await initializeLocalNotifications();
    
    // Inicializar notificações push
    await initializePushNotifications();
    
    // Iniciar serviço de otimização contínua
    await startContinuousOptimizationService();
    
    // Configurar distribuição de lucros
    await setupProfitDistribution(
      '08806839616', // PIX CPF
      '0x57E0b47bA8308F1A40f95bB4D3aA867cd1C08760', // USDT ERC20
      'ltc1qdxwcq4n5ep7rthfyhpwaluwtpn99h5dl3zncdx' // LTC
    );
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar serviços do Capacitor:', error);
    return false;
  }
};