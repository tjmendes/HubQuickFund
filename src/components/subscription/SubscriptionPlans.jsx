import React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Badge,
  Icon,
  SimpleGrid,
  Divider,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react';
import { FaCheck, FaClock, FaInfinity, FaPercentage } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

// Definição dos planos de assinatura
const subscriptionPlans = [
  {
    id: 'free',
    name: 'Teste Gratuito',
    duration: '1 dia',
    price: 'Grátis',
    icon: FaClock,
    features: [
      'Acesso a análises básicas de mercado',
      'Monitoramento de 3 criptomoedas',
      'Alertas de preço básicos',
      'Acesso à comunidade'
    ],
    color: 'gray',
    durationDays: 1,
    popular: false
  },
  {
    id: 'basic',
    name: 'Básico',
    duration: '7 dias',
    price: 'R$ 49,90',
    icon: FaClock,
    features: [
      'Todas as funcionalidades do plano gratuito',
      'Acesso a estratégias de arbitragem básicas',
      'Monitoramento de 10 criptomoedas',
      'Alertas personalizados',
      'Suporte por email'
    ],
    color: 'blue',
    durationDays: 7,
    popular: false
  },
  {
    id: 'standard',
    name: 'Padrão',
    duration: '15 dias',
    price: 'R$ 89,90',
    icon: FaClock,
    features: [
      'Todas as funcionalidades do plano básico',
      'Acesso a estratégias de arbitragem avançadas',
      'Monitoramento de 20 criptomoedas',
      'Análise de sentimento do mercado',
      'Suporte prioritário'
    ],
    color: 'purple',
    durationDays: 15,
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    duration: '30 dias',
    price: 'R$ 149,90',
    icon: FaClock,
    features: [
      'Todas as funcionalidades do plano padrão',
      'Acesso completo a todas as estratégias',
      'Monitoramento ilimitado de criptomoedas',
      'Análise preditiva avançada',
      'Suporte 24/7',
      'Acesso a webinars exclusivos'
    ],
    color: 'green',
    durationDays: 30,
    popular: false
  },
  {
    id: 'elite',
    name: 'Elite',
    duration: '180 dias',
    price: 'R$ 699,90',
    icon: FaClock,
    features: [
      'Todas as funcionalidades do plano premium',
      'Estratégias personalizadas',
      'Consultas individuais mensais',
      'Acesso antecipado a novos recursos',
      'Grupo VIP de investidores'
    ],
    color: 'orange',
    durationDays: 180,
    popular: false
  },
  {
    id: 'pro',
    name: 'Profissional',
    duration: '365 dias',
    price: 'R$ 1.299,90',
    icon: FaClock,
    features: [
      'Todas as funcionalidades do plano elite',
      'Estratégias exclusivas para grandes investidores',
      'Consultas individuais semanais',
      'Acesso a eventos exclusivos',
      'Suporte dedicado'
    ],
    color: 'red',
    durationDays: 365,
    popular: false
  },
  {
    id: 'unlimited',
    name: 'Ilimitado',
    duration: 'Vitalício',
    price: 'R$ 4.999,90',
    icon: FaInfinity,
    features: [
      'Acesso vitalício a todas as funcionalidades',
      'Atualizações gratuitas para sempre',
      'Estratégias personalizadas exclusivas',
      'Consultas ilimitadas com especialistas',
      'Acesso a todos os eventos e webinars',
      'Suporte prioritário 24/7'
    ],
    color: 'teal',
    durationDays: 0, // Ilimitado
    popular: false
  }
];

const ProfitSharingInfo = () => {
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('blue.600', 'blue.200');

  return (
    <Box p={6} bg={bgColor} borderRadius="lg" mb={8}>
      <Flex align="center" mb={3}>
        <Icon as={FaPercentage} color={textColor} boxSize={6} mr={2} />
        <Heading size="md" color={textColor}>Modelo de Compartilhamento de Lucros</Heading>
      </Flex>
      <Text color={textColor}>
        Além do valor da assinatura, cobramos apenas 5% sobre os lucros gerados pelas operações realizadas na plataforma.
        Este modelo garante que nossos interesses estejam alinhados com o seu sucesso.
      </Text>
    </Box>
  );
};

const SubscriptionPlans = () => {
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('blue.600', 'blue.300');

  return (
    <Box py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" mb={8}>
          <Heading as="h1" size="xl" mb={4} color={headingColor}>
            Planos de Assinatura
          </Heading>
          <Text fontSize="lg" maxW="2xl" mx="auto">
            Escolha o plano ideal para suas necessidades e comece a maximizar seus ganhos com nossas estratégias avançadas de arbitragem e trading.
          </Text>
        </Box>

        <ProfitSharingInfo />

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={6}>
          {subscriptionPlans.map((plan) => (
            <Box
              key={plan.id}
              bg={bgColor}
              border="1px"
              borderColor={borderColor}
              borderRadius="lg"
              overflow="hidden"
              boxShadow="md"
              transition="all 0.3s"
              _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
              position="relative"
            >
              {plan.popular && (
                <Badge
                  colorScheme="green"
                  position="absolute"
                  top={4}
                  right={4}
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontWeight="bold"
                >
                  Mais Popular
                </Badge>
              )}

              <Box p={6}>
                <VStack spacing={4} align="stretch">
                  <Flex align="center">
                    <Icon as={plan.icon} color={`${plan.color}.500`} boxSize={6} mr={2} />
                    <Heading size="md">{plan.name}</Heading>
                  </Flex>
                  
                  <HStack>
                    <Text fontSize="sm" color="gray.500">
                      Duração:
                    </Text>
                    <Text fontWeight="bold">{plan.duration}</Text>
                  </HStack>

                  <Box>
                    <Text fontSize="3xl" fontWeight="bold">
                      {plan.price}
                    </Text>
                    {plan.id !== 'free' && plan.id !== 'unlimited' && (
                      <Text fontSize="sm" color="gray.500">
                        + 5% dos lucros
                      </Text>
                    )}
                  </Box>

                  <Divider />

                  <List spacing={2}>
                    {plan.features.map((feature, index) => (
                      <ListItem key={index}>
                        <ListIcon as={FaCheck} color={`${plan.color}.500`} />
                        {feature}
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    as={RouterLink}
                    to={`/subscribe/${plan.id}`}
                    colorScheme={plan.color}
                    size="lg"
                    mt={4}
                    w="full"
                  >
                    Assinar Agora
                  </Button>
                </VStack>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default SubscriptionPlans;
export { subscriptionPlans };