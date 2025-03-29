// Serviço para gerenciar assinaturas e pagamentos
class SubscriptionService {
  constructor() {
    // Inicializa o armazenamento local para assinaturas se não existir
    if (!localStorage.getItem('subscriptions')) {
      localStorage.setItem('subscriptions', JSON.stringify([]));
    }
  }

  // Planos de assinatura disponíveis
  getSubscriptionPlans() {
    return [
      {
        id: 'free',
        name: 'Teste Gratuito',
        duration: '1 dia',
        price: 'Grátis',
        durationDays: 1,
        profitFeePercentage: 5
      },
      {
        id: 'basic',
        name: 'Básico',
        duration: '7 dias',
        price: 'R$ 49,90',
        durationDays: 7,
        profitFeePercentage: 5
      },
      {
        id: 'standard',
        name: 'Padrão',
        duration: '15 dias',
        price: 'R$ 89,90',
        durationDays: 15,
        profitFeePercentage: 5
      },
      {
        id: 'premium',
        name: 'Premium',
        duration: '30 dias',
        price: 'R$ 149,90',
        durationDays: 30,
        profitFeePercentage: 5
      },
      {
        id: 'elite',
        name: 'Elite',
        duration: '180 dias',
        price: 'R$ 699,90',
        durationDays: 180,
        profitFeePercentage: 5
      },
      {
        id: 'pro',
        name: 'Profissional',
        duration: '365 dias',
        price: 'R$ 1.299,90',
        durationDays: 365,
        profitFeePercentage: 5
      },
      {
        id: 'unlimited',
        name: 'Ilimitado',
        duration: 'Vitalício',
        price: 'R$ 4.999,90',
        durationDays: 0, // 0 significa ilimitado
        profitFeePercentage: 5
      }
    ];
  }

  // Obter detalhes de um plano específico
  getPlanById(planId) {
    const plans = this.getSubscriptionPlans();
    return plans.find(plan => plan.id === planId);
  }

  // Processar um novo pagamento de assinatura
  async processSubscription(userId, planId, paymentDetails) {
    try {
      // Simula uma chamada de API para processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const plan = this.getPlanById(planId);
      if (!plan) throw new Error('Plano não encontrado');
      
      // Calcula a data de término da assinatura
      const startDate = new Date();
      let endDate;
      
      if (plan.durationDays === 0) { // Plano ilimitado
        endDate = new Date(9999, 11, 31); // Data muito distante no futuro
      } else {
        endDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
      }
      
      // Cria o registro da assinatura
      const subscription = {
        id: Date.now().toString(),
        userId,
        planId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        paymentDetails: {
          amount: plan.price,
          date: new Date().toISOString(),
          method: 'credit_card',
          last4: paymentDetails.cardNumber.slice(-4),
          status: 'completed'
        },
        profitFeePercentage: plan.profitFeePercentage,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      // Salva a assinatura no armazenamento local
      const subscriptions = JSON.parse(localStorage.getItem('subscriptions'));
      subscriptions.push(subscription);
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      
      return subscription;
    } catch (error) {
      throw error;
    }
  }

  // Verificar se uma assinatura está ativa
  isSubscriptionActive(subscription) {
    if (!subscription) return false;
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    
    return subscription.isActive && endDate > now;
  }

  // Calcular a taxa sobre o lucro
  calculateProfitFee(profit, profitFeePercentage = 5) {
    return (profit * profitFeePercentage) / 100;
  }

  // Obter assinaturas de um usuário
  getUserSubscriptions(userId) {
    const subscriptions = JSON.parse(localStorage.getItem('subscriptions'));
    return subscriptions.filter(sub => sub.userId === userId);
  }

  // Obter a assinatura ativa de um usuário
  getActiveSubscription(userId) {
    const userSubscriptions = this.getUserSubscriptions(userId);
    return userSubscriptions.find(sub => this.isSubscriptionActive(sub));
  }

  // Cancelar uma assinatura
  async cancelSubscription(subscriptionId) {
    try {
      // Simula uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const subscriptions = JSON.parse(localStorage.getItem('subscriptions'));
      const index = subscriptions.findIndex(sub => sub.id === subscriptionId);
      
      if (index === -1) throw new Error('Assinatura não encontrada');
      
      // Atualiza o status da assinatura
      subscriptions[index].isActive = false;
      subscriptions[index].canceledAt = new Date().toISOString();
      
      localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
      
      return subscriptions[index];
    } catch (error) {
      throw error;
    }
  }
}

export default new SubscriptionService();