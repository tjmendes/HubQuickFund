import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Divider,
  List,
  ListItem,
  ListIcon,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
  HStack,
  Icon,
  Badge,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FaCheck, FaClock, FaInfinity, FaPercentage, FaCreditCard, FaArrowLeft } from 'react-icons/fa';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { subscriptionPlans } from './SubscriptionPlans';

const SubscriptionDetails = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('blue.600', 'blue.300');

  useEffect(() => {
    // Encontrar o plano selecionado com base no ID da URL
    const plan = subscriptionPlans.find(plan => plan.id === planId);
    if (plan) {
      setSelectedPlan(plan);
    } else {
      // Redirecionar para a página de planos se o ID não for válido
      navigate('/subscription-plans');
      toast({
        title: 'Plano não encontrado',
        description: 'O plano selecionado não existe.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [planId, navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo({
      ...paymentInfo,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!paymentInfo.cardNumber) {
      newErrors.cardNumber = 'Número do cartão é obrigatório';
    } else if (!/^\d{16}$/.test(paymentInfo.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }
    
    if (!paymentInfo.cardName) {
      newErrors.cardName = 'Nome no cartão é obrigatório';
    }
    
    if (!paymentInfo.expiryDate) {
      newErrors.expiryDate = 'Data de validade é obrigatória';
    } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expiryDate)) {
      newErrors.expiryDate = 'Formato inválido (MM/AA)';
    }
    
    if (!paymentInfo.cvv) {
      newErrors.cvv = 'CVV é obrigatório';
    } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
      newErrors.cvv = 'CVV inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Aqui seria a chamada para a API de processamento de pagamento
      // const response = await paymentService.processPayment(paymentInfo, selectedPlan);
      
      // Simulando uma chamada de API bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Assinatura realizada com sucesso!',
        description: `Você agora tem acesso ao plano ${selectedPlan.name} por ${selectedPlan.duration}.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirecionar para a página do dashboard após a assinatura
      navigate('/');
    } catch (error) {
      toast({
        title: 'Erro ao processar pagamento',
        description: error.message || 'Ocorreu um erro ao processar seu pagamento. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedPlan) {
    return null; // Ou um componente de carregamento
  }

  return (
    <Box py={8}>
      <VStack spacing={8} align="stretch">
        <Button
          leftIcon={<FaArrowLeft />}
          variant="ghost"
          alignSelf="flex-start"
          onClick={() => navigate('/subscription-plans')}
        >
          Voltar para planos
        </Button>

        <Box textAlign="center" mb={4}>
          <Heading as="h1" size="xl" mb={2} color={headingColor}>
            Finalizar Assinatura
          </Heading>
          <Text fontSize="lg">
            Você está prestes a assinar o plano <strong>{selectedPlan.name}</strong>
          </Text>
        </Box>

        <Flex direction={{ base: 'column', md: 'row' }} spacing={8} gap={8}>
          {/* Detalhes do plano */}
          <Box
            flex="1"
            bg={bgColor}
            border="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            p={6}
          >
            <VStack spacing={4} align="stretch">
              <Flex align="center" justify="space-between">
                <Flex align="center">
                  <Icon as={selectedPlan.icon} color={`${selectedPlan.color}.500`} boxSize={6} mr={2} />
                  <Heading size="md">{selectedPlan.name}</Heading>
                </Flex>
                <Badge colorScheme={selectedPlan.color} p={2} borderRadius="md">
                  {selectedPlan.duration}
                </Badge>
              </Flex>

              <Stat mt={2}>
                <StatLabel>Valor</StatLabel>
                <StatNumber>{selectedPlan.price}</StatNumber>
                {selectedPlan.id !== 'free' && selectedPlan.id !== 'unlimited' && (
                  <StatHelpText>
                    <Icon as={FaPercentage} mr={1} />
                    + 5% dos lucros gerados
                  </StatHelpText>
                )}
              </Stat>

              <Divider my={2} />

              <Box>
                <Text fontWeight="bold" mb={2}>Benefícios inclusos:</Text>
                <List spacing={2}>
                  {selectedPlan.features.map((feature, index) => (
                    <ListItem key={index}>
                      <ListIcon as={FaCheck} color={`${selectedPlan.color}.500`} />
                      {feature}
                    </ListItem>
                  ))}
                </List>
              </Box>

              {selectedPlan.id !== 'free' && (
                <Alert status="info" mt={4} borderRadius="md">
                  <AlertIcon />
                  Além do valor da assinatura, cobramos apenas 5% sobre os lucros gerados pelas operações realizadas na plataforma.
                </Alert>
              )}
            </VStack>
          </Box>

          {/* Formulário de pagamento */}
          <Box
            flex="1"
            bg={bgColor}
            border="1px"
            borderColor={borderColor}
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            p={6}
          >
            <VStack spacing={4} align="stretch">
              <Heading size="md" mb={2}>Informações de Pagamento</Heading>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={4} align="stretch">
                  <FormControl isInvalid={errors.cardNumber}>
                    <FormLabel>Número do Cartão</FormLabel>
                    <Input
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={paymentInfo.cardNumber}
                      onChange={handleChange}
                    />
                    <FormErrorMessage>{errors.cardNumber}</FormErrorMessage>
                  </FormControl>

                  <FormControl isInvalid={errors.cardName}>
                    <FormLabel>Nome no Cartão</FormLabel>
                    <Input
                      name="cardName"
                      placeholder="Nome como aparece no cartão"
                      value={paymentInfo.cardName}
                      onChange={handleChange}
                    />
                    <FormErrorMessage>{errors.cardName}</FormErrorMessage>
                  </FormControl>

                  <HStack>
                    <FormControl isInvalid={errors.expiryDate}>
                      <FormLabel>Validade</FormLabel>
                      <Input
                        name="expiryDate"
                        placeholder="MM/AA"
                        value={paymentInfo.expiryDate}
                        onChange={handleChange}
                      />
                      <FormErrorMessage>{errors.expiryDate}</FormErrorMessage>
                    </FormControl>

                    <FormControl isInvalid={errors.cvv}>
                      <FormLabel>CVV</FormLabel>
                      <Input
                        name="cvv"
                        placeholder="123"
                        value={paymentInfo.cvv}
                        onChange={handleChange}
                        maxLength={4}
                      />
                      <FormErrorMessage>{errors.cvv}</FormErrorMessage>
                    </FormControl>
                  </HStack>

                  <Button
                    type="submit"
                    colorScheme={selectedPlan.color}
                    size="lg"
                    mt={6}
                    isLoading={isLoading}
                    loadingText="Processando..."
                    leftIcon={<FaCreditCard />}
                  >
                    {selectedPlan.id === 'free' ? 'Ativar Plano Gratuito' : `Pagar ${selectedPlan.price}`}
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>
        </Flex>
      </VStack>
    </Box>
  );
};

export default SubscriptionDetails;