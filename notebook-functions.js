/**
 * Funções complementares para o script de configuração do notebook
 * Este arquivo contém as funções para enviar notificações e relatórios
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer');

// Arquivo para simular o DynamoDB localmente
const dataDir = path.join(__dirname, 'data');
const profitsDbFile = path.join(dataDir, 'profits.json');
const usersDbFile = path.join(dataDir, 'users.json');

// Inicializar arquivo de usuários se não existir
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

// Função para enviar notificação via WhatsApp (Twilio)
async function sendWhatsAppNotification(userId, profit) {
  try {
    // Obter informações do usuário
    const users = JSON.parse(fs.readFileSync(usersDbFile));
    const user = users.find(u => u.userId === userId);
    
    if (!user || !user.whatsappNumber) {
      console.log('Número de WhatsApp não encontrado para o usuário:', userId);
      return;
    }
    
    const message = `QuickFundHub: Novo lucro de ${profit.amount} ${profit.asset} registrado na operação ${profit.operation || 'trading'}!`;
    
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('Credenciais do Twilio não configuradas. Simulando envio de WhatsApp...');
      console.log(`Mensagem para ${user.whatsappNumber}: ${message}`);
      return;
    }
    
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        To: `whatsapp:${user.whatsappNumber}`,
        From: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        Body: message
      }),
      {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('Notificação WhatsApp enviada:', response.data.sid);
  } catch (error) {
    console.error('Erro ao enviar notificação WhatsApp:', error);
  }
}

// Função para enviar relatório diário
async function sendDailyReport(userId) {
  try {
    console.log(`Gerando relatório diário para o usuário: ${userId}`);
    
    // Obter lucros das últimas 24 horas
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const profits = JSON.parse(fs.readFileSync(profitsDbFile));
    const userProfits = profits.filter(p => p.userId === userId && p.timestamp >= oneDayAgo);
    
    // Calcular estatísticas
    const totalProfit = userProfits.reduce((sum, p) => sum + parseFloat(p.profit), 0);
    const profitsByAsset = {};
    const profitsByOperation = {};
    
    userProfits.forEach(p => {
      // Agrupar por ativo
      if (!profitsByAsset[p.asset]) {
        profitsByAsset[p.asset] = 0;
      }
      profitsByAsset[p.asset] += parseFloat(p.profit);
      
      // Agrupar por operação
      if (!profitsByOperation[p.operation]) {
        profitsByOperation[p.operation] = 0;
      }
      profitsByOperation[p.operation] += parseFloat(p.profit);
    });
    
    // Obter informações do usuário
    const users = JSON.parse(fs.readFileSync(usersDbFile));
    const user = users.find(u => u.userId === userId);
    
    if (!user) {
      console.log('Usuário não encontrado:', userId);
      return;
    }
    
    // Criar conteúdo do email
    const date = new Date().toLocaleDateString('pt-BR');
    const emailContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          h2 { color: #3498db; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .highlight { color: #2ecc71; font-weight: bold; }
          .footer { margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Relatório Diário de Lucros - QuickFundHub</h1>
          <p><strong>Data:</strong> ${date}</p>
          <p><strong>Total de Operações:</strong> ${userProfits.length}</p>
          <p><strong>Lucro Total:</strong> <span class="highlight">$${totalProfit.toFixed(2)}</span></p>
          
          <h2>Lucros por Ativo</h2>
          <table>
            <tr>
              <th>Ativo</th>
              <th>Lucro</th>
              <th>Percentual</th>
            </tr>
            ${Object.entries(profitsByAsset).map(([asset, profit]) => {
              const percentage = (profit / totalProfit * 100).toFixed(2);
              return `
                <tr>
                  <td>${asset}</td>
                  <td>$${profit.toFixed(2)}</td>
                  <td>${percentage}%</td>
                </tr>
              `;
            }).join('')}
          </table>
          
          <h2>Lucros por Operação</h2>
          <table>
            <tr>
              <th>Operação</th>
              <th>Lucro</th>
              <th>Percentual</th>
            </tr>
            ${Object.entries(profitsByOperation).map(([operation, profit]) => {
              const percentage = (profit / totalProfit * 100).toFixed(2);
              return `
                <tr>
                  <td>${operation}</td>
                  <td>$${profit.toFixed(2)}</td>
                  <td>${percentage}%</td>
                </tr>
              `;
            }).join('')}
          </table>
          
          <p>Para mais detalhes, acesse seu painel no QuickFundHub.</p>
          
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>© ${new Date().getFullYear()} QuickFundHub. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Enviar email
    await sendEmail(
      [process.env.REPORT_EMAIL_1, process.env.REPORT_EMAIL_2],
      `Relatório Diário de Lucros - QuickFundHub - ${date}`,
      emailContent
    );
    
    console.log('Relatório diário enviado com sucesso');
    
    // Salvar relatório localmente
    const reportsDir = path.join(dataDir, 'reports', userId, 'daily');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportFile = path.join(reportsDir, `${date.replace(/\//g, '-')}.html`);
    fs.writeFileSync(reportFile, emailContent);
    
    console.log('Relatório salvo localmente:', reportFile);
    
    return { success: true, reportFile };
  } catch (error) {
    console.error('Erro ao gerar relatório diário:', error);
    return { success: false, error: error.message };
  }
}

// Função para enviar relatório semanal
async function sendWeeklyReport(userId) {
  try {
    console.log(`Gerando relatório semanal para o usuário: ${userId}`);
    
    // Obter lucros da última semana
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const profits = JSON.parse(fs.readFileSync(profitsDbFile));
    const userProfits = profits.filter(p => p.userId === userId && p.timestamp >= oneWeekAgo);
    
    // Calcular estatísticas
    const totalProfit = userProfits.reduce((sum, p) => sum + parseFloat(p.profit), 0);
    const profitsByAsset = {};
    const profitsByOperation = {};
    const profitsByDay = {};
    
    userProfits.forEach(p => {
      // Agrupar por ativo
      if (!profitsByAsset[p.asset]) {
        profitsByAsset[p.asset] = 0;
      }
      profitsByAsset[p.asset] += parseFloat(p.profit);
      
      // Agrupar por operação
      if (!profitsByOperation[p.operation]) {
        profitsByOperation[p.operation] = 0;
      }
      profitsByOperation[p.operation] += parseFloat(p.profit);
      
      // Agrupar por dia
      const day = new Date(p.timestamp).toLocaleDateString('pt-BR');
      if (!profitsByDay[day]) {
        profitsByDay[day] = 0;
      }
      profitsByDay[day] += parseFloat(p.profit);
    });
    
    // Obter informações do usuário
    const users = JSON.parse(fs.readFileSync(usersDbFile));
    const user = users.find(u => u.userId === userId);
    
    if (!user) {
      console.log('Usuário não encontrado:', userId);
      return;
    }
    
    // Criar conteúdo do email
    const startDate = new Date(oneWeekAgo).toLocaleDateString('pt-BR');
    const endDate = new Date().toLocaleDateString('pt-BR');
    const emailContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          h2 { color: #3498db; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .highlight { color: #2ecc71; font-weight: bold; }
          .footer { margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Relatório Semanal de Lucros - QuickFundHub</h1>
          <p><strong>Período:</strong> ${startDate} a ${endDate}</p>
          <p><strong>Total de Operações:</strong> ${userProfits.length}</p>
          <p><strong>Lucro Total:</strong> <span class="highlight">$${totalProfit.toFixed(2)}</span></p>
          
          <h2>Lucros por Dia</h2>
          <table>
            <tr>
              <th>Data</th>