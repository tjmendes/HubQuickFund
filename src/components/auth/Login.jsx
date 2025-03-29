import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useColorModeValue,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Icon,
  useToast
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Aqui seria a chamada para a API de autenticação
      // const response = await authService.login(email, password);
      
      // Simulando uma chamada de API bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Login realizado com sucesso!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Redirecionar para a página principal após o login
      navigate('/');
    } catch (error) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message || 'Verifique suas credenciais e tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      p={8} 
      maxWidth="400px" 
      borderWidth={1} 
      borderRadius="lg" 
      borderColor={borderColor}
      boxShadow="lg"
      bg={bgColor}
      mx="auto"
    >
      <VStack spacing={4} align="flex-start" w="full">
        <VStack spacing={1} align="center" w="full">
          <Heading color={textColor}>Entrar</Heading>
          <Text>Acesse sua conta para continuar</Text>
        </VStack>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4} align="flex-start" w="full">
            <FormControl isInvalid={errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.password}>
              <FormLabel htmlFor="password">Senha</FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                />
                <InputRightElement>
                  <Button
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    size="sm"
                  >
                    <Icon as={showPassword ? FaEyeSlash : FaEye} />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isLoading}
              loadingText="Entrando..."
            >
              Entrar
            </Button>
          </VStack>
        </form>

        <VStack spacing={1} align="center" w="full">
          <Text>
            Não tem uma conta?{' '}
            <Link as={RouterLink} to="/register" color="blue.500">
              Registre-se
            </Link>
          </Text>
          <Link as={RouterLink} to="/forgot-password" color="blue.500">
            Esqueceu sua senha?
          </Link>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Login;