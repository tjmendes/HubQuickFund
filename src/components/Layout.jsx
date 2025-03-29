import React, { useState, useEffect } from 'react'
import { Box, Flex, VStack, Heading, Text, Link, Icon, Divider, useColorModeValue, Container, Spacer, IconButton, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure, HStack, Button, Badge, Avatar, Menu, MenuButton, MenuList, MenuItem, MenuDivider, useBreakpointValue, Image } from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { FaHome, FaChartLine, FaRobot, FaExchangeAlt, FaServer, FaCubes, FaUserTie, FaBullseye, FaRocket, FaBars, FaBell, FaWallet, FaUser, FaCog, FaSignOutAlt, FaChevronDown, FaCoins } from 'react-icons/fa'
import { useMediaQuery } from 'react-responsive'

const navItems = [
  { name: 'Home', path: '/', icon: FaHome },
  { name: 'Inteligência Competitiva', path: '/competitive-intelligence', icon: FaChartLine },
  { name: 'Análise Preditiva', path: '/predictive-analytics', icon: FaRobot },
  { name: 'Trading Avançado', path: '/advanced-trading', icon: FaExchangeAlt },
  { name: 'Infraestrutura', path: '/infrastructure', icon: FaServer },
  { name: 'Monitoramento Blockchain', path: '/blockchain-monitor', icon: FaCubes },
  { name: 'Rastreador de Baleias', path: '/elite-whale-tracker', icon: FaUserTie },
  { name: 'Análises Avançadas', path: '/advanced-analytics', icon: FaBullseye },
  { name: 'QuickAI', path: '/quick-ai', icon: FaRocket }
]

const Layout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const location = useLocation()
  
  // Detectar tipo de dispositivo
  const isMobile = useMediaQuery({ maxWidth: 767 })
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 991 })
  const isDesktop = useMediaQuery({ minWidth: 992 })
  
  // Cores
  const bgColor = useColorModeValue('white', 'gray.800')
  const navBgColor = useColorModeValue('white', 'gray.900')
  const sidebarBgColor = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const activeColor = useColorModeValue('blue.600', 'blue.400')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  // Ajustar layout com base no dispositivo
  const showSidebar = useBreakpointValue({ base: false, lg: true })
  const containerPadding = useBreakpointValue({ base: 4, md: 8 })
  const logoSize = useBreakpointValue({ base: "sm", md: "md" })
  
  // Simular notificações
  const [notifications, setNotifications] = useState(3)
  const [balance, setBalance] = useState(12567.89)
  
  // Formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }
  
  // Verificar se um item de navegação está ativo
  const isActive = (path) => {
    return location.pathname === path
  }
  
  // Renderizar item de navegação para a barra lateral
  const NavItem = ({ item }) => {
    const active = isActive(item.path)
    
    return (
      <Link
        as={RouterLink}
        to={item.path}
        display="flex"
        alignItems="center"
        py={3}
        px={4}
        borderRadius="md"
        fontWeight={active ? "semibold" : "normal"}
        color={active ? activeColor : textColor}
        bg={active ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
        _hover={{
          bg: useColorModeValue('gray.100', 'gray.700'),
          color: active ? activeColor : useColorModeValue('gray.800', 'white')
        }}
        onClick={isMobile ? onClose : undefined}
      >
        <Icon as={item.icon} mr={3} boxSize={5} />
        <Text>{isMobile || isDesktop ? item.name : item.name.split(' ')[0]}</Text>
        {active && (
          <Box ml="auto" w={1} h={6} bg={activeColor} borderRadius="full" />
        )}
      </Link>
    )
  }
  
  // Renderizar barra lateral
  const Sidebar = () => (
    <Box
      as="aside"
      position="fixed"
      left={0}
      w={"250px"}
      h="calc(100vh - 70px)"
      bg={sidebarBgColor}
      borderRight="1px"
      borderColor={borderColor}
      overflowY="auto"
      display={{ base: 'none', lg: 'block' }}
      pt={4}
    >
      <VStack spacing={1} align="stretch" px={2}>
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </VStack>
      
      <Divider my={6} />
      
      <Box px={6} py={4}>
        <Text fontWeight="medium" mb={2} color={textColor}>Saldo Disponível</Text>
        <Flex align="center">
          <Icon as={FaWallet} color="green.500" mr={2} />
          <Text fontWeight="bold" fontSize="xl">{formatCurrency(balance)}</Text>
        </Flex>
      </Box>
    </Box>
  )
  
  // Renderizar menu móvel
  const MobileDrawer = () => (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">
          <Flex align="center">
            <Heading size="md" color="blue.600">QuickFundHub</Heading>
            <DrawerCloseButton />
          </Flex>
        </DrawerHeader>
        <DrawerBody p={0}>
          <VStack spacing={0} align="stretch">
            {navItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </VStack>
          
          <Divider my={4} />
          
          <Box px={6} py={4}>
            <Text fontWeight="medium" mb={2} color={textColor}>Saldo Disponível</Text>
            <Flex align="center">
              <Icon as={FaWallet} color="green.500" mr={2} />
              <Text fontWeight="bold" fontSize="xl">{formatCurrency(balance)}</Text>
            </Flex>
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
  
  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Barra de navegação superior */}
      <Box as="nav" bg={navBgColor} boxShadow="sm" py={3} position="sticky" top={0} zIndex={1000}>
        <Container maxW="container.xl" px={containerPadding}>
          <Flex align="center" justify="space-between">
            {/* Logo e botão do menu móvel */}
            <Flex align="center">
              {!showSidebar && (
                <IconButton
                  icon={<FaBars />}
                  variant="ghost"
                  onClick={onOpen}
                  aria-label="Abrir menu"
                  mr={3}
                  display={{ base: 'flex', lg: 'none' }}
                />
              )}
              <Flex align="center">
              <Image src="/images/quickai-logo.svg" alt="QuickAI Logo" height="40px" mr={2} />
              <Heading size={logoSize} color="blue.600">QuickFundHub</Heading>
            </Flex>
            </Flex>
            
            {/* Menu de navegação para tablets */}
            {isTablet && (
              <HStack spacing={4} display={{ base: 'none', md: 'flex', lg: 'none' }}>
                {navItems.slice(0, 4).map((item) => (
                  <Link
                    key={item.path}
                    as={RouterLink}
                    to={item.path}
                    px={3}
                    py={2}
                    borderRadius="md"
                    fontWeight={isActive(item.path) ? "semibold" : "normal"}
                    color={isActive(item.path) ? activeColor : textColor}
                    _hover={{ color: activeColor }}
                  >
                    <Icon as={item.icon} mr={1} />
                    <Text as="span" display="inline">
                      {item.name.split(' ')[0]}
                    </Text>
                  </Link>
                ))}
              </HStack>
            )}
            
            {/* Ícones de ação */}
            <HStack spacing={{ base: 2, md: 4 }}>
              {/* Notificações */}
              <Box position="relative">
                <IconButton
                  icon={<FaBell />}
                  variant="ghost"
                  aria-label="Notificações"
                  size={isMobile ? "sm" : "md"}
                />
                {notifications > 0 && (
                  <Badge
                    position="absolute"
                    top="0"
                    right="0"
                    transform="translate(25%, -25%)"
                    borderRadius="full"
                    colorScheme="red"
                    fontSize="xs"
                    px={1.5}
                  >
                    {notifications}
                  </Badge>
                )}
              </Box>
              
              {/* Menu do usuário */}
              <Menu>
                <MenuButton
                  as={Button}
                  variant="ghost"
                  rightIcon={<FaChevronDown />}
                  size={isMobile ? "sm" : "md"}
                >
                  <HStack spacing={2}>
                    <Avatar size="xs" name="Usuário" />
                    {!isMobile && <Text>Usuário</Text>}
                  </HStack>
                </MenuButton>
                <MenuList zIndex={1001}>
                  <MenuItem icon={<FaUser />}>Perfil</MenuItem>
                  <MenuItem icon={<FaWallet />}>Carteira</MenuItem>
                  <MenuItem icon={<FaCoins />}>Transações</MenuItem>
                  <MenuItem icon={<FaCog />}>Configurações</MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<FaSignOutAlt />}>Sair</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Flex>
        </Container>
      </Box>
      
      {/* Conteúdo principal */}
      <Box pt={4} pb={8}>
        <Container maxW="container.xl" px={containerPadding}>
          <Flex>
            {/* Barra lateral para desktop */}
            {showSidebar && <Sidebar />}
            
            {/* Conteúdo principal */}
            <Box
              flex="1"
              ml={showSidebar ? "250px" : 0}
              transition="margin 0.3s"
            >
              {children}
            </Box>
          </Flex>
        </Container>
      </Box>
      
      {/* Menu móvel */}
      <MobileDrawer />
    </Box>
  )
}

export default Layout