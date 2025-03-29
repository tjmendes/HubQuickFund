import { config } from 'aws-sdk';

// Configurações base da AWS
export const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

// Configurações para serviços específicos
export const serviceConfig = {
  // Infraestrutura e Automação
  infrastructure: {
    cloudformation: {
      stackName: 'quickfund-stack',
      templateVersion: 'latest',
      capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM']
    },
    organizations: {
      featureSet: 'ALL',
      serviceAccessPrincipals: ['cloudtrail.amazonaws.com', 'config.amazonaws.com']
    },
    controltower: {
      enabled: true,
      guardrailLevel: 'STRICT'
    }
  },

  // Computação e Containers
  compute: {
    ec2: {
      instanceType: 't3.medium',
      minInstances: 1,
      maxInstances: 10,
      spotPrice: '0.04',
      autoScaling: {
        enabled: true,
        targetCPUUtilization: 70
      }
    },
    ecs: {
      clusterName: 'quickfund-cluster',
      taskDefinition: 'quickfund-task',
      desiredCount: 2,
      capacityProviders: ['FARGATE', 'FARGATE_SPOT']
    },
    lambda: {
      runtime: 'nodejs18.x',
      memorySize: 1024,
      timeout: 30
    },
    outposts: {
      rackCount: 1,
      instanceFamily: 'compute-optimized'
    }
  },

  // Contêineres e Kubernetes
  containers: {
    eks: {
      version: '1.27',
      nodeGroups: {
        minSize: 2,
        maxSize: 10,
        instanceTypes: ['t3.large']
      }
    },
    fargate: {
      vpcConfig: {
        assignPublicIp: 'ENABLED'
      },
      taskSize: {
        cpu: '1024',
        memory: '2048'
      }
    }
  },

  // Banco de Dados
  database: {
    rds: {
      engine: 'aurora-postgresql',
      instanceClass: 'db.r5.large',
      multiAZ: true,
      backupRetentionPeriod: 35
    },
    dynamodb: {
      readCapacityUnits: 5,
      writeCapacityUnits: 5,
      tableName: 'transactions',
      streamEnabled: true,
      backupConfig: {
        pointInTimeRecovery: true
      }
    },
    elasticache: {
      engine: 'redis',
      nodeType: 'cache.t3.medium',
      numCacheNodes: 2
    },
    auroraServerless: {
      engine: 'aurora-postgresql',
      minCapacity: 2,
      maxCapacity: 16
    }
  },

  // Armazenamento e Backup
  storage: {
    s3: {
      bucketName: 'quickfund-data',
      backupBucket: 'quickfund-backup',
      lifecycleRules: {
        enabled: true,
        transition: {
          days: 90,
          storageClass: 'GLACIER'
        }
      },
      versioning: true,
      encryption: {
        enabled: true,
        type: 'AES256'
      }
    },
    backup: {
      planName: 'quickfund-backup-plan',
      frequency: 24,
      retention: 90
    },
    storageGateway: {
      type: 'FILE_GATEWAY',
      gatewayName: 'quickfund-gateway'
    }
  },

  // Segurança e Compliance
  security: {
    securityHub: {
      enabled: true,
      standards: ['CIS', 'PCI_DSS']
    },
    guardDuty: {
      enabled: true,
      findingPublishingFrequency: 'FIFTEEN_MINUTES'
    },
    kms: {
      keySpec: 'SYMMETRIC_DEFAULT',
      enabled: true,
      rotation: true
    },
    waf: {
      ruleLimit: 100,
      ipRateLimit: 2000,
      rules: {
        rateLimitRules: true,
        sqlInjectionProtection: true,
        xssProtection: true
      }
    },
    shield: {
      advanced: true,
      proactiveEngagement: true
    },
    cloudwatch: {
      logRetention: 90,
      metricsEnabled: true,
      alarmActions: ['SNS_TOPIC_ARN']
    }
  },

  // Analytics e Machine Learning
  analytics: {
    glue: {
      databaseName: 'quickfund-analytics',
      crawlerSchedule: 'cron(0 0 * * ? *)'
    },
    athena: {
      outputLocation: 's3://quickfund-data/athena-results/',
      queryPricing: 'QUERY_RESULT_REUSE'
    },
    redshift: {
      nodeType: 'ra3.xlplus',
      numberOfNodes: 2
    },
    quicksight: {
      edition: 'ENTERPRISE',
      userRole: 'AUTHOR'
    },
    sagemaker: {
      instanceType: 'ml.t3.medium',
      volumeSize: 50,
      autoScaling: {
        enabled: true,
        minCapacity: 1,
        maxCapacity: 4
      }
    }
  },

  // Blockchain e Mineração
  blockchain: {
    managedBlockchain: {
      networkType: 'ETHEREUM',
      instanceType: 'bc.t3.small',
      memberConfiguration: {
        name: 'quickfund-member',
        invitationOnly: true
      }
    },
    qldb: {
      ledgerName: 'quickfund-ledger',
      permissionsMode: 'ALLOW_ALL'
    },
    mining: {
      gpuInstanceType: 'p3.2xlarge',
      maxWorkers: 5,
      autoScaling: {
        enabled: true,
        targetUtilization: 85
      }
    }
  },

  // Aplicativos Empresariais
  enterprise: {
    workspaces: {
      bundleId: 'wsb-92tn3b7gx',
      directoryId: 'd-123456789'
    },
    appstream: {
      fleetType: 'ALWAYS_ON',
      instanceType: 'stream.standard.medium'
    },
    chime: {
      mediaRegion: 'us-east-1',
      phoneNumberType: 'Local'
    }
  },

  // IoT e Edge Computing
  iot: {
    core: {
      thingName: 'quickfund-iot-core',
      keepAlivePeriod: 300
    },
    greengrass: {
      coreDeviceName: 'quickfund-edge',
      deploymentType: 'NewDeployment'
    }
  },

  // Redes e CDN
  networking: {
    cloudfront: {
      priceClass: 'PriceClass_All',
      defaultTTL: 86400
    },
    globalAccelerator: {
      enabled: true,
      flowLogsEnabled: true
    },
    directConnect: {
      connectionBandwidth: '1Gbps',
      location: 'EqSe2'
    }
  },

  // Gerenciamento Financeiro
  financial: {
    costExplorer: {
      enabled: true,
      granularity: 'DAILY'
    },
    budgets: {
      timeUnit: 'MONTHLY',
      alertThreshold: 80
    },
    trustedAdvisor: {
      checkLevel: 'BUSINESS',
      refreshInterval: 'DAILY'
    }
  }
}
};

// Inicialização da configuração AWS
config.update(awsConfig);

// Função para validar configurações
export const validateConfig = () => {
  const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required AWS environment variables: ${missingVars.join(', ')}`);
  }

  return true;
};

// Função para obter configurações específicas de serviço
export const getServiceConfig = (service, subService) => {
  if (!serviceConfig[service]) {
    throw new Error(`Service configuration not found: ${service}`);
  }

  if (subService && !serviceConfig[service][subService]) {
    throw new Error(`Sub-service configuration not found: ${service}.${subService}`);
  }

  return subService ? serviceConfig[service][subService] : serviceConfig[service];
};