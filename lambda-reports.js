/**
 * Funções complementares para a função Lambda
 * Este arquivo contém as funções para gerar e enviar relatórios por email
 */

const AWS = require('aws-sdk');

// Inicializar clientes AWS
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ses = new AWS.SES();
const s3 = new AWS.S3();

// Função para gerar e enviar relatório diário
async function generateAndSendDailyReport(userId) {
  console.log(`Gerando relatório diário para o usuário: ${userId}`);
  
  try {
    // Obter lucros das últimas 24 horas
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    const params = {
      TableName: process.env.DYNAMODB_TABLE_PROFITS,
      FilterExpression: 'userId = :userId AND #ts >= :startTime',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':startTime': oneDayAgo
      }
    };
    
    const result = await dynamodb.scan(params).promise();
    const profits = result.Items;
    
    // Calcular estatísticas
    const totalProfit = profits.reduce((sum, p) => sum + parseFloat(p.profit), 0);
    const profitsByAsset = {};
    const profitsByOperation = {};
    
    profits.forEach(p => {
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
    
    // Obter emails do usuário
    const userParams = {
      TableName: process.env.DYNAMODB_TABLE_USERS,
      Key: { userId }
    };
    
    const userResult = await dynamodb.get(userParams).promise();
    const user = userResult.Item;
    
    if (!user || !user.email) {
      console.log('Email não encontrado para o usuário:', userId);
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
          <p><strong>Data