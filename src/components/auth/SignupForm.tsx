
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react';

const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('=== INICIANDO CADASTRO ===');
      console.log('Email:', email);
      console.log('Nome completo:', fullName);
      console.log('Nome da empresa:', companyName);

      // Primeiro, verificar se o usuário já existe
      const { data: existingUser } = await supabase.auth.getUser();
      if (existingUser.user) {
        console.log('Usuário já está logado, fazendo logout primeiro');
        await supabase.auth.signOut();
      }

      // Tentar criar o usuário
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
            company_name: companyName,
          }
        }
      });

      console.log('=== RESULTADO DO SIGNUP ===');
      console.log('Data:', signUpData);
      console.log('Error:', signUpError);

      if (signUpError) {
        console.error('Erro no signup:', signUpError);
        
        let errorMessage = signUpError.message;
        if (signUpError.message.includes("User already registered")) {
          errorMessage = "Este email já está cadastrado. Tente fazer login.";
        } else if (signUpError.message.includes("Password should be at least")) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres.";
        } else if (signUpError.message.includes("Invalid email")) {
          errorMessage = "Email inválido. Verifique o formato.";
        }

        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: errorMessage,
        });
        return;
      }

      if (signUpData.user) {
        console.log('=== USUÁRIO CRIADO COM SUCESSO ===');
        console.log('User ID:', signUpData.user.id);
        console.log('User email:', signUpData.user.email);
        console.log('User metadata:', signUpData.user.user_metadata);

        // Aguardar um pouco para o trigger processar
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verificar se o perfil foi criado
        console.log('=== VERIFICANDO PERFIL CRIADO ===');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*, companies(*)')
          .eq('id', signUpData.user.id)
          .single();

        console.log('Profile data:', profileData);
        console.log('Profile error:', profileError);

        // Verificar empresas criadas
        console.log('=== VERIFICANDO EMPRESAS ===');
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('email', email);

        console.log('Companies data:', companiesData);
        console.log('Companies error:', companiesError);

        if (signUpData.session) {
          console.log('Usuário logado automaticamente');
          toast({
            title: "Organização criada com sucesso!",
            description: "Bem-vindo! Sua conta foi criada e você já está logado.",
          });
        } else {
          console.log('Usuário criado, aguardando confirmação por email');
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar a conta antes de fazer login.",
          });
        }
      } else {
        console.error('Nenhum usuário retornado do cadastro');
        toast({
          variant: "destructive",
          title: "Erro inesperado",
          description: "Não foi possível criar a conta. Tente novamente.",
        });
      }
    } catch (error: any) {
      console.error('=== ERRO INESPERADO ===', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Organização</CardTitle>
        <CardDescription>
          Crie sua organização e comece a capturar leads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da Organização</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="companyName"
                type="text"
                placeholder="Nome da sua empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="pl-10"
                required
                minLength={2}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome do Administrador</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
                required
                minLength={2}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signupEmail">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="signupEmail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signupPassword">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="signupPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-sm text-gray-500">Mínimo de 6 caracteres</p>
          </div>
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Criando organização..." : "Criar Organização"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignupForm;
