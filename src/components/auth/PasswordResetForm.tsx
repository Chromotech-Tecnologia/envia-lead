
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from 'lucide-react';

interface PasswordResetFormProps {
  onBackToLogin: () => void;
}

const PasswordResetForm = ({ onBackToLogin }: PasswordResetFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { toast } = useToast();

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
            onClick={onBackToLogin}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PasswordResetForm;
