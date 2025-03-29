import React from 'react';
import Register from '../components/auth/Register';
import { Box, Container, Flex } from '@chakra-ui/react';

const RegisterPage = () => {
  return (
    <Container maxW="container.xl">
      <Flex minH="80vh" align="center" justify="center">
        <Register />
      </Flex>
    </Container>
  );
};

export default RegisterPage;