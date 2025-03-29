/**
 * Serviço em segundo plano para o QuickFundHub
 * Este arquivo implementa um serviço que continua executando mesmo com a tela bloqueada
 * e garante que as operações de geração de lucro continuem funcionando 24/7
 */

const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cron = require('node-cron');
const { fork } = require('child_process');

// Importar funções auxiliares
const { sendWhatsAppNotification, sendDailyReport, sendWeeklyReport } = require('./notebook-functions');
const { sendEmail } = require('./notebook-email');

// Carregar variáveis de ambiente
dotenv.config();

// Criar diretório de dados se não existir
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Arquivo para simular o DynamoDB localmente
const profitsDbFile = path.join(dataDir, 'profits.json');
if (!fs.existsSync(profitsDbFile)) {
  fs.writeFileSync(profitsDbFile, JSON.stringify([]));
}

// Arquivo para simular a tabela de usuários
const usersDbFile = path.join(dataDir, 'users.json');
if (!fs.existsSync(usersDbFile)) {
  const defaultUser = {
    userId: 'user1',
    email: process.env.REPORT_EMAIL_1,
    whatsappNumber: process.env.USER_WHATSAPP_NUMBER,
    name: 'Tiago Mendes',
    subscription: 'premium'
  };
  fs.writeFileSync(usersDbFile, JSON.stringify([defaultUser], null, 2));
}

// Arquivo para registrar logs do serviço em segundo plano
const logFile = path.join(dataDir, 'background-service.log');

/**
 * Função para registrar logs
 * @param {string} message - Mensagem a ser registrada
 * @param {string} level - Nível do log (info, warn, error)
 */
function logMessage(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} [${level.toUpperCase()}] ${message}\n`;
  
  // Adicionar ao arquivo de log
  fs.appendFileSync(logFile, logEntry);
  
  // Também exibir no console
  console.log(logEntry.trim());
}

/**
 * Classe para gerenciar o serviço em segundo plano
 */
class BackgroundService {
  constructor() {
    this.isRunning = false;
    this.strategies = [];
    this.workers = {};
    this.profitStats = {
      totalProfits: 0,
      profitsByStrategy: {},
      lastProfitTimestamp: null
    };
    this.app = express();
    this.setupExpress();
    this.setupCronJobs();
  }
  
  /**
   * Configurar o servidor Express
   */
  setupExpress() {
    this.app.use(bodyParser.json());
    
    // Middleware para logging
    this.app.use((req, res, next) => {
      logMessage(`${req.method} ${req.url}`);
      next();
    });
    
    // Rota para verificar status do serviço
    this.app.get('/api/status', (req, res) => {
      res.json({
        status: this.isRunning ? 'running' : 'stopped',
        uptime: process.uptime(),
        strategies: this.strategies.map(s => ({
          name: s.name,
          status: s.status,
          lastRun: s.lastRun,
          profits: this.profitStats.profitsByStrategy[s.name] || 0
        })),
        totalProfits: this.profitStats.totalProfits,
        lastProfit: this.profitStats.lastProfitTimestamp
      });
    });
    
    // Rota para iniciar o serviço
    this.app.post('/api/start', (req, res) => {
      if (!this.isRunning) {
        this.start();
        res.json({ success: true, message: 'Serviço iniciado com sucesso' });
      } else {
        res.json({ success: false, message: 'Serviço já está em execução' });
      }
    });
    
    // Rota para parar o serviço
    this.app.post('/api/stop', (req, res) => {
      if (this.isRunning) {
        this.stop();
        res.json({ success: true, message: 'Serviço parado com sucesso' });
      } else {
        res.json({ success: false, message: 'Serviço não está em execução' });
      }
    });
    
    // Rota para registrar lucros manualmente
    this.app.post('/api/profits', async (req, res) => {
      try {
        const { userId, profit } = req.body;
        
        if (!userId || !profit || !profit.amount || !profit.asset) {
          return res.status(400).json({ error: 'Dados incompletos' });
        }
        
        await this.registerProfit(userId, profit);
        res.status(201).json({ success: true, profit });
      } catch (error) {
        logMessage(`Erro ao registrar lucro: ${error.message}`, 'error');
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    });
  }
  
  /**
   * Configurar tarefas agendadas
   */
  setupCronJobs() {
    // Executar estratégias a cada 5 minutos
    cron.schedule('*/5 * * * *', () => {
      if (this.isRunning) {
        this.executeStrategies();
      }
    });
    
    // Enviar relatório diário às 20:00 UTC
    cron.schedule('0 20 * * *', async () => {
      if (this.isRunning) {
        try {
          const users = JSON.parse(fs.readFileSync(usersDbFile));
          for (const user of users) {
            await sendDailyReport(user.userId);
            logMessage(`Relatório diário enviado para ${user.userId}`);
          }
        } catch (error) {
          logMessage(`Erro ao enviar relatório diário: ${error.message}`, 'error');
        }
      }
    });
    
    // Enviar relatório semanal aos domingos às 20:00 UTC
    cron.schedule('0 20 * * 0', async () => {
      if (this.isRunning) {
        try {
          const users = JSON.parse(fs.readFileSync(usersDbFile));
          for (const user of users) {
            await sendWeeklyReport(user.userId);
            logMessage(`Relatório semanal enviado para ${user.userId}`);
          }
        } catch (error) {
          logMessage(`Erro ao enviar relatório semanal: ${error.message}`, 'error');
        }
      }
    });
    
    // Limpar logs antigos a cada dia à meia-noite
    cron.schedule('0 0 * * *', () => {
      this.cleanupOldLogs();
    });
  }
  
  /**
   * Iniciar o serviço em segundo plano
   */
  start() {
    if (this.isRunning) {
      logMessage('Serviço já está em execução');
      return;
    }
    
    this.isRunning = true;
    logMessage('Iniciando serviço em segundo plano...');
    
    // Carregar estratégias disponíveis
    this.loadStrategies();
    
    // Executar estratégias imediatamente
    this.executeStrategies();
    
    logMessage('Serviço em segundo plano iniciado com sucesso');
  }
  
  /**
   * Parar o serviço em segundo plano
   */
  stop() {
    if (!this.isRunning) {
      logMessage('Serviço não está em execução');
      return;
    }
    
    this.isRunning = false;
    logMessage('Parando serviço em segundo plano...');
    
    // Parar todos os workers
    Object.keys(this.workers).forEach(strategyName => {
      if (this.workers[strategyName]) {
        this.workers[strategyName].kill();
        delete this.workers[strategyName];
      }
    });
    
    logMessage('Serviço em segundo plano parado com sucesso');
  }
  
  /**
   * Carregar estratégias disponíveis
   */
  loadStrategies() {
    logMessage('Carregando estratégias disponíveis...');
    
    // Lista de estratégias disponíveis
    this.strategies = [
      { name: 'cryptoArbitrage', file: './src/services/cryptoArbitrage.js', status: 'idle', lastRun: null },
      { name: 'multiStrategyArbitrage', file: './src/services/multiStrategyArbitrage.js', status: 'idle', lastRun: null },
      { name: 'flashLoan', file: './src/services/flashLoan.js', status: 'idle', lastRun: null },
      { name: 'defiLending', file: './src/services/defiLending.js', status: 'idle', lastRun: null },
      { name: 'yieldFarmingStaking', file: './src/services/yieldFarmingStaking.js', status: 'idle', lastRun: null },
      { name: 'marketMaking', file: './src/services/marketMaking.js', status: 'idle', lastRun: null },
      { name: 'continuousOptimization', file: './src/services/continuousOptimizationService.js', status: 'idle', lastRun: null }
    ];
    
    logMessage(`${this.strategies.length} estratégias carregadas`);
  }
  
  /**
   * Executar todas as estratégias em paralelo
   */
  executeStrategies() {
    if (!this.isRunning) {
      return;
    }
    
    logMessage('Executando estratégias...');
    
    this.strategies.forEach(strategy => {
      this.executeStrategy(strategy);
    });
  }
  
  /**
   * Executar uma estratégia específica
   * @param {Object} strategy - Estratégia a ser executada
   */
  executeStrategy(strategy) {
    try {
      // Atualizar status da estratégia
      strategy.status = 'running';
      strategy.lastRun = new Date().toISOString();
      
      logMessage(`Executando estratégia: ${strategy.name}`);
      
      // Criar um processo filho para executar a estratégia
      const worker = fork(path.join(__dirname, 'strategy-worker.js'));
      
      // Armazenar referência ao worker
      this.workers[strategy.name] = worker;
      
      // Enviar dados para o worker
      worker.send({ strategy: strategy.name, file: strategy.file });
      
      // Receber resultados do worker
      worker.on('message', async (data) => {
        if (data.error) {
          logMessage(`Erro na estratégia ${strategy.name}: ${data.error}`, 'error');
          strategy.status = 'error';
        } else if (data.profit) {
          logMessage(`Lucro gerado pela estratégia ${strategy.name}: ${data.profit.amount} ${data.profit.asset}`);
          strategy.status = 'success';
          
          // Registrar o lucro
          await this.registerProfit('user1', data.profit);
        } else {
          strategy.status = 'completed';
        }
        
        // Encerrar o worker
        worker.kill();
        delete this.workers[strategy.name];
      });
      
      // Tratar erros do worker
      worker.on('error', (error) => {
        logMessage(`Erro no worker da estratégia ${strategy.name}: ${error.message}`, 'error');
        strategy.status = 'error';
        delete this.workers[strategy.name];
      });
      
      // Tratar encerramento do worker
      worker.on('exit', (code) => {
        if (code !== 0) {
          logMessage(`Worker da estratégia ${strategy.name} encerrado com código ${code}`, 'warn');
          strategy.status = 'error';
        }
        delete this.workers[strategy.name];
      });
    } catch (error) {
      logMessage(`Erro ao executar estratégia ${strategy.name}: ${error.message}`, 'error');
      strategy.status = 'error';
    }
  }
  
  /**
   * Registrar um lucro gerado
   * @param {string} userId - ID do usuário
   * @param {Object} profit - Dados do lucro
   */
  async registerProfit(userId, profit) {
    try {
      // Salvar no banco de dados local
      const timestamp = Date.now();
      const profitRecord = {
        userId,
        timestamp,
        profit: profit.amount,
        asset: profit.asset,
        operation: profit.operation || 'unknown',
        details: profit.details || {}
      };
      
      // Ler dados existentes
      const profits = JSON.parse(fs.readFileSync(profitsDbFile));
      profits.push(profitRecord);
      fs.writeFileSync(profitsDbFile, JSON.stringify(profits, null, 2));
      
      // Atualizar estatísticas
      this.profitStats.totalProfits += parseFloat(profit.amount);
      this.profitStats.lastProfitTimestamp = timestamp;
      
      if (!this.profitStats.profitsByStrategy[profit.operation]) {
        this.profitStats.profitsByStrategy[profit.operation] = 0;
      }
      this.profitStats.profitsByStrategy[profit.operation] += parseFloat(profit.amount);
      
      // Verificar se deve enviar notificação
      if (profit.amount >= parseFloat(process.env.PROFIT_NOTIFICATION_THRESHOLD)) {
        // Enviar notificação WhatsApp via Twilio
        await sendWhatsAppNotification(userId, profit);
      }
      
      return profitRecord;
    } catch (error) {
      logMessage(`Erro ao registrar lucro: ${error.message}`, 'error');
      throw error;
    }
  }
  
  /**
   * Limpar logs antigos (mais de 7 dias)
   */
  cleanupOldLogs() {
    try {
      const logContent = fs.readFileSync(logFile, 'utf8');
      const logLines = logContent.split('\n');
      
      // Filtrar logs dos últimos 7 dias
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const recentLogs = logLines.filter(line => {
        if (!line.trim()) return false;
        
        const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
        if (!timestampMatch) return true; // Manter linhas sem timestamp
        
        const lineTimestamp = new Date(timestampMatch[1]).getTime();
        return lineTimestamp >= sevenDaysAgo;
      });
      
      // Escrever logs filtrados de volta ao arquivo
      fs.writeFileSync(logFile, recentLogs.join('\n'));
      
      logMessage(`Limpeza de logs concluída. ${logLines.length - recentLogs.length} linhas removidas.`);
    } catch (error) {
      logMessage(`Erro ao limpar logs antigos: ${error.message}`, 'error');
    }
  }
}

// Inicializar o serviço
const backgroundService = new BackgroundService();

// Iniciar o servidor
const PORT = process.env.BACKGROUND_SERVICE_PORT || 3001;
backgroundService.app.listen(PORT, () => {
  logMessage(`Servidor do serviço em segundo plano rodando em http://localhost:${PORT}`);
  
  // Iniciar o serviço automaticamente
  backgroundService.start();
});

// Tratar sinais de encerramento
process.on('SIGINT', () => {
  logMessage('Recebido sinal SIGINT. Encerrando serviço...');
  backgroundService.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logMessage('Recebido sinal SIGTERM. Encerrando serviço...');
  backgroundService.stop();
  process.exit(0);
});

// Manter o processo ativo mesmo com a tela bloqueada
setInterval(() => {
  // Este intervalo mantém o processo Node.js ativo
  if (backgroundService.isRunning) {
    const timestamp = new Date().toISOString();
    // Não logar para não encher o arquivo de log
  }
}, 60000); // A cada minuto