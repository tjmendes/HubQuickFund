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
          <p><strong>Data:</strong> ${date}</p>
          <p><strong>Total de Operações:</strong> ${profits.length}</p>
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
    
    // Salvar relatório no S3
    const s3Key = `reports/${userId}/daily/${date.replace(/\//g, '-')}.html`;
    await s3.putObject({
      Bucket: process.env.S3_BUCKET_REPORTS,
      Key: s3Key,
      Body: emailContent,
      ContentType: 'text/html'
    }).promise();
    
    console.log('Relatório salvo no S3:', s3Key);
    
    return { success: true, s3Key };
  } catch (error) {
    console.error('Erro ao gerar relatório diário:', error);
    return { success: false, error: error.message };
  }
}

// Função para gerar e enviar relatório semanal
async function generateAndSendWeeklyReport(userId) {
  try {
    console.log(`Gerando relatório semanal para o usuário: ${userId}`);
    
    // Obter lucros da última semana
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    const params = {
      TableName: process.env.DYNAMODB_TABLE_PROFITS,
      FilterExpression: 'userId = :userId AND #ts >= :startTime',
      ExpressionAttributeNames: {
        '#ts': 'timestamp'
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':startTime': oneWeekAgo
      }
    };
    
    const result = await dynamodb.scan(params).promise();
    const profits = result.Items;
    
    // Calcular estatísticas
    const totalProfit = profits.reduce((sum, p) => sum + parseFloat(p.profit), 0);
    const profitsByAsset = {};
    const profitsByOperation = {};
    const profitsByDay = {};
    
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
      
      // Agrupar por dia
      const day = new Date(p.timestamp).toLocaleDateString('pt-BR');
      if (!profitsByDay[day]) {
        profitsByDay[day] = 0;
      }
      profitsByDay[day] += parseFloat(p.profit);
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
          <p><strong>Total de Operações:</strong> ${profits.length}</p>
          <p><strong>Lucro Total:</strong> <span class="highlight">$${totalProfit.toFixed(2)}</span></p>
          
          <h2>Lucros por Dia</h2>
          <table>
            <tr>
              <th>Data</th>
              <th>Lucro</th>
              <th>Percentual</th>
            </tr>
            ${Object.entries(profitsByDay).map(([day, profit]) => {
              const percentage = (profit / totalProfit * 100).toFixed(2);
              return `
                <tr>
                  <td>${day}</td>
                  <td>$${profit.toFixed(2)}</td>
                  <td>${percentage}%</td>
                </tr>
              `;
            }).join('')}
          </table>
          
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
      `Relatório Semanal de Lucros - QuickFundHub - ${startDate} a ${endDate}`,
      emailContent
    );
    
    console.log('Relatório semanal enviado com sucesso');
    
    // Salvar relatório no S3
    const s3Key = `reports/${userId}/weekly/${startDate.replace(/\//g, '-')}_${endDate.replace(/\//g, '-')}.html`;
    await s3.putObject({
      Bucket: process.env.S3_BUCKET_REPORTS,
      Key: s3Key,
      Body: emailContent,
      ContentType: 'text/html'
    }).promise();
    
    console.log('Relatório salvo no S3:', s3Key);
    
    return { success: true, s3Key };
  } catch (error) {
    console.error('Erro ao gerar relatório semanal:', error);
    return { success: false, error: error.message };
  }
}

// Função para enviar email usando SES
async function sendEmail(to, subject, htmlContent) {
  try {
    const params = {
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to]
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: htmlContent
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      },
      Source: `QuickFundHub <no-reply@${process.env.SES_DOMAIN || 'quickfundhub.com'}>`
    };
    
    const result = await ses.sendEmail(params).promise();
    console.log('Email enviado:', result.MessageId);
    
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  generateAndSendDailyReport,
  generateAndSendWeeklyReport,
  sendEmail
};