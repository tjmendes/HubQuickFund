/**
 * Script de configuração para execução no notebook local
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
    const report = await generateDailyReport(userId);
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
    const report = await generateWeeklyReport(userId);
    res.json(report);
  } catch (error) {
    console.error('Erro ao gerar relatório semanal:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Função para enviar notificação via WhatsApp (Twilio)
async function sendWhatsAppNotification(userId, profit) {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('Credenciais do Twilio não configuradas. Simulando envio de WhatsApp...');
      console.log(`Mensagem para ${process.env.USER_WHATSAPP_NUMBER}: QuickFundHub: Novo lucro de ${profit.amount} ${profit.asset} registrado na operação ${profit.operation}!`);
      return;
    }
    
    const message = `QuickFundHub: Novo lucro de ${profit.amount} ${profit.asset} registrado na operação ${profit.operation}!`;
    
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        To: `whatsapp:${process.env.USER_WHATSAPP_NUMBER}`,
        From: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,