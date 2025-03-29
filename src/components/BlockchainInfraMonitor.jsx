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
  Tooltip,
  Select
} from '@chakra-ui/react';
import { 
  FaServer, 
  FaDatabase, 
  FaNetworkWired, 
  FaMemory, 
  FaShieldAlt, 
  FaHistory, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaChartLine,
  FaCubes
} from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Legend);

// Importar o serviço de monitoramento
const blockchainInfraMonitor = new (require('../services/blockchainInfraMonitor').default)();

const BlockchainInfraMonitor = () => {
  const [monitorData, setMonitorData] = useState({
    compute: { current: 0, latency: 0, trend: 'stable' },
    memory: { current: 0, available: 0, trend: 'stable' },
    storage: { current: 0, available: 0, trend: 'stable' },
    network: { current: 0, bandwidth: 0, trend: 'stable' },
    verification: { consensusLevel: 0, verifiedEntries: 0, lastAuditTimestamp: 0 },
    status: { healthy: true, alerts: 0, uptime: 0 },
    alerts: [],
    auditLogs: []
  });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60); // segundos
  const [selectedMetric, setSelectedMetric] = useState('cpu');

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const headingColor = useColorModeValue('blue.600', 'blue.300');

  // Configurações do gráfico
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Métricas de Infraestrutura' }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Carregar dados do monitor
  useEffect(() => {
    const fetchMonitorData = async () => {
      setIsLoading(true);
      try {
        // Inicializar o monitor se ainda não foi inicializado
        if (!blockchainInfraMonitor.lastUpdate) {
          await blockchainInfraMonitor.initialize();
        }
        
        // Obter dados do monitor
        const data = blockchainInfraMonitor.getMetricsSummary();
        setMonitorData(data);
        
        // Atualizar dados do gráfico
        updateChartData(data, selectedMetric);
      } catch (error) {
        console.error('Erro ao carregar dados do monitor:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonitorData();

    // Configurar atualização periódica
    const intervalId = setInterval(fetchMonitorData, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [refreshInterval, selectedMetric]);

  // Atualizar dados do gráfico
  const updateChartData = (data, metricType) => {
    // Simulação de dados históricos para o gráfico
    const timeLabels = Array.from({length: 24}, (_, i) => `${i}:00`);
    
    // Gerar dados baseados no tipo de métrica selecionada
    let metricData;
    let metricColor;
    
    switch (metricType) {
      case 'cpu':
        metricData = Array.from({length: 24}, (_, i) => 
          Math.max(20, Math.min(95, data.compute.current + (Math.random() * 20 - 10))));
        metricColor = 'rgb(255, 99, 132)';
        break;
      case 'memory':
        metricData = Array.from({length: 24}, (_, i) => 
          Math.max(30, Math.min(90, data.memory.current + (Math.random() * 15 - 7.5))));
        metricColor = 'rgb(54, 162, 235)';
        break;
      case 'storage':
        metricData = Array.from({length: 24}, (_, i) => 
          Math.max(40, Math.min(85, data.storage.current + (Math.random() * 10 - 5))));
        metricColor = 'rgb(255, 206, 86)';
        break;
      case 'network':
        metricData = Array.from({length: 24}, (_, i) => 
          Math.max(10, Math.min(80, data.network.current + (Math.random() * 25 - 12.5))));
        metricColor = 'rgb(75, 192, 192)';
        break;
      case 'consensus':
        metricData = Array.from({length: 24}, (_, i) => 
          Math.max(0.7, Math.min(1.0, data.verification.consensusLevel + (Math.random() * 0.1 - 0.05))) * 100);
        metricColor = 'rgb(153, 102, 255)';
        break;
      default:
        metricData = Array.from({length: 24}, () => Math.random() * 100);
        metricColor = 'rgb(75, 192, 192)';
    }
    
    setChartData({
      labels: timeLabels,
      datasets: [{
        label: getMetricLabel(metricType),
        data: metricData,
        borderColor: metricColor,
        backgroundColor: metricColor.replace(')', ', 0.2)').replace('rgb', 'rgba'),
        tension: 0.3
      }]
    });
  };

  // Obter rótulo da métrica
  const getMetricLabel = (metricType) => {
    switch (metricType) {
      case 'cpu': return 'Utilização de CPU (%)';
      case 'memory': return 'Utilização de Memória (%)';
      case 'storage': return 'Utilização de Armazenamento (%)';
      case 'network': return 'Utilização de Rede (%)';
      case 'consensus': return 'Nível de Consenso (%)';
      default: return 'Valor';
    }
  };

  // Formatar timestamp para data legível
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Renderizar seção de métricas de computação
  const renderComputeMetrics = () => {
    const { compute } = monitorData;

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaServer} />
            <Text>Métricas de Computação</Text>
          </HStack>
        </Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Utilização de CPU</StatLabel>
            <StatNumber>{compute.current ? `${compute.current.toFixed(1)}%` : 'N/A'}</StatNumber>
            <Progress
              mt={2}
              value={compute.current || 0}
              size="sm"
              colorScheme={
                (compute.current || 0) > 80 ? 'red' :
                (compute.current || 0) > 60 ? 'yellow' :
                'green'
              }
              rounded="full"
            />
            <StatHelpText>
              {compute.trend === 'increasing' ? (
                <>
                  <StatArrow type="increase" />
                  Em alta
                </>
              ) : compute.trend === 'decreasing' ? (
                <>
                  <StatArrow type="decrease" />
                  Em queda
                </>
              ) : (
                'Estável'
              )}
            </StatHelpText>
          </Stat>

          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Latência</StatLabel>
            <StatNumber>{compute.latency ? `${compute.latency.toFixed(1)}ms` : 'N/A'}</StatNumber>
            <Progress
              mt={2}
              value={Math.min(100, (compute.latency || 0) / 2)}
              size="sm"
              colorScheme={
                (compute.latency || 0) > 150 ? 'red' :
                (compute.latency || 0) > 80 ? 'yellow' :
                'green'
              }
              rounded="full"
            />
          </Stat>
        </Grid>
      </Box>
    );
  };

  // Renderizar seção de métricas de memória e armazenamento
  const renderStorageMetrics = () => {
    const { memory, storage } = monitorData;

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaDatabase} />
            <Text>Memória e Armazenamento</Text>
          </HStack>
        </Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Utilização de Memória</StatLabel>
            <StatNumber>{memory.current ? `${memory.current.toFixed(1)}%` : 'N/A'}</StatNumber>
            <Progress
              mt={2}
              value={memory.current || 0}
              size="sm"
              colorScheme={
                (memory.current || 0) > 80 ? 'red' :
                (memory.current || 0) > 60 ? 'yellow' :
                'green'
              }
              rounded="full"
            />
            <StatHelpText>
              Disponível: {memory.available ? `${memory.available.toFixed(1)}%` : 'N/A'}
            </StatHelpText>
          </Stat>

          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Utilização de Armazenamento</StatLabel>
            <StatNumber>{storage.current ? `${storage.current.toFixed(1)}%` : 'N/A'}</StatNumber>
            <Progress
              mt={2}
              value={storage.current || 0}
              size="sm"
              colorScheme={
                (storage.current || 0) > 85 ? 'red' :
                (storage.current || 0) > 70 ? 'yellow' :
                'green'
              }
              rounded="full"
            />
            <StatHelpText>
              Disponível: {storage.available ? `${storage.available.toFixed(1)}%` : 'N/A'}
            </StatHelpText>
          </Stat>
        </Grid>
      </Box>
    );
  };

  // Renderizar seção de métricas de rede
  const renderNetworkMetrics = () => {
    const { network } = monitorData;

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaNetworkWired} />
            <Text>Métricas de Rede</Text>
          </HStack>
        </Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Utilização de Rede</StatLabel>
            <StatNumber>{network.current ? `${network.current.toFixed(1)}%` : 'N/A'}</StatNumber>
            <Progress
              mt={2}
              value={network.current || 0}
              size="sm"
              colorScheme={
                (network.current || 0) > 75 ? 'red' :
                (network.current || 0) > 50 ? 'yellow' :
                'green'
              }
              rounded="full"
            />
            <StatHelpText>
              {network.trend === 'increasing' ? (
                <>
                  <StatArrow type="increase" />
                  Em alta
                </>
              ) : network.trend === 'decreasing' ? (
                <>
                  <StatArrow type="decrease" />
                  Em queda
                </>
              ) : (
                'Estável'
              )}
            </StatHelpText>
          </Stat>

          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Largura de Banda</StatLabel>
            <StatNumber>{network.bandwidth ? `${network.bandwidth.toFixed(1)} Mbps` : 'N/A'}</StatNumber>
            <Progress
              mt={2}
              value={Math.min(100, (network.bandwidth || 0) / 10)}
              size="sm"
              colorScheme="blue"
              rounded="full"
            />
          </Stat>
        </Grid>
      </Box>
    );
  };

  // Renderizar seção de verificação blockchain
  const renderBlockchainVerification = () => {
    const { verification } = monitorData;

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaCubes} />
            <Text>Verificação Blockchain</Text>
          </HStack>
        </Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Nível de Consenso</StatLabel>
            <StatNumber>{verification.consensusLevel ? `${(verification.consensusLevel * 100).toFixed(1)}%` : 'N/A'}</StatNumber>
            <Progress
              mt={2}
              value={(verification.consensusLevel || 0) * 100}
              size="sm"
              colorScheme={
                (verification.consensusLevel || 0) > 0.95 ? 'green' :
                (verification.consensusLevel || 0) > 0.85 ? 'blue' :
                'yellow'
              }
              rounded="full"
            />
          </Stat>

          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Entradas Verificadas</StatLabel>
            <StatNumber>{verification.verifiedEntries?.toLocaleString() || 'N/A'}</StatNumber>
            <StatHelpText>
              Última auditoria: {formatTimestamp(verification.lastAuditTimestamp)}
            </StatHelpText>
          </Stat>
        </Grid>
      </Box>
    );
  };

  // Renderizar seção de status do sistema
  const renderSystemStatus = () => {
    const { status } = monitorData;

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaShieldAlt} />
            <Text>Status do Sistema</Text>
          </HStack>
        </Heading>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Estado</StatLabel>
            <HStack>
              <Icon 
                as={status.healthy ? FaCheckCircle : FaExclamationTriangle} 
                color={status.healthy ? 'green.500' : 'red.500'} 
                w={6} 
                h={6} 
              />
              <StatNumber>{status.healthy ? 'Saudável' : 'Alerta'}</StatNumber>
            </HStack>
          </Stat>

          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Alertas Ativos</StatLabel>
            <StatNumber>{status.alerts || 0}</StatNumber>
            <Badge colorScheme={status.alerts > 0 ? 'red' : 'green'}>
              {status.alerts > 0 ? 'Atenção Necessária' : 'Tudo Normal'}
            </Badge>
          </Stat>

          <Stat p={3} bg={useColorModeValue('gray.50', 'gray.800')} rounded="md">
            <StatLabel>Tempo de Atividade</StatLabel>
            <StatNumber>
              {status.uptime ? `${Math.floor(status.uptime / (1000 * 60 * 60))}h ${Math.floor((status.uptime / (1000 * 60)) % 60)}m` : 'N/A'}
            </StatNumber>
          </Stat>
        </Grid>
      </Box>
    );
  };

  // Renderizar gráfico de métricas
  const renderMetricsChart = () => {
    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <HStack justify="space-between" mb={4}>
          <Heading size="md" color={headingColor}>
            <HStack>
              <Icon as={FaChartLine} />
              <Text>Histórico de Métricas</Text>
            </HStack>
          </Heading>
          
          <Select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            w="200px"
          >
            <option value="cpu">CPU</option>
            <option value="memory">Memória</option>
            <option value="storage">Armazenamento</option>
            <option value="network">Rede</option>
            <option value="consensus">Consenso</option>
          </Select>
        </HStack>
        
        <Box h="300px">
          <Line options={chartOptions} data={chartData} />
        </Box>
      </Box>
    );
  };

  // Renderizar histórico de auditoria
  const renderAuditHistory = () => {
    // Simulação de dados de auditoria
    const auditLogs = [
      { timestamp: Date.now() - 86400000, type: 'audit', result: 'success', verifiedEntries: 1245 },
      { timestamp: Date.now() - 172800000, type: 'audit', result: 'success', verifiedEntries: 1120 },
      { timestamp: Date.now() - 259200000, type: 'audit', result: 'warning', verifiedEntries: 980 }
    ];

    return (
      <Box p={4} bg={bgColor} rounded="lg" shadow="md" borderWidth="1px" borderColor={borderColor}>
        <Heading size="md" mb={4} color={headingColor}>
          <HStack>
            <Icon as={FaHistory} />
            <Text>Histórico de Auditoria</Text>
          </HStack>
        </Heading>

        {auditLogs.length > 0 ? (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Data</Th>
                <Th>Tipo</Th>
                <Th>Resultado</Th>
                <Th>Entradas Verificadas</Th>
              </Tr>
            </Thead>
            <Tbody>
              {auditLogs.map((log, index) => (
                <Tr key={index}>
                  <Td>{formatTimestamp(log.timestamp)}</Td>
                  <Td>{log.type}</Td>
                  <Td>
                    <Badge colorScheme={log.result === 'success' ? 'green' : log.result === 'warning' ? 'yellow' : 'red'}>
                      {log.result}
                    </Badge>
                  </Td>
                  <Td isNumeric>{log.verifiedEntries.toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text>Nenhum registro de auditoria disponível</Text>
        )}
      </Box>
    );
  };

  return (
    <Box p={4}>
      <HStack mb={6} justify="space-between" align="center">
        <Heading size="lg">Monitoramento de Infraestrutura Blockchain</Heading>
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
          {renderComputeMetrics()}
          {renderNetworkMetrics()}
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {renderStorageMetrics()}
          {renderBlockchainVerification()}
        </Grid>

        {renderSystemStatus()}
        {renderMetricsChart()}
        {renderAuditHistory()}

        <Box textAlign="right" fontSize="sm" color={textColor}>
          <Text>Última atualização: {formatTimestamp(Date.now())}</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default BlockchainInfraMonitor;