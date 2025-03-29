import { CapacitorConfig } from '@capacitor/cli';

// Configuração para ambiente de produção após 3 anos de testes
const config: CapacitorConfig = {
  appId: 'com.quickfundhub.app.production',
  appName: 'QuickFundHub',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    hostname: 'app.quickfundhub.com',
    cleartext: true,
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#3182CE',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'large',
      spinnerColor: '#FFFFFF',
      splashFullScreen: true,
      splashImmersive: true
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#3182CE',
      sound: 'beep.wav'
    },
    BackgroundTask: {
      backgroundTaskInterval: 900000 // 15 minutos
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false, // Desabilitado para produção
    backgroundColor: '#FFFFFF',
    minSdkVersion: 19, // Compatível com Samsung Galaxy A13 4G (Android 12)
    targetSdkVersion: 33,
    buildOptions: {
      keystorePath: 'android/app/quickfundhub.keystore',
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD || 'quickfundhub',
      keystoreAlias: 'quickfundhub',
      keystoreAliasPassword: process.env.ANDROID_KEY_PASSWORD || 'quickfundhub',
      releaseType: 'APK',
      minifyEnabled: true,
      shrinkResources: true,
      proguardEnabled: true,
      abiFilters: ['armeabi-v7a', 'arm64-v8a'], // Suporte para arquiteturas comuns em smartphones
      splits: {
        abi: {
          enable: true,
          include: ['armeabi-v7a', 'arm64-v8a']
        }
      }
    }
  },
  ios: {
    contentInset: 'always',
    allowsLinkPreview: true,
    scrollEnabled: true,
    useOnlineAssets: true,
    limitsNavigationsToAppBoundDomains: true,
    backgroundColor: '#FFFFFF',
    minVersion: '9.0' // Compatível com iPhone a partir do iOS 9
  }
};

export default config;