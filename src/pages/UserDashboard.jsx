import React from 'react';
import UserDashboard from '../components/user/UserDashboard';
import { Box, Container } from '@chakra-ui/react';

const UserDashboardPage = () => {
  return (
    <Container maxW="container.xl">
      <Box py={8}>
        <UserDashboard />
      </Box>
    </Container>
  );
};

export default UserDashboardPage;