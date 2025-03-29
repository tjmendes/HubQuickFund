/**
 * Funções de email para o script de configuração do notebook
 * Este arquivo contém as funções para enviar emails
 */

const nodemailer = require('nodemailer');

// Função para enviar email
async function sendEmail(to, subject, htmlContent, attachments = []) {
  try {
    // Verificar se as credenciais de email estão configuradas
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.log('Credenciais de email não configuradas. Simulando envio de email...');
      console.log(`Email para: ${to.join(', ')}`);
      console.log(`Assunto: ${subject}`);
      console.log('Conteúdo HTML:', htmlContent.substring(0, 100) + '...');
      if (attachments && attachments.length > 0) {
        console.log('Anexos:', attachments.map(a => a.filename).join(', '));
      }
      return { success: true, simulated: true };
    }
    
    // Configurar o transporter do Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
    
    // Configurar as opções do email
    const mailOptions = {
      from: `"QuickFundHub" <${process.env.SMTP_USER}>`,
      to: to.join(', '),
      subject: subject,
      html: htmlContent
    };
    
    // Adicionar anexos se fornecidos
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    
    // Enviar o email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendEmail };