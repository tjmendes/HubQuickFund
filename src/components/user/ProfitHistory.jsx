import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Divider,
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
  Select,
  FormControl,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Badge
} from '@chakra-ui/react';
import { FaChartLine, FaExchangeAlt, FaPercentage, FaCoins, FaArrowLeft, FaDownload, FaFilter } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import authService from '../../services/authService';
import userProfitService from '../../services/userProfitService';

const ProfitHistory = () => {
  const [user, setUser] = useState(null);
  const [profitHistory, setProfitHistory] = useState(null);
  const [filteredOperations, setFilteredOperations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    period: 'all',
    asset: 'all'
  });
  
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
        
        // Obter histórico de lucros
        const history = userProfitService.getUserProfitHistory(currentUser.id);
        setProfitHistory(history);
        setFilteredOperations(history.operations.reverse()); // Mais recentes primeiro
      } catch (error) {
        console.error('Erro ao carregar histórico de lucros:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);
  
  useEffect(() => {
    if (!profitHistory) return;
    
    // Aplicar filtros
    let operations = [...profitHistory.operations];
    
    // Filtrar por período
    if (filter.period !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (filter.period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(0); // Início dos tempos
      }
      
      operations = operations.filter(op => new Date(op.timestamp) >= startDate);
    }
    
    // Filtrar por ativo
    if (filter.asset !== 'all') {
      operations = operations.filter(op => op.asset === filter.asset);
    }
    
    // Ordenar por data (mais recentes primeiro)
    operations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setFilteredOperations(operations);
  }, [filter, profitHistory]);
  
  // Formatar valor para exibição
  const formatCurrency = (value) => {
    const numValue = parseFloat(value) / 1e18; // Convertendo de wei para ether
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };
  
  // Obter lista de ativos únicos
  const getUniqueAssets = () => {
    if (!profitHistory || !profitHistory.operations) return [];
    
    const assets = profitHistory.operations.map(op => op.asset);
    return ['all', ...new Set(assets)];
  };
  
  // Calcular estatísticas para as operações filtradas
  const calculateStats = () => {
    if (!filteredOperations.length) {
      return {
        totalProfit: '0',
        totalFee: '0',
        netProfit: '0',
        count: 0
      };
    }
    
    let totalProfit = 0;
    let totalFee = 0;
    
    filteredOperations.forEach(op => {
      totalProfit += parseFloat(op.profit) / 1e18;
      totalFee += parseFloat(op.fee) / 1e18;
    });
    
    const netProfit = totalProfit - totalFee;
    
    return {
      totalProfit: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalProfit),
      totalFee: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalFee),
      netProfit: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netProfit),
      count: filteredOperations.length
    };
  };
  
  const stats = calculateStats();
  
  if (isLoading) {
    return (
      <Box p={8}>
        <VStack spacing={4}>
          <Heading size="md">Carregando histórico...</Heading>
          <Progress size="xs" isIndeterminate w="100%" />
        </VStack>
      </Box>
    );
  }
  
  return (
    <Box py={8}>
      <VStack spacing={8} align="stretch">
        {/* Cabeçalho */}
        <Flex justify="space-between" align="center">
          <Button
            as={RouterLink}
            to="/dashboard"
            leftIcon={<FaArrowLeft />}
            variant="ghost"
          >
            Voltar ao Painel
          </Button>
          
          <HStack spacing={4}>
            <Button
              leftIcon={<FaDownload />}
              colorScheme="blue"
              variant="outline"
              isDisabled={filteredOperations.length === 0}
            >
              Exportar Relatório
            </Button>
            <Button
              as={RouterLink}
              to="/profit-withdraw"
              colorScheme="green"
              leftIcon={<FaWallet />}
            >
              Sacar Lucros
            </Button>
          </HStack>
        </Flex>
        
        <Heading size="lg" color={headingColor}>Histórico de Lucros</Heading>
        
        {/* Filtros */}
        <Box
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
        >
          <VStack spacing={4} align="stretch">
            <Flex align="center">
              <Icon as={FaFilter} mr={2} />
              <Heading size="md">Filtros</Heading>
            </Flex>
            
            <Divider />
            
            <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
              <FormControl>
                <FormLabel>Período</FormLabel>
                <Select
                  value={filter.period}
                  onChange={(e) => setFilter({ ...filter, period: e.target.value })}
                >
                  <option value="all">Todos os períodos</option>
                  <option value="today">Hoje</option>
                  <option value="week">Últimos 7 dias</option>
                  <option value="month">Último mês</option>
                  <option value="year">Último ano</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Ativo</FormLabel>
                <Select
                  value={filter.asset}
                  onChange={(e) => setFilter({ ...filter, asset: e.target.value })}
                >
                  {getUniqueAssets().map((asset) => (
                    <option key={asset} value={asset}>
                      {asset === 'all' ? 'Todos os ativos' : asset}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Flex>
          </VStack>
        </Box>
        
        {/* Resumo das Operações Filtradas */}
        <Box
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md">Resumo</Heading>
            
            <Divider />
            
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              <Stat>
                <Flex align="center">
                  <Icon as={FaChartLine} color="green.500" mr={2} />
                  <StatLabel>Lucro Total</StatLabel>
                </Flex>
                <StatNumber>{stats.totalProfit}</StatNumber>
                <StatHelpText>
                  {stats.count} operações
                </StatHelpText>
              </Stat>
              
              <Stat>
                <Flex align="center">
                  <Icon as={FaPercentage} color="red.500" mr={2} />
                  <StatLabel>Taxa Total (5%)</StatLabel>
                </Flex>
                <StatNumber>{stats.totalFee}</StatNumber>
              </Stat>
              
              <Stat>
                <Flex align="center">
                  <Icon as={FaCoins} color="blue.500" mr={2} />
                  <StatLabel>Lucro Líquido</StatLabel>
                </Flex>
                <StatNumber>{stats.netProfit}</StatNumber>
              </Stat>
              
              <Stat>
                <Flex align="center">
                  <Icon as={FaExchangeAlt} color="purple.500" mr={2} />
                  <StatLabel>Operações</StatLabel>
                </Flex>
                <StatNumber>{stats.count}</StatNumber>
                <StatHelpText>
                  {filter.period !== 'all' || filter.asset !== 'all' ? 'Filtradas' : 'Total'}
                </StatHelpText>
              </Stat>
            </SimpleGrid>
          </VStack>
        </Box>
        
        {/* Tabela de Operações */}
        <Box
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
        >
          <VStack spacing={4} align="stretch">
            <Heading size="md">Detalhes das Operações</Heading>
            
            <Divider />
            
            {filteredOperations.length > 0 ? (
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Data</Th>
                      <Th>Hora</Th>
                      <Th>Ativo</Th>
                      <Th>Operação</Th>
                      <Th isNumeric>Valor</Th>
                      <Th isNumeric>Lucro</Th>
                      <Th isNumeric>Taxa (5%)</Th>
                      <Th isNumeric>Líquido</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredOperations.map((op) => {
                      const date = new Date(op.timestamp);
                      return (
                        <Tr key={op.id}>
                          <Td>{date.toLocaleDateString('pt-BR')}</Td>
                          <Td>{date.toLocaleTimeString('pt-BR')}</Td>
                          <Td>
                            <Badge colorScheme="blue">{op.asset}</Badge>
                          </Td>
                          <Td>
                            <HStack>
                              <Icon as={FaExchangeAlt} color="blue.500" />
                              <Text>Arbitragem</Text>
                            </HStack>
                          </Td>
                          <Td isNumeric>{op.amount}</Td>
                          <Td isNumeric>
                            <Text color="green.500">
                              {formatCurrency(op.profit)}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <Text color="red.500">
                              {formatCurrency(op.fee)}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <Text fontWeight="bold">
                              {formatCurrency(op.netProfit)}
                            </Text>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Box textAlign="center" py={4}>
                <Text>Nenhuma operação encontrada com os filtros selecionados.</Text>
              </Box>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default ProfitHistory;