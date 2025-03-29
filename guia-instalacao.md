# Guia de Instalação do QuickFundHub

## Como baixar para notebook

### Requisitos
- Windows 10 ou superior
- Node.js versão 14 ou superior
- PowerShell
- Git (opcional)

### Passos para baixar e instalar

1. **Baixar o projeto**
   - Execute o script PowerShell para compactar o projeto:
   ```powershell
   ./download-project.ps1
   ```
   - Isso criará um arquivo `QuickFundHub-Project.zip` no diretório atual
   - Copie este arquivo para seu notebook usando um pendrive ou transferência de rede

2. **Extrair o projeto no notebook**
   - Extraia o conteúdo do arquivo ZIP em uma pasta de sua preferência
   - Abra um terminal (PowerShell ou Prompt de Comando) na pasta extraída

3. **Instalar dependências**
   ```bash
   npm install
   ```

4. **Configurar o ambiente**
   - Renomeie o arquivo `.env.example` para `.env` se ainda não existir um arquivo `.env`
   - Edite o arquivo `.env` com suas configurações pessoais

5. **Iniciar o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

## Como gerar APK para smartphones Android (Samsung Galaxy A13 4G e superiores)

### Requisitos
- JDK 11 ou superior
- Android SDK
- Gradle

### Passos para gerar o APK

1. **Configurar o ambiente Android**
   - Instale o Android Studio ou apenas o Android SDK
   - Configure as variáveis de ambiente ANDROID_HOME e JAVA_HOME

2. **Gerar o APK**
   - Execute o comando:
   ```bash
   npm run generate:apk
   ```
   - O APK será gerado em `./mobile-build/android/app/build/outputs/apk/release/app-release.apk`

3. **Instalar no dispositivo**
   - Transfira o APK para seu smartphone Samsung Galaxy A13 4G ou superior
   - No smartphone, navegue até o arquivo APK e toque nele para instalar
   - Permita a instalação de fontes desconhecidas se solicitado

## Como gerar IPA para iPhones (iOS 9 e superiores)

### Requisitos
- Mac com macOS 10.15 ou superior
- Xcode 12 ou superior
- Conta de desenvolvedor Apple

### Passos para gerar o IPA

1. **Configurar o ambiente iOS**
   - Instale o Xcode no Mac
   - Configure sua conta de desenvolvedor Apple no Xcode

2. **Gerar o IPA**
   - No Mac, execute o comando:
   ```bash
   npm run generate:apk
   ```
   - O IPA será gerado em `./mobile-build/ios/App/build/ios/App.ipa`

3. **Instalar no dispositivo**
   - Use o Apple Configurator 2 ou iTunes para instalar o IPA no seu iPhone
   - Alternativamente, distribua através do TestFlight para instalação sem fio

## Solução de problemas

### Erro ao gerar APK
- Verifique se o JDK e Android SDK estão instalados corretamente
- Execute `npm run cap:sync` antes de tentar gerar o APK novamente

### Erro ao gerar IPA
- Verifique se sua conta de desenvolvedor Apple está configurada corretamente
- Certifique-se de que o certificado de assinatura é válido

### Aplicativo não inicia no dispositivo
- Verifique os logs de erro no console do dispositivo
- Certifique-se de que o dispositivo atende aos requisitos mínimos (Android 4.4+ ou iOS 9+)

## Suporte

Para obter ajuda adicional, entre em contato com o suporte técnico do QuickFundHub.