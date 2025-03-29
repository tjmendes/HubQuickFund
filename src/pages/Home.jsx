import React, { useState, useEffect } from 'react'
import { Box, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Icon, useColorModeValue, VStack, Button, Flex, Heading, Divider, Text, Badge, Progress, HStack, Card, CardBody, CardHeader, useBreakpointValue, Skeleton, SkeletonText } from '@chakra-ui/react'
import { FaRocket, FaChartLine, FaMicrochip, FaRobot, FaArrowRight, FaUserTie, FaExchangeAlt, FaWallet, FaCoins, FaMoneyBillWave, FaChartPie, FaLock, FaShieldAlt } from 'react-icons/fa'
import MarketAnalytics from '../components/MarketAnalytics'
import EliteWhaleTracker from '../components/EliteWhaleTracker'
import { Link as RouterLink } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'

const StatCard = ({ title, value, description, icon, isLoading = false }) => {
  const bgColor = useColorModeValue('white', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.200')

  return (
    <Box p={{ base: 4, md: 6 }} bg={bgColor} rounded="xl" shadow="base" transition="all 0.3s" _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}>
      {isLoading ? (
        <>
          <Flex alignItems="center" mb={2}>
            <Skeleton height="24px" width="24px" mr={2} />
            <Skeleton height="20px" width="120px" />
          </Flex>
          <Skeleton height="28px" width="80px" mb={2} />
          <SkeletonText noOfLines={1} />
        </>
      ) : (
        <Stat>
          <Box display="flex" alignItems="center" mb={2}>
            <Icon as={icon} w={{ base: 5, md: 6 }} h={{ base: 5, md: 6 }} color="blue.500" mr={2} />
            <StatLabel fontSize={{ base: "md", md: "lg" }} color={textColor}>{title}</StatLabel>
          </Box>
          <StatNumber fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" color="blue.600">{value}</StatNumber>
          <StatHelpText color={textColor} fontSize={{ base: "xs", md: "sm" }}>{description}</StatHelpText>
        </Stat>
      )}
    </Box>
  )
}

const ProfitCard = ({ title, value, change, isPositive, icon }) => {
  const bgColor = useColorModeValue('white', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.200')
  
  return (
    <Card bg={bgColor} shadow="md" borderRadius="lg" overflow="hidden">
      <CardHeader pb={0}>
        <Flex justify="space-between" align="center">
          <Text fontWeight="medium" color={textColor}>{title}</Text>
          <Icon as={icon} color="blue.500" w={5} h={5} />
        </Flex>
      </CardHeader>
      <CardBody>
        <Text fontSize={{ base: "xl", md: "2xl" }} fontWeight="bold" mb={1}>{value}</Text>
        <Flex align="center">
          <Badge colorScheme={isPositive ? "green" : "red"} px={2} py={1} borderRadius="full">
            {isPositive ? "+" : ""}{change}
          </Badge>
          <Text ml={2} fontSize="sm" color={textColor}>últimas 24h</Text>
        </Flex>
      </CardBody>
    </Card>
  )
}

const Home = () => {
  // Detectar tipo de dispositivo
  const isMobile = useMediaQuery({ maxWidth: 767 })
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 })
  const isDesktop = useMediaQuery({ minWidth: 992 })
  
  // Ajustar layout com base no dispositivo
  const cardColumns = useBreakpointValue({ base: 1, sm: 2, md: 2, lg: 4 })
  const buttonSize = useBreakpointValue({ base: "md", md: "lg" })
  const headingSize = useBreakpointValue({ base: "md", md: "lg" })
  
  // Estado para simular carregamento
  const [isLoading, setIsLoading] = useState(true)
  
  // Estado para simular lucros
  const [profits, setProfits] = useState({
    total: 0,
    flashLoans: 0,
    defi: 0,
    mining: 0,
    ai: 0
  })
  
  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setProfits({
        total: 12567.89,
        flashLoans: 15.2,
        defi: 10.5,
        mining: 8.7,
        ai: 12.3
      })
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Simular aumento de lucros
  useEffect(() => {
    if (isLoading) return
    
    const interval = setInterval(() => {
  pa    setProfits(prev => ({
        total: prev.total * 1.0002,
        flashLoans: prev.flashLoans * 1.0003,
        defi: prev.defi * 1.0002,
        mining: prev.mining * 1.0001,
        ai: prev.ai * 1.0004
      }))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isLoading])
  
  // Formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  // Formatar percentuais
  const formatPercent = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100)
  }
  
  return (
    <VStack spacing={{ base: 4, md: 8 }} align="stretch">
      {/* Cabeçalho com lucro total */}
      <Box bg="blue.500" p={{ base: 4, md: 6 }} borderRadius="xl" color="white" mb={{ base: 2, md: 4 }}>
        <Heading size={headingSize} mb={2}>Lucro Total Acumulado</Heading>
        {isLoading ? (
          <Skeleton height="48px" width="200px" mb={2} />
        ) : (
          <Text fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold">
            {formatCurrency(profits.total)}
          </Text>
        )}
        <Progress 
          value={75} 
          size="sm" 
          colorScheme="blue" 
          bg="blue.700" 
          borderRadius="full" 
          mt={3} 
          isAnimated
          hasStripe
        />
      </Box>
      
      {/* Cards de estatísticas */}
      <SimpleGrid columns={cardColumns} spacing={{ base: 3, md: 6 }}>
        <StatCard
          title="Flash Loans"
          value={isLoading ? "--" : formatPercent(profits.flashLoans)}
          description="Lucro armazenado em cold wallets"
          icon={FaRocket}
          isLoading={isLoading}
        />
        <StatCard
          title="DeFi & Mineração"
          value={isLoading ? "--" : formatPercent(profits.defi)}
          description="Alocado para Yield Farming e Staking"
          icon={FaChartLine}
          isLoading={isLoading}
        />
        <StatCard
          title="Poder de Mineração"
          value={isLoading ? "--" : "10B TH"}
          description="Terahashes de poder computacional"
          icon={FaMicrochip}
          isLoading={isLoading}
        />
        <StatCard
          title="Bots IA"
          value={isLoading ? "--" : formatPercent(profits.ai)}
          description="Bots automatizados em operação"
          icon={FaRobot}
          isLoading={isLoading}
        />
      </SimpleGrid>
      
      {/* Cards de lucro */}
      <Heading size={headingSize} mt={{ base: 4, md: 8 }} mb={{ base: 2, md: 4 }} color="blue.600">Desempenho por Estratégia</Heading>
      <SimpleGrid columns={cardColumns} spacing={{ base: 3, md: 6 }}>
        <ProfitCard 
          title="Flash Loans" 
          value={formatCurrency(profits.total * 0.35)} 
          change="3.2%" 
          isPositive={true} 
          icon={FaWallet}
        />
        <ProfitCard 
          title="Arbitragem" 
          value={formatCurrency(profits.total * 0.25)} 
          change="2.8%" 
          isPositive={true} 
          icon={FaExchangeAlt}
        />
        <ProfitCard 
          title="Yield Farming" 
          value={formatCurrency(profits.total * 0.20)} 
          change="1.5%" 
          isPositive={true} 
          icon={FaCoins}
        />
        <ProfitCard 
          title="Trading IA" 
          value={formatCurrency(profits.total * 0.20)} 
          change="4.2%" 
          isPositive={true} 
          icon={FaRobot}
        />
      </SimpleGrid>
      
      <Divider my={{ base: 4, md: 8 }} />
      
      {/* Análise de mercado */}
      <Heading size={headingSize} mb={{ base: 2, md: 4 }} color="blue.600">Análise de Mercado</Heading>
      <Box overflow="hidden" borderRadius="xl">
        <MarketAnalytics />
      </Box>
      
      <Divider my={{ base: 4, md: 8 }} />
      
      {/* Rastreador de baleias */}
      <Heading size={headingSize} mb={{ base: 2, md: 4 }} color="blue.600">Elite Whale Tracker</Heading>
      <Box overflow="hidden" borderRadius="xl">
        <EliteWhaleTracker />
      </Box>
      
      {/* Botão de acesso ao QuickAI */}
      <Flex justifyContent="center" mt={{ base: 6, md: 10 }} mb={{ base: 4, md: 0 }}>
        <Button
          as={RouterLink}
          to="/quick-ai"
          size={buttonSize}
          colorScheme="blue"
          rightIcon={<FaArrowRight />}
          _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
          px={{ base: 4, md: 8 }}
          py={{ base: 6, md: 7 }}
        >
          {isMobile ? "Acessar QuickAI" : "Acessar QuickAI - Sistema Avançado de Operações Financeiras"}
        </Button>
      </Flex>
    </VStack>
  )
}

export default Home