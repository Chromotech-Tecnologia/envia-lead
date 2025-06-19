
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        if (session) {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Tentando fazer login com:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: error.message === "Invalid login credentials" 
            ? "Email ou senha incorretos" 
            : error.message,
        });
      } else {
        console.log('Login realizado com sucesso:', data);
        toast({
          title: "Login realizado com sucesso!",
          description: "Você será redirecionado...",
        });
      }
    } catch (error: any) {
      console.error('Erro inesperado no login:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Tentando criar conta para:', email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        console.error('Erro no cadastro:', error);
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: error.message === "User already registered" 
            ? "Este email já está cadastrado" 
            : error.message,
        });
      } else {
        console.log('Cadastro realizado:', data);
        if (data.user && !data.session) {
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu email para confirmar a conta.",
          });
        } else {
          toast({
            title: "Cadastro realizado com sucesso!",
            description: "Você já pode usar o sistema.",
          });
        }
      }
    } catch (error: any) {
      console.error('Erro inesperado no cadastro:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.message,
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir a senha.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex">
      {/* Lado esquerdo - Imagem institucional */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold mb-4">Envia Lead</h1>
            <p className="text-xl opacity-90 max-w-md">
              Plataforma completa de geração e envio de leads via chat inteligente
            </p>
            <div className="grid grid-cols-1 gap-4 mt-8 max-w-sm">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Capte leads qualificados automaticamente</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Integre facilmente em qualquer site</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Aumente suas conversões com chat inteligente</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bem-vindo ao Envia Lead
            </h2>
            <p className="text-gray-600">
              Acesse sua conta ou crie uma nova
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Fazer Login</CardTitle>
                  <CardDescription>
                    Entre com suas credenciais para acessar o sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
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
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Entrando..." : "Entrar"}
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-sm"
                      onClick={() => setActiveTab('reset')}
                    >
                      Esqueceu sua senha?
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Conta</CardTitle>
                  <CardDescription>
                    Preencha os dados para criar sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
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
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reset">
              <Card>
                <CardHeader>
                  <CardTitle>Recuperar Senha</CardTitle>
                  <CardDescription>
                    Digite seu email para receber instruções de recuperação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="resetEmail">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="resetEmail"
                          type="email"
                          placeholder="seu@email.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Enviando..." : "Enviar Email"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab('login')}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar ao Login
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
