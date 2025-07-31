
import { ReactNode } from 'react';
import Logo from '@/components/Logo';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 flex">
      {/* Lado esquerdo - Imagem institucional */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 relative overflow-hidden">
        {/* Padrão decorativo de fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/20 via-transparent to-blue-400/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/20 to-black/30"></div>
        
        {/* Conteúdo principal */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white h-full">
          {/* Logo centralizado */}
          <div className="mb-12 flex flex-col items-center text-center animate-fade-in">
            <div className="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
              <Logo className="h-40 w-40" />
            </div>
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
              EnviaLead
            </h1>
            <p className="text-xl font-medium text-white/90 drop-shadow-md max-w-md leading-relaxed">
              Plataforma completa de geração e envio de leads via chat inteligente
            </p>
          </div>
          
          {/* Lista de benefícios */}
          <div className="space-y-6 max-w-md">
            <div className="flex items-center gap-4 group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="text-lg font-medium text-white drop-shadow-sm">Capte leads qualificados automaticamente</span>
            </div>
            <div className="flex items-center gap-4 group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="text-lg font-medium text-white drop-shadow-sm">Integre facilmente em qualquer site</span>
            </div>
            <div className="flex items-center gap-4 group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="text-lg font-medium text-white drop-shadow-sm">Aumente suas conversões com chat inteligente</span>
            </div>
            <div className="flex items-center gap-4 group hover:transform hover:scale-105 transition-all duration-300">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span className="text-lg font-medium text-white drop-shadow-sm">Suporte 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-white to-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 hover:shadow-3xl transition-shadow duration-300">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-6 lg:hidden">
                <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl">
                  <Logo className="h-32 w-32" />
                </div>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                Bem-vindo
              </h2>
              <p className="text-gray-600 text-base font-medium">
                Acesse sua conta ou crie uma nova
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
