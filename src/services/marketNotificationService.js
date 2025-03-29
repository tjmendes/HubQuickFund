/**
 * Market Notification Service
 * 
 * Este serviço implementa notificações em tempo real para operações financeiras,
 * incluindo integrações com BTG Pactual Trader e outros mercados financeiros.
 * 
 * Acesso exclusivo para: Tiago José Mendes
 * 
 * AVISO: Este código contém informações confidenciais e está protegido por NDA.
 * Não compartilhe ou distribua este código sem autorização expressa.
 */

import axios from 'axios';
import dotenv from 'dotenv';
import btgPactualService from './btgPactualService.js';
import traditionalMarketService from './traditionalMarketService.js';

dotenv.config();

// Configuração de segurança - acesso restrito
const AUTHORIZED_USER = 'Tiago José Mendes';
const AUTHORIZED_USER_ID = 'user1'; // ID do usuário no sistema

/**
 * Classe para gerenciamento de notificações de mercado
 * Implementa notificações em tempo real para operações financeiras
 */
class MarketNotificationService {
  constructor() {
    this.isInitialized = false;
    this.btgPactualService = btgPactualService;
    this.traditionalMarketService = traditionalMarketService;
    this.notificationHistory = [];
    this.notificationSettings = {
      email: true,
      whatsapp: true,
      push: true,
      sms: false
    };
  }

  /**
   * Inicializa o serviço com verificação de segurança
   * @param {string} userId - ID do usuário que está tentando acessar o serviço
   * @param {string} userName - Nome do usuário que está tentando acessar o serviço
   * @returns {boolean} - Retorna true se o acesso for autorizado
   */
  initialize(userId, userName) {
    // Verificação de segurança - apenas o usuário autorizado pode acessar
    if (userId !== AUTHORIZED_USER_ID || userName !== AUTHORIZED_USER) {
      console.error('Acesso não autorizado ao MarketNotificationService');
      return false;
    }

    // Inicializa os serviços dependentes
    this.btgPactualService.initialize(userId, userName);
    this.traditionalMarketService.initialize(userId, userName);

    this.isInitialized = true;
    console.log(`Market Notification Service inicializado para ${userName}`);
    return true;
  }

  /**
   * Configura as preferências de notificação
   * @param {Object} settings - Configurações de notificação
   */
  setNotificationSettings(settings) {
    if (!this.isInitialized) {
      throw new Error('Serviço não inicializado ou acesso não autorizado');
    }

    this.notificationSettings = {
      ...this.notificationSettings,
      ...settings
    };

    console.log('Configurações de notificação atualizadas:', this.notificationSettings);
  }

  /**
   * Inicia o monitoramento de mercado e envio de notificações
   * @returns {Promise<boolean>} - Retorna true se o monitoramento foi iniciado com sucesso
   */
  async startMonitoring() {
    if (!this.isInitialized) {
      throw new Error('Serviço não inicializado ou acesso não autorizado');
    }

    try {
      console.log('Iniciando monitoramento de mercado...');
      
      // Monitora operações no BTG Pactual Trader
      const btgOperations = await this.btgPactualService.monitorOperations();
      
      // Envia notificações para operações relevantes
      if (btgOperations && btgOperations.length > 0) {
        await this._sendNotifications(btgOperations, 'BTG_PACTUAL');
      }
      
      // Monitora outros mercados financeiros tradicionais
      const marketData = await this.traditionalMarketService.monitorMarkets();
      
      console.log('Monitoramento de mercado concluído com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao monitorar mercados:', error);
      return false;
    }
  }

  /**
   * Envia notificações para operações financeiras
   * @private
   * @param {Array} operations - Lista de operações
   * @param {string} source - Fonte das operações (BTG_PACTUAL, FOREX, etc)
   */
  async _sendNotifications(operations, source) {
    if (!this.isInitialized) return;
    
    try {
      for (const operation of operations) {
        // Formata a mensagem de notificação
        const message = this._formatNotificationMessage(operation, source);
        
        // Envia notificações de acordo com as configurações
        if (this.notificationSettings.whatsapp) {
          // Em produção, isso chamaria a API real de WhatsApp
          console.log(`[WhatsApp] Enviando notificação para ${AUTHORIZED_USER}:`, message);
          // await sendWhatsAppNotification(AUTHORIZED_USER_PHONE, message);
        }
        
        if (this.notificationSettings.email) {
          // Em produção, isso enviaria um email real
          console.log(`[Email] Enviando notificação para ${AUTHORIZED_USER}:`, message);
          // await sendEmailNotification(AUTHORIZED_USER_EMAIL, 'Alerta de Operação - QuickFundHub', message);
        }
        
        if (this.notificationSettings.push) {
          // Em produção, isso enviaria uma notificação push real
          console.log(`[Push] Enviando notificação para ${AUTHORIZED_USER}:`, message);
          // await sendPushNotification(AUTHORIZED_USER_ID, 'Alerta de Operação', message);
        }
        
        if (this.notificationSettings.sms) {
          // Em produção, isso enviaria um SMS real
          console.log(`[SMS] Enviando notificação para ${AUTHORIZED_USER}:`, message);
          // await sendSMSNotification(AUTHORIZED_USER_PHONE, message);
        }
        
        // Registra a notificação enviada
        this.notificationHistory.push({
          operation,
          source,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
    }
  }

  /**
   * Formata a mensagem de notificação
   * @private
   * @param {Object} operation - Operação financeira
   * @param {string} source - Fonte da operação
   * @returns {string} - Mensagem formatada
   */
  _formatNotificationMessage(operation, source) {
    let message = '';
    
    if (source === 'BTG_PACTUAL') {
      const changePercent = (operation.change * 100).toFixed(2);
      const direction = operation.direction === 'COMPRA' ? '🟢 COMPRA' : '🔴 VENDA';
      
      message = `*ALERTA DE OPERAÇÃO - BTG PACTUAL*\n\n`;
      message += `*${direction}* de *${operation.asset}*\n`;
      message += `*Tipo:* ${operation.type}\n`;
      message += `*Preço Atual:* R$ ${operation.price.toFixed(2)}\n`;
      message += `*Variação:* ${changePercent}%\n`;
      message += `*Confiança:* ${operation.score}/100\n\n`;
      message += `*Motivo:* ${operation.reason}\n\n`;
      message += `*PASSO A PASSO DA OPERAÇÃO:*\n${operation.steps.join('\n')}\n\n`;
      message += `_Análise gerada por QuickFundHub exclusivamente para ${AUTHORIZED_USER}_`;
    } else {
      // Formato para outras fontes de operação
      message = `*ALERTA DE MERCADO - ${source}*\n\n`;
      message += `*Ativo:* ${operation.asset}\n`;
      message += `*Ação Recomendada:* ${operation.action}\n`;
      message += `*Detalhes:* ${operation.details}\n\n`;
      message += `_Análise gerada por QuickFundHub exclusivamente para ${AUTHORIZED_USER}_`;
    }
    
    return message;
  }

  /**
   * Obtém o histórico de notificações
   * @param {number} limit - Limite de notificações a serem retornadas
   * @returns {Array} - Histórico de notificações
   */
  getNotificationHistory(limit = 10) {
    if (!this.isInitialized) {
      throw new Error('Serviço não inicializado ou acesso não autorizado');
    }
    
    // Retorna as últimas notificações, limitado pelo parâmetro
    return this.notificationHistory
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }
}

// Exporta a instância única do serviço
const marketNotificationService = new MarketNotificationService();
export default marketNotificationService;