import React from 'react';
import ProfitHistory from '../components/user/ProfitHistory';
import { Box, Container } from '@chakra-ui/react';

const ProfitHistoryPage = () => {
  return (
    <Container maxW="container.xl">
      <Box py={8}>
        <ProfitHistory />
      </Box>
    </Container>
  );
};

export default ProfitHistoryPage;