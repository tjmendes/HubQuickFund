# Guia de Download e Instalação do QuickFundHub

## Índice
1. [Aplicativo Móvel (Android e iOS)](#aplicativo-móvel-android-e-ios)
2. [Instalação em Notebook](#instalação-em-notebook)
3. [Configuração na AWS](#configuração-na-aws)
4. [Execução em Segundo Plano](#execução-em-segundo-plano)
5. [Solução de Problemas](#solução-de-problemas)

## Aplicativo Móvel (Android e iOS)

### Android (Samsung Galaxy A13 4G e outros dispositivos)

#### Requisitos do Sistema
- Sistema Operacional: Android 4.4 ou superior
- Espaço de Armazenamento: Mínimo de 100MB disponíveis
- Memória RAM: Mínimo de 2GB
- Conexão com Internet: Necessária para sincronização de dados
- Permissões: Acesso à internet, notificações e execução em segundo plano

#### Passos para Download e Instalação
1. **Obtenha o APK**:
   - Acesse o QuickFundHub pelo navegador do seu computador
   - Na seção "Aplicativo Móvel", insira seu email e clique em "Enviar APK por Email"
   - Verifique sua caixa de entrada e baixe o arquivo APK anexado

2. **Transferência para o Dispositivo**:
   - Conecte seu smartphone ao computador via cabo USB
   - Copie o arquivo APK para a pasta "Downloads" do seu smartphone
   - Alternativamente, abra o email diretamente no smartphone e baixe o APK

3. **Instalação**:
   - No seu smartphone, navegue até a pasta onde o APK foi salvo
   - Toque no arquivo APK para iniciar a instalação
   - Se solicitado, permita a instalação de aplicativos de fontes desconhecidas nas configurações
   - Siga as instruções na tela para concluir a instalação

4. **Configuração Inicial**:
   - Abra o aplicativo QuickFundHub
   - Faça login com suas credenciais existentes
   - Permita as notificações quando solicitado
   - Ative a execução em segundo plano nas configurações do aplicativo

### iOS (iPhone e iPad)

#### Requisitos do Sistema
- Sistema Operacional: iOS 9.0 ou superior
- Espaço de Armazenamento: Mínimo de 120MB disponíveis
- Conexão com Internet: Necessária para sincronização de dados
- Permissões: Notificações e atualização em segundo plano

#### Passos para Download e Instalação
1. **Obtenha o Aplicativo**:
   - Acesse o QuickFundHub pelo navegador do seu computador
   - Na seção "Aplicativo Móvel", selecione "iOS" e insira seu email
   - Clique em "Enviar APK por Email"
   - Verifique sua caixa de entrada para instruções específicas para iOS

2. **Instalação via TestFlight**:
   - Abra o email no seu dispositivo iOS
   - Clique no link de convite do TestFlight
   - Instale o aplicativo TestFlight se ainda não estiver instalado
   - Siga as instruções para baixar o QuickFundHub através do TestFlight

3. **Configuração Inicial**:
   - Abra o aplicativo QuickFundHub
   - Faça login com suas credenciais existentes
   - Permita as notificações quando solicitado
   - Nas configurações do iPhone, vá para "Geral" > "Atualização em segundo plano" e certifique-se de que o QuickFundHub está ativado

## Instalação em Notebook

### Requisitos do Sistema
- Sistema Operacional: Windows 10/11, macOS 10.14+ ou Linux (Ubuntu 18.04+)
- Processador: Intel Core i5 ou equivalente (recomendado)
- Memória RAM: Mínimo de 8GB (16GB recomendado)
- Espaço em Disco: 1GB disponível
- Node.js: Versão 14.x ou superior
- npm: Versão 6.x ou superior

### Passos para Instalação

1. **Preparação do Ambiente**:
   - Instale o Node.js e npm do site oficial: https://nodejs.org/
   - Verifique a instalação executando no terminal/prompt de comando:
     ```
     node --version
     npm --version
     ```

2. **Download do Projeto**:
   - Abra o PowerShell ou prompt de comando como administrador
   - Navegue até a pasta onde deseja instalar o projeto
   - Execute o script de download:
     ```
     ./download-project.ps1
     ```
   - Alternativamente, baixe o arquivo ZIP do projeto e extraia-o

3. **Instalação de Dependências**:
   - Navegue até a pasta do projeto extraído
   - Execute o comando:
     ```
     npm install
     ```
   - Aguarde a instalação de todas as dependências

4. **Configuração do Ambiente**:
   - Copie o arquivo `.env.example` para `.env`
   - Edite o arquivo `.env` com suas credenciais e configurações
   - Certifique-se de configurar corretamente as variáveis AWS_ACCESS_KEY_ID e AWS_SECRET_ACCESS_KEY se planeja usar recursos AWS

5. **Iniciar o Aplicativo**:
   - Execute o comando:
     ```
     npm run dev
     ```
   - O aplicativo será iniciado e estará disponível em `http://localhost:5173`

6. **Configurar Serviço em Segundo Plano**:
   - Em uma nova janela de terminal, execute:
     ```
     node start-background-service.js
     ```
   - Este serviço manterá as estratégias de lucro funcionando mesmo quando o navegador estiver fechado

## Configuração na AWS

### Requisitos
- Conta AWS ativa
- AWS CLI instalado e configurado
- Permissões para criar recursos (IAM, Lambda, DynamoDB, CloudFormation)
- Node.js e npm instalados

### Passos para Implantação

1. **Preparação do Ambiente AWS**:
   - Configure suas credenciais AWS no arquivo `.env`:
     ```
     AWS_ACCESS_KEY_ID=sua_access_key
     AWS_SECRET_ACCESS_KEY=sua_secret_key
     AWS_REGION=us-east-1
     ```
   - Certifique-se de que o usuário IAM tem permissões para criar recursos

2. **Configuração do Twilio para Notificações** (opcional):
   - Crie uma conta no Twilio e obtenha suas credenciais
   - Adicione as credenciais ao arquivo `.env`:
     ```
     TWILIO_ACCOUNT_SID=seu_account_sid
     TWILIO_AUTH_TOKEN=seu_auth_token
     TWILIO_PHONE_NUMBER=seu_numero_twilio
     USER_WHATSAPP_NUMBER=seu_numero_whatsapp
     ```

3. **Configuração de Emails para Relatórios**:
   - Adicione os emails para receber relatórios no arquivo `.env`:
     ```
     REPORT_EMAIL_1=seu_email_principal
     REPORT_EMAIL_2=seu_email_secundario
     ```

4. **Implantação na AWS**:
   - Navegue até a pasta do projeto
   - Execute o script de implantação:
     ```
     node aws-deploy.js
     ```
   - O script criará todos os recursos necessários na AWS:
     - Funções Lambda para processamento de lucros
     - Banco de dados DynamoDB para armazenamento
     - Configurações de segurança e permissões
     - Agendamento de relatórios automáticos

5. **Verificação da Implantação**:
   - Após a conclusão, verifique no console AWS se todos os recursos foram criados
   - Teste o funcionamento enviando uma transação de teste
   - Verifique se as notificações estão sendo enviadas para o WhatsApp configurado

## Execução em Segundo Plano

### No Smartphone (Android/iOS)

1. **Configuração no Android**:
   - Abra as configurações do aplicativo QuickFundHub
   - Ative a opção "Executar em segundo plano"
   - Vá para as configurações do sistema > Aplicativos > QuickFundHub > Bateria
   - Desative a otimização de bateria para o QuickFundHub
   - Permita que o aplicativo inicie automaticamente ao ligar o dispositivo

2. **Configuração no iOS**:
   - Abra as configurações do iPhone > Geral > Atualização em segundo plano
   - Certifique-se de que o QuickFundHub está ativado
   - Nas configurações do aplicativo, ative todas as permissões de notificação

### No Notebook

1. **Serviço em Segundo Plano**:
   - Execute o script de inicialização do serviço em segundo plano:
     ```
     node start-background-service.js
     ```
   - Para manter o serviço em execução mesmo após fechar o terminal, use:
     - No Windows: `start /b node start-background-service.js`
     - No macOS/Linux: `nohup node start-background-service.js &`

2. **Configuração para Iniciar com o Sistema**:
   - **Windows**:
     - Crie um arquivo .bat com o comando para iniciar o serviço
     - Adicione um atalho para este arquivo na pasta de inicialização
   - **macOS**:
     - Crie um arquivo .plist no diretório LaunchAgents
     - Configure-o para executar o script de serviço em segundo plano
   - **Linux**:
     - Crie um serviço systemd para iniciar automaticamente

### Na AWS

- O serviço em segundo plano é gerenciado automaticamente pela AWS
- As funções Lambda são executadas conforme programado
- Não é necessária configuração adicional para execução em segundo plano

## Solução de Problemas

### Problemas Comuns no Android

1. **APK não instala**:
   - Verifique se permitiu a instalação de fontes desconhecidas
   - Certifique-se de que há espaço suficiente no dispositivo
   - Tente baixar o APK novamente

2. **Aplicativo fecha inesperadamente**:
   - Verifique se seu dispositivo atende aos requisitos mínimos
   - Limpe o cache do aplicativo nas configurações
   - Reinstale o aplicativo

### Problemas Comuns no iOS

1. **Não consegue instalar via TestFlight**:
   - Verifique se o TestFlight está atualizado
   - Certifique-se de que o convite ainda é válido (expira após 30 dias)
   - Entre em contato com o suporte para um novo convite

2. **Notificações não funcionam**:
   - Verifique as permissões de notificação nas configurações
   - Certifique-se de que o modo "Não perturbe" está desativado

### Problemas no Notebook

1. **Erro ao instalar dependências**:
   - Verifique sua versão do Node.js e npm
   - Tente executar `npm cache clean --force` e instalar novamente
   - Verifique se há erros específicos no console

2. **Serviço em segundo plano não inicia**:
   - Verifique se há outro processo usando a mesma porta
   - Certifique-se de que todas as dependências foram instaladas
   - Verifique os logs de erro no arquivo `background-service.log`

### Problemas na AWS

1. **Falha na implantação**:
   - Verifique se as credenciais AWS estão corretas
   - Certifique-se de que o usuário tem permissões suficientes
   - Verifique os logs de erro durante a implantação

2. **Notificações não são enviadas**:
   - Verifique se as credenciais do Twilio estão corretas
   - Certifique-se de que o número de WhatsApp está no formato correto
   - Verifique os logs da função Lambda no console AWS

Para suporte adicional, entre em contato com nossa equipe técnica pelo email suporte@quickfundhub.com ou pelo WhatsApp: +55 (XX) XXXXX-XXXX.