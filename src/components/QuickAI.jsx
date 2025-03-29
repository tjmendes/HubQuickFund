import React, { useState, useEffect } from 'react'
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
  Tooltip,
  Icon,
  Flex,
  Divider,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Button,
  Link,
  CircularProgress,
  CircularProgressLabel,
  Stack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Image
} from '@chakra-ui/react'
import { 
  FaRocket, 
  FaChartLine, 
  FaExchangeAlt, 
  FaServer, 
  FaCubes, 
  FaRobot, 
  FaWallet, 
  FaCoins, 
  FaMoneyBillWave,
  FaCloudDownloadAlt,
  FaNetworkWired,
  FaLock,
  FaHistory,
  FaChartPie,
  FaArrowUp,
  FaArrowDown,
  FaDatabase,
  FaUserTie
} from 'react-icons/fa'
import { Line, Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js'

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, ChartTooltip, Legend)

const QuickAI = () => {
  const [dashboardData, setDashboardData] = useState({
    flashLoans: {
      totalOperations: 0,
      successRate: 0,
      totalProfit: 0,
      recentOperations: [],
      profitHistory: []
    },
    defiMining: {
      yieldFarming: {
        totalLiquidity: 0,
        currentAPY: 0,
        protocols: []
      },
      staking: {
        totalStaked: 0,
        rewards: 0,
        networks: []
      },
      cloudMining: {
        hashPower: 0,
        activeMines: 0,
        coins: []
      }
    },
    trading: {
      crypto: {
        activeBots: 0,
        performance: 0,
        recentTrades: []
      },
      traditional: {
        stocks: {
          performance: 0,
          positions: []
        },
        forex: {
          performance: 0,
          positions: []
        }
      }
    },
    wallets: {
      coldStorage: 0,
      hotWallet: 0,
      recentWithdrawals: []
    },
    infrastructure: {
      botNetwork: {
        active: 0,
        total: 100000000,
        distribution: {}
      },
      computingPower: {
        current: 0,
        target: 10000000000,
        utilization: 0
      }
    }
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [timeframe, setTimeframe] = useState('24h')
  
  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.200')
  const headingColor = useColorModeValue('blue.600', 'blue.300')
  
  // Carregar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Simulação de dados para demonstração
        const mockData = {
          flashLoans: {
            totalOperations: 1287,
            successRate: 98.7,
            totalProfit: 156.34,
            recentOperations: [
              { id: 1, asset: 'ETH', amount: '500', profit: '0.87', timestamp: Date.now() - 1000 * 60 * 5 },
              { id: 2, asset: 'USDC', amount: '250000', profit: '423.12', timestamp: Date.now() - 1000 * 60 * 15 },
              { id: 3, asset: 'BTC', amount: '12', profit: '0.15', timestamp: Date.now() - 1000 * 60 * 30 },
              { id: 4, asset: 'AVAX', amount: '3000', profit: '45.23', timestamp: Date.now() - 1000 * 60 * 45 },
              { id: 5, asset: 'MATIC', amount: '15000', profit: '78.91', timestamp: Date.now() - 1000 * 60 * 60 }
            ],
            profitHistory: [
              { timestamp: Date.now() - 1000 * 60 * 60 * 24, profit: 120.45 },
              { timestamp: Date.now() - 1000 * 60 * 60 * 20, profit: 134.21 },
              { timestamp: Date.now() - 1000 * 60 * 60 * 16, profit: 142.78 },
              { timestamp: Date.now() - 1000 * 60 * 60 * 12, profit: 145.32 },
              { timestamp: Date.now() - 1000 * 60 * 60 * 8, profit: 149.87 },
              { timestamp: Date.now() - 1000 * 60 * 60 * 4, profit: 152.65 },
              { timestamp: Date.now(), profit: 156.34 }
            ]
          },
          defiMining: {
            yieldFarming: {
              totalLiquidity: 2500000,
              currentAPY: 8.7,
              protocols: [
                { name: 'Aave', liquidity: 1000000, apy: 7.2 },
                { name: 'Compound', liquidity: 800000, apy: 6.8 },
                { name: 'Curve', liquidity: 500000, apy: 12.5 },
                { name: 'Uniswap', liquidity: 200000, apy: 9.1 }
              ]
            },
            staking: {
              totalStaked: 1800000,
              rewards: 12500,
              networks: [
                { name: 'Ethereum', amount: 800000, reward: 5600 },
                { name: 'Polygon', amount: 500000, reward: 3800 },
                { name: 'Solana', amount: 300000, reward: 2100 },
                { name: 'Avalanche', amount: 200000, reward: 1000 }
              ]
            },
            cloudMining: {
              hashPower: 8500000000,
              activeMines: 12,
              coins: [
                { name: 'BTC', hashPower: 5000000000, dailyReward: 0.085 },
                { name: 'ETH', hashPower: 2000000000, dailyReward: 1.2 },
                { name: 'LTC', hashPower: 1000000000, dailyReward: 5.7 },
                { name: 'XMR', hashPower: 500000000, dailyReward: 2.3 }
              ]
            }
          },
          trading: {
            crypto: {
              activeBots: 45000000,
              performance: 12.8,
              recentTrades: [
                { pair: 'BTC/USDT', type: 'buy', amount: '0.5', price: '42156.78', profit: '213.45', timestamp: Date.now() - 1000 * 60 * 2 },
                { pair: 'ETH/USDT', type: 'sell', amount: '5', price: '2876.32', profit: '187.65', timestamp: Date.now() - 1000 * 60 * 8 },
                { pair: 'SOL/USDT', type: 'buy', amount: '20', price: '123.45', profit: '98.76', timestamp: Date.now() - 1000 * 60 * 15 },
                { pair: 'AVAX/USDT', type: 'sell', amount: '30', price: '34.56', profit: '45.67', timestamp: Date.now() - 1000 * 60 * 25 }
              ]
            },
            traditional: {
              stocks: {
                performance: 8.5,
                positions: [
                  { symbol: 'AAPL', shares: 100, entryPrice: 178.32, currentPrice: 182.45, profit: 413.00 },
                  { symbol: 'MSFT', shares: 50, entryPrice: 325.67, currentPrice: 337.89, profit: 611.00 },
                  { symbol: 'GOOGL', shares: 30, entryPrice: 134.56, currentPrice: 142.78, profit: 246.60 },
                  { symbol: 'AMZN', shares: 20, entryPrice: 167.89, currentPrice: 178.90, profit: 220.20 }
                ]
              },
              forex: {
                performance: 5.2,
                positions: [
                  { pair: 'EUR/USD', size: '100000', entryPrice: 1.0876, currentPrice: 1.0923, profit: 470.00 },
                  { pair: 'GBP/USD', size: '50000', entryPrice: 1.2654, currentPrice: 1.2701, profit: 235.00 },
                  { pair: 'USD/JPY', size: '200000', entryPrice: 147.32, currentPrice: 146.87, profit: -600.00 },
                  { pair: 'AUD/USD', size: '75000', entryPrice: 0.6543, currentPrice: 0.6587, profit: 330.00 }
                ]
              }
            }
          },
          wallets: {
            coldStorage: 23500000,
            hotWallet: 1500000,
            recentWithdrawals: [
              { asset: 'USDC', amount: '500000', destination: '0x57E0b47bA8308F1A40f95bB4D3aA867cd1C08760', timestamp: Date.now() - 1000 * 60 * 60 },
              { asset: 'USDC', amount: '250000', destination: '0x57E0b47bA8308F1A40f95bB4D3aA867cd1C08760', timestamp: Date.now() - 1000 * 60 * 60 * 2 },
              { asset: 'USDC', amount: '750000', destination: '0x57E0b47bA8308F1A40f95bB4D3aA867cd1C08760', timestamp: Date.now() - 1000 * 60 * 60 * 3 }
            ]
          },
          infrastructure: {
            botNetwork: {
              active: 87500000,
              total: 100000000,
              distribution: {
                trading: 45000000,
                staking: 15000000,
                yieldFarming: 10000000,
                cloudMining: 12500000,
                nftTrading: 5000000
              }
            },
            computingPower: {
              current: 8500000000,
              target: 10000000000,
              utilization: 85
            }
          }
        }
        
        setDashboardData(mockData)
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
    
    // Atualizar dados a cada 60 segundos
    const intervalId = setInterval(fetchDashboardData, 60000)
    
    return () => clearInterval(intervalId)
  }, [])
  
  // Formatar timestamp para data legível
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }
  
  // Formatar valores monetários
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  // Dados para o gráfico de lucro de Flash Loans
  const flashLoanProfitChartData = {
    labels: dashboardData.flashLoans.profitHistory.map(item => formatTimestamp(item.timestamp)),
    datasets: [
      {
        label: 'Lucro Acumulado (USD)',
        data: dashboardData.flashLoans.profitHistory.map(item => item.profit),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  }
  
  // Dados para o gráfico de distribuição de bots
  const botDistributionChartData = {
    labels: Object.keys(dashboardData.infrastructure.botNetwork.distribution),
    datasets: [
      {
        label: 'Distribuição de Bots',
        data: Object.values(dashboardData.infrastructure.botNetwork.distribution),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  }
  
  // Dados para o gráfico de protocolos DeFi
  const defiProtocolsChartData = {
    labels: dashboardData.defiMining.yieldFarming.protocols.map(protocol => protocol.name),
    datasets: [
      {
        label: 'Liquidez (USD)',
        data: dashboardData.defiMining.yieldFarming.protocols.map(protocol => protocol.liquidity),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'APY (%)',
        data: dashboardData.defiMining.yieldFarming.protocols.map(protocol => protocol.apy),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  }
  
  // Opções para o gráfico de protocolos DeFi
  const defiProtocolsChartOptions = {
    responsive: true,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Liquidez (USD)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'APY (%)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  }
  
  return (
    <Box>
      <Flex align="center" mb={6}>
  <Image src="/images/quickai-logo.svg" alt="QuickAI Logo" height="60px" mr={3} />
  <Heading size="lg" color={headingColor}>QuickAI - Sistema Avançado de Operações Financeiras</Heading>
</Flex>
      
      {isLoading ? (
        <Flex justify="center" align="center" h="300px">
          <CircularProgress isIndeterminate color="blue.500" size="100px">
            <CircularProgressLabel>Carregando</CircularProgressLabel>
          </CircularProgress>
        </Flex>
      ) : (
        <>
          {/* Estatísticas Principais */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            <Stat p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FaRocket} mr={2} color="blue.500" />
                Flash Loans
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="blue.600">
                {dashboardData.flashLoans.totalOperations.toLocaleString()}
              </StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {dashboardData.flashLoans.successRate}% de sucesso
              </StatHelpText>
            </Stat>
            
            <Stat p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FaChartLine} mr={2} color="green.500" />
                DeFi & Mineração
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="green.600">
                {formatCurrency(dashboardData.defiMining.yieldFarming.totalLiquidity + dashboardData.defiMining.staking.totalStaked)}
              </StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {((dashboardData.defiMining.yieldFarming.currentAPY + dashboardData.defiMining.staking.rewards / dashboardData.defiMining.staking.totalStaked * 100) / 2).toFixed(2)}% APY médio
              </StatHelpText>
            </Stat>
            
            <Stat p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FaServer} mr={2} color="purple.500" />
                Poder de Mineração
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="purple.600">
                {(dashboardData.infrastructure.computingPower.current / 1000000000).toFixed(1)}B TH
              </StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {dashboardData.infrastructure.computingPower.utilization}% de utilização
              </StatHelpText>
            </Stat>
            
            <Stat p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
              <StatLabel fontSize="md" display="flex" alignItems="center">
                <Icon as={FaRobot} mr={2} color="orange.500" />
                Bots IA
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="orange.600">
                {(dashboardData.infrastructure.botNetwork.active / 1000000).toFixed(1)}M
              </StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                {(dashboardData.infrastructure.botNetwork.active / dashboardData.infrastructure.botNetwork.total * 100).toFixed(1)}% ativos
              </StatHelpText>
            </Stat>
          </SimpleGrid>
          
          {/* Tabs para diferentes seções */}
          <Tabs colorScheme="blue" variant="enclosed" onChange={setActiveTab} index={activeTab}>
            <TabList>
              <Tab><Icon as={FaRocket} mr={2} /> Flash Loans & Arbitragem</Tab>
              <Tab><Icon as={FaChartLine} mr={2} /> DeFi & Mineração</Tab>
              <Tab><Icon as={FaExchangeAlt} mr={2} /> Trading Automatizado</Tab>
              <Tab><Icon as={FaWallet} mr={2} /> Carteiras & Saques</Tab>
              <Tab><Icon as={FaServer} mr={2} /> Infraestrutura</Tab>
            </TabList>
            
            <TabPanels>
              {/* Tab 1: Flash Loans & Arbitragem */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  <Box>
                    <Heading size="md" mb={4}>Desempenho de Flash Loans</Heading>
                    <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor} h="300px">
                      <Line data={flashLoanProfitChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </Box>
                  </Box>
                  
                  <Box>
                    <Heading size="md" mb={4}>Operações Recentes</Heading>
                    <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor} overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Ativo</Th>
                            <Th isNumeric>Quantidade</Th>
                            <Th isNumeric>Lucro (USD)</Th>
                            <Th>Horário</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {dashboardData.flashLoans.recentOperations.map((op) => (
                            <Tr key={op.id}>
                              <Td>{op.asset}</Td>
                              <Td isNumeric>{parseFloat(op.amount).toLocaleString()}</Td>
                              <Td isNumeric color={parseFloat(op.profit) > 0 ? "green.500" : "red.500"}>
                                ${parseFloat(op.profit).toLocaleString()}
                              </Td>
                              <Td>{formatTimestamp(op.timestamp)}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                    
                    <Box mt={6}>
                      <Heading size="md" mb={4}>Estratégia de Arbitragem</Heading>
                      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
                        <Text mb={2}>
                          <Icon as={FaRocket} mr={2} color="blue.500" />
                          <strong>Processo:</strong> Identificação de discrepâncias de preços entre exchanges e execução de operações de arbitragem com capital temporário obtido via flash loans.
                        </Text>
                        <Text mb={2}>
                          <Icon as={FaLock} mr={2} color="green.500" />
                          <strong>Segurança:</strong> 15% do lucro armazenado em cold wallets para garantir a sustentabilidade das operações.
                        </Text>
                        <Text>
                          <Icon as={FaHistory} mr={2} color="purple.500" />
                          <strong>Frequência:</strong> Monitoramento contínuo 24/7 com execução automática quando oportunidades lucrativas são identificadas.
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                </SimpleGrid>
              </TabPanel>
              
              {/* Tab 2: DeFi & Mineração */}
              <TabPanel>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  <Box>
                    <Heading size="md" mb={4}>Yield Farming & Staking</Heading>
                    <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor} h="300px">
                      <Bar data={defiProtocolsChartData} options={defiProtocolsChartOptions} />
                    </Box>
                    
                    <Box mt={6}>
                      <Heading size="md" mb={4}>Redes de Staking</Heading>
                      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor} overflowX="auto">
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Rede</Th>
                              <Th isNumeric>Valor Staking (USD)</Th>
                              <Th isNumeric>Recompensas (USD)</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {dashboardData.defiMining.staking.networks.map((network, index) => (
                              <Tr key={index}>
                                <Td>{network.name}</Td>
                                <Td isNumeric>{formatCurrency(network.amount)}</Td>
                                <Td isNumeric color="green.500">{formatCurrency(network.reward)}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Heading size="md" mb={4}>Mineração em Nuvem</Heading>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {dashboardData.defiMining.cloudMining.coins.map((coin, index) => (
                        <Box key={index} p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
                          <HStack mb={2}>
                            <Icon as={FaCoins} color="yellow.500" />
                            <Heading size="sm">{coin.name}</Heading>
                          </HStack>
                          <Text mb={2}><strong>Hash Power:</strong> {(coin.hashPower / 1000000000).toFixed(2)} TH/s</Text>
                          <Text mb={2}><strong>Recompensa Diária:</strong> {coin.dailyReward} {coin.name}</Text>
                          <Progress value={(coin.hashPower / dashboardData.defiMining.cloudMining.hashPower) * 100} colorScheme="yellow" rounded="md" size="sm" />
                        </Box>
                      ))}
                    </SimpleGrid>
                    
                    <Box mt={6}>
                      <Heading size="md" mb={4}>Estratégia DeFi</Heading>
                      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
                        <Text mb={2}>
                          <Icon as={FaChartLine} mr={2} color="green.500" />
                          <strong>Alocação:</strong> 10% do lucro gerado é direcionado para operações de Yield Farming, Staking e Trading de Criptomoedas.
                        </Text>
                        <Text mb={2}>
                          <Icon as={FaNetworkWired} mr={2} color="blue.500" />
                          <strong>Diversificação:</strong> Distribuição estratégica entre múltiplos protocolos e redes para maximizar retornos e minimizar riscos.
                        </Text>
                        <Text>
                          <Icon as={FaCloudDownloadAlt} mr={2} color="purple.500" />
                          <strong>