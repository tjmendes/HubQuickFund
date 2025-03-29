import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import App from './App'

// Importar serviços de otimização e compliance
import { initializeAllServices } from './services'
import { initializePlatformServices } from './services/platformService'

// Tema responsivo para diferentes dispositivos
const theme = extendTheme({
  breakpoints: {
    sm: '320px',
    md: '768px',
    lg: '960px',
    xl: '1200px',
    '2xl': '1536px',
  },
  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  colors: {
    brand: {
      50: '#e6f1fe',
      100: '#cce3fd',
      200: '#99c7fb',
      300: '#66aaf9',
      400: '#338ef7',
      500: '#0072f5', // Cor principal
      600: '#005bc4',
      700: '#004493',
      800: '#002e62',
      900: '#001731',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
    },
    Card: {
      baseStyle: {
        p: '4',
        borderRadius: 'lg',
        boxShadow: 'sm',
      },
    },
  },
});

// Componente principal para inicialização
const Root = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Inicializar serviços específicos da plataforma
    initializePlatformServices().then(platformSuccess => {
      console.log(`Inicialização de serviços da plataforma ${platformSuccess ? 'concluída com sucesso' : 'falhou'}`);
      
      // Inicializar todos os serviços de negócio
      return initializeAllServices();
    }).then(success => {
      console.log(`Inicialização de serviços de negócio ${success ? 'concluída com sucesso' : 'falhou'}`);
      setInitialized(true);
    }).catch(err => {
      console.error('Erro ao inicializar serviços:', err);
      setError(err.message || 'Erro desconhecido');
    });
    
    // Solicitar permissão para notificações web
    if ('Notification' in window) {
      Notification.requestPermission();
    }
  }, []);

  return (
    <React.StrictMode>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <App initialized={initialized} error={error} />
        </ChakraProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Root />)