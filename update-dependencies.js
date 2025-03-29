/**
 * Script para atualizar dependências do QuickFundHub
 * Este arquivo instala todas as dependências necessárias para o serviço em segundo plano
 * e para a geração do aplicativo móvel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Função para instalar dependências
function installDependencies() {
  console.log('Instalando dependências necessárias para o QuickFundHub...');
  
  try {
    // Ler o arquivo package.json atual
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Dependências necessárias para o serviço em segundo plano
    const backgroundDependencies = {
      'express': '^4.18.2',
      'body-parser': '^1.20.2',
      'node-cron': '^3.0.2',
      'dotenv': '^16.3.1',
      'axios': '^1.5.0',
      'nodemailer': '^6.9.5',
      'twilio': '^4.16.0'
    };
    
    // Dependências necessárias para o aplicativo móvel
    const mobileDependencies = {
      '@capacitor/android': '^5.0.0',
      '@capacitor/core': '^5.0.0',
      '@capacitor/ios': '^5.0.0',
      '@capacitor/cli': '^5.0.0',
      '@capacitor/splash-screen': '^5.0.0',
      '@capacitor/local-notifications': '^5.0.0',
      '@capacitor/background-task': '^5.0.0'
    };
    
    // Verificar e adicionar dependências faltantes
    let dependenciesChanged = false;
    
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    // Adicionar dependências para o serviço em segundo plano
    for (const [dep, version] of Object.entries(backgroundDependencies)) {
      if (!packageJson.dependencies[dep]) {
        console.log(`Adicionando dependência: ${dep}@${version}`);
        packageJson.dependencies[dep] = version;
        dependenciesChanged = true;
      }
    }
    
    // Adicionar dependências para o aplicativo móvel
    for (const [dep, version] of Object.entries(mobileDependencies)) {
      if (!packageJson.dependencies[dep]) {
        console.log(`Adicionando dependência: ${dep}@${version}`);
        packageJson.dependencies[dep] = version;
        dependenciesChanged = true;
      }
    }
    
    // Adicionar scripts para capacitor se não existirem
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    const requiredScripts = {
      'start:background': 'node start-background-service.js',
      'generate:apk': 'node generate-mobile-app.js',
      'cap:init': 'npx cap init',
      'cap:add:android': 'npx cap add android',
      'cap:add:ios': 'npx cap add ios',
      'cap:sync': 'npx cap sync',
      'cap:open:android': 'npx cap open android',
      'cap:open:ios': 'npx cap open ios'
    };
    
    for (const [script, command] of Object.entries(requiredScripts)) {
      if (!packageJson.scripts[script]) {
        console.log(`Adicionando script: ${script}`);
        packageJson.scripts[script] = command;
        dependenciesChanged = true;
      }
    }
    
    // Salvar package.json atualizado se houve mudanças
    if (dependenciesChanged) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      // Instalar dependências
      console.log('\nInstalando novas dependências...');
      execSync('npm install', { stdio: 'inherit' });
      
      console.log('\nDependências instaladas com sucesso!');
    } else {
      console.log('\nTodas as dependências já estão instaladas.');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao instalar dependências:', error);
    return false;
  }
}

// Executar instalação de dependências
if (require.main === module) {
  const success = installDependencies();
  
  if (success) {
    console.log('\nAtualização de dependências concluída com sucesso!');
    console.log('Agora você pode executar:');
    console.log('  - node start-background-service.js (para iniciar o serviço em segundo plano)');
    console.log('  - node generate-mobile-app.js (para gerar o APK para smartphones)');
  } else {
    console.error('\nFalha ao atualizar dependências. Verifique os erros acima.');
    process.exit(1);
  }
}

module.exports = { installDependencies };