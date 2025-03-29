import React, { useState, useEffect } from 'react'
import { Box, Grid, Heading, Text, VStack, HStack, Progress, Badge, useColorModeValue, Tabs, TabList, Tab, TabPanels, TabPanel, Select, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Table, Thead, Tbody, Tr, Th, Td, Tooltip, Icon, Flex, Divider, Card, CardHeader, CardBody, SimpleGrid } from '@chakra-ui/react'
import { FaArrowUp, FaArrowDown, FaChartLine, FaUsers, FaLightbulb, FaExclamationTriangle, FaLeaf, FaBullseye, FaUserTie, FaChartPie, FaRobot, FaGraduationCap, FaHandshake } from 'react-icons/fa'
import { Line, Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js'
import { predictiveAnalytics } from '../services/predictiveAnalytics'
import { MarketingAnalytics } from '../services/marketingAnalytics'
import { HRAnalytics } from '../services/hrAnalytics'

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, ChartTooltip, Legend)

// Instanciar serviços
const marketingAnalytics = new MarketingAnalytics()
const hrAnalytics = new HRAnalytics()

const AdvancedAnalytics = () => {
  const [dashboardData, setDashboardData] = useState({
    marketing: {
      customerSegments: [],
      sentimentAnalysis: {},
      campaignPerformance: [],
      recommendations: []
    },
    hr: {
      recruitmentMetrics: {},
      retentionAnalysis: {},
      performanceMetrics: {},
      diversityMetrics: {}
    },
    integration: {
      processAutomation: {},
      businessMetrics: {}
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60) // segundos
  const [activeTab, setActiveTab] = useState(0)

  const bgColor = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.200')
  const headingColor = useColorModeValue('blue.600', 'blue.300')

  // Carregar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Inicializar serviços se necessário
        await marketingAnalytics.initialize()
        await hrAnalytics.initialize()

        // Obter dados de marketing
        const marketingData = await fetchMarketingData()
        
        // Obter dados de RH
        const hrData = await fetchHRData()
        
        // Obter dados de integração de processos
        const integrationData = await fetchIntegrationData()
        
        setDashboardData({
          marketing: marketingData,
          hr: hrData,
          integration: integrationData
        })
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

  // Buscar dados de marketing
  const fetchMarketingData = async () => {
    // Simulação de dados para desenvolvimento
    return {
      customerSegments: [
        { id: 'high_value_active', name: 'Alto Valor (Ativos)', count: 1250, averageValue: 5200, retentionRate: 0.92 },
        { id: 'high_value_at_risk', name: 'Alto Valor (Em Risco)', count: 320, averageValue: 4800, retentionRate: 0.65 },
        { id: 'medium_value_active', name: 'Valor Médio (Ativos)', count: 3600, averageValue: 1800, retentionRate: 0.78 },
        { id: 'new_customers', name: 'Novos Clientes', count: 950, averageValue: 1200, retentionRate: 0.45 }
      ],
      sentimentAnalysis: {
        overall: 0.72,
        sources: [
          { name: 'social_media', positive: 65, negative: 15, neutral: 20 },
          { name: 'customer_reviews', positive: 72, negative: 18, neutral: 10 },
          { name: 'support_tickets', positive: 45, negative: 35, neutral: 20 }
        ],
        keyPhrases: ['excelente serviço', 'rápido atendimento', 'preços competitivos', 'interface intuitiva'],
        trend: 'increasing'
      },
      campaignPerformance: [
        { id: 'camp1', name: 'Campanha Q3', impressions: 125000, clicks: 12500, conversions: 1250, revenue: 62500, roi: 3.2 },
        { id: 'camp2', name: 'Email Retenção', impressions: 45000, clicks: 9000, conversions: 1800, revenue: 90000, roi: 4.5 },
        { id: 'camp3', name: 'Remarketing', impressions: 85000, clicks: 7650, conversions: 920, revenue: 46000, roi: 2.8 }
      ],
      recommendations: [
        { id: 'rec1', type: 'segment_targeting', description: 'Aumentar investimento no segmento de alto valor em risco', confidence: 0.89, potentialImpact: 'high' },
        { id: 'rec2', type: 'content_optimization', description: 'Otimizar conteúdo para destacar atendimento rápido', confidence: 0.92, potentialImpact: 'medium' },
        { id: 'rec3', type: 'campaign_adjustment', description: 'Expandir campanha de remarketing com foco em conversão', confidence: 0.85, potentialImpact: 'high' }
      ]
    }
  }

  // Buscar dados de RH
  const fetchHRData = async () => {
    // Simulação de dados para desenvolvimento
    return {
      recruitmentMetrics: {
        openPositions: 12,
        applicants: 345,
        interviewsScheduled: 48,
        offersMade: 8,
        offersAccepted: 6,
        timeToHire: 28, // dias
        costPerHire: 4200,
        qualityOfHire: 0.85,
        topSources: [
          { name: 'LinkedIn', candidates: 145, hires: 3, quality: 0.88 },
          { name: 'Referrals', candidates: 42, hires: 2, quality: 0.92 },
          { name: 'Job Boards', candidates: 158, hires: 1, quality: 0.75 }
        ]
      },
      retentionAnalysis: {
        overallRetention: 0.82,
        atRiskEmployees: 14,
        retentionByDepartment: [
          { department: 'Engineering', retention: 0.88 },
          { department: 'Sales', retention: 0.75 },
          { department: 'Marketing', retention: 0.92 },
          { department: 'Customer Support', retention: 0.79 }
        ],
        keyFactors: [
          { factor: 'Compensation', impact: 0.35 },
          { factor: 'Work-Life Balance', impact: 0.25 },
          { factor: 'Career Growth', impact: 0.22 },
          { factor: 'Management', impact: 0.18 }
        ]
      },
      performanceMetrics: {
        averagePerformance: 0.78,
        topPerformers: 22, // percentual
        lowPerformers: 8, // percentual
        performanceDistribution: [
          { score: '90-100%', count: 42 },
          { score: '80-89%', count: 78 },
          { score: '70-79%', count: 124 },
          { score: '60-69%', count: 56 },
          { score: '<60%', count: 28 }
        ],
        skillGaps: [
          { skill: 'Data Analysis', gap: 0.35 },
          { skill: 'Project Management', gap: 0.28 },
          { skill: 'AI/ML Knowledge', gap: 0.42 },
          { skill: 'Leadership', gap: 0.22 }
        ]
      },
      diversityMetrics: {
        genderDistribution: { male: 58, female: 41, nonBinary: 1 },
        ethnicityDistribution: {
          caucasian: 62,
          asian: 18,
          hispanic: 12,
          african: 6,
          other: 2
        },
        inclusionScore: 0.76,
        payEquityGap: 0.06 // 6% gap
      }
    }
  }

  // Buscar dados de integração de processos
  const fetchIntegrationData = async () => {
    // Simulação de dados para desenvolvimento
    return {
      processAutomation: {
        automatedProcesses: 28,
        manualProcesses: 12,
        automationRate: 0.7,
        timesSaved: 1250, // horas por mês
        costSaved: 75000, // por mês
        processEfficiency: [
          { process: 'Onboarding', before: 24, after: 4, unit: 'horas' },
          { process: 'Reporting', before: 40, after: 5, unit: 'horas' },
          { process: 'Invoicing', before: 16, after: 2, unit: 'horas' },
          { process: 'Data Analysis', before: 80, after: 12, unit: 'horas' }
        ]
      },
      businessMetrics: {
        revenueGrowth: 0.18, // 18%
        costReduction: 0.12, // 12%
        customerSatisfaction: 0.85,
        employeeSatisfaction: 0.78,
        operationalEfficiency: 0.82,
        timeToMarket: -0.35 // redução de 35%
      }
    }
  }

  // Formatar timestamp para data legível
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleString()
  }

  // Renderizar seção de segmentação de clientes
  const renderCustomerSegments = () => {
    const { customerSegments } = dashboardData.marketing

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaChartPie} />
            <Text>Segmentação de Clientes</Text>
          </HStack>
        </Heading>

        {customerSegments.length > 0 ? (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Segmento</Th>
                <Th isNumeric>Clientes</Th>
                <Th isNumeric>Valor Médio</Th>
                <Th isNumeric>Retenção</Th>
              </Tr>
            </Thead>
            <Tbody>
              {customerSegments.map((segment) => (
                <Tr key={segment.id}>
                  <Td>{segment.name}</Td>
                  <Td isNumeric>{segment.count.toLocaleString()}</Td>
                  <Td isNumeric>R$ {segment.averageValue.toLocaleString()}</Td>
                  <Td isNumeric>
                    <Badge colorScheme={segment.retentionRate > 0.8 ? 'green' : segment.retentionRate > 0.6 ? 'yellow' : 'red'}>
                      {(segment.retentionRate * 100).toFixed(0)}%
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text>Nenhum segmento de cliente disponível</Text>
        )}
      </Box>
    )
  }

  // Renderizar seção de análise de sentimento
  const renderSentimentAnalysis = () => {
    const { sentimentAnalysis } = dashboardData.marketing

    if (!sentimentAnalysis || !sentimentAnalysis.sources) {
      return <Text>Dados de análise de sentimento não disponíveis</Text>
    }

    // Dados para gráfico de pizza
    const pieData = {
      labels: ['Positivo', 'Negativo', 'Neutro'],
      datasets: [
        {
          data: [
            sentimentAnalysis.sources.reduce((sum, source) => sum + source.positive, 0),
            sentimentAnalysis.sources.reduce((sum, source) => sum + source.negative, 0),
            sentimentAnalysis.sources.reduce((sum, source) => sum + source.neutral, 0)
          ],
          backgroundColor: ['#48BB78', '#F56565', '#CBD5E0'],
          borderWidth: 1
        }
      ]
    }

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaLightbulb} />
            <Text>Análise de Sentimento</Text>
          </HStack>
        </Heading>

        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
          <Box>
            <Stat mb={4}>
              <StatLabel>Sentimento Geral</StatLabel>
              <StatNumber>{(sentimentAnalysis.overall * 100).toFixed(0)}%</StatNumber>
              <StatHelpText>
                {sentimentAnalysis.trend === 'increasing' ? (
                  <>
                    <StatArrow type="increase" />
                    Em alta
                  </>
                ) : sentimentAnalysis.trend === 'decreasing' ? (
                  <>
                    <StatArrow type="decrease" />
                    Em queda
                  </>
                ) : (
                  'Estável'
                )}
              </StatHelpText>
            </Stat>

            <Text fontWeight="bold" mb={2}>Frases-chave:</Text>
            <Flex flexWrap="wrap" gap={2} mb={4}>
              {sentimentAnalysis.keyPhrases.map((phrase, index) => (
                <Badge key={index} colorScheme="blue" variant="subtle" p={1}>
                  {phrase}
                </Badge>
              ))}
            </Flex>
          </Box>

          <Box height="200px">
            <Pie data={pieData} options={{ maintainAspectRatio: false }} />
          </Box>
        </Grid>

        <Divider my={4} />

        <Text fontWeight="bold" mb={2}>Sentimento por Fonte:</Text>
        {sentimentAnalysis.sources.map((source, index) => (
          <Box key={index} mb={3}>
            <HStack mb={1} justify="space-between">
              <Text>{source.name.replace('_', ' ')}</Text>
              <Text fontWeight="bold">
                {source.positive}% / {source.negative}% / {source.neutral}%
              </Text>
            </HStack>
            <Progress 
              value={source.positive} 
              size="sm" 
              colorScheme="green" 
              borderRadius="full"
              hasStripe
            />
          </Box>
        ))}
      </Box>
    )
  }

  // Renderizar seção de desempenho de campanhas
  const renderCampaignPerformance = () => {
    const { campaignPerformance } = dashboardData.marketing

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaBullseye} />
            <Text>Desempenho de Campanhas</Text>
          </HStack>
        </Heading>

        {campaignPerformance.length > 0 ? (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Campanha</Th>
                <Th isNumeric>Impressões</Th>
                <Th isNumeric>Cliques</Th>
                <Th isNumeric>Conversões</Th>
                <Th isNumeric>ROI</Th>
              </Tr>
            </Thead>
            <Tbody>
              {campaignPerformance.map((campaign) => (
                <Tr key={campaign.id}>
                  <Td>{campaign.name}</Td>
                  <Td isNumeric>{campaign.impressions.toLocaleString()}</Td>
                  <Td isNumeric>{campaign.clicks.toLocaleString()}</Td>
                  <Td isNumeric>{campaign.conversions.toLocaleString()}</Td>
                  <Td isNumeric>
                    <Badge colorScheme={campaign.roi > 3 ? 'green' : campaign.roi > 2 ? 'blue' : 'yellow'}>
                      {campaign.roi.toFixed(1)}x
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text>Nenhuma campanha disponível</Text>
        )}
      </Box>
    )
  }

  // Renderizar seção de recomendações de marketing
  const renderMarketingRecommendations = () => {
    const { recommendations } = dashboardData.marketing

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaLightbulb} />
            <Text>Recomendações Inteligentes</Text>
          </HStack>
        </Heading>

        {recommendations.length > 0 ? (
          <VStack spacing={3} align="stretch">
            {recommendations.map((recommendation) => (
              <Box 
                key={recommendation.id} 
                p={3} 
                borderWidth="1px" 
                borderColor={borderColor} 
                borderRadius="md"
                bg={useColorModeValue('gray.50', 'gray.800')}
              >
                <HStack justify="space-between" mb={2}>
                  <Badge colorScheme={
                    recommendation.type === 'segment_targeting' ? 'purple' :
                    recommendation.type === 'content_optimization' ? 'blue' :
                    recommendation.type === 'campaign_adjustment' ? 'green' :
                    'gray'
                  }>
                    {recommendation.type.replace('_', ' ')}
                  </Badge>
                  <Badge colorScheme={
                    recommendation.potentialImpact === 'high' ? 'red' :
                    recommendation.potentialImpact === 'medium' ? 'orange' :
                    'yellow'
                  }>
                    Impacto: {recommendation.potentialImpact}
                  </Badge>
                </HStack>
                <Text>{recommendation.description}</Text>
                <Text fontSize="sm" mt={1} color={textColor}>
                  Confiança: {(recommendation.confidence * 100).toFixed(0)}%
                </Text>
              </Box>
            ))}
          </VStack>
        ) : (
          <Text>Nenhuma recomendação disponível</Text>
        )}
      </Box>
    )
  }

  // Renderizar métricas de recrutamento
  const renderRecruitmentMetrics = () => {
    const { recruitmentMetrics } = dashboardData.hr

    if (!recruitmentMetrics) {
      return <Text>Dados de recrutamento não disponíveis</Text>
    }

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaUserTie} />
            <Text>Métricas de Recrutamento</Text>
          </HStack>
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={6}>
          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Vagas Abertas</StatLabel>
            <StatNumber>{recruitmentMetrics.openPositions}</StatNumber>
          </Stat>
          
          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Candidatos</StatLabel>
            <StatNumber>{recruitmentMetrics.applicants}</StatNumber>
          </Stat>
          
          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Tempo para Contratar</StatLabel>
            <StatNumber>{recruitmentMetrics.timeToHire} dias</StatNumber>
          </Stat>
          
          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Qualidade de Contratação</StatLabel>
            <StatNumber>{(recruitmentMetrics.qualityOfHire * 100).toFixed(0)}%</StatNumber>
          </Stat>
        </SimpleGrid>

        <Heading size="sm" mb={3}>Principais Fontes de Candidatos</Heading>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Fonte</Th>
              <Th isNumeric>Candidatos</Th>
              <Th isNumeric>Contratações</Th>
              <Th isNumeric>Qualidade</Th>
            </Tr>
          </Thead>
          <Tbody>
            {recruitmentMetrics.topSources.map((source, index) => (
              <Tr key={index}>
                <Td>{source.name}</Td>
                <Td isNumeric>{source.candidates}</Td>
                <Td isNumeric>{source.hires}</Td>
                <Td isNumeric>
                  <Badge colorScheme={source.quality > 0.85 ? 'green' : source.quality > 0.7 ? 'yellow' : 'red'}>
                    {(source.quality * 100).toFixed(0)}%
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    )
  }

  // Renderizar análise de retenção
  const renderRetentionAnalysis = () => {
    const { retentionAnalysis } = dashboardData.hr

    if (!retentionAnalysis) {
      return <Text>Dados de retenção não disponíveis</Text>
    }

    // Dados para gráfico de barras
    const barData = {
      labels: retentionAnalysis.retentionByDepartment.map(d => d.department),
      datasets: [
        {
          label: 'Taxa de Retenção',
          data: retentionAnalysis.retentionByDepartment.map(d => d.retention * 100),
          backgroundColor: 'rgba(66, 153, 225, 0.6)',
          borderColor: 'rgba(66, 153, 225, 1)',
          borderWidth: 1
        }
      ]
    }

    // Opções do gráfico
    const barOptions = {
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: 'Retenção (%)'
          }
        }
      },
      maintainAspectRatio: false
    }

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaUsers} />
            <Text>Análise de Retenção</Text>
          </HStack>
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box>
            <Stat mb={4}>
              <StatLabel>Retenção Geral</StatLabel>
              <StatNumber>{(retentionAnalysis.overallRetention * 100).toFixed(1)}%</StatNumber>
            </Stat>
            
            <Stat mb={4}>
              <StatLabel>Funcionários em Risco</StatLabel>
              <StatNumber>{retentionAnalysis.atRiskEmployees}</StatNumber>
            </Stat>
            
            <Heading size="sm" mb={3}>Fatores-Chave de Retenção</Heading>
            {retentionAnalysis.keyFactors.map((factor, index) => (
              <Box key={index} mb={3}>
                <HStack mb={1} justify="space-between">
                  <Text>{factor.factor}</Text>
                  <Text fontWeight="bold">{(factor.impact * 100).toFixed(0)}%</Text>
                </HStack>
                <Progress 
                  value={factor.impact * 100} 
                  size="sm" 
                  colorScheme="blue" 
                  borderRadius="full"
                />
              </Box>
            ))}
          </Box>
          
          <Box height="300px">
            <Bar data={barData} options={barOptions} />
          </Box>
        </SimpleGrid>
      </Box>
    )
  }

  // Renderizar métricas de desempenho
  const renderPerformanceMetrics = () => {
    const { performanceMetrics } = dashboardData.hr

    if (!performanceMetrics) {
      return <Text>Dados de desempenho não disponíveis</Text>
    }

    // Dados para gráfico de distribuição de desempenho
    const distributionData = {
      labels: performanceMetrics.performanceDistribution.map(d => d.score),
      datasets: [
        {
          label: 'Funcionários',
          data: performanceMetrics.performanceDistribution.map(d => d.count),
          backgroundColor: 'rgba(72, 187, 120, 0.6)',
          borderColor: 'rgba(72, 187, 120, 1)',
          borderWidth: 1
        }
      ]
    }

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaChartLine} />
            <Text>Métricas de Desempenho</Text>
          </HStack>
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Box>
            <SimpleGrid columns={2} spacing={4} mb={6}>
              <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
                <StatLabel>Desempenho Médio</StatLabel>
                <StatNumber>{(performanceMetrics.averagePerformance * 100).toFixed(0)}%</StatNumber>
              </Stat>
              
              <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
                <StatLabel>Top Performers</StatLabel