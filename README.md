# QuickFundHub

Sistema avançado de geração de lucros automatizado com operação contínua, notificações via WhatsApp e relatórios por email. Funciona em notebooks e smartphones, mesmo com a tela bloqueada.

## Visão Geral

Este projeto implementa um sistema completo para geração e rastreamento de lucros em operações financeiras, com notificações em tempo real via WhatsApp e envio de relatórios periódicos por email. O sistema pode ser executado tanto localmente (notebook) quanto na nuvem AWS, além de smartphones Android e iOS através do aplicativo móvel.

## Funcionalidades

- Rastreamento de lucros em tempo real
- Operação contínua mesmo com a tela bloqueada (serviço em segundo plano)
- Aplicativo móvel para smartphones Android e iOS
- Notificações via WhatsApp quando novos lucros são registrados
- Relatórios diários e semanais enviados por email
- Armazenamento de histórico de lucros
- Análise de desempenho por ativo e tipo de operação
- Implantação automatizada na AWS
- Múltiplas estratégias de geração de lucro (arbitragem, flash loans, DeFi, etc.)

## Configuração

### Pré-requisitos

- Node.js (versão 14 ou superior)
- Conta AWS (para implantação na nuvem)
- Conta Twilio (para notificações WhatsApp)

### Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure o arquivo `.env` com suas credenciais (um arquivo `.env` já foi criado com valores de exemplo)

## Execução Local (Notebook)

Para executar o sistema localmente:

```bash
node notebook-setup.js
```

Isso iniciará um servidor local que simula o ambiente de produção, permitindo testar o sistema de rastreamento de lucros e notificações.

### Serviço em Segundo Plano

Para iniciar o serviço em segundo plano que continua funcionando mesmo com a tela bloqueada:

```bash
node start-background-service.js
```

O serviço executará várias estratégias de geração de lucro em intervalos regulares e enviará notificações sobre os lucros gerados. Para verificar o status do serviço, acesse `http://localhost:3001/api/status`.

### Aplicativo Móvel

Para gerar o APK para smartphones Android e iOS:

```bash
node generate-mobile-app.js
```

O APK será gerado em `./mobile-build/QuickFundHub.apk`. Envie este arquivo por email para seu smartphone e instale-o para acessar o QuickFundHub em dispositivos móveis.

## Implantação na AWS

Para implantar o sistema na AWS:

```bash
node aws-deploy.js
```

Este script irá:

1. Criar os parâmetros necessários no AWS Systems Manager Parameter Store
2. Empacotar a função Lambda
3. Implantar a stack do CloudFormation com todos os recursos necessários

### Recursos AWS Utilizados

- AWS Lambda: Processamento de eventos de lucro
- Amazon DynamoDB: Armazenamento de dados de lucros e usuários
- Amazon SNS: Notificações em tempo real
- Amazon SQS: Fila de processamento de lucros
- Amazon S3: Armazenamento de relatórios
- Amazon SES: Envio de emails
- AWS CloudFormation: Gerenciamento de infraestrutura
- Amazon API Gateway: API RESTful para o sistema

## Notificações e Relatórios

### WhatsApp

As notificações via WhatsApp são enviadas para o número configurado no arquivo `.env` (USER_WHATSAPP_NUMBER) sempre que um novo lucro é registrado e atinge o limite mínimo configurado (PROFIT_NOTIFICATION_THRESHOLD).

### Emails

Os relatórios são enviados para os emails configurados no arquivo `.env` (REPORT_EMAIL_1 e REPORT_EMAIL_2):

- Relatórios diários: Enviados no horário configurado (DAILY_REPORT_TIME)
- Relatórios semanais: Enviados no dia da semana configurado (WEEKLY_REPORT_DAY)

## Estrutura do Projeto

- `.env`: Configurações do ambiente
- `notebook-setup.js`: Script para execução local
- `notebook-functions.js`: Funções auxiliares para execução local
- `notebook-email.js`: Funções para envio de emails no ambiente local
- `lambda-function.js`: Função Lambda para processamento de lucros
- `lambda-reports-complete.js`: Funções para geração e envio de relatórios na AWS
- `cloudformation-template.yaml`: Template para implantação da infraestrutura AWS
- `aws-deploy.js`: Script para implantação na AWS

## Contato

Para mais informações, entre em contato:

- Email: tiagojosemendes841@gmail.com ou quicktrust43@gmail.com
- WhatsApp: +5531975196208