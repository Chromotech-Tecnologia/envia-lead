
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

  const createProfileIfNotExists = async (user: User) => {
    try {
      console.log('AuthWrapper: Verificando/criando perfil para usuário:', user.id);
      
      // Primeiro, verificar se já existe
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('AuthWrapper: Erro ao verificar perfil existente:', fetchError);
        return;
      }

      if (existingProfile) {
        console.log('AuthWrapper: Perfil já existe:', existingProfile);
        return;
      }

      console.log('AuthWrapper: Perfil não existe, criando...');

      // Criar empresa primeiro
      const companyName = user.user_metadata?.company_name || 'Nova Empresa';
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          email: user.email,
          status: 'trial'
        })
        .select()
        .single();

      if (companyError) {
        console.error('AuthWrapper: Erro ao criar empresa:', companyError);
        return;
      }

      console.log('AuthWrapper: Empresa criada:', company);

      // Criar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email || '',
          company_id: company.id,
          role: 'admin',
          is_active: true
        })
        .select()
        .single();

      if (profileError) {
        console.error('AuthWrapper: Erro ao criar perfil:', profileError);
        return;
      }

      console.log('AuthWrapper: Perfil criado com sucesso:', profile);
    } catch (error) {
      console.error('AuthWrapper: Erro inesperado ao criar perfil:', error);
    }
  };

  useEffect(() => {
    console.log('AuthWrapper: Configurando listener de autenticação');
    let mounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) {
          console.log('AuthWrapper: Componente desmontado, ignorando evento');
          return;
        }
        
        console.log('AuthWrapper: Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthWrapper: Usuário logado, verificando/criando perfil...');
          
          // Aguardar um pouco e tentar criar perfil se necessário
          setTimeout(() => {
            createProfileIfNotExists(session.user).catch(error => {
              console.error('Erro ao criar perfil:', error);
            });
          }, 1000);
          
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
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('AuthWrapper: Erro ao obter sessão:', error);
      } else {
        console.log('AuthWrapper: Sessão inicial:', session?.user?.email || 'Nenhuma sessão');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Verificar/criar perfil para sessão existente
          await createProfileIfNotExists(session.user);
        }
        
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
      mounted = false;
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
