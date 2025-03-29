import React from 'react';
import ProfitWithdraw from '../components/user/ProfitWithdraw';
import { Box, Container } from '@chakra-ui/react';

const ProfitWithdrawPage = () => {
  return (
    <Container maxW="container.xl">
      <Box py={8}>
        <ProfitWithdraw />
      </Box>
    </Container>
  );
};

export default ProfitWithdrawPage;