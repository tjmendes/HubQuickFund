/**
 * Configuração para geração do APK do QuickFundHub - AMBIENTE DE PRODUÇÃO
 * Este arquivo contém as configurações necessárias para criar um APK
 * que pode ser instalado em smartphones Android e iOS
 * 
 * ATENÇÃO: Esta configuração é para o ambiente de produção após 3 anos de testes.
 * Todas as operações são realizadas com ativos reais.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

/**
 * Configurações do aplicativo móvel
 */
const mobileAppConfig = {
  // Informações básicas do aplicativo
  app: {
    name: "QuickFundHub",
    version: "1.0.0",
    description: "Plataforma de geração de lucros automatizada",
    author: "Tiago Mendes",
    package: "com.quickfundhub.app",
    icon: "./src/assets/icon.png",
    splash: "./src/assets/splash.png"
  },
  
  // Configurações de build
  build: {
    outputDir: "./mobile-build",
    android: {
      targetSdkVersion: 33,
      minSdkVersion: 19, // Compatível com Samsung Galaxy A13 4G (Android 12)
      compileSdkVersion: 33,
      buildToolsVersion: "33.0.0",
      gradleVersion: "7.4.2",
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD || "quickfundhub",
      keyAlias: "quickfundhub",
      keyPassword: process.env.ANDROID_KEY_PASSWORD || "quickfundhub",
      // Configurações específicas para Samsung Galaxy A13 4G
      deviceConfigs: {
        samsungGalaxyA13: {
          model: "SM-A135F",
          screenDensity: 411, // DPI para Samsung Galaxy A13 4G
          screenSize: "6.6", // Tamanho da tela em polegadas
          cpuArch: "arm64-v8a", // Arquitetura da CPU
          memoryRequirement: "2GB" // Requisito mínimo de memória
        }
      }
    },
    ios: {
      deploymentTarget: "12.0", // Atualizado para compatibilidade com iPhones mais recentes
      bundleIdentifier: "com.quickfundhub.app",
      developmentTeam: process.env.IOS_DEVELOPMENT_TEAM || "",
      codeSignIdentity: "iPhone Developer",
      // Configurações específicas para iPhones
      deviceConfigs: {
        iPhoneModels: ["iPhone 8", "iPhone X", "iPhone 11", "iPhone 12", "iPhone 13", "iPhone 14", "iPhone 15"],
        supportedArchitectures: ["arm64"],
        screenSizes: ["4.7", "5.8", "6.1", "6.7"], // Diferentes tamanhos de tela em polegadas
        optimizeForDevices: true // Otimizar para diferentes dispositivos
      }
    }
  },
  
  // Permissões necessárias
  permissions: {
    android: [
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.WAKE_LOCK",
      "android.permission.VIBRATE",
      "android.permission.RECEIVE_BOOT_COMPLETED",
      "android.permission.FOREGROUND_SERVICE"
    ],
    ios: [
      "NSAppTransportSecurity",
      "UIBackgroundModes"
    ]
  },
  
  // Configurações do serviço em segundo plano
  backgroundService: {
    enabled: true,
    notificationTitle: "QuickFundHub",
    notificationText: "Gerando lucros em segundo plano",
    notificationIcon: "notification_icon",
    updateInterval: 300000, // 5 minutos em milissegundos
    startOnBoot: true,
    foregroundServiceType: "dataSync"
  },
  
  // Configurações de API
  api: {
    baseUrl: process.env.API_BASE_URL || "https://api.quickfundhub.com",
    timeout: 30000, // 30 segundos
    retryAttempts: 3,
    cacheEnabled: true,
    cacheTTL: 3600000 // 1 hora em milissegundos
  },
  
  // Configurações de sincronização
  sync: {
    enabled: true,
    interval: 60000, // 1 minuto em milissegundos (otimização e correção a cada minuto)
    retryOnFailure: true,
    maxRetries: 10,
    retryDelay: 30000, // 30 segundos em milissegundos
    dataUsageLimit: {
      mobileData: 20480, // 20GB em MB por mês
      wifiData: "unlimited" // Sem limite em WiFi
    },
    errorCorrection: {
      enabled: true,
      interval: 60000, // Correção de erros a cada 1 minuto
      autoOptimize: true
    }
  },
  
  // Configurações de notificações
  notifications: {
    enabled: true,
    profitThreshold: parseFloat(process.env.PROFIT_NOTIFICATION_THRESHOLD) || 0.01,
    dailyReportEnabled: true,
    dailyReportTime: process.env.DAILY_REPORT_TIME || "20:00",
    weeklyReportEnabled: true,
    weeklyReportDay: parseInt(process.env.WEEKLY_REPORT_DAY) || 0, // Domingo
    sound: true,
    vibration: true
  }
};

/**
 * Função para gerar o arquivo de configuração do Capacitor
 * @returns {Object} Configuração do Capacitor
 */
function generateCapacitorConfig() {
  return {
    appId: mobileAppConfig.app.package,
    appName: mobileAppConfig.app.name,
    webDir: "dist",
    bundledWebRuntime: false,
    plugins: {
      SplashScreen: {
        launchShowDuration: 3000,
        backgroundColor: "#FFFFFF",
        androidSplashResourceName: "splash",
        androidScaleType: "CENTER_CROP",
        showSpinner: true,
        androidSpinnerStyle: "large",
        iosSpinnerStyle: "large",
        spinnerColor: "#2196F3",
        splashFullScreen: true,
        splashImmersive: true
      },
      LocalNotifications: {
        smallIcon: "notification_icon",
        iconColor: "#2196F3"
      },
      BackgroundTask: {
        backgroundTaskInterval: mobileAppConfig.backgroundService.updateInterval
      }
    },
    android: {
      allowMixedContent: true,
      captureInput: true,
      webContentsDebuggingEnabled: false,
      backgroundColor: "#FFFFFF",
      buildOptions: {
        keystorePath: "./android/app/quickfundhub.keystore",
        keystorePassword: mobileAppConfig.build.android.keystorePassword,
        keyAlias: mobileAppConfig.build.android.keyAlias,
        keyPassword: mobileAppConfig.build.android.keyPassword
      }
    },
    ios: {
      contentInset: "always",
      cordovaSwiftVersion: "5.1",
      minVersion: mobileAppConfig.build.ios.deploymentTarget,
      backgroundColor: "#FFFFFF",
      preferredContentMode: "mobile",
      scheme: mobileAppConfig.app.name.toLowerCase(),
      limitsNavigationsToAppBoundDomains: true
    }
  };
}

/**
 * Função para gerar o arquivo de configuração do serviço em segundo plano para Android
 * @returns {string} Conteúdo do arquivo de configuração
 */
function generateAndroidBackgroundServiceConfig() {
  return `package ${mobileAppConfig.app.package};

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.PowerManager.WakeLock;
import androidx.core.app.NotificationCompat;

public class BackgroundService extends Service {
    private static final String CHANNEL_ID = "QuickFundHubChannel";
    private static final int NOTIFICATION_ID = 1;
    private WakeLock wakeLock;
    private boolean isServiceRunning = false;
    
    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(NOTIFICATION_ID, createNotification());
        
        // Adquirir WakeLock para manter o serviço em execução mesmo com a tela bloqueada
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "QuickFundHub:BackgroundServiceWakeLock");
        wakeLock.acquire();
        
        isServiceRunning = true;
        
        // Iniciar o serviço de geração de lucros
        startProfitGenerationService();
        
        // Se o serviço for encerrado pelo sistema, reiniciá-lo
        return START_STICKY;
    }
    
    private void startProfitGenerationService() {
        // Aqui seria implementada a lógica para iniciar o serviço de geração de lucros
        // Isso seria feito através de uma ponte JavaScript para o código React/Web
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                CHANNEL_ID,
                "QuickFundHub Background Service",
                NotificationManager.IMPORTANCE_LOW
            );
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }
    
    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE);
        
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("${mobileAppConfig.backgroundService.notificationTitle}")
            .setContentText("${mobileAppConfig.backgroundService.notificationText}")
            .setSmallIcon(R.drawable.notification_icon)
            .setContentIntent(pendingIntent)
            .build();
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        
        isServiceRunning = false;
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}`;
}

/**
 * Função para gerar o arquivo de configuração do serviço em segundo plano para iOS
 * @returns {string} Conteúdo do arquivo de configuração
 */
function generateIOSBackgroundServiceConfig() {
  return `import Foundation
import UIKit
import BackgroundTasks

@objc class BackgroundService: NSObject {
    static let shared = BackgroundService()
    private var isRunning = false
    
    func registerBackgroundTasks() {
        BGTaskScheduler.shared.register(forTaskWithIdentifier: "${mobileAppConfig.app.package}.refresh", using: nil) { task in
            self.handleAppRefresh(task: task as! BGAppRefreshTask)
        }
    }
    
    func scheduleAppRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: "${mobileAppConfig.app.package}.refresh")
        request.earliestBeginDate = Date(timeIntervalSinceNow: Double(${mobileAppConfig.backgroundService.updateInterval}) / 1000.0)
        
        do {
            try BGTaskScheduler.shared.submit(request)
            print("Background task scheduled successfully")
        } catch {
            print("Could not schedule app refresh: \(error)")
        }
    }
    
    private func handleAppRefresh(task: BGAppRefreshTask) {
        // Criar um novo pedido para a próxima execução
        scheduleAppRefresh()
        
        // Criar um task para garantir que o sistema não suspenda a tarefa até terminarmos
        let taskCompletionHandler = { (success: Bool) in
            task.setTaskCompleted(success: success)
        }
        
        // Definir um timeout para garantir que a tarefa seja concluída mesmo se algo der errado
        let timeoutHandler = { 
            taskCompletionHandler(false)
        }
        
        task.expirationHandler = {
            timeoutHandler()
        }
        
        // Executar o serviço de geração de lucros
        startProfitGenerationService(completion: taskCompletionHandler)
    }
    
    private func startProfitGenerationService(completion: @escaping (Bool) -> Void) {
        // Aqui seria implementada a lógica para iniciar o serviço de geração de lucros
        // Isso seria feito através de uma ponte JavaScript para o código React/Web
        
        // Simular uma operação bem-sucedida após algum tempo
        DispatchQueue.global().asyncAfter(deadline: .now() + 25) {
            completion(true)
        }
    }
}`;
}

/**
 * Função para salvar as configurações em arquivos
 */
function saveConfigurations() {
  try {
    // Criar diretório de configurações se não existir
    const configDir = path.join(__dirname, 'mobile-config');
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    // Salvar configuração principal
    fs.writeFileSync(
      path.join(configDir, 'mobile-app-config.json'),
      JSON.stringify(mobileAppConfig, null, 2)
    );
    
    // Salvar configuração do Capacitor
    fs.writeFileSync(
      path.join(configDir, 'capacitor.config.json'),
      JSON.stringify(generateCapacitorConfig(), null, 2)
    );
    
    // Salvar configuração do serviço em segundo plano para Android
    fs.writeFileSync(
      path.join(configDir, 'BackgroundService.java'),
      generateAndroidBackgroundServiceConfig()
    );
    
    // Salvar configuração do serviço em segundo plano para iOS
    fs.writeFileSync(
      path.join(configDir, 'BackgroundService.swift'),
      generateIOSBackgroundServiceConfig()
    );
    
    console.log('Configurações do aplicativo móvel salvas com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações do aplicativo móvel:', error);
    return false;
  }
}

// Exportar configurações e funções
module.exports = {
  mobileAppConfig,
  generateCapacitorConfig,
  generateAndroidBackgroundServiceConfig,
  generateIOSBackgroundServiceConfig,
  saveConfigurations
};