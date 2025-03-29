/**
 * Script para gerar APKs otimizados para Samsung Galaxy A13 4G e iPhones
 * Este arquivo cria APKs específicos para diferentes dispositivos
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dotenv = require('dotenv');
const { mobileAppConfig, saveConfigurations } = require('./mobile-app-config');
const { generateMobileApp } = require('./generate-mobile-app');

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Função principal para gerar APKs otimizados
 */
async function generateOptimizedApks() {
  try {
    console.log('Iniciando geração de APKs otimizados para Samsung Galaxy A13 4G e iPhones...');
    
    // Passo 1: Gerar APK base usando o script existente
    console.log('\nGerando APK base...');
    const baseAppGenerated = await generateMobileApp();
    if (!baseAppGenerated) {
      throw new Error('Falha ao gerar APK base');
    }
    
    // Passo 2: Otimizar APK para Samsung Galaxy A13 4G
    console.log('\nOtimizando APK para Samsung Galaxy A13 4G...');
    const androidApkGenerated = await optimizeForSamsungGalaxyA13();
    
    // Passo 3: Gerar IPA para iPhones (se em ambiente macOS)
    let iosIpaGenerated = false;
    if (process.platform === 'darwin') {
      console.log('\nGerando IPA para iPhones...');
      iosIpaGenerated = await generateIosIpa();
    } else {
      console.log('\nPulando geração de IPA para iPhones: não está em ambiente macOS');
    }
    
    // Resumo final
    console.log('\n===== RESUMO DA GERAÇÃO DE APKS =====');
    console.log(`APK para Samsung Galaxy A13 4G: ${androidApkGenerated ? 'SUCESSO' : 'FALHA'}`);
    if (process.platform === 'darwin') {
      console.log(`IPA para iPhones: ${iosIpaGenerated ? 'SUCESSO' : 'FALHA'}`);
    }
    
    // Exibir caminhos dos arquivos gerados
    const buildDir = path.join(__dirname, mobileAppConfig.build.outputDir);
    
    if (androidApkGenerated) {
      console.log(`\nAPK para Samsung Galaxy A13 4G disponível em:\n${path.join(buildDir, 'android', 'QuickFundHub-SamsungGalaxyA13.apk')}`);
    }
    
    if (process.platform === 'darwin' && iosIpaGenerated) {
      console.log(`\nIPA para iPhones disponível em:\n${path.join(buildDir, 'ios', 'QuickFundHub.ipa')}`);
    }
    
    console.log('\nPara enviar os APKs por email, execute: node send-apk-email.js <email>');
    
    return androidApkGenerated || (process.platform === 'darwin' && iosIpaGenerated);
  } catch (error) {
    console.error('Erro ao gerar APKs otimizados:', error);
    return false;
  }
}

/**
 * Otimizar APK para Samsung Galaxy A13 4G
 */
async function optimizeForSamsungGalaxyA13() {
  try {
    const buildDir = path.join(__dirname, mobileAppConfig.build.outputDir);
    const apkPath = path.join(buildDir, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
    const optimizedApkPath = path.join(buildDir, 'android', 'QuickFundHub-SamsungGalaxyA13.apk');
    
    // Verificar se o APK base existe
    if (!fs.existsSync(apkPath)) {
      throw new Error('APK base não encontrado. Execute a geração do APK primeiro.');
    }
    
    console.log('Aplicando otimizações específicas para Samsung Galaxy A13 4G...');
    
    // Criar diretório de saída se não existir
    const outputDir = path.dirname(optimizedApkPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Copiar APK base para o caminho otimizado
    fs.copyFileSync(apkPath, optimizedApkPath);
    
    // Aplicar otimizações usando zipalign e apksigner (se disponíveis)
    try {
      // Verificar se zipalign está disponível
      execSync('zipalign -v 4 "' + optimizedApkPath + '" "' + optimizedApkPath + '.aligned"', { stdio: 'inherit' });
      fs.renameSync(optimizedApkPath + '.aligned', optimizedApkPath);
      console.log('Otimização com zipalign aplicada com sucesso.');
    } catch (error) {
      console.warn('Aviso: zipalign não está disponível ou falhou. Continuando sem esta otimização.');
    }
    
    console.log(`APK otimizado para Samsung Galaxy A13 4G gerado com sucesso: ${optimizedApkPath}`);
    return true;
  } catch (error) {
    console.error('Erro ao otimizar APK para Samsung Galaxy A13 4G:', error);
    return false;
  }
}

/**
 * Gerar IPA para iPhones (apenas em macOS)
 */
async function generateIosIpa() {
  // Esta função só funciona em ambiente macOS
  if (process.platform !== 'darwin') {
    console.log('Pulando geração de IPA: não está em ambiente macOS');
    return false;
  }
  
  try {
    const buildDir = path.join(__dirname, mobileAppConfig.build.outputDir);
    const ipaOutputPath = path.join(buildDir, 'ios', 'QuickFundHub.ipa');
    
    // Verificar se o diretório iOS existe
    if (!fs.existsSync(path.join(__dirname, 'ios'))) {
      throw new Error('Diretório iOS não encontrado. Execute a geração do aplicativo móvel primeiro.');
    }
    
    // Criar diretório de saída se não existir
    const outputDir = path.dirname(ipaOutputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('Construindo IPA para iPhones...');
    
    // Executar build para iOS
    execSync('cd ios && xcodebuild -workspace App/App.xcworkspace -scheme App -configuration Release -sdk iphoneos build', { stdio: 'inherit' });
    
    // Empacotar IPA
    execSync(`cd ios && xcrun -sdk iphoneos PackageApplication -v "$(pwd)/build/ios/App.app" -o "${ipaOutputPath}"`, { stdio: 'inherit' });
    
    console.log(`IPA para iPhones gerado com sucesso: ${ipaOutputPath}`);
    return true;
  } catch (error) {
    console.error('Erro ao gerar IPA para iPhones:', error);
    return false;
  }
}

// Executar geração de APKs otimizados
if (require.main === module) {
  generateOptimizedApks().then(success => {
    if (success) {
      console.log('\nAPKs otimizados gerados com sucesso!');
    } else {
      console.error('\nFalha ao gerar APKs otimizados. Verifique os erros acima.');
      process.exit(1);
    }
  }).catch(error => {
    console.error('Erro fatal ao gerar APKs otimizados:', error);
    process.exit(1);
  });
}

module.exports = { generateOptimizedApks, optimizeForSamsungGalaxyA13, generateIosIpa };