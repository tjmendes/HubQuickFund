import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Progress,
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  CircularProgress,
  CircularProgressLabel,
  Stack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react'
import { 
  FaShieldAlt, 
  FaClipboardCheck, 
  FaExclamationTriangle, 
  FaFileAlt, 
  FaChartLine, 
  FaBalanceScale,
  FaGlobe,
  FaUserShield,
  FaLock,
  FaHistory,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaInfoCircle
} from 'react-icons/fa'
import { Line, Pie, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js'

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, ChartTooltip, Legend)

const ComplianceMonitor = () => {
  const [complianceData, setComplianceData] = useState({
    overallScore: 0,
    regulatoryCompliance: {
      score: 0,
      regulations: [],
      recentReports: []
    },
    amlCompliance: {
      score: 0,
      flaggedTransactions: [],
      riskDistribution: {}
    },
    kycCompliance: {
      score: 0,
      verificationRate: 0,
      pendingVerifications: []
    },
    auditHistory: [],
    regulatoryUpdates: []
  })
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  useEffect(() => {
    // Simular carregamento de dados de compliance
    const fetchComplianceData = async () => {
      setLoading(true)
      
      try {
        // Em produção, isso seria substituído por uma chamada real à API
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Dados simulados
        const mockData = {
          overallScore: 0.92,
          regulatoryCompliance: {
            score: 0.94,
            regulations: [
              { name: 'FATF Travel Rule', status: 'compliant', score: 0.98 },
              { name: 'MiCA', status: 'compliant', score: 0.95 },
              { name: 'BSA/AML', status: 'compliant', score: 0.92 },
              { name: 'GDPR', status: 'compliant', score: 0.97 },
              { name: 'SEC Guidelines', status: 'attention', score: 0.85 }
            ],
            recentReports: [
              { id: 'rep-001', type: 'dailySummary', date: '2023-12-15', status: 'submitted' },
              { id: 'rep-002', type: 'largeTransactionReport', date: '2023-12-14', status: 'submitted' },
              { id: 'rep-003', type: 'suspiciousActivityReport', date: '2023-12-12', status: 'submitted' }
            ]
          },
          amlCompliance: {
            score: 0.90,
            flaggedTransactions: [
              { id: 'tx-001', risk: 'medium', amount: 15000, asset: 'BTC', date: '2023-12-15' },
              { id: 'tx-002', risk: 'high', amount: 50000, asset: 'USDC', date: '2023-12-14' },
              { id: 'tx-003', risk: 'medium', amount: 12000, asset: 'ETH', date: '2023-12-13' }
            ],
            riskDistribution: {
              low: 85,
              medium: 12,
              high: 3
            }
          },
          kycCompliance: {
            score: 0.95,
            verificationRate: 0.98,
            pendingVerifications: [
              { id: 'user-001', level: 'advanced', submitted: '2023-12-14', status: 'pending' },
              { id: 'user-002', level: 'intermediate', submitted: '2023-12-15', status: 'pending' }
            ]
          },
          auditHistory: [
            { id: 'audit-001', date: '2023-12-01', score: 0.91, findings: 2, status: 'resolved' },
            { id: 'audit-002', date: '2023-11-01', score: 0.89, findings: 3, status: 'resolved' },
            { id: 'audit-003', date: '2023-10-01', score: 0.87, findings: 4, status: 'resolved' }
          ],
          regulatoryUpdates: [
            { id: 'reg-001', jurisdiction: 'EU', regulation: 'MiCA Phase 2', effectiveDate: '2024-01-15', status: 'pending' },
            { id: 'reg-002', jurisdiction: 'US', regulation: 'SEC Crypto Guidance', effectiveDate: '2024-02-01', status: 'pending' }
          ]
        }
        
        setComplianceData(mockData)
      } catch (error) {
        console.error('Erro ao carregar dados de compliance:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchComplianceData()
    
    // Atualizar dados a cada 5 minutos
    const interval = setInterval(() => {
      fetchComplianceData()
    }, 300000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Dados para gráfico de pontuação de compliance ao longo do tempo
  const complianceScoreData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Pontuação de Compliance',
        data: [0.85, 0.87, 0.86, 0.88, 0.89, 0.91, 0.90, 0.92, 0.91, 0.93, 0.92, 0.94],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  }
  
  // Dados para gráfico de distribuição de risco
  const riskDistributionData = {
    labels: ['Baixo Risco', 'Médio Risco', 'Alto Risco'],
    datasets: [
      {
        data: [complianceData.amlCompliance.riskDistribution.low || 0, 
               complianceData.amlCompliance.riskDistribution.medium || 0, 
               complianceData.amlCompliance.riskDistribution.high || 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  }
  
  // Função para renderizar badge de status
  const renderStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'compliant':
        return <Badge colorScheme="green">Conforme</Badge>
      case 'attention':
        return <Badge colorScheme="yellow">Atenção</Badge>
      case 'non-compliant':
        return <Badge colorScheme="red">Não Conforme</Badge>
      case 'pending':
        return <Badge colorScheme="blue">Pendente</Badge>
      case 'submitted':
        return <Badge colorScheme="teal">Enviado</Badge>
      case 'resolved':
        return <Badge colorScheme="green">Resolvido</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }
  
  // Função para renderizar badge de risco
  const renderRiskBadge = (risk) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return <Badge colorScheme="green">Baixo</Badge>
      case 'medium':
        return <Badge colorScheme="yellow">Médio</Badge>
      case 'high':
        return <Badge colorScheme="red">Alto</Badge>
      default:
        return <Badge>{risk}</Badge>
    }
  }
  
  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <CircularProgress isIndeterminate color="blue.500" />
        <Text mt={4}>Carregando dados de compliance...</Text>
      </Box>
    )
  }
  
  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>Monitor de Compliance e Regulação</Heading>
      
      {/* Visão geral de compliance */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={6}>
        <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Pontuação Geral de Compliance</StatLabel>
              <HStack>
                <StatNumber>{(complianceData.overallScore * 100).toFixed(1)}%</StatNumber>
                <CircularProgress value={complianceData.overallScore * 100} color="green.400" size="50px">
                  <CircularProgressLabel>{(complianceData.overallScore * 100).toFixed(0)}%</CircularProgressLabel>
                </CircularProgress>
              </HStack>
              <StatHelpText>
                <StatArrow type="increase" />
                2.3% desde o último mês
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Compliance Regulatório</StatLabel>
              <HStack>
                <StatNumber>{(complianceData.regulatoryCompliance.score * 100).toFixed(1)}%</StatNumber>
                <Icon as={FaBalanceScale} color="blue.500" w={6} h={6} />
              </HStack>
              <StatHelpText>
                {complianceData.regulatoryCompliance.regulations.length} regulações monitoradas
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Compliance AML</StatLabel>
              <HStack>
                <StatNumber>{(complianceData.amlCompliance.score * 100).toFixed(1)}%</StatNumber>
                <Icon as={FaShieldAlt} color="green.500" w={6} h={6} />
              </HStack>
              <StatHelpText>
                {complianceData.amlCompliance.flaggedTransactions.length} transações sinalizadas
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <StatLabel>Compliance KYC</StatLabel>
              <HStack>
                <StatNumber>{(complianceData.kycCompliance.score * 100).toFixed(1)}%</StatNumber>
                <Icon as={FaUserShield} color="purple.500" w={6} h={6} />
              </HStack>
              <StatHelpText>
                Taxa de verificação: {(complianceData.kycCompliance.verificationRate * 100).toFixed(1)}%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Alertas de compliance */}
      {complianceData.regulatoryCompliance.regulations.some(reg => reg.status === 'attention' || reg.status === 'non-compliant') && (
        <Alert status="warning" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Atenção necessária!</AlertTitle>
          <AlertDescription>
            Existem questões de compliance que precisam de atenção imediata.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Tabs para diferentes aspectos de compliance */}
      <Tabs colorScheme="blue" variant="enclosed" index={activeTab} onChange={setActiveTab} mb={6}>
        <TabList>
          <Tab><Icon as={FaBalanceScale} mr={2} /> Regulatório</Tab>
          <Tab><Icon as={FaShieldAlt} mr={2} /> Anti-Lavagem de Dinheiro</Tab>
          <Tab><Icon as={FaUserShield} mr={2} /> KYC</Tab>
          <Tab><Icon as={FaHistory} mr={2} /> Auditoria</Tab>
          <Tab><Icon as={FaGlobe} mr={2} /> Atualizações Regulatórias</Tab>
        </TabList>
        
        <TabPanels>
          {/* Tab de Compliance Regulatório */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Status de Regulações</Heading>
                </CardHeader>
                <CardBody>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Regulação</Th>
                        <Th>Status</Th>
                        <Th isNumeric>Pontuação</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {complianceData.regulatoryCompliance.regulations.map((regulation, index) => (
                        <Tr key={index}>
                          <Td>{regulation.name}</Td>
                          <Td>{renderStatusBadge(regulation.status)}</Td>
                          <Td isNumeric>{(regulation.score * 100).toFixed(1)}%</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
              
              <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Relatórios Recentes</Heading>
                </CardHeader>
                <CardBody>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Tipo</Th>
                        <Th>Data</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {complianceData.regulatoryCompliance.recentReports.map((report, index) => (
                        <Tr key={index}>
                          <Td>{report.id}</Td>
                          <Td>{report.type}</Td>
                          <Td>{report.date}</Td>
                          <Td>{renderStatusBadge(report.status)}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Tab de Anti-Lavagem de Dinheiro */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Transações Sinalizadas</Heading>
                </CardHeader>
                <CardBody>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Risco</Th>
                        <Th>Valor</Th>
                        <Th>Ativo</Th>
                        <Th>Data</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {complianceData.amlCompliance.flaggedTransactions.map((transaction, index) => (
                        <Tr key={index}>
                          <Td>{transaction.id}</Td>
                          <Td>{renderRiskBadge(transaction.risk)}</Td>
                          <Td>{transaction.amount.toLocaleString('pt-BR')}</Td>
                          <Td>{transaction.asset}</Td>
                          <Td>{transaction.date}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
              
              <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Distribuição de Risco</Heading>
                </CardHeader>
                <CardBody>
                  <Box h="250px">
                    <Pie data={riskDistributionData} options={{ maintainAspectRatio: false }} />
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Tab de KYC */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Verificações Pendentes</Heading>
                </CardHeader>
                <CardBody>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Nível</Th>
                        <Th>Enviado</Th>
                        <Th>Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {complianceData.kycCompliance.pendingVerifications.length > 0 ? (
                        complianceData.kycCompliance.pendingVerifications.map((verification, index) => (
                          <Tr key={index}>
                            <Td>{verification.id}</Td>
                            <Td>{verification.level}</Td>
                            <Td>{verification.submitted}</Td>
                            <Td>{renderStatusBadge(verification.status)}</Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={4} textAlign="center">Nenhuma verificação pendente</Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
              
              <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
                <CardHeader>
                  <Heading size="md">Estatísticas de KYC</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text mb={2}>Taxa de Verificação</Text>
                      <Progress value={complianceData.kycCompliance.verificationRate * 100} colorScheme="green" borderRadius="md" />
                      <Text mt={1} fontSize="sm" textAlign="right">
                        {(complianceData.kycCompliance.verificationRate * 100).toFixed(1)}%
                      </Text>
                    </Box>
                    
                    <Box>
                      <Text mb={2}>Pontuação de KYC</Text>
                      <Progress value={complianceData.kycCompliance.score * 100} colorScheme="purple" borderRadius="md" />
                      <Text mt={1} fontSize="sm" textAlign="right">
                        {(complianceData.kycCompliance.score * 100).toFixed(1)}%
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
          
          {/* Tab de Auditoria */}
          <TabPanel>
            <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Histórico de Auditoria</Heading>
              </CardHeader>
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Data</Th>
                      <Th isNumeric>Pontuação</Th>
                      <Th isNumeric>Descobertas</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {complianceData.auditHistory.map((audit, index) => (
                      <Tr key={index}>
                        <Td>{audit.id}</Td>
                        <Td>{audit.date}</Td>
                        <Td isNumeric>{(audit.score * 100).toFixed(1)}%</Td>
                        <Td isNumeric>{audit.findings}</Td>
                        <Td>{renderStatusBadge(audit.status)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
            
            <Box mt={6}>
              <Heading size="md" mb={4}>Tendência de Compliance</Heading>
              <Box h="300px">
                <Line data={complianceScoreData} options={{ maintainAspectRatio: false }} />
              </Box>
            </Box>
          </TabPanel>
          
          {/* Tab de Atualizações Regulatórias */}
          <TabPanel>
            <Card bg={bgColor} boxShadow="md" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Atualizações Regulatórias Pendentes</Heading>
              </CardHeader>
              <CardBody>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Jurisdição</Th>
                      <Th>Regulação</Th>
                      <Th>Data Efetiva</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {complianceData.regulatoryUpdates.length > 0 ? (
                      complianceData.regulatoryUpdates.map((update, index) => (
                        <Tr key={index}>
                          <Td>{update.id}</Td>
                          <Td>{update.jurisdiction}</Td>
                          <Td>{update.regulation}</Td>
                          <Td>{update.effectiveDate}</Td>
                          <Td>{renderStatusBadge(update.status)}</Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={5} textAlign="center">Nenhuma atualização regulatória pendente</Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
            
            <Accordion allowToggle mt={6}>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <HStack>
                        <Icon as={FaInfoCircle} color="blue.500" />
                        <Text fontWeight="bold">Sobre Compliance Regulatório</Text>
                      </HStack>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Text>
                    O sistema de compliance regulatório monitora continuamente as operações para garantir conformidade com regulações financeiras globais. 
                    Utilizamos inteligência artificial avançada para analisar transações em tempo real e identificar potenciais riscos regulatórios antes que se tornem problemas.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}

export default ComplianceMonitor