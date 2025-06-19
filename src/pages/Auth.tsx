
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import PasswordResetForm from "@/components/auth/PasswordResetForm";
import Layout from "@/components/Layout";

const Auth = () => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

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

  const handleForgotPassword = () => {
    setActiveTab('reset');
  };

  const handleBackToLogin = () => {
    setActiveTab('login');
  };

  return (
    <Layout>
      <AuthLayout>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <LoginForm onForgotPassword={handleForgotPassword} />
          </TabsContent>

          <TabsContent value="signup">
            <SignupForm />
          </TabsContent>

          <TabsContent value="reset">
            <PasswordResetForm onBackToLogin={handleBackToLogin} />
          </TabsContent>
        </Tabs>
      </AuthLayout>
    </Layout>
  );
};

export default Auth;
