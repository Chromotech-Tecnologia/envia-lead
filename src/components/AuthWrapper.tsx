
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
    console.log('=== AUTHWRAPPER: Configurando listener de autenticação ===');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTHWRAPPER: Auth state changed ===');
        console.log('Event:', event);
        console.log('Session:', session ? {
          user_id: session.user.id,
          user_email: session.user.email,
          expires_at: session.expires_at
        } : null);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session) {
          console.log('=== USUÁRIO LOGADO ===');
          
          // Verificar se perfil existe
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*, companies(*)')
            .eq('id', session.user.id)
            .single();
          
          console.log('Profile encontrado:', profile);
          console.log('Profile error:', profileError);
          
          if (location.pathname === '/auth') {
            console.log('Redirecionando para dashboard');
            navigate('/');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('=== USUÁRIO DESLOGADO ===');
          if (location.pathname !== '/auth') {
            console.log('Redirecionando para auth');
            navigate('/auth');
          }
        }
      }
    );

    // Verificar sessão inicial
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('=== ERRO AO OBTER SESSÃO ===', error);
      } else {
        console.log('=== SESSÃO INICIAL ===');
        console.log('Session:', session ? {
          user_id: session.user.id,
          user_email: session.user.email,
          expires_at: session.expires_at
        } : 'Nenhuma sessão');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session) {
          // Verificar se perfil existe
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*, companies(*)')
            .eq('id', session.user.id)
            .single();
          
          console.log('Profile inicial encontrado:', profile);
          console.log('Profile inicial error:', profileError);
          
          if (location.pathname === '/auth') {
            console.log('Com sessão, redirecionando para dashboard');
            navigate('/');
          }
        } else if (location.pathname !== '/auth') {
          console.log('Sem sessão, redirecionando para auth');
          navigate('/auth');
        }
      }
      setLoading(false);
    });

    return () => {
      console.log('=== AUTHWRAPPER: Removendo listener ===');
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
