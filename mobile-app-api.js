/**
 * API para gerenciamento do aplicativo móvel
 * Este arquivo contém as rotas para download e envio do APK por email
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { sendEmail } = require('./notebook-email');
const { mobileAppConfig } = require('./mobile-app-config');

const router = express.Router();

// Rota para obter o caminho do APK
router.get('/apk-path', (req, res) => {
  try {
    const buildDir = path.join(__dirname, mobileAppConfig.build.outputDir);
    const apkPath = path.join(buildDir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    
    if (fs.existsSync(apkPath)) {
      res.json({ path: apkPath, available: true });
    } else {
      res.json({ available: false, message: 'APK não encontrado. Execute a geração do APK primeiro.' });
    }
  } catch (error) {
    console.error('Erro ao obter caminho do APK:', error);
    res.status(500).json({ error: 'Erro ao obter caminho do APK' });
  }
});

// Rota para verificar status do APK
router.get('/apk-status', (req, res) => {
  try {
    const buildDir = path.join(__dirname, mobileAppConfig.build.outputDir);
    const apkPath = path.join(buildDir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    
    const available = fs.existsSync(apkPath);
    let fileSize = null;
    
    if (available) {
      const stats = fs.statSync(apkPath);
      fileSize = (stats.size / (1024 * 1024)).toFixed(2); // Tamanho em MB
    }
    
    res.json({ 
      available, 
      fileSize,
      lastModified: available ? fs.statSync(apkPath).mtime : null
    });
  } catch (error) {
    console.error('Erro ao verificar status do APK:', error);
    res.status(500).json({ error: 'Erro ao verificar status do APK' });
  }
});

// Rota para enviar APK por email
router.post('/send-apk', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email não fornecido' });
    }
    
    // Verificar se o APK existe
    const buildDir = path.join(__dirname, mobileAppConfig.build.outputDir);
    const apkPath = path.join(buildDir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    
    if (!fs.existsSync(apkPath)) {
      return res.status(404).json({ error: 'APK não encontrado. Execute a geração do APK primeiro.' });
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
      res.json({ success: true, message: 'APK enviado por email com sucesso' });
    } else {
      throw new Error(emailResult.error || 'Falha ao enviar email');
    }
  } catch (error) {
    console.error('Erro ao enviar APK por email:', error);
    res.status(500).json({ error: 'Erro ao enviar APK por email: ' + error.message });
  }
});

// Rota para gerar APK
router.post('/generate-apk', (req, res) => {
  try {
    // Executar script de geração do APK
    console.log('Iniciando geração do APK...');
    execSync('node generate-mobile-app.js', { stdio: 'inherit' });
    
    // Verificar se o APK foi gerado
    const buildDir = path.join(__dirname, mobileAppConfig.build.outputDir);
    const apkPath = path.join(buildDir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    
    if (fs.existsSync(apkPath)) {
      const stats = fs.statSync(apkPath);
      const fileSize = (stats.size / (1024 * 1024)).toFixed(2); // Tamanho em MB
      
      res.json({ 
        success: true, 
        message: 'APK gerado com sucesso', 
        path: apkPath,
        fileSize: fileSize + ' MB',
        lastModified: stats.mtime
      });
    } else {
      res.status(500).json({ error: 'Falha ao gerar APK. Verifique os logs para mais detalhes.' });
    }
  } catch (error) {
    console.error('Erro ao gerar APK:', error);
    res.status(500).json({ error: 'Erro ao gerar APK: ' + error.message });
  }
});

// Rota para obter instruções de instalação
router.get('/installation-instructions', (req, res) => {
  try {
    const { deviceType } = req.query;
    
    let instructions = {};
    
    if (deviceType === 'android') {
      instructions = {
        title: 'Instruções de Instalação para Android (Samsung Galaxy A13 4G)',
        steps: [
          'Baixe o arquivo APK enviado para seu email',
          'No seu smartphone, localize o arquivo baixado (geralmente na pasta Downloads)',
          'Toque no arquivo APK para iniciar a instalação',
          'Se solicitado, permita a instalação de aplicativos de fontes desconhecidas',
          'Siga as instruções na tela para concluir a instalação',
          'Após a instalação, abra o aplicativo e faça login com suas credenciais'
        ],
        notes: [
          'O aplicativo requer Android 4.4 ou superior',
          'Certifique-se de ter pelo menos 100MB de espaço livre',
          'Recomendamos conectar-se a uma rede Wi-Fi para o download'
        ]
      };
    } else if (deviceType === 'ios') {
      instructions = {
        title: 'Instruções de Instalação para iOS',
        steps: [
          'O arquivo IPA será enviado para seu email',
          'No seu Mac, instale o Apple Configurator 2 ou iTunes',
          'Conecte seu iPhone ao Mac usando um cabo USB',
          'Abra o Apple Configurator 2 ou iTunes',
          'Arraste o arquivo IPA para o aplicativo ou use a opção "Adicionar" para selecionar o arquivo',
          'Siga as instruções na tela para instalar o aplicativo no seu iPhone'
        ],
        notes: [
          'O aplicativo requer iOS 9 ou superior',
          'Você precisará de uma conta de desenvolvedor Apple ou usar o TestFlight para instalação sem fio',
          'Certifique-se de ter pelo menos 100MB de espaço livre no seu iPhone'
        ]
      };
    } else {
      instructions = {
        title: 'Instruções de Instalação',
        steps: [
          'Selecione o tipo de dispositivo (Android ou iOS) para ver instruções específicas'
        ]
      };
    }
    
    res.json(instructions);
  } catch (error) {
    console.error('Erro ao obter instruções de instalação:', error);
    res.status(500).json({ error: 'Erro ao obter instruções de instalação' });
  }
});

module.exports = router;