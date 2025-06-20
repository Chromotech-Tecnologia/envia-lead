
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('AuthWrapper: Configurando listener de autenticação');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthWrapper: Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('AuthWrapper: Usuário logado, verificando perfil...');
          
          // Aguardar um pouco para o trigger processar
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('AuthWrapper: Erro ao buscar perfil:', error);
              } else {
                console.log('AuthWrapper: Perfil encontrado:', profile);
              }
            } catch (error) {
              console.error('AuthWrapper: Erro inesperado ao buscar perfil:', error);
            }
          }, 2000);
          
          if (location.pathname === '/auth') {
            console.log('AuthWrapper: Redirecionando para dashboard');
            navigate('/');
          }
        } else if (event === 'SIGNED_OUT' && location.pathname !== '/auth') {
          console.log('AuthWrapper: Usuário deslogado, redirecionando para auth');
          navigate('/auth');
        }
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthWrapper: Erro ao obter sessão:', error);
      } else {
        console.log('AuthWrapper: Sessão inicial:', session?.user?.email || 'Nenhuma sessão');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session && location.pathname !== '/auth') {
          console.log('AuthWrapper: Sem sessão, redirecionando para auth');
          navigate('/auth');
        } else if (session && location.pathname === '/auth') {
          console.log('AuthWrapper: Com sessão, redirecionando para dashboard');
          navigate('/');
        }
      }
      setLoading(false);
    });

    return () => {
      console.log('AuthWrapper: Removendo listener de autenticação');
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;
