/**
 * Script de configuração completo para execução no notebook local
 * Este arquivo configura o ambiente local para testar o sistema de rastreamento de lucros
 * e envio de notificações via WhatsApp e email.
 */

const dotenv = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer');

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

// Inicializar servidor Express
const app = express();
app.use(bodyParser.json());

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rota para registrar lucros
app.post('/api/profits', async (req, res) => {
  try {
    const { userId, profit } = req.body;
    
    if (!userId || !profit || !profit.amount || !profit.asset) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
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
    
    // Verificar se deve enviar notificação
    if (profit.amount >= parseFloat(process.env.PROFIT_NOTIFICATION_THRESHOLD)) {
      // Enviar notificação WhatsApp via Twilio
      await sendWhatsAppNotification(userId, profit);
      
      // Verificar se é hora de enviar relatório diário
      const now = new Date();
      const reportTime = process.env.DAILY_REPORT_TIME.split(':');
      if (now.getUTCHours() === parseInt(reportTime[0]) && 
          now.getUTCMinutes() === parseInt(reportTime[1])) {
        await sendDailyReport(userId);
      }
      
      // Verificar se é dia de enviar relatório semanal
      if (now.getUTCDay() === parseInt(process.env.WEEKLY_REPORT_DAY) && 
          now.getUTCHours() === parseInt(reportTime[0]) && 
          now.getUTCMinutes() === parseInt(reportTime[1])) {
        await sendWeeklyReport(userId);
      }
    }
    
    res.status(201).json({ success: true, profit: profitRecord });
  } catch (error) {
    console.error('Erro ao registrar lucro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para obter lucros de um usuário
app.get('/api/profits/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const profits = JSON.parse(fs.readFileSync(profitsDbFile));
    const userProfits = profits.filter(p => p.userId === userId);
    res.json(userProfits);
  } catch (error) {
    console.error('Erro ao obter lucros:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para gerar relatório diário
app.get('/api/reports/daily/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const report = await sendDailyReport(userId);
    res.json(report);
  } catch (error) {
    console.error('Erro ao gerar relatório diário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para gerar relatório semanal
app.get('/api/reports/weekly/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const report = await sendWeeklyReport(userId);
    res.json(report);
  } catch (error) {
    console.error('Erro ao gerar relatório semanal:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Importar função para enviar APK por email
const { sendApkByEmail } = require('./send-apk-email');

// Rota para enviar APK por email
app.post('/api/mobile/send-apk-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email não fornecido' });
    }
    
    const result = await sendApkByEmail(email);
    
    if (result.success) {
      res.json({ success: true, message: 'APK enviado por email com sucesso' });
    } else {
      res.status(500).json({ error: result.error || 'Falha ao enviar email' });
    }
  } catch (error) {
    console.error('Erro ao enviar APK por email:', error);
    res.status(500).json({ error: 'Erro ao enviar APK por email: ' + error.message });
  }
});

// Rota para simular um lucro (para testes)
app.post('/api/simulate-profit', async (req, res) => {
  try {
    const { userId, amount, asset, operation } = req.body;
    
    if (!userId || !amount || !asset) {
      return res.status(400).json({ error: 'Dados incompletos' });
    }
    
    // Criar registro de lucro simulado
    const profit = {
      amount: parseFloat(amount),
      asset,
      operation: operation || 'simulação',
      details: { simulated: true, timestamp: Date.now() }
    };
    
    // Fazer requisição para a API de lucros
    const response = await axios.post(
      `http://localhost:${process.env.PORT || 3000}/api/profits`,
      { userId, profit },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao simular lucro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Configurações:');
  console.log(`- Notificações WhatsApp: ${process.env.USER_WHATSAPP_NUMBER}`);
  console.log(`- Relatórios para: ${process.env.REPORT_EMAIL_1}, ${process.env.REPORT_EMAIL_2}`);
  console.log(`- Limite para notificação: $${process.env.PROFIT_NOTIFICATION_THRESHOLD}`);
  console.log(`- Relatório diário: ${process.env.DAILY_REPORT_TIME} UTC`);
  console.log(`- Relatório semanal: Dia ${process.env.WEEKLY_REPORT_DAY} às ${process.env.DAILY_REPORT_TIME} UTC`);
  console.log('\nPara testar, envie uma requisição POST para /api/simulate-profit');
  console.log('Exemplo: { "userId": "user1", "amount": 100, "asset": "BTC", "operation": "trading" }');
});