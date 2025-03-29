import React, { useState, useEffect } from 'react'
import { Box, Grid, Heading, Text, VStack, HStack, Progress, Badge, useColorModeValue, Tabs, TabList, Tab, TabPanels, TabPanel, Select, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Table, Thead, Tbody, Tr, Th, Td, Tooltip, Icon, Flex, Divider, Card, CardHeader, CardBody } from '@chakra-ui/react'
import { FaArrowUp, FaArrowDown, FaExchangeAlt, FaGlobe, FaChartLine, FaUsers, FaLightbulb, FaExclamationTriangle, FaLeaf } from 'react-icons/fa'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js'
import { predictiveAnalytics } from '../services/predictiveAnalytics'

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend)

const CompetitiveIntelligence = () => {
  const [dashboardData, setDashboardData] = useState({
    competitive: {},
    sustainability: {},
    predictions: {},
    infrastructure: {}
  })
  const [isLoading, setIsLoading] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60) // segundos

  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.200')
  const headingColor = useColorModeValue('blue.600', 'blue.300')

  // Carregar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const data = await predictiveAnalytics.getMarketDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()

    // Configurar atualização periódica
    const intervalId = setInterval(fetchDashboardData, refreshInterval * 1000)

    return () => clearInterval(intervalId)
  }, [refreshInterval])

  // Formatar timestamp para data legível
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleString()
  }

  // Renderizar seção de concorrentes
  const renderCompetitors = () => {
    const { topCompetitors = [] } = dashboardData.competitive || {}

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaUsers} />
            <Text>Principais Concorrentes</Text>
          </HStack>
        </Heading>

        {topCompetitors.length > 0 ? (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Endereço</Th>
                <Th>Volume</Th>
                <Th>Padrão</Th>
                <Th>Ameaça</Th>
              </Tr>
            </Thead>
            <Tbody>
              {topCompetitors.map((competitor, index) => (
                <Tr key={index}>
                  <Td>{competitor.address.substring(0, 8)}...</Td>
                  <Td isNumeric>{parseFloat(competitor.volume).toFixed(2)}</Td>
                  <Td>{competitor.pattern}</Td>
                  <Td>
                    <Progress
                      value={competitor.threat * 100}
                      size="sm"
                      colorScheme={competitor.threat > 0.7 ? 'red' : competitor.threat > 0.4 ? 'yellow' : 'green'}
                      rounded="full"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text>Nenhum concorrente identificado</Text>
        )}
      </Box>
    )
  }

  // Renderizar seção de oportunidades
  const renderOpportunities = () => {
    const { topOpportunities = [] } = dashboardData.competitive || {}

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaLightbulb} />
            <Text>Oportunidades de Mercado</Text>
          </HStack>
        </Heading>

        {topOpportunities.length > 0 ? (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Tipo</Th>
                <Th>Ativo</Th>
                <Th>Confiança</Th>
                <Th>Retorno Est.</Th>
              </Tr>
            </Thead>
            <Tbody>
              {topOpportunities.map((opportunity, index) => (
                <Tr key={index}>
                  <Td>
                    <Badge colorScheme={
                      opportunity.type === 'arbitrage' ? 'green' :
                      opportunity.type === 'trend_following' ? 'blue' :
                      opportunity.type === 'liquidity_provision' ? 'purple' :
                      'gray'
                    }>
                      {opportunity.type}
                    </Badge>
                  </Td>
                  <Td>{opportunity.asset.substring(0, 8)}...</Td>
                  <Td isNumeric>{(opportunity.confidence * 100).toFixed(1)}%</Td>
                  <Td isNumeric>{typeof opportunity.expectedReturn === 'number' ? 
                    `${opportunity.expectedReturn.toFixed(2)}%` : 
                    opportunity.expectedReturn || 'N/A'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text>Nenhuma oportunidade identificada</Text>
        )}
      </Box>
    )
  }

  // Renderizar seção de ameaças
  const renderThreats = () => {
    const { criticalThreats = [] } = dashboardData.competitive || {}

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaExclamationTriangle} />
            <Text>Ameaças Críticas</Text>
          </HStack>
        </Heading>

        {criticalThreats.length > 0 ? (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Tipo</Th>
                <Th>Descrição</Th>
                <Th>Nível</Th>
              </Tr>
            </Thead>
            <Tbody>
              {criticalThreats.map((threat, index) => (
                <Tr key={index}>
                  <Td>
                    <Badge colorScheme={
                      threat.type === 'competitor' ? 'red' :
                      threat.type === 'market' ? 'orange' :
                      threat.type === 'regulatory' ? 'blue' :
                      'gray'
                    }>
                      {threat.type}
                    </Badge>
                  </Td>
                  <Td>{threat.description}</Td>
                  <Td>
                    <Progress
                      value={threat.threatLevel * 100}
                      size="sm"
                      colorScheme="red"
                      rounded="full"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text>Nenhuma ameaça crítica identificada</Text>
        )}
      </Box>
    )
  }

  // Renderizar seção de sustentabilidade
  const renderSustainability = () => {
    const { energyConsumption, carbonFootprint, resourceUtilization, currentScore } = dashboardData.sustainability || {}

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaLeaf} />
            <Text>Métricas de Sustentabilidade</Text>
          </HStack>
        </Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Pontuação de Sustentabilidade</StatLabel>
            <StatNumber>{currentScore ? (currentScore).toFixed(1) : 'N/A'}</StatNumber>
            <Progress
              mt={2}
              value={currentScore || 0}
              size="sm"
              colorScheme={
                currentScore > 80 ? 'green' :
                currentScore > 50 ? 'yellow' :
                'red'
              }
              rounded="full"
            />
          </Stat>

          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Consumo de Energia</StatLabel>
            <StatNumber>{energyConsumption?.current ? `${energyConsumption.current.toFixed(1)}W` : 'N/A'}</StatNumber>
            <StatHelpText>
              {energyConsumption?.trend === 'decreasing' ? (
                <>
                  <StatArrow type="decrease" />
                  Em queda
                </>
              ) : energyConsumption?.trend === 'increasing' ? (
                <>
                  <StatArrow type="increase" />
                  Em alta
                </>
              ) : (
                'Estável'
              )}
            </StatHelpText>
          </Stat>

          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Pegada de Carbono</StatLabel>
            <StatNumber>{carbonFootprint?.current ? `${carbonFootprint.current.toFixed(3)}kg` : 'N/A'}</StatNumber>
            <StatHelpText>
              {carbonFootprint?.trend === 'decreasing' ? (
                <>
                  <StatArrow type="decrease" />
                  Em queda
                </>
              ) : carbonFootprint?.trend === 'increasing' ? (
                <>
                  <StatArrow type="increase" />
                  Em alta
                </>
              ) : (
                'Estável'
              )}
            </StatHelpText>
          </Stat>

          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Utilização de CPU</StatLabel>
            <StatNumber>{resourceUtilization?.cpu ? `${resourceUtilization.cpu.toFixed(1)}%` : 'N/A'}</StatNumber>
            <Progress
              mt={2}
              value={resourceUtilization?.cpu || 0}
              size="sm"
              colorScheme={
                (resourceUtilization?.cpu || 0) > 80 ? 'red' :
                (resourceUtilization?.cpu || 0) > 50 ? 'yellow' :
                'green'
              }
              rounded="full"
            />
          </Stat>
        </Grid>
      </Box>
    )
  }

  // Renderizar seção de previsões
  const renderPredictions = () => {
    const { topPredictions = [], averageConfidence } = dashboardData.predictions || {}

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaChartLine} />
            <Text>Previsões de Mercado</Text>
          </HStack>
        </Heading>

        {topPredictions.length > 0 ? (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Ativo</Th>
                <Th>Direção</Th>
                <Th>Magnitude</Th>
                <Th>Prazo</Th>
                <Th>Confiança</Th>
              </Tr>
            </Thead>
            <Tbody>
              {topPredictions.map((prediction, index) => (
                <Tr key={index}>
                  <Td>{prediction.asset.substring(0, 8)}...</Td>
                  <Td>
                    <HStack>
                      {prediction.direction > 0 ? (
                        <Icon as={FaArrowUp} color="green.500" />
                      ) : (
                        <Icon as={FaArrowDown} color="red.500" />
                      )}
                      <Text>{prediction.direction > 0 ? 'Alta' : 'Baixa'}</Text>
                    </HStack>
                  </Td>
                  <Td isNumeric>{(prediction.magnitude * 100).toFixed(1)}%</Td>
                  <Td>{prediction.timeframe}</Td>
                  <Td>
                    <Progress
                      value={prediction.confidence * 100}
                      size="sm"
                      colorScheme={
                        prediction.confidence > 0.9 ? 'green' :
                        prediction.confidence > 0.7 ? 'blue' :
                        'yellow'
                      }
                      rounded="full"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text>Nenhuma previsão disponível</Text>
        )}

        {averageConfidence > 0 && (
          <HStack mt={4} justifyContent="flex-end">
            <Text fontSize="sm">Confiança média:</Text>
            <Badge colorScheme="blue">{(averageConfidence * 100).toFixed(1)}%</Badge>
          </HStack>
        )}
      </Box>
    )
  }

  // Renderizar seção de infraestrutura
  const renderInfrastructure = () => {
    const { currentCapacity, processingStats } = dashboardData.infrastructure || {}

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaGlobe} />
            <Text>Infraestrutura Inteligente</Text>
          </HStack>
        </Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Capacidade Atual</StatLabel>
            <StatNumber>{currentCapacity || 'N/A'}</StatNumber>
            <StatHelpText>Instâncias</StatHelpText>
          </Stat>

          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Eventos Processados</StatLabel>
            <StatNumber>{processingStats?.eventsProcessed?.toLocaleString() || 'N/A'}</StatNumber>
            <StatHelpText>Total</StatHelpText>
          </Stat>

          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Latência Média</StatLabel>
            <StatNumber>{processingStats?.averageLatency ? `${processingStats.averageLatency.toFixed(1)}ms` : 'N/A'}</StatNumber>
            <StatHelpText>Processamento</StatHelpText>
          </Stat>

          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Anomalias Detectadas</StatLabel>
            <StatNumber>{processingStats?.anomaliesDetected?.toLocaleString() || 'N/A'}</StatNumber>
            <StatHelpText>Total</StatHelpText>
          </Stat>
        </Grid>
      </Box>
    )
  }

  return (
    <Box p={4}>
      <HStack mb={6} justify="space-between" align="center">
        <Heading size="lg">Inteligência Competitiva & Sustentabilidade</Heading>
        <HStack spacing={4}>
          <Select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
            w="200px"
          >
            <option value="30">Atualizar: 30s</option>
            <option value="60">Atualizar: 1min</option>
            <option value="300">Atualizar: 5min</option>
          </Select>
        </HStack>
      </HStack>

      <VStack spacing={6} align="stretch">
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {renderCompetitors()}
          {renderOpportunities()}
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {renderThreats()}
          {renderSustainability()}
        </Grid>

        {renderPredictions()}
        {renderInfrastructure()}

        <Box textAlign="right" fontSize="sm" color={textColor}>
          <Text>Última atualização: {formatTimestamp(dashboardData.timestamp)}</Text>
        </Box>
      </VStack>
    </Box>
  )
}

export default CompetitiveIntelligence