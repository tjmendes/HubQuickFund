import React from 'react';
import SubscriptionDetails from '../components/subscription/SubscriptionDetails';
import { Box, Container } from '@chakra-ui/react';

const SubscriptionDetailsPage = () => {
  return (
    <Container maxW="container.xl">
      <Box py={8}>
        <SubscriptionDetails />
      </Box>
    </Container>
  );
};

export default SubscriptionDetailsPage;