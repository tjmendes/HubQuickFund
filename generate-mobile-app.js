/**
 * Script para gerar o APK do QuickFundHub para smartphones
 * Este arquivo cria um APK que pode ser instalado em dispositivos Android e iOS
 * e permite a execução do sistema mesmo com a tela bloqueada
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const { mobileAppConfig, saveConfigurations } = require('./mobile-app-config');

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Função principal para gerar o APK
 */
async function generateMobileApp() {
  try {
    console.log('Iniciando geração do aplicativo móvel QuickFundHub...');
    
    // Passo 1: Salvar configurações
    console.log('Salvando configurações do aplicativo móvel...');
    const configSaved = saveConfigurations();
    if (!configSaved) {
      throw new Error('Falha ao salvar configurações do aplicativo móvel');
    }
    
    // Passo 2: Criar diretório de build se não existir
    const buildDir = path.join(__dirname, mobileAppConfig.build.outputDir);
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    
    // Passo 3: Instalar dependências necessárias
    console.log('Instalando dependências necessárias...');
    installDependencies();
    
    // Passo 4: Configurar Capacitor
    console.log('Configurando Capacitor...');
    setupCapacitor();
    
    // Passo 5: Adicionar plataformas
    console.log('Adicionando plataformas Android e iOS...');
    addPlatforms();
    
    // Passo 6: Copiar arquivos de serviço em segundo plano
    console.log('Configurando serviço em segundo plano...');
    setupBackgroundService();
    
    // Passo 7: Construir aplicativo web
    console.log('Construindo aplicativo web...');
    buildWebApp();
    
    // Passo 8: Copiar build web para Capacitor
    console.log('Copiando build web para Capacitor...');
    copyWebBuild();
    
    // Passo 9: Construir APK Android
    console.log('Construindo APK Android...');
    buildAndroidApk();
    
    // Passo 10: Construir IPA iOS (se em ambiente macOS)
    if (process.platform === 'darwin') {
      console.log('Construindo IPA iOS...');
      buildIosIpa();
    } else {
      console.log('Pulando build iOS: não está em ambiente macOS');
    }
    
    console.log('\nGeração do aplicativo móvel QuickFundHub concluída com sucesso!');
    console.log(`APK Android disponível em: ${path.join(buildDir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk')}`);
    
    if (process.platform === 'darwin') {
      console.log(`IPA iOS disponível em: ${path.join(buildDir, 'ios', 'App', 'build', 'ios', 'App.ipa')}`);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar aplicativo móvel:', error);
    return false;
  }
}

/**
 * Instalar dependências necessárias
 */
function installDependencies() {
  try {
    // Verificar se já tem as dependências instaladas
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')));
    
    // Adicionar dependências necessárias se não existirem
    let dependenciesChanged = false;
    
    const requiredDependencies = {
      '@capacitor/android': '^5.0.0',
      '@capacitor/core': '^5.0.0',
      '@capacitor/ios': '^5.0.0',
      '@capacitor/cli': '^5.0.0',
      '@capacitor/splash-screen': '^5.0.0',
      '@capacitor/local-notifications': '^5.0.0',
      '@capacitor/background-task': '^5.0.0'
    };
    
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    // Verificar e adicionar dependências faltantes
    for (const [dep, version] of Object.entries(requiredDependencies)) {
      if (!packageJson.dependencies[dep]) {
        packageJson.dependencies[dep] = version;
        dependenciesChanged = true;
      }
    }
    
    // Adicionar scripts para capacitor se não existirem
    if (!packageJson.scripts) {
      packageJson.scripts = {};
    }
    
    const requiredScripts = {
      'cap:init': 'npx cap init',
      'cap:add:android': 'npx cap add android',
      'cap:add:ios': 'npx cap add ios',
      'cap:sync': 'npx cap sync',
      'cap:open:android': 'npx cap open android',
      'cap:open:ios': 'npx cap open ios',
      'cap:build:android': 'npx cap copy android && cd android && ./gradlew assembleRelease',
      'cap:build:ios': 'npx cap copy ios && cd ios && xcodebuild -workspace App/App.xcworkspace -scheme App -configuration Release -sdk iphoneos build'
    };
    
    for (const [script, command] of Object.entries(requiredScripts)) {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = command;
        dependenciesChanged = true;
      }
    }
    
    // Salvar package.json atualizado se houve mudanças
    if (dependenciesChanged) {
      fs.writeFileSync(path.join(__dirname, 'package.json'), JSON.stringify(packageJson, null, 2));
      
      // Instalar dependências
      console.log('Instalando novas dependências...');
      execSync('npm install', { stdio: 'inherit' });
    } else {
      console.log('Todas as dependências já estão instaladas.');
    }
  } catch (error) {
    console.error('Erro ao instalar dependências:', error);
    throw error;
  }
}

/**
 * Configurar Capacitor
 */
function setupCapacitor() {
  try {
    const capacitorConfigPath = path.join(__dirname, 'capacitor.config.json');
    
    // Verificar se já existe configuração do Capacitor
    if (!fs.existsSync(capacitorConfigPath)) {
      // Copiar configuração gerada
      const configSourcePath = path.join(__dirname, 'mobile-config', 'capacitor.config.json');
      if (fs.existsSync(configSourcePath)) {
        fs.copyFileSync(configSourcePath, capacitorConfigPath);
      } else {
        // Inicializar Capacitor
        console.log('Inicializando Capacitor...');
        execSync(`npx cap init ${mobileAppConfig.app.name} ${mobileAppConfig.app.package} --web-dir=dist`, { stdio: 'inherit' });
        
        // Atualizar configuração com as configurações personalizadas
        if (fs.existsSync(capacitorConfigPath)) {
          const capacitorConfig = JSON.parse(fs.readFileSync(configSourcePath));
          fs.writeFileSync(capacitorConfigPath, JSON.stringify(capacitorConfig, null, 2));
        }
      }
    } else {
      console.log('Configuração do Capacitor já existe.');
    }
  } catch (error) {
    console.error('Erro ao configurar Capacitor:', error);
    throw error;
  }
}

/**
 * Adicionar plataformas Android e iOS
 */
function addPlatforms() {
  try {
    // Verificar se já tem plataforma Android
    if (!fs.existsSync(path.join(__dirname, 'android'))) {
      console.log('Adicionando plataforma Android...');
      execSync('npx cap add android', { stdio: 'inherit' });
    } else {
      console.log('Plataforma Android já adicionada.');
    }
    
    // Verificar se está em macOS para adicionar iOS
    if (process.platform === 'darwin') {
      if (!fs.existsSync(path.join(__dirname, 'ios'))) {
        console.log('Adicionando plataforma iOS...');
        execSync('npx cap add ios', { stdio: 'inherit' });
      } else {
        console.log('Plataforma iOS já adicionada.');
      }
    }
  } catch (error) {
    console.error('Erro ao adicionar plataformas:', error);
    throw error;
  }
}

/**
 * Configurar serviço em segundo plano
 */
function setupBackgroundService() {
  try {
    // Copiar arquivos de serviço em segundo plano para Android
    const androidServicePath = path.join(__dirname, 'android', 'app', 'src', 'main', 'java', ...mobileAppConfig.app.package.split('.'));
    
    if (!fs.existsSync(androidServicePath)) {
      fs.mkdirSync(androidServicePath, { recursive: true });
    }
    
    // Copiar arquivo de serviço em segundo plano para Android
    const androidServiceSourcePath = path.join(__dirname, 'mobile-config', 'BackgroundService.java');
    const androidServiceDestPath = path.join(androidServicePath, 'BackgroundService.java');
    
    if (fs.existsSync(androidServiceSourcePath)) {
      fs.copyFileSync(androidServiceSourcePath, androidServiceDestPath);
    }
    
    // Configurar serviço em segundo plano para iOS (se em macOS)
    if (process.platform === 'darwin') {
      const iosServicePath = path.join(__dirname, 'ios', 'App', 'App', 'BackgroundService.swift');
      const iosServiceSourcePath = path.join(__dirname, 'mobile-config', 'BackgroundService.swift');
      
      if (fs.existsSync(iosServiceSourcePath)) {
        fs.copyFileSync(iosServiceSourcePath, iosServicePath);
      }
    }
  } catch (error) {
    console.error('Erro ao configurar serviço em segundo plano:', error);
    throw error;
  }
}

/**
 * Construir aplicativo web
 */
function buildWebApp() {
  try {
    console.log('Executando build do aplicativo web...');
    execSync('npm run build', { stdio: 'inherit' });
  } catch (error) {
    console.error('Erro ao construir aplicativo web:', error);
    throw error;
  }
}

/**
 * Copiar build web para Capacitor
 */
function copyWebBuild() {
  try {
    console.log('Sincronizando aplicativo web com Capacitor...');
    execSync('npx cap sync', { stdio: 'inherit' });
  } catch (error) {
    console.error('Erro ao sincronizar com Capacitor:', error);
    throw error;
  }
}

/**
 * Construir APK Android
 */
function buildAndroidApk() {
  try {
    console.log('Construindo APK Android...');
    
    // Verificar se o diretório android existe
    if (!fs.existsSync(path.join(__dirname, 'android'))) {
      throw new Error('Diretório Android não encontrado. Execute addPlatforms() primeiro.');
    }
    
    // Construir APK
    execSync('cd android && .\\gradlew.bat assembleRelease', { stdio: 'inherit' });
    
    // Verificar se o APK foi gerado
    const apkPath = path.join(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    if (!fs.existsSync(apkPath)) {
      throw new Error('APK não foi gerado corretamente.');
    }
    
    // Copiar APK para o diretório de saída
    const outputDir = path.join(__dirname, mobileAppConfig.build.outputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.copyFileSync(apkPath, path.join(outputDir, 'QuickFundHub.apk'));
    console.log(`APK gerado com sucesso: ${path.join(outputDir, 'QuickFundHub.apk')}`);
  } catch (error) {
    console.error('Erro ao construir APK Android:', error);
    throw error;
  }
}

/**
 * Construir IPA iOS (apenas em macOS)
 */
function buildIosIpa() {
  // Esta função só funciona em ambiente macOS
  if (process.platform !== 'darwin') {
    console.log('Pulando build iOS: não está em ambiente macOS');
    return;
  }
  
  try {
    console.log('Construindo IPA iOS...');
    
    // Verificar se o diretório iOS existe
    if (!fs.existsSync(path.join(__dirname, 'ios'))) {
      throw new Error('Diretório iOS não encontrado. Execute addPlatforms() primeiro.');
    }
    
    // Construir IPA (apenas em macOS)
    execSync('cd ios && xcodebuild -workspace App/App.xcworkspace -scheme App -configuration Release -sdk iphoneos build', { stdio: 'inherit' });
    
    console.log('IPA iOS gerado com sucesso');
  } catch (error) {
    console.error('Erro ao construir IPA iOS:', error);
    throw error;
  }
}

// Executar geração do aplicativo móvel
if (require.main === module) {
  generateMobileApp().then(success => {
    if (success) {
      console.log('\nAPK gerado com sucesso! Pronto para ser enviado por email e instalado em smartphones.');
    } else {
      console.error('\nFalha ao gerar APK. Verifique os erros acima.');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Erro fatal ao gerar APK:', error);
    process.exit(1);
  });
}

module.exports = { generateMobileApp };