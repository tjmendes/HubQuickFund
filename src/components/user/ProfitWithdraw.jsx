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
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Badge,
  Icon,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast
} from '@chakra-ui/react';
import { FaWallet, FaExchangeAlt, FaCoins, FaArrowRight, FaArrowLeft, FaPercentage, FaChartLine, FaEthereum } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import authService from '../../services/authService';
import userProfitService from '../../services/userProfitService';

const ProfitWithdraw = () => {
  const [user, setUser] = useState(null);
  const [profitStats, setProfitStats] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [targetWallet, setTargetWallet] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('ETH');
  const [profitSource, setProfitSource] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  
  // Lista de criptomoedas disponíveis para saque
  const availableCryptos = [
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'USDT', name: 'Tether' },
    { symbol: 'USDC', name: 'USD Coin' },
    { symbol: 'BNB', name: 'Binance Coin' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'AVAX', name: 'Avalanche' },
    { symbol: 'MATIC', name: 'Polygon' }
  ];
  
  // Fontes de lucro disponíveis
  const profitSources = [
    { id: 'all', name: 'Todos os lucros' },
    { id: 'defi', name: 'DeFi' },
    { id: 'mining', name: 'Mineração' },
    { id: 'staking', name: 'Staking' },
    { id: 'trading', name: 'Trading' },
    { id: 'yield', name: 'Yield Farming' }
  ];
  
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
        
        // Obter estatísticas de lucro
        const stats = userProfitService.getUserProfitStats(currentUser.id);
        setProfitStats(stats);
        
        // Carregar histórico de saques (simulado por enquanto)
        // Em uma implementação real, isso viria de um serviço específico
        setWithdrawHistory([
          {
            id: '1',
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 dias atrás
            amount: '0.5',
            crypto: 'ETH',
            wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
            status: 'completed',
            source: 'defi'
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 dias atrás
            amount: '0.25',
            crypto: 'BTC',
            wallet: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            status: 'completed',
            source: 'staking'
          }
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do usuário.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [toast]);
  
  // Formatar valor para exibição
  const formatCurrency = (value) => {
    const numValue = parseFloat(value) / 1e18; // Convertendo de wei para ether
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };
  
  // Formatar valor de cripto
  const formatCrypto = (value, symbol) => {
    return `${value} ${symbol}`;
  };
  
  // Calcular taxa de conversão (simulado)
  const getConversionRate = (fromCrypto, toCrypto) => {
    const rates = {
      'ETH': { 'BTC': 0.067, 'USDT': 1800, 'USDC': 1800, 'BNB': 7.5 },
      'BTC': { 'ETH': 15, 'USDT': 27000, 'USDC': 27000, 'BNB': 112 },
      'USDT': { 'ETH': 0.00055, 'BTC': 0.000037, 'USDC': 1, 'BNB': 0.0042 },
      'USDC': { 'ETH': 0.00055, 'BTC': 0.000037, 'USDT': 1, 'BNB': 0.0042 },
      'BNB': { 'ETH': 0.13, 'BTC': 0.0089, 'USDT': 240, 'USDC': 240 }
    };
    
    if (fromCrypto === toCrypto) return 1;
    
    return rates[fromCrypto]?.[toCrypto] || 0;
  };
  
  // Calcular valor disponível para saque com base na fonte selecionada
  const getAvailableAmount = () => {
    if (!profitStats) return 0;
    
    // Em uma implementação real, isso seria calculado com base nos lucros por fonte
    // Por enquanto, vamos simular valores diferentes para cada fonte
    const sourceMultipliers = {
      'all': 1,
      'defi': 0.15,
      'mining': 0.15,
      'staking': 0.15,
      'trading': 0.20,
      'yield': 0.15
    };
    
    const totalProfit = parseFloat(profitStats.netProfit) / 1e18;
    return totalProfit * sourceMultipliers[profitSource];
  };
  
  // Processar solicitação de saque
  const handleWithdraw = () => {
    setIsLoading(true);
    
    // Validar entrada
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um valor válido para saque.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }
    
    if (!targetWallet) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um endereço de carteira válido.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }
    
    // Verificar se há saldo suficiente
    const availableAmount = getAvailableAmount();
    if (parseFloat(withdrawAmount) > availableAmount) {
      toast({
        title: 'Saldo insuficiente',
        description: `Você tem apenas ${availableAmount.toFixed(6)} disponível para saque desta fonte.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }
    
    // Simular processamento de saque
    setTimeout(() => {
      // Adicionar ao histórico de saques
      const newWithdraw = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        amount: withdrawAmount,
        crypto: selectedCrypto,
        wallet: targetWallet,
        status: 'processing',
        source: profitSource
      };
      
      setWithdrawHistory([newWithdraw, ...withdrawHistory]);
      
      // Simular conclusão após 2 segundos
      setTimeout(() => {
        setWithdrawHistory(prev => {
          const updated = [...prev];
          updated[0] = { ...updated[0], status: 'completed' };
          return updated;
        });
        
        toast({
          title: 'Saque realizado com sucesso!',
          description: `${withdrawAmount} ${selectedCrypto} foi enviado para sua carteira.`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }, 2000);
      
      // Limpar campos
      setWithdrawAmount('');
      setIsLoading(false);
    }, 1500);
  };
  
  // Obter o status do saque formatado
  const getWithdrawStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge colorScheme="green">Concluído</Badge>;
      case 'processing':
        return <Badge colorScheme="yellow">Processando</Badge>;
      case 'failed':
        return <Badge colorScheme="red">Falhou</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };
  
  // Obter nome da fonte de lucro
  const getProfitSourceName = (sourceId) => {
    const source = profitSources.find(s => s.id === sourceId);
    return source ? source.name : sourceId;
  };
  
  const availableAmount = getAvailableAmount();
  
  return (
    <Box py={8}>
      <VStack spacing={8} align="stretch">
        {/* Cabeçalho */}
        <Flex justify="space-between" align="center">
          <Button
            as={RouterLink}
            to="/profit-history"
            leftIcon={<FaArrowLeft />}
            variant="ghost"
          >
            Voltar ao Histórico
          </Button>
        </Flex>
        
        <Heading size="lg" color={headingColor}>Saque de Lucros</Heading>
        
        {/* Resumo de Lucros Disponíveis */}
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
            <Heading size="md">Lucros Disponíveis</Heading>
            
            <Divider />
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Stat>
                <Flex align="center">
                  <Icon as={FaCoins} color="green.500" mr={2} />
                  <StatLabel>Lucro Total</StatLabel>
                </Flex>
                <StatNumber>{profitStats ? formatCurrency(profitStats.totalProfit) : 'R$ 0,00'}</StatNumber>
                <StatHelpText>
                  Todos os lucros acumulados
                </StatHelpText>
              </Stat>
              
              <Stat>
                <Flex align="center">
                  <Icon as={FaPercentage} color="red.500" mr={2} />
                  <StatLabel>Taxa Total</StatLabel>
                </Flex>
                <StatNumber>{profitStats ? formatCurrency(profitStats.totalFee) : 'R$ 0,00'}</StatNumber>
                <StatHelpText>
                  Taxas deduzidas
                </StatHelpText>
              </Stat>
              
              <Stat>
                <Flex align="center">
                  <Icon as={FaWallet} color="blue.500" mr={2} />
                  <StatLabel>Disponível para Saque</StatLabel>
                </Flex>
                <StatNumber>{profitStats ? formatCurrency(profitStats.netProfit) : 'R$ 0,00'}</StatNumber>
                <StatHelpText>
                  Lucro líquido disponível
                </StatHelpText>
              </Stat>
            </SimpleGrid>
          </VStack>
        </Box>
        
        {/* Formulário de Saque */}
        <Box
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          p={6}
        >
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab><Icon as={FaWallet} mr={2} /> Saque de Lucros</Tab>
              <Tab><Icon as={FaExchangeAlt} mr={2} /> Histórico de Saques</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <FormControl isRequired>
                      <FormLabel>Fonte de Lucro</FormLabel>
                      <Select
                        value={profitSource}
                        onChange={(e) => setProfitSource(e.target.value)}
                      >
                        {profitSources.map((source) => (
                          <option key={source.id} value={source.id}>
                            {source.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Criptomoeda para Recebimento</FormLabel>
                      <Select
                        value={selectedCrypto}
                        onChange={(e) => setSelectedCrypto(e.target.value)}
                      >
                        {availableCryptos.map((crypto) => (
                          <option key={crypto.symbol} value={crypto.symbol}>
                            {crypto.name} ({crypto.symbol})
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                  
                  <FormControl isRequired>
                    <FormLabel>Endereço da Carteira</FormLabel>
                    <Input
                      placeholder="0x..."
                      value={targetWallet}
                      onChange={(e) => setTargetWallet(e.target.value)}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Valor para Saque ({selectedCrypto})</FormLabel>
                    <NumberInput
                      min={0}
                      max={availableAmount}
                      precision={6}
                      value={withdrawAmount}
                      onChange={(valueString) => setWithdrawAmount(valueString)}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Disponível: {availableAmount.toFixed(6)} {selectedCrypto} ({getProfitSourceName(profitSource)})
                    </Text>
                  </FormControl>
                  
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text>Taxa de rede: 0.0005 {selectedCrypto}</Text>
                      <Text>Tempo estimado: 2-5 minutos</Text>
                    </VStack>
                  </Alert>
                  
                  <Button
                    colorScheme="blue"
                    size="lg"
                    rightIcon={<FaArrowRight />}
                    isLoading={isLoading}
                    onClick={handleWithdraw}
                    isDisabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || !targetWallet}
                  >
                    Sacar Lucros
                  </Button>
                </VStack>
              </TabPanel>
              
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {withdrawHistory.length > 0 ? (
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Data</Th>
                            <Th>Fonte</Th>
                            <Th>Valor</Th>
                            <Th>Carteira</Th>
                            <Th>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {withdrawHistory.map((withdraw) => {
                            const date = new Date(withdraw.timestamp);
                            return (
                              <Tr key={withdraw.id}>
                                <Td>{date.toLocaleDateString('pt-BR')} {date.toLocaleTimeString('pt-BR')}</Td>
                                <Td>{getProfitSourceName(withdraw.source)}</Td>
                                <Td>
                                  <HStack>
                                    <Text>{formatCrypto(withdraw.amount, withdraw.crypto)}</Text>
                                    {withdraw.crypto === 'ETH' && <Icon as={FaEthereum} color="purple.500" />}
                                    {withdraw.crypto === 'BTC' && <Icon as={FaCoins} color="orange.500" />}
                                  </HStack>
                                </Td>
                                <Td>
                                  <Text isTruncated maxW="200px">
                                    {withdraw.wallet}
                                  </Text>
                                </Td>
                                <Td>{getWithdrawStatusBadge(withdraw.status)}</Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Text>Nenhum saque realizado ainda.</Text>
                    </Box>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </VStack>
    </Box>
  );
};

export default ProfitWithdraw;