import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import ChatPage from './pages/ChatPage';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si está autenticado, mostrar el chat
  // Si no, mostrar la página de login
  return isAuthenticated ? <ChatPage /> : <AuthPage />;
}

export default App;