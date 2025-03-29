/**
 * Script de implantação para AWS
 * Este arquivo configura e implanta os recursos necessários na AWS
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');

// Carregar variáveis de ambiente
dotenv.config();

// Configurar AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })
});

// Inicializar clientes AWS
const cloudformation = new AWS.CloudFormation();
const ssm = new AWS.SSM();
const lambda = new AWS.Lambda();

// Função principal
async function deploy() {
  try {
    console.log('Iniciando implantação do QuickFundHub na AWS...');
    
    // Verificar se as credenciais AWS estão configuradas
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('Credenciais AWS não configuradas. Verifique o arquivo .env');
    }
    
    // Verificar se as credenciais do Twilio estão configuradas
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('Aviso: Credenciais do Twilio não configuradas. As notificações WhatsApp não funcionarão.');
    }
    
    // Criar parâmetros no Parameter Store para as credenciais do Twilio
    await createParameterStoreValues();
    
    // Empacotar a função Lambda
    await packageLambdaFunction();
    
    // Implantar a stack do CloudFormation
    await deployCloudFormationStack();
    
    console.log('Implantação concluída com sucesso!');
    console.log('Você receberá notificações de lucro no WhatsApp: ' + process.env.USER_WHATSAPP_NUMBER);
    console.log('Relatórios serão enviados para os emails:');
    console.log('- ' + process.env.REPORT_EMAIL_1);
    console.log('- ' + process.env.REPORT_EMAIL_2);
  } catch (error) {
    console.error('Erro durante a implantação:', error);
    process.exit(1);
  }
}

// Função para criar valores no Parameter Store
async function createParameterStoreValues() {
  console.log('Criando parâmetros no AWS Systems Manager Parameter Store...');
  
  const parameters = [
    {
      Name: '/quickfundhub/twilio/account_sid',
      Value: process.env.TWILIO_ACCOUNT_SID || 'placeholder',
      Type: 'SecureString',
      Overwrite: true
    },
    {
      Name: '/quickfundhub/twilio/auth_token',
      Value: process.env.TWILIO_AUTH_TOKEN || 'placeholder',
      Type: 'SecureString',
      Overwrite: true
    },
    {
      Name: '/quickfundhub/twilio/phone_number',
      Value: process.env.TWILIO_PHONE_NUMBER || '+14155238886',
      Type: 'SecureString',
      Overwrite: true
    }
  ];
  
  for (const param of parameters) {
    try {
      await ssm.putParameter(param).promise();
      console.log(`Parâmetro ${param.Name} criado/atualizado com sucesso.`);
    } catch (error) {
      console.error(`Erro ao criar parâmetro ${param.Name}:`, error);
      throw error;
    }
  }
}

// Função para empacotar a função Lambda
async function packageLambdaFunction() {
  console.log('Empacotando função Lambda...');
  
  const lambdaDir = path.join(__dirname, 'lambda-package');
  const zipFile = path.join(__dirname, 'lambda-function.zip');
  
  // Criar diretório temporário se não existir
  if (!fs.existsSync(lambdaDir)) {
    fs.mkdirSync(lambdaDir);
  }
  
  // Copiar arquivos necessários
  fs.copyFileSync(
    path.join(__dirname, 'lambda-function.js'),
    path.join(lambdaDir, 'lambda-function.js')
  );
  
  fs.copyFileSync(
    path.join(__dirname, 'lambda-reports-complete.js'),
    path.join(lambdaDir, 'lambda-reports.js')
  );
  
  // Criar package.json para a função Lambda
  const packageJson = {
    name: 'quickfundhub-lambda',
    version: '1.0.0',
    description: 'QuickFundHub Lambda Function',
    main: 'lambda-function.js',
    dependencies: {
      'aws-sdk': '^2.1400.0',
      'axios': '^1.4.0'
    }
  };
  
  fs.writeFileSync(
    path.join(lambdaDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Instalar dependências
  console.log('Instalando dependências...');
  execSync('npm install --production', { cwd: lambdaDir });
  
  // Criar arquivo ZIP
  console.log('Criando arquivo ZIP...');
  execSync(`powershell Compress-Archive -Path "${lambdaDir}\*" -DestinationPath "${zipFile}" -Force`);
  
  console.log('Função Lambda empacotada com sucesso:', zipFile);
}

// Função para implantar a stack do CloudFormation
async function deployCloudFormationStack() {
  console.log('Implantando stack do CloudFormation...');
  
  const templateFile = path.join(__dirname, 'cloudformation-template.yaml');
  const templateBody = fs.readFileSync(templateFile, 'utf8');
  
  const stackName = 'QuickFundHub-Stack';
  const environment = process.env.NODE_ENV || 'dev';
  
  // Verificar se a stack já existe
  let stackExists = false;
  try {
    await cloudformation.describeStacks({ StackName: stackName }).promise();
    stackExists = true;
  } catch (error) {
    // Stack não existe
  }
  
  const params = {
    StackName: stackName,
    TemplateBody: templateBody,
    Parameters: [
      {
        ParameterKey: 'Environment',
        ParameterValue: environment
      }
    ],
    Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM']
  };
  
  try {
    if (stackExists) {
      console.log('Atualizando stack existente...');
      await cloudformation.updateStack(params).promise();
    } else {
      console.log('Criando nova stack...');
      await cloudformation.createStack(params).promise();
    }
    
    console.log('Aguardando conclusão da implantação...');
    await waitForStackCompletion(stackName, stackExists ? 'UPDATE_COMPLETE' : 'CREATE_COMPLETE');
    
    // Obter outputs da stack
    const { Stacks } = await cloudformation.describeStacks({ StackName: stackName }).promise();
    const outputs = Stacks[0].Outputs;
    
    console.log('\nRecursos implantados:');
    outputs.forEach(output => {
      console.log(`${output.OutputKey}: ${output.OutputValue}`);
    });
  } catch (error) {
    if (error.message.includes('No updates are to be performed')) {
      console.log('Nenhuma atualização necessária. A stack já está atualizada.');
    } else {
      throw error;
    }
  }
}

// Função para aguardar a conclusão da stack
async function waitForStackCompletion(stackName, desiredStatus) {
  let stackStatus = '';
  let dots = 0;
  
  while (stackStatus !== desiredStatus) {
    try {
      const { Stacks } = await cloudformation.describeStacks({ StackName: stackName }).promise();
      stackStatus = Stacks[0].StackStatus;
      
      if (stackStatus.includes('FAILED') || stackStatus.includes('ROLLBACK')) {
        throw new Error(`Falha na implantação da stack: ${stackStatus}`);
      }
      
      process.stdout.write(`\rStatus atual: ${stackStatus} ${''.padEnd(dots, '.')}`);
      dots = (dots + 1) % 4;
      
      if (stackStatus !== desiredStatus) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    } catch (error) {
      if (error.message.includes('does not exist')) {
        throw new Error('A stack foi excluída durante a implantação.');
      }
      throw error;
    }
  }
  
  console.log(`\nStack ${stackName} implantada com sucesso!`);
}

// Executar a implantação
deploy();