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
  useToast,
  HStack,
  Checkbox
} from '@chakra-ui/react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'agreeTerms' ? checked : value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Você deve concordar com os termos e condições';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Aqui seria a chamada para a API de registro
      // const response = await authService.register(formData);
      
      // Simulando uma chamada de API bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Conta criada com sucesso!',
        description: 'Você já pode fazer login com suas credenciais.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Redirecionar para a página de login após o registro
      navigate('/login');
    } catch (error) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message || 'Ocorreu um erro ao processar seu registro. Tente novamente.',
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
      maxWidth="500px" 
      borderWidth={1} 
      borderRadius="lg" 
      borderColor={borderColor}
      boxShadow="lg"
      bg={bgColor}
      mx="auto"
    >
      <VStack spacing={4} align="flex-start" w="full">
        <VStack spacing={1} align="center" w="full">
          <Heading color={textColor}>Criar Conta</Heading>
          <Text>Registre-se para acessar a plataforma</Text>
        </VStack>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4} align="flex-start" w="full">
            <FormControl isInvalid={errors.name}>
              <FormLabel htmlFor="name">Nome Completo</FormLabel>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome completo"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.email}>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.password}>
              <FormLabel htmlFor="password">Senha</FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
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

            <FormControl isInvalid={errors.confirmPassword}>
              <FormLabel htmlFor="confirmPassword">Confirmar Senha</FormLabel>
              <InputGroup>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="******"
                />
                <InputRightElement>
                  <Button
                    variant="ghost"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    size="sm"
                  >
                    <Icon as={showConfirmPassword ? FaEyeSlash : FaEye} />
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.agreeTerms}>
              <HStack>
                <Checkbox
                  id="agreeTerms"
                  name="agreeTerms"
                  isChecked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <Text fontSize="sm">
                  Eu concordo com os{' '}
                  <Link as={RouterLink} to="/terms" color="blue.500">
                    Termos e Condições
                  </Link>
                </Text>
              </HStack>
              <FormErrorMessage>{errors.agreeTerms}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isLoading}
              loadingText="Criando conta..."
              mt={4}
            >
              Criar Conta
            </Button>
          </VStack>
        </form>

        <Text align="center" w="full">
          Já tem uma conta?{' '}
          <Link as={RouterLink} to="/login" color="blue.500">
            Faça login
          </Link>
        </Text>
      </VStack>
    </Box>
  );
};

export default Register;