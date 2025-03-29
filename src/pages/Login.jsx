import React from 'react';
import Login from '../components/auth/Login';
import { Box, Container, Flex } from '@chakra-ui/react';

const LoginPage = () => {
  return (
    <Container maxW="container.xl">
      <Flex minH="80vh" align="center" justify="center">
        <Login />
      </Flex>
    </Container>
  );
};

export default LoginPage;