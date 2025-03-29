# QuickFundHub - Ambiente de Produção

Sistema avançado de geração de lucros automatizado com operação contínua, notificações via WhatsApp e relatórios por email. Funciona em notebooks, desktops, e smartphones (Android e iOS), mesmo com a tela bloqueada.

## Visão Geral

Este projeto implementa um sistema completo para geração e rastreamento de lucros em operações financeiras, com notificações em tempo real via WhatsApp e envio de relatórios periódicos por email. O sistema pode ser executado tanto localmente (notebook/desktop) quanto na nuvem AWS, além de smartphones Android e iOS através do aplicativo móvel.

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
- Serviço de IA para otimizações em tempo real

## Configuração do Ambiente de Produção

### Pré-requisitos

- Node.js (versão 14 ou superior)
- Conta AWS (para implantação na nuvem)
- Conta Twilio (para notificações WhatsApp)
- Git (para controle de versão)

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/tjmendes/quickai.git
cd quickai
```

2. Instale as dependências:

```bash
npm install
```

3. Configure o arquivo `.env` com suas credenciais (use `.env.example` como referência)

4. Execute o script de exportação para produção:

```bash
npm run export:production
```

Este script irá:
- Otimizar o código para produção
- Gerar APKs para smartphones Android e iOS
- Configurar o serviço de IA para otimizações em tempo real
- Configurar a infraestrutura AWS
- Exportar o projeto para o repositório GitHub

## Execução em Diferentes Ambientes

### Servidor Web (Notebook/Desktop)

Para iniciar o servidor web:

```bash
npm run build
npm run preview
```

### Serviço em Segundo Plano

Para iniciar o serviço em segundo plano que continua operando mesmo com a tela bloqueada:

```bash
npm run start:background
```

### Serviço de IA para Otimizações em Tempo Real

Para iniciar o serviço de IA que otimiza operações e maximiza lucros em tempo real:

```bash
npm run start:ai-optimization
```

### Aplicativo Móvel (Android/iOS)

Os APKs otimizados para smartphones são gerados automaticamente durante o processo de exportação para produção. Você pode encontrá-los no diretório de build:

- Android: `./build/android/QuickFundHub-SamsungGalaxyA13.apk`
- iOS: `./build/ios/QuickFundHub.ipa` (requer ambiente macOS para geração)

Para enviar os APKs por email:

```bash
npm run send:apk your@email.com
```

### Implantação na AWS

Para implantar o sistema na AWS:

```bash
npm run deploy:aws
```

Este comando configura todos os recursos necessários na AWS, incluindo:
- Banco de dados Aurora
- Funções Lambda
- API Gateway
- S3 Buckets
- CloudFront
- SNS/SQS para notificações

## Monitoramento e Relatórios

### Notificações WhatsApp

O sistema envia notificações via WhatsApp quando novos lucros são registrados. Para configurar, defina as seguintes variáveis no arquivo `.env`:

```
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_PHONE_NUMBER=+14155238886
USER_WHATSAPP_NUMBER=+5511999999999
```

### Relatórios por Email

O sistema envia relatórios diários e semanais por email. Para configurar, defina as seguintes variáveis no arquivo `.env`:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha
REPORT_EMAIL_1=destinatario1@email.com
REPORT_EMAIL_2=destinatario2@email.com
```

## Otimizações de Produção

O sistema inclui diversas otimizações para ambiente de produção:

- Minificação e compressão de código
- Divisão de código (code splitting)
- Otimização de imagens
- Service Worker para funcionamento offline
- Cache de recursos estáticos
- Otimização de banco de dados
- Balanceamento de carga
- Auto-scaling
- Monitoramento e alertas
- Backup automático

## Serviço de IA para Otimizações em Tempo Real

O sistema inclui um serviço de IA que realiza otimizações em tempo real para maximizar lucros. Este serviço:

- Analisa condições de mercado em tempo real
- Ajusta parâmetros de estratégias automaticamente
- Seleciona as melhores estratégias para as condições atuais
- Otimiza alocação de recursos
- Minimiza custos de transação
- Maximiza retorno sobre investimento

## Suporte a Dispositivos

O sistema é otimizado para funcionar em diversos dispositivos:

- Notebooks e desktops (Windows, macOS, Linux)
- Smartphones Android (otimizado para Samsung Galaxy A13 4G)
- iPhones (iOS 12+)
- Tablets
- Navegadores web modernos

## Segurança

O sistema implementa diversas medidas de segurança:

- Criptografia de dados em repouso e em trânsito
- Autenticação de dois fatores
- Proteção contra ataques de força bruta
- Proteção contra injeção SQL
- Proteção contra XSS
- Proteção contra CSRF
- Auditoria de acessos
- Backup automático

## Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.