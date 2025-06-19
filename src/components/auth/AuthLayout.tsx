
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
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
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
