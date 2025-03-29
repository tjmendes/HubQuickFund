import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, Spinner, Flex } from '@chakra-ui/react';

// Componente para proteger rotas que requerem autenticação
const ProtectedRoute = ({ children, requireSubscription = false }) => {
  const { currentUser, loading, isSubscriptionActive } = useAuth();
  const location = useLocation();

  // Exibir spinner enquanto verifica autenticação
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar se a assinatura é necessária e está ativa
  if (requireSubscription && !isSubscriptionActive()) {
    return <Navigate to="/subscription-plans" state={{ from: location }} replace />;
  }

  // Renderizar o conteúdo protegido
  return children;
};

export default ProtectedRoute;