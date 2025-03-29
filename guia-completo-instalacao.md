# Guia Completo de Download e Instalação do QuickFundHub

Este guia fornece instruções detalhadas para baixar, instalar e operar o QuickFundHub em notebooks, smartphones Android (Samsung Galaxy A13 4G), iPhones (a partir do iOS 9) e na infraestrutura AWS.

## Índice

1. [Download e Instalação em Notebook](#download-e-instalação-em-notebook)
2. [Download e Instalação em Samsung Galaxy A13 4G (Android)](#download-e-instalação-em-samsung-galaxy-a13-4g-android)
3. [Download e Instalação em iPhone (iOS 9+)](#download-e-instalação-em-iphone-ios-9)
4. [Configuração e Execução na AWS](#configuração-e-execução-na-aws)
5. [Operação do Sistema](#operação-do-sistema)
6. [Solução de Problemas Comuns](#solução-de-problemas-comuns)

## Download e Instalação em Notebook

### Requisitos do Sistema

- **Sistema Operacional**: Windows 10/11, macOS 10.14+ ou Linux (Ubuntu 18.04+)
- **Processador**: Intel Core i5 ou equivalente (recomendado)
- **Memória RAM**: Mínimo de 8GB (16GB recomendado)
- **Espaço em Disco**: 1GB disponível
- **Software Necessário**: Node.js (versão 14.x ou superior), npm (versão 6.x ou superior)

### Passos para Download

1. **Baixar o Arquivo ZIP**:
   - Opção 1: Baixe o arquivo `QuickFundHub-Project.zip` diretamente do repositório
   - Opção 2: Execute o script PowerShell para gerar o arquivo ZIP:
     ```powershell
     ./download-project.ps1
     ```

2. **Transferir para o Notebook**:
   - Copie o arquivo ZIP para seu notebook usando um pendrive, transferência de rede ou serviço de armazenamento em nuvem
   - Extraia o conteúdo do arquivo ZIP em uma pasta de sua preferência

### Passos para Instalação

1. **Preparar o Ambiente**:
   - Instale o Node.js e npm do site oficial: https://nodejs.org/
   - Verifique a instalação executando no terminal/prompt de comando:
     ```
     node --version
     npm --version
     ```

2. **Instalar Dependências**:
   - Abra o terminal/prompt de comando
   - Navegue até a pasta onde o projeto foi extraído
   - Execute o comando:
     ```
     npm install
     ```

3. **Configurar o Ambiente**:
   - Renomeie o arquivo `.env.example` para `.env`
   - Edite o arquivo `.env` com suas configurações pessoais

4. **Iniciar o Sistema**:
   - Execute o comando para configurar o notebook:
     ```
     node notebook-setup.js
     ```
   - Inicie o servidor de desenvolvimento:
     ```
     npm run dev
     ```
   - O sistema estará disponível em `http://localhost:3000`

5. **Iniciar o Serviço em Segundo Plano**:
   - Execute o comando:
     ```
     node start-background-service.js
     ```
   - Este serviço continuará funcionando mesmo com a tela bloqueada

## Download e Instalação em Samsung Galaxy A13 4G (Android)

### Requisitos do Sistema

- **Sistema Operacional**: Android 4.4 ou superior (Android 12 recomendado)
- **Espaço de Armazenamento**: Mínimo de 100MB disponíveis
- **Memória RAM**: Mínimo de 2GB
- **Conexão com Internet**: Necessária para sincronização de dados
- **Permissões**: Acesso à internet, notificações e execução em segundo plano

### Passos para Download e Instalação

1. **Obter o APK**:
   - **Método 1 - Via Email**:
     - No notebook com o projeto instalado, execute:
       ```
       node send-apk-email.js seu-email@exemplo.com android
       ```
     - Verifique sua caixa de entrada e baixe o arquivo APK anexado
   
   - **Método 2 - Geração Direta**:
     - No notebook com o projeto instalado, execute:
       ```
       node generate-mobile-apks.js
       ```
     - Localize o APK gerado em `./[diretório de saída]/android/QuickFundHub-SamsungGalaxyA13.apk`
     - Transfira o arquivo para seu smartphone via cabo USB, Bluetooth ou serviço de nuvem

2. **Instalação no Smartphone**:
   - No seu Samsung Galaxy A13 4G, navegue até a pasta onde o APK foi salvo
   - Toque no arquivo APK para iniciar a instalação
   - Se solicitado, permita a instalação de aplicativos de fontes desconhecidas:
     - Vá para **Configurações > Segurança > Instalar aplicativos desconhecidos**
     - Ative a permissão para o seu gerenciador de arquivos ou aplicativo de email
   - Siga as instruções na tela para concluir a instalação

3. **Configuração Inicial**:
   - Abra o aplicativo QuickFundHub
   - Faça login com suas credenciais existentes
   - Permita as notificações quando solicitado
   - Ative a execução em segundo plano nas configurações do aplicativo

## Download e Instalação em iPhone (iOS 9+)

### Requisitos do Sistema

- **Dispositivo**: iPhone 6s ou superior (recomendado)
- **Sistema Operacional**: iOS 9.0 ou superior (iOS 15+ recomendado)
- **Espaço de Armazenamento**: Mínimo de 120MB disponíveis
- **Conexão com Internet**: Necessária para sincronização de dados
- **Permissões**: Notificações e atualização em segundo plano

### Passos para Download e Instalação

1. **Obter o Aplicativo**:
   - **Método 1 - Via Email**:
     - No notebook com o projeto instalado, execute:
       ```
       node send-apk-email.js seu-email@exemplo.com ios
       ```
     - Verifique sua caixa de entrada para instruções específicas para iOS

   - **Método 2 - Geração Direta** (requer macOS):
     - Em um Mac, execute:
       ```
       node generate-mobile-apks.js
       ```
     - Localize o IPA gerado em `./[diretório de saída]/ios/QuickFundHub.ipa`

2. **Instalação via AltStore** (método recomendado):
   - Instale o AltStore em seu computador e iPhone seguindo as instruções em [altstore.io](https://altstore.io)
   - Transfira o arquivo IPA para seu computador
   - Abra o AltStore no seu iPhone
   - Vá para a guia "My Apps" e toque no símbolo "+" no canto superior
   - Selecione o arquivo IPA do QuickFundHub
   - Aguarde a instalação ser concluída

3. **Instalação via Sideloadly** (método alternativo):
   - Baixe e instale o Sideloadly em seu computador a partir de [sideloadly.io](https://sideloadly.io)
   - Conecte seu iPhone ao computador
   - Abra o Sideloadly e arraste o arquivo IPA para o aplicativo
   - Insira seu Apple ID e senha quando solicitado
   - Clique em "Start" para iniciar a instalação
   - No seu iPhone, vá para **Configurações > Geral > Gerenciamento de Dispositivo**
   - Confie no perfil do desenvolvedor associado ao seu Apple ID

4. **Configuração Inicial**:
   - Abra o aplicativo QuickFundHub
   - Faça login com suas credenciais existentes
   - Permita as notificações quando solicitado
   - Nas configurações do iPhone, vá para "Geral" > "Atualização em segundo plano" e certifique-se de que o QuickFundHub está ativado

## Configuração e Execução na AWS

### Requisitos

- Conta AWS ativa
- AWS CLI instalado e configurado
- Permissões IAM adequadas para criar recursos (Lambda, DynamoDB, S3, etc.)

### Passos para Configuração

1. **Preparar o Ambiente AWS**:
   - Configure a AWS CLI com suas credenciais:
     ```
     aws configure
     ```
   - Verifique se você tem acesso aos serviços necessários

2. **Implantar na AWS**:
   - No notebook com o projeto instalado, execute:
     ```
     node aws-deploy.js
     ```
   - Este script irá:
     - Criar os parâmetros necessários no AWS Systems Manager Parameter Store
     - Empacotar a função Lambda
     - Implantar a stack do CloudFormation com todos os recursos necessários

3. **Verificar a Implantação**:
   - Acesse o Console AWS
   - Navegue até CloudFormation e verifique se a stack foi criada com sucesso
   - Verifique os recursos criados: Lambda, DynamoDB, SNS, SQS, S3, SES, API Gateway

4. **Configurar Notificações**:
   - No Console AWS, navegue até o serviço SNS
   - Confirme a inscrição do seu email/número de telefone para receber notificações

### Execução na AWS

1. **Lambda**:
   - O sistema executará automaticamente as funções Lambda conforme programado
   - Para execução manual, você pode invocar a função Lambda pelo Console AWS ou AWS CLI:
     ```
     aws lambda invoke --function-name QuickFundHub-Function output.txt
     ```

2. **Monitoramento**:
   - Acesse o CloudWatch para monitorar logs e métricas
   - Configure alarmes para ser notificado sobre eventos importantes

## Operação do Sistema

### Notebook

1. **Interface Web**:
   - Acesse `http://localhost:3000` no navegador
   - Faça login com suas credenciais
   - Navegue pelo painel para visualizar lucros, histórico e configurações

2. **Serviço em Segundo Plano**:
   - O serviço iniciado com `node start-background-service.js` continuará executando estratégias de geração de lucro
   - Para verificar o status, acesse `http://localhost:3001/api/status`

3. **Relatórios**:
   - Relatórios diários e semanais serão enviados automaticamente para seu email
   - Para gerar um relatório manualmente, execute:
     ```
     node lambda-reports.js
     ```

### Smartphone (Android e iOS)

1. **Interface do Aplicativo**:
   - Abra o aplicativo QuickFundHub
   - Faça login com suas credenciais
   - A tela inicial mostrará um resumo dos lucros e operações recentes

2. **Notificações**:
   - O aplicativo enviará notificações quando novos lucros forem registrados
   - Toque nas notificações para ver detalhes da operação

3. **Operação em Segundo Plano**:
   - O aplicativo continuará funcionando em segundo plano, mesmo com a tela bloqueada
   - Verifique nas configurações do dispositivo se a execução em segundo plano está permitida

4. **Sincronização**:
   - Os dados são sincronizados automaticamente quando o dispositivo está conectado à internet
   - Para forçar uma sincronização, puxe para baixo na tela principal

### AWS

1. **Monitoramento**:
   - Acesse o Console AWS para monitorar a execução das funções Lambda
   - Verifique os logs no CloudWatch para identificar possíveis problemas

2. **Escalabilidade**:
   - O sistema está configurado para escalar automaticamente conforme a demanda
   - Não é necessário intervenção manual para ajustar a capacidade

## Solução de Problemas Comuns

### Notebook

1. **Erro ao instalar dependências**:
   - Verifique se o Node.js e npm estão instalados corretamente
   - Tente limpar o cache do npm: `npm cache clean --force`
   - Execute `npm install` novamente

2. **Erro ao iniciar o servidor**:
   - Verifique se a porta 3000 não está sendo usada por outro aplicativo
   - Verifique se todas as dependências foram instaladas
   - Verifique o arquivo `.env` para configurações incorretas

3. **Serviço em segundo plano não funciona**:
   - Verifique se o script foi iniciado com privilégios de administrador
   - Verifique os logs em `./logs/background-service.log`

### Samsung Galaxy A13 4G (Android)

1. **Não é possível instalar o APK**:
   - Verifique se permitiu a instalação de aplicativos de fontes desconhecidas
   - Verifique se há espaço suficiente no dispositivo
   - Tente baixar o APK novamente

2. **Aplicativo fecha inesperadamente**:
   - Verifique se o Android está atualizado
   - Limpe o cache do aplicativo: Configurações > Aplicativos > QuickFundHub > Armazenamento > Limpar cache
   - Reinicie o dispositivo

3. **Notificações não aparecem**:
   - Verifique as permissões de notificação: Configurações > Aplicativos > QuickFundHub > Notificações
   - Verifique se o modo "Não perturbe" está desativado

### iPhone (iOS)

1. **Não é possível instalar o IPA**:
   - Verifique se o método de sideload (AltStore ou Sideloadly) está configurado corretamente
   - Verifique se seu Apple ID não tem verificação em duas etapas (ou use senha específica para aplicativos)
   - Tente reiniciar o iPhone e o computador

2. **Aplicativo não abre (mostra tela cinza)**:
   - O certificado pode ter expirado. Reinstale o aplicativo
   - Verifique se confiou no perfil do desenvolvedor em Configurações > Geral > Gerenciamento de Dispositivo

3. **Aplicativo não funciona em segundo plano**:
   - Verifique se a atualização em segundo plano está ativada: Configurações > Geral > Atualização em segundo plano
   - Verifique se o modo de baixo consumo está desativado

### AWS

1. **Falha na implantação do CloudFormation**:
   - Verifique os logs de erro no Console AWS
   - Verifique se você tem permissões suficientes para criar todos os recursos
   - Tente excluir a stack e implantar novamente

2. **Funções Lambda não executam**:
   - Verifique os logs no CloudWatch
   - Verifique se as permissões IAM estão configuradas corretamente
   - Verifique se os gatilhos (triggers) estão configurados

3. **Não recebe notificações**:
   - Verifique se confirmou a inscrição no tópico SNS
   - Verifique se o email não está marcando as notificações como spam
   - Verifique as configurações de notificação no Console AWS

---

Para suporte adicional, consulte a documentação completa ou entre em contato com a equipe de suporte do QuickFundHub.