import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';
import subscriptionService from '../services/subscriptionService';

// Criação do contexto de autenticação
const AuthContext = createContext(null);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => useContext(AuthContext);

// Provedor do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar usuário atual do localStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const user = authService.getCurrentUser();
        
        if (user) {
          setCurrentUser(user);
          
          // Carregar detalhes da assinatura
          const subscriptionDetails = authService.getSubscriptionDetails();
          if (subscriptionDetails) {
            const planDetails = subscriptionService.getPlanById(subscriptionDetails.planId);
            setSubscription({
              ...subscriptionDetails,
              planDetails
            });
          }
        }
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar usuário:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Função para login
  const login = async (email, password) => {
    try {
      setLoading(true);
      const user = await authService.login(email, password);
      setCurrentUser(user);
      
      // Carregar detalhes da assinatura após login
      const subscriptionDetails = authService.getSubscriptionDetails();
      if (subscriptionDetails) {
        const planDetails = subscriptionService.getPlanById(subscriptionDetails.planId);
        setSubscription({
          ...subscriptionDetails,
          planDetails
        });
      }
      
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função para registro
  const register = async (userData) => {
    try {
      setLoading(true);
      const user = await authService.register(userData);
      setCurrentUser(user);
      
      // Carregar detalhes da assinatura após registro
      const subscriptionDetails = authService.getSubscriptionDetails();
      if (subscriptionDetails) {
        const planDetails = subscriptionService.getPlanById(subscriptionDetails.planId);
        setSubscription({
          ...subscriptionDetails,
          planDetails
        });
      }
      
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Função para logout
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setSubscription(null);
  };

  // Função para atualizar assinatura
  const updateSubscription = async (planId, durationDays) => {
    try {
      setLoading(true);
      const updatedSubscription = await authService.updateSubscription(planId, durationDays);
      
      // Atualizar detalhes da assinatura
      const planDetails = subscriptionService.getPlanById(planId);
      setSubscription({
        ...updatedSubscription,
        planDetails
      });
      
      return updatedSubscription;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verificar se a assinatura está ativa
  const isSubscriptionActive = () => {
    if (!subscription) return false;
    return subscriptionService.isSubscriptionActive(subscription);
  };

  // Valor do contexto
  const value = {
    currentUser,
    subscription,
    loading,
    error,
    login,
    register,
    logout,
    updateSubscription,
    isSubscriptionActive
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};