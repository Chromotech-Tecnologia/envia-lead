
import { ReactNode } from 'react';
import Logo from '@/components/Logo';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex">
      {/* Lado esquerdo - Imagem institucional */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col items-center p-12 text-white h-full">
          {/* Logo e título mais acima e centralizados */}
          <div className="text-center mt-16 mb-12">
            <div className="flex flex-col items-center justify-center mb-8">
              <Logo className="h-48 w-48 mb-6" />
              <h1 className="text-5xl font-bold text-center">Envia Lead</h1>
            </div>
          </div>
          
          {/* Conteúdo principal centralizado */}
          <div className="flex-1 flex flex-col justify-center text-center space-y-6 max-w-md">
            <p className="text-xl opacity-90">
              Plataforma completa de geração e envio de leads via chat inteligente
            </p>
            <div className="grid grid-cols-1 gap-4 mt-8">
              <div className="flex items-center gap-3 text-sm justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Capte leads qualificados automaticamente</span>
              </div>
              <div className="flex items-center gap-3 text-sm justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Integre facilmente em qualquer site</span>
              </div>
              <div className="flex items-center gap-3 text-sm justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Aumente suas conversões com chat inteligente</span>
              </div>
            </div>
          </div>

          {/* Chat widget flutuante */}
          <div className="fixed bottom-8 left-8 flex items-center gap-4 z-50">
            {/* Mensagem de saudação vertical */}
            <div className="bg-white rounded-lg p-3 shadow-lg border max-w-xs">
              <div className="text-gray-800 text-sm">
                Olá! Como posso ajudá-lo?
              </div>
              <div className="absolute top-4 -right-2 w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
            </div>
            
            {/* Ícone do chat */}
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4 lg:hidden">
              <Logo className="h-10 w-10" />
              <h2 className="text-2xl font-bold text-gray-900">Envia Lead</h2>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 hidden lg:block">
              Bem-vindo ao Envia Lead
            </h2>
            <p className="text-gray-600">
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
