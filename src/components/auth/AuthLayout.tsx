
import { ReactNode } from 'react';
import Logo from '@/components/Logo';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex">
      {/* Lado esquerdo - Imagem institucional */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-300 to-blue-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center p-16 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent h-full">
          {/* Logo centralizado */}
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo className="h-48 w-48 mb-6" />
            <p className="text-lg opacity-90">
              Plataforma completa de geração e envio de leads via chat inteligente
            </p>
          </div>
          
          {/* Lista de benefícios */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-base">Capte leads qualificados automaticamente</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-base">Integre facilmente em qualquer site</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-base">Aumente suas conversões com chat inteligente</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-base">Suporte 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6 lg:hidden">
              <Logo className="h-36 w-36" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bem-vindo
            </h2>
            <p className="text-gray-600 text-sm">
              Acesse sua conta ou crie uma nova
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
