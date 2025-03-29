import React from 'react';
import SubscriptionPlans from '../components/subscription/SubscriptionPlans';
import { Box, Container } from '@chakra-ui/react';

const SubscriptionPlansPage = () => {
  return (
    <Container maxW="container.xl">
      <Box py={8}>
        <SubscriptionPlans />
      </Box>
    </Container>
  );
};

export default SubscriptionPlansPage;