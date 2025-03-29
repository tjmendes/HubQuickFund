import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  Badge,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Flex,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Button,
  Tooltip,
  CircularProgress,
  CircularProgressLabel
} from '@chakra-ui/react';
import { 
  FaUserTie, 
  FaChartLine, 
  FaExchangeAlt, 
  FaWallet, 
  FaSearch, 
  FaHistory, 
  FaRegLightbulb,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { eliteWhaleTracker } from '../services/eliteWhaleTracker';
import { sentimentAnalysis } from '../services/sentimentAnalysis';

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend);

const EliteWhaleTracker = () => {
  const [whaleData, setWhaleData] = useState({
    eliteWallets: [],
    recentMovements: [],
    tradingPatterns: [],
    sentimentCorrelation: [],
    priceImpact: []
  });
  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const [timeframe, setTimeframe] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const headingColor = useColorModeValue('blue.600', 'blue.300');

  // Carregar dados de baleias
  useEffect(() => {
    const fetchWhaleData = async () => {
      setIsLoading(true);
      try {
        // Inicializar rastreador de baleias se necessário
        if (!eliteWhaleTracker.isInitialized) {
          await eliteWhaleTracker.initialize();
        }
        
        // Obter dados de baleias para o ativo selecionado
        const data = await eliteWhaleTracker.getWhaleInsights(selectedAsset, timeframe);
        setWhaleData(data);
      } catch (error) {
        console.error('Erro ao carregar dados de baleias:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWhaleData();
    
    // Configurar atualização periódica
    const intervalId = setInterval(fetchWhaleData, 60000); // Atualizar a cada minuto
    
    return () => clearInterval(intervalId);
  }, [selectedAsset, timeframe]);

  // Configurações do gráfico de impacto de preço
  const priceImpactChartData = {
    labels: whaleData.priceImpact.map(item => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Impacto no Preço (%)',
        data: whaleData.priceImpact.map(item => item.impact * 100),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: 'Volume de Transações',
        data: whaleData.priceImpact.map(item => item.volume / 1000), // Dividir por 1000 para escala
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4
      }
    ]
  };

  // Configurações do gráfico de correlação de sentimento
  const sentimentChartData = {
    labels: whaleData.sentimentCorrelation.map(item => new Date(item.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Atividade de Baleias',
        data: whaleData.sentimentCorrelation.map(item => item.whaleActivity),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        yAxisID: 'y'
      },
      {
        label: 'Sentimento de Mercado',
        data: whaleData.sentimentCorrelation.map(item => item.sentiment * 100),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  // Configurações do gráfico de padrões de trading
  const tradingPatternsChartData = {
    labels: whaleData.tradingPatterns.map(item => item.pattern),
    datasets: [
      {
        label: 'Frequência',
        data: whaleData.tradingPatterns.map(item => item.frequency),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Opções para gráficos
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { title: { display: true, text: 'Tempo' } },
      y: { title: { display: true, text: 'Valor' } }
    }
  };

  // Opções para gráfico de sentimento
  const sentimentChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { title: { display: true, text: 'Tempo' } },
      y: { 
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'Atividade de Baleias' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'Sentimento (%)' },
        grid: { drawOnChartArea: false }
      }
    }
  };

  // Renderizar lista de baleias elite
  const renderEliteWallets = () => {
    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaUserTie} />
            <Text>Baleias Elite</Text>
          </HStack>
        </Heading>

        {whaleData.eliteWallets.length > 0 ? (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Endereço</Th>
                <Th>Padrão</Th>
                <Th>Sucesso</Th>
                <Th>Influência</Th>
              </Tr>
            </Thead>
            <Tbody>
              {whaleData.eliteWallets.map((whale, index) => (
                <Tr key={index}>
                  <Td>
                    <Tooltip label={whale.address}>
                      <Text>{whale.address.substring(0, 8)}...{whale.address.substring(whale.address.length - 6)}</Text>
                    </Tooltip>
                  </Td>
                  <Td>
                    <Badge colorScheme={
                      whale.pattern === 'accumulation' ? 'green' :
                      whale.pattern === 'distribution' ? 'red' :
                      whale.pattern === 'swing_trading' ? 'purple' :
                      'blue'
                    }>
                      {whale.pattern}
                    </Badge>
                  </Td>
                  <Td isNumeric>{(whale.successRate * 100).toFixed(1)}%</Td>
                  <Td>
                    <Progress
                      value={whale.influence * 100}
                      size="sm"
                      colorScheme={whale.influence > 0.7 ? 'red' : whale.influence > 0.4 ? 'yellow' : 'green'}
                      rounded="full"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text>Nenhuma baleia elite identificada</Text>
        )}
      </Box>
    );
  };

  // Renderizar movimentos recentes
  const renderRecentMovements = () => {
    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaHistory} />
            <Text>Movimentos Recentes</Text>
          </HStack>
        </Heading>

        {whaleData.recentMovements.length > 0 ? (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Horário</Th>
                <Th>Endereço</Th>
                <Th>Tipo</Th>
                <Th>Valor</Th>
                <Th>Impacto</Th>
              </Tr>
            </Thead>
            <Tbody>
              {whaleData.recentMovements.map((movement, index) => (
                <Tr key={index}>
                  <Td>{new Date(movement.timestamp).toLocaleTimeString()}</Td>
                  <Td>
                    <Tooltip label={movement.address}>
                      <Text>{movement.address.substring(0, 6)}...</Text>
                    </Tooltip>
                  </Td>
                  <Td>
                    <HStack>
                      <Icon 
                        as={movement.type === 'buy' ? FaArrowUp : FaArrowDown} 
                        color={movement.type === 'buy' ? 'green.500' : 'red.500'} 
                      />
                      <Text>{movement.type === 'buy' ? 'Compra' : 'Venda'}</Text>
                    </HStack>
                  </Td>
                  <Td isNumeric>{parseFloat(movement.value).toFixed(2)} {selectedAsset}</Td>
                  <Td>
                    <Badge colorScheme={
                      movement.priceImpact > 0.02 ? 'red' :
                      movement.priceImpact > 0.01 ? 'yellow' :
                      'green'
                    }>
                      {(movement.priceImpact * 100).toFixed(2)}%
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text>Nenhum movimento recente detectado</Text>
        )}
      </Box>
    );
  };

  // Renderizar correlação de sentimento
  const renderSentimentCorrelation = () => {
    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaRegLightbulb} />
            <Text>Correlação de Sentimento</Text>
          </HStack>
        </Heading>

        <Line data={sentimentChartData} options={sentimentChartOptions} />

        <Divider my={4} />

        <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={4}>
          <Stat>
            <StatLabel>Correlação</StatLabel>
            <StatNumber>{(whaleData.correlationScore || 0).toFixed(2)}</StatNumber>
            <StatHelpText>
              {whaleData.correlationScore > 0.7 ? 'Alta' : whaleData.correlationScore > 0.4 ? 'Média' : 'Baixa'}
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Sentimento Atual</StatLabel>
            <StatNumber>
              <HStack>
                <Icon 
                  as={whaleData.currentSentiment > 0 ? FaArrowUp : FaArrowDown} 
                  color={whaleData.currentSentiment > 0 ? 'green.500' : 'red.500'} 
                />
                <Text>{Math.abs((whaleData.currentSentiment || 0) * 100).toFixed(1)}%</Text>
              </HStack>
            </StatNumber>
            <StatHelpText>
              {whaleData.currentSentiment > 0.5 ? 'Muito Positivo' : 
               whaleData.currentSentiment > 0 ? 'Positivo' : 
               whaleData.currentSentiment > -0.5 ? 'Negativo' : 'Muito Negativo'}
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Previsão</StatLabel>
            <StatNumber>
              <Badge colorScheme={whaleData.prediction === 'bullish' ? 'green' : 'red'} p={1}>
                {whaleData.prediction === 'bullish' ? 'Alta' : 'Baixa'}
              </Badge>
            </StatNumber>
            <StatHelpText>
              Confiança: {(whaleData.predictionConfidence || 0) * 100}%
            </StatHelpText>
          </Stat>
        </Grid>
      </Box>
    );
  };

  // Renderizar impacto no preço
  const renderPriceImpact = () => {
    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaChartLine} />
            <Text>Impacto no Preço</Text>
          </HStack>
        </Heading>

        <Line data={priceImpactChartData} options={chartOptions} />

        <Divider my={4} />

        <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={4}>
          <Stat>
            <StatLabel>Impacto Médio</StatLabel>
            <StatNumber>{((whaleData.averageImpact || 0) * 100).toFixed(2)}%</StatNumber>
            <StatHelpText>
              Por transação de baleia
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Maior Impacto</StatLabel>
            <StatNumber>{((whaleData.maxImpact || 0) * 100).toFixed(2)}%</StatNumber>
            <StatHelpText>
              Nas últimas 24h
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Tempo de Recuperação</StatLabel>
            <StatNumber>{whaleData.recoveryTime || 0} min</StatNumber>
            <StatHelpText>
              Após movimento de baleia
            </StatHelpText>
          </Stat>
        </Grid>
      </Box>
    );
  };

  // Renderizar padrões de trading
  const renderTradingPatterns = () => {
    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaExchangeAlt} />
            <Text>Padrões de Trading</Text>
          </HStack>
        </Heading>

        <Bar data={tradingPatternsChartData} options={chartOptions} height={200} />

        <Divider my={4} />

        <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4}>
          {whaleData.tradingPatterns.map((pattern, index) => (
            <Box key={index} p={3} borderWidth="1px" borderRadius="md">
              <HStack>
                <Icon 
                  as={
                    pattern.pattern === 'accumulation' ? FaArrowUp :
                    pattern.pattern === 'distribution' ? FaArrowDown :
                    pattern.pattern === 'swing_trading' ? FaExchangeAlt :
                    FaWallet
                  } 
                  color={
                    pattern.pattern === 'accumulation' ? 'green.500' :
                    pattern.pattern === 'distribution' ? 'red.500' :
                    pattern.pattern === 'swing_trading' ? 'purple.500' :
                    'blue.500'
                  }
                />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">{pattern.pattern}</Text>
                  <Text fontSize="sm">Frequência: {pattern.frequency}</Text>
                </VStack>
              </HStack>
            </Box>
          ))}
        </Grid>
      </Box>
    );
  };

  return (
    <Box>
      <HStack mb={6} justify="space-between">
        <Heading size="lg" color={headingColor}>
          <HStack>
            <Icon as={FaUserTie} />
            <Text>Elite Whale Tracker</Text>
          </HStack>
        </Heading>
        <HStack spacing={4}>
          <Select
            value={selectedAsset}
            onChange={(e) => setSelectedAsset(e.target.value)}
            width="120px"
          >
            <option value="BTC">Bitcoin</option>
            <option value="ETH">Ethereum</option>
            <option value="USDC">USDC</option>
            <option value="AVAX">Avalanche</option>
            <option value="MATIC">Polygon</option>
          </Select>
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            width="100px"
          >
            <option value="1h">1 hora</option>
            <option value="6h">6 horas</option>
            <option value="24h">24 horas</option>
            <option value="7d">7 dias</option>
          </Select>
        </HStack>
      </HStack>

      {isLoading ? (
        <Flex justify="center" align="center" height="400px">
          <CircularProgress isIndeterminate color="blue.500" />
        </Flex>
      ) : (
        <Tabs variant="enclosed" colorScheme="blue" index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Baleias Elite</Tab>
            <Tab>Movimentos Recentes</Tab>
            <Tab>Correlação de Sentimento</Tab>
            <Tab>Impacto no Preço</Tab>
            <Tab>Padrões de Trading</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>{renderEliteWallets()}</TabPanel>
            <TabPanel>{renderRecentMovements()}</TabPanel>
            <TabPanel>{renderSentimentCorrelation()}</TabPanel>
            <TabPanel>{renderPriceImpact()}</TabPanel>
            <TabPanel>{renderTradingPatterns()}</TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Box>
  );
};

export default EliteWhaleTracker;