/**
 * AWS Lambda Function para processamento de lucros e envio de notificações
 * Este arquivo será implantado no AWS Lambda para processar eventos de lucro
 * e enviar notificações via WhatsApp e email.
 */

const AWS = require('aws-sdk');
const axios = require('axios');

// Inicializar clientes AWS
const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const ses = new AWS.SES();

// Função principal do Lambda
exports.handler = async (event, context) => {
  console.log('Evento recebido:', JSON.stringify(event, null, 2));
  
  try {
    // Processar eventos do DynamoDB Stream
    if (event.Records && event.Records.length > 0) {
      for (const record of event.Records) {
        // Verificar se é um novo registro de lucro
        if (record.eventName === 'INSERT' && record.dynamodb && record.dynamodb.NewImage) {
          const profit = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);
          await processProfit(profit);
        }
      }
    }
    // Processar eventos do SNS
    else if (event.Records && event.Records[0].Sns) {
      const message = JSON.parse(event.Records[0].Sns.Message);
      await processProfit(message);
    }
    // Processar eventos da API Gateway
    else if (event.body) {
      const profit = JSON.parse(event.body);
      await processProfit(profit);
      
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Lucro processado com sucesso' }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    
    return { statusCode: 200, body: 'Processamento concluído' };
  } catch (error) {
    console.error('Erro ao processar evento:', error);
    
    // Se for uma chamada da API Gateway, retornar erro formatado
    if (event.httpMethod) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Erro interno do servidor' }),
        headers: {
          'Content-Type': 'application/json'
        }
      };
    }
    
    throw error;
  }
};

// Função para processar um registro de lucro
async function processProfit(profit) {
  console.log('Processando lucro:', JSON.stringify(profit, null, 2));
  
  // Verificar se o lucro atinge o limite para notificação
  if (parseFloat(profit.amount) >= parseFloat(process.env.PROFIT_NOTIFICATION_THRESHOLD)) {
    // Enviar notificação via WhatsApp
    await sendWhatsAppNotification(profit);
    
    // Publicar no tópico SNS para processamento adicional
    await publishToSNS(profit);
    
    // Verificar se é hora de enviar relatórios
    const now = new Date();
    const reportTime = process.env.DAILY_REPORT_TIME.split(':');
    
    if (now.getUTCHours() === parseInt(reportTime[0]) && 
        now.getUTCMinutes() === parseInt(reportTime[1])) {
      await generateAndSendDailyReport(profit.userId);
    }
    
    if (now.getUTCDay() === parseInt(process.env.WEEKLY_REPORT_DAY) && 
        now.getUTCHours() === parseInt(reportTime[0]) && 
        now.getUTCMinutes() === parseInt(reportTime[1])) {
      await generateAndSendWeeklyReport(profit.userId);
    }
  }
  
  // Salvar o registro no histórico
  await saveToHistory(profit);
}

// Função para enviar notificação via WhatsApp (Twilio)
async function sendWhatsAppNotification(profit) {
  try {
    const message = `QuickFundHub: Novo lucro de ${profit.amount} ${profit.asset} registrado na operação ${profit.operation || 'trading'}!`;
    
    // Obter o número de WhatsApp do usuário
    const userParams = {
      TableName: process.env.DYNAMODB_TABLE_USERS,
      Key: { userId: profit.userId }
    };
    
    const userResult = await dynamodb.get(userParams).promise();
    const user = userResult.Item;
    
    if (!user || !user.whatsappNumber) {
      console.log('Número de WhatsApp não encontrado para o usuário:', profit.userId);
      return;
    }
    
    // Enviar mensagem via Twilio API
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

// Função para publicar no tópico SNS
async function publishToSNS(profit) {
  try {
    const params = {
      TopicArn: process.env.SNS_TOPIC_PROFITS,
      Message: JSON.stringify(profit),
      MessageAttributes: {
        'userId': {
          DataType: 'String',
          StringValue: profit.userId
        },
        'profitAmount': {
          DataType: 'Number',
          StringValue: profit.amount.toString()
        },
        'asset': {
          DataType: 'String',
          StringValue: profit.asset
        }
      }
    };
    
    const result = await sns.publish(params).promise();
    console.log('Mensagem publicada no SNS:', result.MessageId);
  } catch (error) {
    console.error('Erro ao publicar no SNS:', error);
  }
}

// Função para salvar no histórico do DynamoDB
async function saveToHistory(profit) {
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_PROFITS,
      Item: {
        userId: profit.userId,
        timestamp: Date.now(),
        profit: profit.amount,
        asset: profit.asset,
        operation: profit.operation || 'unknown',
        details: profit.details || {}
      }
    };
    
    await dynamodb.put(params).promise();
    console.log('Lucro salvo no histórico do DynamoDB');
  } catch (error) {
    console.error('Erro ao salvar no histórico do DynamoDB:', error);
  }
}

// Função para gerar e enviar relatório diário
async function generateAndSendDailyReport(userId) {
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
    
    profits.forEach(p => {
      if (!profitsByAsset[p.asset]) {
        profitsByAsset[p.asset] = 0;
      }
      profitsByAsset[p.asset] += parseFloat(p.profit);
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
    const emailContent = `
      <h2>Relatório Diário de Lucros - QuickFundHub</h2>
      <p><strong>Data:</strong> ${new Date().toLocaleDateString()}</p>
      <p><strong>Total de Operações:</strong> ${profits.length}</p>
      <p><strong>Lucro Total:</strong> $${totalProfit.toFixed(2)}</p>
      
      <h3>Lucros por Ativo:</h3>
      <ul>
        ${Object.entries(profitsByAsset).map(([asset, profit]) => 
          `<li>