import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Button,
  Divider,
  SimpleGrid,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Icon,
  Progress,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { FaCalendarAlt, FaClock, FaCoins, FaPercentage, FaChartLine, FaExchangeAlt, FaArrowUp, FaArrowDown, FaMobile } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import authService from '../../services/authService';
import subscriptionService from '../../services/subscriptionService';
import userProfitService from '../../services/userProfitService';
import MobileAppDownload from './MobileAppDownload';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [profitStats, setProfitStats] = useState(null);
  const [recentOperations, setRecentOperations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
        // Obter dados do usuário atual
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          // Redirecionar para login se não estiver autenticado
          window.location.href = '/login';
          return;
        }
        
        setUser(currentUser);
        
        // Obter detalhes da assinatura
        const subscriptionDetails = authService.getSubscriptionDetails();
        if (subscriptionDetails) {
          const planDetails = subscriptionService.getPlanById(subscriptionDetails.planId);
          setSubscription({
            ...subscriptionDetails,
            planDetails
          });
        }
        
        // Obter estatísticas de lucro
        const stats = userProfitService.getUserProfitStats(currentUser.id);
        setProfitStats(stats);
        
        // Obter operações recentes
        const profitHistory = userProfitService.getUserProfitHistory(currentUser.id);
        setRecentOperations(profitHistory.operations.slice(-5).reverse()); // Últimas 5 operações
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  // Formatar valor para exibição
  const formatCurrency = (value) => {
    const numValue = parseFloat(value) / 1e18; // Convertendo de wei para ether
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };
  
  // Calcular dias restantes da assinatura
  const getRemainingDays = () => {
    if (!subscription) return 0;
    
    const endDate = new Date(subscription.endDate);
    const now = new Date();
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Verificar se a assinatura está ativa
  const isSubscriptionActive = () => {
    if (!subscription) return false;
    return subscriptionService.isSubscriptionActive(subscription);
  };
  
  return (
    <Box>
      {isLoading ? (
        <Progress size="xs" isIndeterminate colorScheme="blue" />
      ) : (
        <VStack spacing={6} align="stretch">
          {/* Cabeçalho com saudação */}
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg">Olá, {user?.name || 'Usuário'}!</Heading>
              <Text color="gray.500">Bem-vindo ao seu painel de controle</Text>
            </Box>
            <HStack>
              <Icon as={FaCalendarAlt} color="gray.500" />
              <Text color="gray.500">{new Date().toLocaleDateString('pt-BR')}</Text>
            </HStack>
          </Flex>
          
          {/* Alertas e notificações */}
          {profitStats?.dailyProfit > 0 && (
            <Alert status="success" borderRadius="md">
              <AlertIcon />
              Você obteve {formatCurrency(profitStats.dailyProfit)} de lucro hoje!
            </Alert>
          )}
          
          {/* Estatísticas principais */}
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Box p={5} borderWidth="1px" borderRadius="lg" bg={bgColor}>
              <VStack spacing={3} align="stretch">
                <Heading size="md" color="green.500">Sacar Lucros</Heading>
                <Text>Saque seus lucros de DeFi, mineração, staking, trading e yield farming para qualquer carteira.</Text>
                <Button
                  as={RouterLink}
                  to="/profit-withdraw"
                  colorScheme="green"
                  rightIcon={<FaArrowRight />}
                >
                  Sacar Agora
                </Button>
              </VStack>
            </Box>
            <StatCard
              label="Lucro Total"
              value={formatCurrency(profitStats?.totalProfit || 0)}
              helpText={`${profitStats?.profitPercentage || 0}% desde o início`}
              type="increase"
              icon={FaCoins}
              color="green.500"
            />
            
            <StatCard
              label="Lucro Diário"
              value={formatCurrency(profitStats?.dailyProfit || 0)}
              helpText={`${profitStats?.dailyOperations || 0} operações hoje`}
              type={profitStats?.dailyProfit > 0 ? "increase" : "decrease"}
              icon={FaChartLine}
              color="blue.500"
            />
            
            <StatCard
              label="Taxa de Sucesso"
              value={`${profitStats?.successRate || 0}%`}
              helpText={`${profitStats?.totalOperations || 0} operações totais`}
              type={profitStats?.successRate >= 70 ? "increase" : "decrease"}
              icon={FaPercentage}
              color="purple.500"
            />
            
            <StatCard
              label="Tempo Ativo"
              value={`${profitStats?.activeTime || 0} dias`}
              helpText="Sistema funcionando corretamente"
              type="increase"
              icon={FaClock}
              color="orange.500"
            />
          </SimpleGrid>
          
          {/* Detalhes da assinatura */}
          <Box p={5} borderWidth="1px" borderRadius="lg" bg={bgColor}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Detalhes da Assinatura</Heading>
              <Badge colorScheme={subscription?.status === 'active' ? 'green' : 'red'} fontSize="0.8em" p={1}>
                {subscription?.status === 'active' ? 'Ativa' : 'Inativa'}
              </Badge>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box>
                <Text fontWeight="bold">Plano</Text>
                <Text>{subscription?.planDetails?.name || 'Nenhum plano ativo'}</Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold">Próxima Cobrança</Text>
                <Text>{subscription?.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString('pt-BR') : 'N/A'}</Text>
              </Box>
              
              <Box>
                <Text fontWeight="bold">Dias Restantes</Text>
                <Text>{getRemainingDays()}</Text>
              </Box>
            </SimpleGrid>
            
            <Divider my={4} />
            
            <Flex justify="flex-end">
              <Button as={RouterLink} to="/subscription-details" size="sm" colorScheme="blue" variant="outline">
                Gerenciar Assinatura
              </Button>
            </Flex>
          </Box>
          
          {/* Aplicativo Móvel */}
          <Box p={5} borderWidth="1px" borderRadius="lg" bg={bgColor}>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">
                <Icon as={FaMobile} mr={2} />
                Aplicativo Móvel
              </Heading>
            </Flex>
            
            <MobileAppDownload />
          </Box>
          
          {/* Operações recentes */}
          <Box p={5} borderWidth="1px" borderRadius="lg" bg={bgColor}>
            <Heading size="md" mb={4}>Operações Recentes</Heading>
            
            {recentOperations.length > 0 ? (
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Data/Hora</Th>
                      <Th>Ativo</Th>
                      <Th>Operação</Th>
                      <Th isNumeric>Valor</Th>
                      <Th isNumeric>Lucro</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {recentOperations.map((op, index) => (
                      <Tr key={index}>
                        <Td>{new Date(op.timestamp).toLocaleString('pt-BR')}</Td>
                        <Td>{op.asset}</Td>
                        <Td>
                          <Badge colorScheme={getOperationColor(op.operation)}>
                            {op.operation}
                          </Badge>
                        </Td>
                        <Td isNumeric>{formatCurrency(op.amount)}</Td>
                        <Td isNumeric>
                          <Flex justify="flex-end" align="center">
                            <Icon 
                              as={parseFloat(op.profit) >= 0 ? FaArrowUp : FaArrowDown} 
                              color={parseFloat(op.profit) >= 0 ? 'green.500' : 'red.500'} 
                              mr={1} 
                            />
                            {formatCurrency(op.profit)}
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Text>Nenhuma operação recente encontrada.</Text>
            )}
            
            <Flex justify="flex-end" mt={4}>
              <Button as={RouterLink} to="/profit-history" size="sm" colorScheme="blue" variant="outline">
                Ver Histórico Completo
              </Button>
            </Flex>
          </Box>
        </VStack>
      )}
    </Box>
  );
};

export default UserDashboard;