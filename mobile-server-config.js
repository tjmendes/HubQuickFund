/**
 * Configuração do servidor para o aplicativo móvel
 * Este arquivo contém as configurações do servidor Express para o aplicativo móvel
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Importar rotas da API móvel
const mobileAppApi = require('./mobile-app-api');

/**
 * Configurações do servidor móvel
 */
const mobileServerConfig = {
  // Configurações básicas do servidor
  server: {
    port: process.env.MOBILE_SERVER_PORT || 4000,
    host: process.env.MOBILE_SERVER_HOST || '0.0.0.0',
    maxConnections: 10000,
    timeout: 120000, // 2 minutos em milissegundos
    keepAliveTimeout: 60000 // 1 minuto em milissegundos
  },
  
  // Configurações de otimização
  optimization: {
    enabled: true,
    interval: 60000, // Otimização a cada 1 minuto
    autoCorrection: true,
    performanceMonitoring: true,
    resourceUsageThreshold: 80, // Percentual máximo de uso de recursos
    adaptiveScaling: true
  },
  
  // Configurações de dados móveis
  dataUsage: {
    mobileDataLimit: 20480, // 20GB em MB por mês
    wifiDataLimit: "unlimited", // Sem limite em WiFi
    dataCompressionEnabled: true,
    compressionLevel: 9, // Nível máximo de compressão
    prioritizeEssentialData: true,
    cacheStrategy: "aggressive"
  },
  
  // Configurações de banco de dados Aurora
  database: {
    type: "aurora-mysql",
    host: process.env.DB_HOST || "quickfundhub-cluster.cluster-xyz.us-east-1.rds.amazonaws.com",
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_NAME || "quickfundhub",
    username: process.env.DB_USERNAME || "admin",
    password: process.env.DB_PASSWORD || "",
    connectionLimit: 50,
    queueLimit: 100,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
  },
  
  // Configurações de sincronização
  sync: {
    enabled: true,
    interval: 60000, // Sincronização a cada 1 minuto
    priorityQueue: true,
    conflictResolution: "server-wins",
    retryStrategy: {
      attempts: 10,
      backoff: "exponential",
      initialDelay: 1000
    }
  },
  
  // Configurações de segurança
  security: {
    encryption: {
      enabled: true,
      algorithm: "aes-256-gcm"
    },
    rateLimit: {
      enabled: true,
      maxRequests: 100,
      timeWindow: 60000 // 1 minuto em milissegundos
    },
    jwt: {
      secret: process.env.JWT_SECRET || "quickfundhub-mobile-server",
      expiresIn: 86400 // 24 horas em segundos
    }
  },
  
  // Configurações de notificações
  notifications: {
    enabled: true,
    channels: ["push", "email", "sms", "whatsapp"],
    priorityLevels: {
      high: {
        retryCount: 5,
        retryDelay: 60000 // 1 minuto em milissegundos
      },
      medium: {
        retryCount: 3,
        retryDelay: 300000 // 5 minutos em milissegundos
      },
      low: {
        retryCount: 1,
        retryDelay: 3600000 // 1 hora em milissegundos
      }
    }
  },
  
  // Configurações de email para envio do APK
  email: {
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASSWORD || ""
    },
    recipients: [
      "tiagomendes4@gmail.com",
      "tiagojosemendes841@gmail.com"
    ],
    subject: "QuickFundHub - Nova versão do APK disponível",
    attachments: [
      {
        filename: "QuickFundHub.apk",
        path: "./mobile-build/android/app/build/outputs/apk/release/app-release.apk"
      }
    ]
  }
};

/**
 * Função para iniciar o servidor móvel
 */
function startMobileServer() {
  console.log(`Iniciando servidor móvel na porta ${mobileServerConfig.server.port}...`);
  // Lógica de inicialização do servidor
}

/**
 * Função para otimizar o desempenho do aplicativo
 */
function optimizePerformance() {
  console.log('Otimizando desempenho do aplicativo...');
  // Lógica de otimização
}

/**
 * Função para monitorar o uso de dados
 */
function monitorDataUsage() {
  console.log('Monitorando uso de dados...');
  // Lógica de monitoramento de dados
}

/**
 * Função para enviar o APK por email
 */
function sendApkByEmail() {
  console.log('Enviando APK por email para:', mobileServerConfig.email.recipients.join(', '));
  // Lógica de envio de email
}

module.exports = {
  mobileServerConfig,
  startMobileServer,
  optimizePerformance,
  monitorDataUsage,
  sendApkByEmail
};