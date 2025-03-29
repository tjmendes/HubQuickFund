/**
 * Script para enviar o APK do QuickFundHub por email
 * Este arquivo permite enviar o APK para o email do usuário
 */

const fs = require('fs');
const path = require('path');
const { sendEmail } = require('./notebook-email');
const { mobileAppConfig } = require('./mobile-app-config');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Função para enviar o APK por email
 * @param {string} email Email do destinatário
 * @param {string} deviceType Tipo de dispositivo (android ou ios)
 * @returns {Promise<Object>} Resultado do envio
 */
async function sendApkByEmail(email, deviceType = 'android') {
  try {
    console.log(`Enviando APK para o email: ${email} (Dispositivo: ${deviceType})`);
    
    // Verificar se o email foi fornecido
    if (!email) {
      throw new Error('Email não fornecido');
    }
    
    // Verificar se o APK existe
    const buildDir = path.join(__dirname, mobileAppConfig.build.outputDir);
    let appPath;
    
    if (deviceType === 'android') {
      // Verificar primeiro o APK otimizado para Samsung Galaxy A13
      appPath = path.join(buildDir, 'android', 'QuickFundHub-SamsungGalaxyA13.apk');
      
      // Se não existir, usar o APK padrão
      if (!fs.existsSync(appPath)) {
        appPath = path.join(buildDir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
      }
    } else if (deviceType === 'ios') {
      appPath = path.join(buildDir, 'ios', 'QuickFundHub.ipa');
    } else {
      throw new Error('Tipo de dispositivo inválido. Use "android" ou "ios"');
    }
    
    if (!fs.existsSync(appPath)) {
      throw new Error(`Aplicativo para ${deviceType} não encontrado. Execute a geração do APK/IPA primeiro.`);
    }
    
    // Preparar conteúdo do email
    const htmlContent = `
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          h1 { color: #2c3e50; border-bottom: 1px solid #eee; padding-bottom: 10px; }
          h2 { color: #3498db; margin-top: 20px; }
          .instructions { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
          .highlight { color: #2ecc71; font-weight: bold; }
          .footer { margin-top: 30px; font-size: 12px; color: #7f8c8d; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Aplicativo QuickFundHub</h1>
          <p>Olá,</p>
          <p>Segue em anexo o arquivo APK do QuickFundHub para instalação em seu smartphone Android.</p>
          
          <div class="instructions">
            <h2>Instruções de Instalação para Samsung Galaxy A13 4G:</h2>
            <ol>
              <li>Baixe o arquivo APK anexado a este email</li>
              <li>No seu smartphone, localize o arquivo baixado (geralmente na pasta Downloads)</li>
              <li>Toque no arquivo APK para iniciar a instalação</li>
              <li>Se solicitado, permita a instalação de aplicativos de fontes desconhecidas</li>
              <li>Siga as instruções na tela para concluir a instalação</li>
              <li>Após a instalação, abra o aplicativo e faça login com suas credenciais</li>
            </ol>
            
            <h3>Requisitos do Sistema:</h3>
            <ul>
              <li><strong>Sistema Operacional:</strong> Android 4.4 ou superior (Samsung Galaxy A13 4G compatível)</li>
              <li><strong>Espaço de Armazenamento:</strong> Mínimo de 100MB disponíveis</li>
              <li><strong>Memória RAM:</strong> Mínimo de 2GB</li>
              <li><strong>Conexão com Internet:</strong> Necessária para sincronização de dados</li>
              <li><strong>Permissões:</strong> Acesso à internet, notificações e execução em segundo plano</li>
            </ul>
          </div>
          
          <p>O aplicativo QuickFundHub permite que você:</p>
          <ul>
            <li>Acompanhe seus lucros em tempo real</li>
            <li>Receba notificações de operações bem-sucedidas</li>
            <li>Visualize relatórios detalhados</li>
            <li>Acesse todas as funcionalidades mesmo com o smartphone bloqueado</li>
          </ul>
          
          <p>Se precisar de ajuda com a instalação, responda a este email ou entre em contato com nosso suporte.</p>
          
          <p>Atenciosamente,<br>Equipe QuickFundHub</p>
          
          <div class="footer">
            <p>Este email foi enviado automaticamente. Por favor, não responda diretamente.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Configurar anexo
    const attachments = [
      {
        filename: 'QuickFundHub.apk',
        path: apkPath
      }
    ];
    
    // Enviar email com o APK anexado
    const emailResult = await sendEmail([email], 'Aplicativo QuickFundHub - APK para Instalação', htmlContent, attachments);
    
    if (emailResult.success) {
      console.log(`APK enviado com sucesso para ${email}`);
      return { success: true, message: 'APK enviado por email com sucesso' };
    } else {
      throw new Error(emailResult.error || 'Falha ao enviar email');
    }
  } catch (error) {
    console.error('Erro ao enviar APK por email:', error);
    return { success: false, error: error.message };
  }
}

// Exportar funções
module.exports = { sendApkByEmail };