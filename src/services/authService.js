// Serviço de autenticação para gerenciar usuários
class AuthService {
  constructor() {
    // Inicializa o armazenamento local para usuários se não existir
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]));
    }
    
    // Inicializa o usuário atual do localStorage se existir
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
  }

  // Registrar um novo usuário
  async register(userData) {
    try {
      // Simula uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const users = JSON.parse(localStorage.getItem('users'));
      
      // Verifica se o email já está em uso
      if (users.some(user => user.email === userData.email)) {
        throw new Error('Este email já está em uso.');
      }
      
      // Cria um novo usuário com plano gratuito por padrão
      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: userData.password, // Em um app real, isso seria criptografado
        subscription: {
          planId: 'free',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 dia
          isActive: true
        },
        profits: [],
        totalProfit: 0,
        createdAt: new Date().toISOString()
      };
      
      // Adiciona o novo usuário à lista
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Retorna o usuário sem a senha
      const { password, ...userWithoutPassword } = newUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Login de usuário
  async login(email, password) {
    try {
      // Simula uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const users = JSON.parse(localStorage.getItem('users'));
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Email ou senha inválidos.');
      }
      
      // Armazena o usuário atual no localStorage (sem a senha)
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      this.currentUser = userWithoutPassword;
      
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Logout de usuário
  logout() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
  }

  // Verifica se o usuário está autenticado
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Obtém o usuário atual
  getCurrentUser() {
    return this.currentUser;
  }

  // Verifica se a assinatura do usuário está ativa
  isSubscriptionActive() {
    if (!this.currentUser) return false;
    
    const { subscription } = this.currentUser;
    if (!subscription) return false;
    
    return subscription.isActive && new Date(subscription.endDate) > new Date();
  }

  // Obtém os detalhes da assinatura do usuário atual
  getSubscriptionDetails() {
    if (!this.currentUser) return null;
    return this.currentUser.subscription;
  }

  // Atualiza a assinatura do usuário
  async updateSubscription(planId, durationDays) {
    try {
      if (!this.currentUser) throw new Error('Usuário não autenticado');
      
      // Simula uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const users = JSON.parse(localStorage.getItem('users'));
      const userIndex = users.findIndex(u => u.id === this.currentUser.id);
      
      if (userIndex === -1) throw new Error('Usuário não encontrado');
      
      // Calcula a nova data de término da assinatura
      const startDate = new Date().toISOString();
      let endDate;
      
      if (durationDays === 0) { // Plano ilimitado
        endDate = new Date(9999, 11, 31).toISOString();
      } else {
        endDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
      }
      
      // Atualiza a assinatura do usuário
      users[userIndex].subscription = {
        planId,
        startDate,
        endDate,
        isActive: true
      };
      
      // Atualiza o localStorage
      localStorage.setItem('users', JSON.stringify(users));
      
      // Atualiza o usuário atual
      const { password, ...userWithoutPassword } = users[userIndex];
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      this.currentUser = userWithoutPassword;
      
      return userWithoutPassword.subscription;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();