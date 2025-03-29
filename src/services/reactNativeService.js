/**
 * Serviço para integração com React Native
 * Este arquivo gerencia a funcionalidade específica para dispositivos móveis nativos
 */

import { Platform, AppState, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundFetch from 'react-native-background-fetch';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';

// Serviços de negócio
import { profitTracker } from './profitTracker';
import { continuousOptimizationService } from './continuousOptimizationService';

/**
 * Verifica se o aplicativo está rodando em um dispositivo móvel nativo
 */
export const isNativePlatform = () => {
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

/**
 * Obtém informações sobre o dispositivo atual
 */
export const getDeviceInfo = () => {
  return {
    platform: Platform.OS,
    version: Platform.Version,
    isEmulator: Platform.isEmulator || false,
    brand: Platform.constants?.Brand || '',
    manufacturer: Platform.constants?.Manufacturer || '',
    model: Platform.constants?.Model || ''
  };
};

/**
 * Inicializa o sistema de notificações
 */
export const initializeNotifications = () => {
  try {
    PushNotification.configure({
      // (opcional) Chamado quando o token é gerado
      onRegister: function(token) {
        console.log('TOKEN:', token);
        savePushToken(token.token);
      },

      // (obrigatório) Chamado quando uma notificação é recebida ou aberta
      onNotification: function(notification) {
        console.log('NOTIFICATION:', notification);

        // Processar a notificação recebida
        if (notification.foreground) {
          // Notificação recebida em primeiro plano
          PushNotification.localNotification({
            title: notification.title || 'Nova notificação',
            message: notification.message || '',
            playSound: true,
            soundName: 'default'
          });
        }

        // Necessário para notificações iOS
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // Permissões para iOS
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },

      // Deve o aplicativo iniciar em segundo plano
      popInitialNotification: true,
      requestPermissions: true
    });

    return true;
  } catch (error) {
    console.error('Erro ao inicializar notificações:', error);
    return false;
  }
};

/**
 * Envia uma notificação local
 */
export const sendLocalNotification = (title, message) => {
  try {
    PushNotification.localNotification({
      title: title,
      message: message,
      playSound: true,
      soundName: 'default'