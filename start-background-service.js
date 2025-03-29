/**
 * Script para iniciar o serviço em segundo plano do QuickFundHub
 * Este arquivo inicia o serviço que continua executando mesmo com a tela bloqueada
 * e garante que as operações de geração de lucro continuem funcionando 24/7
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Diretório de logs
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Arquivo de log
const logFile = path.join(dataDir, 'background-service-startup.log');

/**
 * Função para registrar logs
 * @param {string} message - Mensagem a ser registrada
 */
function logMessage(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp} ${message}\n`;
  
  // Adicionar ao arquivo de log
  fs.appendFileSync(logFile, logEntry);
  
  // Também exibir no console
  console.log(logEntry.trim());
}

/**
 * Função para iniciar o serviço em segundo plano
 */
function startBackgroundService() {
  logMessage('Iniciando serviço em segundo plano do QuickFundHub...');
  
  try {
    // Verificar se o arquivo do serviço existe
    const servicePath = path.join(__dirname, 'background-service.js');
    if (!fs.existsSync(servicePath)) {
      logMessage(`ERRO: Arquivo do serviço não encontrado: ${servicePath}`);
      return false;
    }
    
    // Opções para o processo em segundo plano
    const options = {
      detached: true, // Desvincula o processo do processo pai
      stdio: ['ignore', 'pipe', 'pipe'], // Redireciona stdin, stdout e stderr
      env: process.env // Passa as variáveis de ambiente
    };
    
    // Iniciar o processo em segundo plano
    const child = spawn('node', [servicePath], options);
    
    // Capturar saída padrão
    child.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        logMessage(`[SERVIÇO] ${output}`);
      }
    });
    
    // Capturar saída de erro
    child.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        logMessage(`[ERRO] ${output}`);
      }
    });
    
    // Tratar encerramento do processo
    child.on('close', (code) => {
      if (code !== 0) {
        logMessage(`Serviço encerrado com código ${code}`);
      }
    });
    
    // Desvincular o processo para que ele continue rodando em segundo plano
    child.unref();
    
    // Salvar o PID do processo para referência futura
    fs.writeFileSync(path.join(dataDir, 'background-service.pid'), child.pid.toString());
    
    logMessage(`Serviço em segundo plano iniciado com sucesso (PID: ${child.pid})`);
    logMessage('O serviço continuará executando mesmo com a tela bloqueada.');
    logMessage('Para verificar o status do serviço, acesse: http://localhost:3001/api/status');
    
    return true;
  } catch (error) {
    logMessage(`ERRO ao iniciar serviço em segundo plano: ${error.message}`);
    return false;
  }
}

/**
 * Função para verificar se o serviço já está em execução
 * @returns {boolean} - true se o serviço estiver em execução, false caso contrário
 */
function isServiceRunning() {
  try {
    const pidFile = path.join(dataDir, 'background-service.pid');
    
    // Verificar se o arquivo PID existe
    if (!fs.existsSync(pidFile)) {
      return false;
    }
    
    // Ler o PID do arquivo
    const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim());
    
    // No Windows, verificar se o processo existe usando tasklist
    if (process.platform === 'win32') {
      try {
        const { execSync } = require('child_process');
        const result = execSync(`tasklist /FI "PID eq ${pid}" /NH`, { encoding: 'utf8' });
        
        // Se o resultado contém o PID, o processo está em execução
        return result.includes(pid.toString());
      } catch (error) {
        return false;
      }
    }
    
    // Em outros sistemas, tentar enviar um sinal 0 para verificar se o processo existe
    try {
      process.kill(pid, 0);
      return true;
    } catch (error) {
      return false;
    }
  } catch (error) {
    logMessage(`ERRO ao verificar status do serviço: ${error.message}`);
    return false;
  }
}

// Verificar se o serviço já está em execução
if (isServiceRunning()) {
  logMessage('O serviço em segundo plano já está em execução.');
  logMessage('Para verificar o status do serviço, acesse: http://localhost:3001/api/status');
} else {
  // Iniciar o serviço em segundo plano
  const success = startBackgroundService();
  
  if (success) {
    logMessage('\nServiço iniciado com sucesso! O QuickFundHub continuará gerando lucros mesmo com a tela bloqueada.');
  } else {
    logMessage('\nFalha ao iniciar o serviço em segundo plano. Verifique os erros acima.');
    process.exit(1);
  }
}