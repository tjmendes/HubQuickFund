import React, { useState, useEffect } from 'react'
import { Box, Grid, Heading, Text, VStack, HStack, Progress, Badge, useColorModeValue, Tabs, TabList, Tab, TabPanels, TabPanel, Select, Stat, StatLabel, StatNumber, StatHelpText, StatArrow } from '@chakra-ui/react'
import { FaArrowUp, FaArrowDown, FaExchangeAlt, FaGlobe, FaChartLine } from 'react-icons/fa'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const MarketMetric = ({ title, value, change, sentiment, marketType }) => {
  const bgColor = useColorModeValue('white', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.200')
  const isPositive = change >= 0

  return (
    <Box p={4} bg={bgColor} rounded="lg" shadow="sm">
      <VStack align="start" spacing={2}>
        <Text fontSize="sm" color={textColor}>{title}</Text>
        <Heading size="md" color={isPositive ? 'green.500' : 'red.500'}>
          {value}
        </Heading>
        <HStack>
          {isPositive ? <FaArrowUp color="green" /> : <FaArrowDown color="red" />}
          <Text fontSize="sm" color={isPositive ? 'green.500' : 'red.500'}>
            {Math.abs(change)}%
          </Text>
        </HStack>
        <Badge colorScheme={sentiment === 'Bullish' ? 'green' : 'red'}>
          {sentiment}
        </Badge>
      </VStack>
    </Box>
  )
}

const MarketAnalytics = () => {
  const [selectedMarket, setSelectedMarket] = useState('crypto')
  const [timeframe, setTimeframe] = useState('1h')
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  })

  // Configurações do gráfico
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Análise de Mercado' }
    }
  }
  // Dados simulados para diferentes mercados
  const cryptoData = [
    {
      title: 'Bitcoin (BTC)',
      value: '$45,230',
      change: 2.5,
      sentiment: 'Bullish',
      confidence: 85
    },
    {
      title: 'Ethereum (ETH)',
      value: '$3,250',
      change: -1.2,
      sentiment: 'Bearish',
      confidence: 72
    },
    {
      title: 'Arbitrum (ARB)',
      value: '$1.85',
      change: 5.3,
      sentiment: 'Bullish',
      confidence: 78
    },
    {
      title: 'Optimism (OP)',
      value: '$2.45',
      change: 3.1,
      sentiment: 'Bullish',
      confidence: 81
    }
  ]

  const forexData = [
    {
      title: 'EUR/USD',
      value: '1.0892',
      change: 0.15,
      sentiment: 'Bullish',
      confidence: 82,
      marketType: 'forex'
    },
    {
      title: 'GBP/USD',
      value: '1.2645',
      change: -0.25,
      sentiment: 'Bearish',
      confidence: 75,
      marketType: 'forex'
    },
    {
      title: 'USD/JPY',
      value: '148.12',
      change: 0.45,
      sentiment: 'Bullish',
      confidence: 88,
      marketType: 'forex'
    },
    {
      title: 'AUD/USD',
      value: '0.6578',
      change: -0.18,
      sentiment: 'Bearish',
      confidence: 71,
      marketType: 'forex'
    }
  ]

  const stockData = [
    {
      title: 'AAPL',
      value: '$182.63',
      change: 1.25,
      sentiment: 'Bullish',
      confidence: 90,
      marketType: 'stocks'
    },
    {
      title: 'MSFT',
      value: '$402.56',
      change: 0.75,
      sentiment: 'Bullish',
      confidence: 87,
      marketType: 'stocks'
    },
    {
      title: 'GOOGL',
      value: '$142.65',
      change: -0.50,
      sentiment: 'Bearish',
      confidence: 73,
      marketType: 'stocks'
    },
    {
      title: 'AMZN',
      value: '$156.87',
      change: 2.15,
      sentiment: 'Bullish',
      confidence: 85,
      marketType: 'stocks'
    }
  ]

  const defiMetrics = [
    {
      title: 'Aave APY',
      value: '3.8%',
      change: 0.5,
      sentiment: 'Bullish',
      confidence: 92
    },
    {
      title: 'Compound Taxa',
      value: '4.2%',
      change: 1.2,
      sentiment: 'Bullish',
      confidence: 88
    },
    {
      title: 'Liquidez Total',
      value: '$2.8B',
      change: 15.3,
      sentiment: 'Bullish',
      confidence: 95
    },
    {
      title: 'Volume 24h',
      value: '$850M',
      change: 7.8,
      sentiment: 'Bullish',
      confidence: 87
    }
  ]

  // Atualizar dados do gráfico baseado no mercado selecionado
  useEffect(() => {
    const generateChartData = () => {
      const timeLabels = Array.from({length: 24}, (_, i) => `${i}:00`)
      const data = Array.from({length: 24}, () => Math.random() * 100)
      
      setChartData({
        labels: timeLabels,
        datasets: [{
          label: 'Preço',
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      })
    }

    generateChartData()
  }, [selectedMarket, timeframe])

  return (
    <Box p={4}>
      <HStack mb={6} justify="space-between" align="center">
        <Heading size="lg">Análise de Mercado</Heading>
        <HStack spacing={4}>
          <Select value={selectedMarket} onChange={(e) => setSelectedMarket(e.target.value)} w="200px">
            <option value="crypto">Criptomoedas</option>
            <option value="forex">Forex</option>
            <option value="stocks">Ações</option>
          </Select>
          <Select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} w="150px">
            <option value="1h">1 Hora</option>
            <option value="4h">4 Horas</option>
            <option value="1d">1 Dia</option>
          </Select>
        </HStack>
      </HStack>

      <VStack spacing={6} align="stretch">
        <Box p={4} bg={useColorModeValue('white', 'gray.800')} rounded="xl" shadow="base">
          <Line options={chartOptions} data={chartData} height={80} />
        </Box>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab><HStack><FaChartLine /><Text>Mercados</Text></HStack></Tab>
            <Tab><HStack><FaExchangeAlt /><Text>DeFi</Text></HStack></Tab>
            <Tab><HStack><FaGlobe /><Text>Global</Text></HStack></Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
            {(selectedMarket === 'crypto' ? cryptoData :
              selectedMarket === 'forex' ? forexData :
              stockData).map((metric, index) => (
              <Box key={index}>
                <MarketMetric {...metric} />
                <Box mt={2} p={2} bg="gray.50" rounded="md">
                  <Text fontSize="sm" mb={1}>Confiança da Previsão</Text>
                  <Progress value={metric.confidence} colorScheme="blue" size="sm" rounded="full" />
                </Box>
              </Box>
            ))}
          </Grid>
            </TabPanel>

            <TabPanel>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
                {defiMetrics.map((metric, index) => (
                  <Box key={index}>
                    <MarketMetric {...metric} />
                    <Box mt={2} p={2} bg="gray.50" rounded="md">
                      <Text fontSize="sm" mb={1}>Confiança da Previsão</Text>
                      <Progress value={metric.confidence} colorScheme="blue" size="sm" rounded="full" />
                    </Box>
                  </Box>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
                <Stat p={4} bg={useColorModeValue('white', 'gray.700')} rounded="lg" shadow="sm">
                  <StatLabel>Volume Global 24h</StatLabel>
                  <StatNumber>$2.8T</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    23.36%
                  </StatHelpText>
                </Stat>
                <Stat p={4} bg={useColorModeValue('white', 'gray.700')} rounded="lg" shadow="sm">
                  <StatLabel>Dominância BTC</StatLabel>
                  <StatNumber>42.5%</StatNumber>
                  <StatHelpText>
                    <StatArrow type="decrease" />
                    1.2%
                  </StatHelpText>
                </Stat>
                <Stat p={4} bg={useColorModeValue('white', 'gray.700')} rounded="lg" shadow="sm">
                  <StatLabel>Volatilidade Global</StatLabel>
                  <StatNumber>2.8%</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    0.5%
                  </StatHelpText>
                </Stat>
                <Stat p={4} bg={useColorModeValue('white', 'gray.700')} rounded="lg" shadow="sm">
                  <StatLabel>Sentimento de Mercado</StatLabel>
                  <StatNumber>Bullish</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    15 pontos
                  </StatHelpText>
                </Stat>
              </Grid>

              <Box mt={6}>
                <Heading size="md" mb={4}>Análise de Arbitragem</Heading>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
                  <Box p={4} bg={useColorModeValue('white', 'gray.700')} rounded="lg" shadow="sm">
                    <StatLabel>Oportunidades Identificadas</StatLabel>
                    <StatNumber>127</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      12 novas
                    </StatHelpText>
                  </Box>
                  <Box p={4} bg={useColorModeValue('white', 'gray.700')} rounded="lg" shadow="sm">
                    <StatLabel>Spread Médio</StatLabel>
                    <StatNumber>0.82%</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      0.1%
                    </StatHelpText>
                  </Box>
                  <Box p={4} bg={useColorModeValue('white', 'gray.700')} rounded="lg" shadow="sm">
                    <StatLabel>Lucro Potencial 24h</StatLabel>
                    <StatNumber>$158.5K</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      15.3%
                    </StatHelpText>
                  </Box>
                </Grid>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}

export default MarketAnalytics