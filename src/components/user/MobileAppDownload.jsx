import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Heading,
  VStack,
  HStack,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Icon,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  Image
} from '@chakra-ui/react';
import { FaDownload, FaEnvelope, FaMobile, FaAndroid, FaApple, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { isNativePlatform } from '../../services/capacitorService';
import * as mobileAppService from '../../services/mobileAppService';
import authService from '../../services/authService';

const MobileAppDownload = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apkStatus, setApkStatus] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [deviceType, setDeviceType] = useState('android');
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    // Carregar email do usuário atual
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.email) {
      setEmail(currentUser.email);
    }
    
    // Verificar status do APK
    checkApkStatus();
    
    // Carregar instruções de instalação
    loadInstallationInstructions();
  }, []);
  
  const checkApkStatus = async () => {
    try {
      const status = await mobileAppService.isApkAvailable();
      setApkStatus(status);
    } catch (error) {
      console.error('Erro ao verificar status do APK:', error);
    }
  };
  
  const loadInstallationInstructions = async () => {
    try {
      const instructionsData = await mobileAppService.getInstallationInstructions(deviceType);
      setInstructions(instructionsData);
    } catch (error) {
      console.error('Erro ao carregar instruções de instalação:', error);
    }
  };
  
  const handleDeviceTypeChange = (type) => {
    setDeviceType(type);
    loadInstallationInstructions();
  };
  
  const handleSendApk = async () => {
    if (!email) {
      toast({
        title: 'Email necessário',
        description: 'Por favor, informe um email válido para receber o APK.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await mobileAppService.sendApkByEmail(email);
      
      toast({
        title: 'APK enviado com sucesso!',
        description: `O APK foi enviado para ${email}. Verifique sua caixa de entrada.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao enviar APK:', error);
      
      toast({
        title: 'Erro ao enviar APK',
        description: error.response?.data?.error || 'Não foi possível enviar o APK. Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateApk = async () => {
    setIsGenerating(true);
    
    try {
      const result = await mobileAppService.generateApk();
      
      toast({
        title: 'APK gerado com sucesso!',
        description: `O APK foi gerado e está pronto para download.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Atualizar status do APK
      checkApkStatus();
    } catch (error) {
      console.error('Erro ao gerar APK:', error);
      
      toast({
        title: 'Erro ao gerar APK',
        description: error.response?.data?.error || 'Não foi possível gerar o APK. Tente novamente mais tarde.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Verificar se está rodando em um dispositivo móvel nativo
  if (isNativePlatform()) {
    return (
      <Box p={4} bg={bgColor} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
        <Alert status="info" borderRadius="md" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>Você já está usando o aplicativo móvel!</AlertTitle>
            <AlertDescription>
              Este dispositivo já está executando a versão móvel do QuickFundHub.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }
  
  return (
    <Box p={4} bg={bgColor} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
      <VStack align="center" mb={4} spacing={2}>
        <Image src="/images/quickai-logo.svg" alt="QuickAI Logo" height="60px" />
        <Heading size="md">
          <Icon as={FaMobile} mr={2} />
          Aplicativo Móvel QuickFundHub
        </Heading>
      </VStack>
      
      <Text mb={4}>
        Baixe o aplicativo QuickFundHub para seu smartphone e tenha acesso a todas as funcionalidades mesmo com a tela bloqueada.
      </Text>
      
      {!apkStatus && (
        <Alert status="warning" borderRadius="md" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>APK não disponível</AlertTitle>
            <AlertDescription>
              O APK ainda não foi gerado. Clique no botão abaixo para gerar o APK.
            </AlertDescription>
          </Box>
        </Alert>
      )}
      
      {apkStatus && (
        <Alert status="success" borderRadius="md" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>APK disponível para download</AlertTitle>
            <AlertDescription>
              O APK está pronto para ser enviado para seu smartphone.
            </AlertDescription>
          </Box>
        </Alert>
      )}
      
      <VStack spacing={4} align="stretch" mt={4}>
        <HStack spacing={4}>
          <Button
            leftIcon={<FaAndroid />}
            colorScheme={deviceType === 'android' ? 'green' : 'gray'}
            variant={deviceType === 'android' ? 'solid' : 'outline'}
            onClick={() => handleDeviceTypeChange('android')}
            flex={1}
          >
            Android
          </Button>
          <Button
            leftIcon={<FaApple />}
            colorScheme={deviceType === 'ios' ? 'blue' : 'gray'}
            variant={deviceType === 'ios' ? 'solid' : 'outline'}
            onClick={() => handleDeviceTypeChange('ios')}
            flex={1}
          >
            iOS
          </Button>
        </HStack>
        
        <Divider />
        
        <FormControl>
          <FormLabel>Email para receber o APK</FormLabel>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="seu-email@exemplo.com"
          />
          <FormHelperText>O APK será enviado para este email.</FormHelperText>
        </FormControl>
        
        <HStack spacing={4}>
          {!apkStatus ? (
            <Button
              leftIcon={<FaDownload />}
              colorScheme="blue"
              isLoading={isGenerating}
              loadingText="Gerando APK..."
              onClick={handleGenerateApk}
              flex={1}
            >
              Gerar APK
            </Button>
          ) : (
            <Button
              leftIcon={<FaEnvelope />}
              colorScheme="green"
              isLoading={isLoading}
              loadingText="Enviando..."
              onClick={handleSendApk}
              flex={1}
            >
              Enviar APK por Email
            </Button>
          )}
        </HStack>
        
        {instructions && (
          <Accordion allowToggle mt={4}>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Icon as={FaInfoCircle} mr={2} />
                    Instruções de Instalação
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <VStack align="stretch" spacing={3}>
                  <Heading size="sm">{instructions.title}</Heading>
                  
                  <List spacing={2}>
                    {instructions.steps && instructions.steps.map((step, index) => (
                      <ListItem key={index}>
                        <ListIcon as={FaCheckCircle} color="green.500" />
                        {step}
                      </ListItem>
                    ))}
                  </List>
                  
                  {instructions.notes && (
                    <Box mt={2}>
                      <Text fontWeight="bold" mb={1}>Observações:</Text>
                      <List spacing={1}>
                        {instructions.notes.map((note, index) => (
                          <ListItem key={index} fontSize="sm">
                            <ListIcon as={FaInfoCircle} color="blue.500" />
                            {note}
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </VStack>
              </AccordionPanel>
            </AccordionItem>
            
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Icon as={FaInfoCircle} mr={2} />
                    Requisitos do Sistema (Samsung Galaxy A13 4G)
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <VStack align="stretch" spacing={3}>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      <Text as="span" fontWeight="bold">Sistema Operacional:</Text> Android 4.4 ou superior
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      <Text as="span" fontWeight="bold">Espaço de Armazenamento:</Text> Mínimo de 100MB disponíveis
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      <Text as="span" fontWeight="bold">Memória RAM:</Text> Mínimo de 2GB
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      <Text as="span" fontWeight="bold">Conexão com Internet:</Text> Necessária para sincronização de dados
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheckCircle} color="green.500" />
                      <Text as="span" fontWeight="bold">Permissões:</Text> Acesso à internet, notificações e execução em segundo plano
                    </ListItem>
                  </List>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )}
      </VStack>
    </Box>
  );
};

export default MobileAppDownload;