
import { Button } from "@/components/ui/button";
import FloatingChatButton from '../FloatingChatButton';

interface FlowPreviewModalProps {
  isOpen: boolean;
  flow: any;
  onClose: () => void;
}

const FlowPreviewModal = ({ isOpen, flow, onClose }: FlowPreviewModalProps) => {
  if (!isOpen) return null;

  // Preparar dados do fluxo para o FloatingChatButton com todas as configurações reais
  const prepareFlowDataForPreview = () => {
    console.log('[FlowPreviewModal] Dados do fluxo original:', flow);
    
    const flowData = {
      id: flow.id,
      name: flow.name,
      description: flow.description,
      welcome_message: flow.welcome_message || 'Olá! Como posso ajudá-lo hoje?',
      avatar_url: flow.avatar_url,
      whatsapp: flow.whatsapp,
      show_whatsapp_button: flow.show_whatsapp_button,
      buttonPosition: flow.position || 'bottom-right',
      chatPosition: flow.position || 'bottom-right',
      colors: flow.colors || {
        primary: flow.primary_color || '#FF6B35',
        secondary: flow.secondary_color || '#3B82F6',
        text: flow.text_color || '#1F2937',
        background: '#FFFFFF'
      },
      questions: flow.questions ? flow.questions
        .filter((q: any) => q.type !== 'bot_message')
        .map((q: any) => ({
          id: q.id,
          type: q.type,
          title: q.title,
          placeholder: q.placeholder,
          required: q.required,
          order_index: q.order_index || 0,
          options: q.options || []
        }))
        .sort((a: any, b: any) => a.order_index - b.order_index) : [
          {
            id: 1,
            type: 'text',
            title: 'Qual é o seu nome?',
            placeholder: 'Digite seu nome completo',
            required: true,
            order_index: 0
          }
        ]
    };
    
    console.log('[FlowPreviewModal] Dados preparados para preview:', flowData);
    return flowData;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full h-[600px] relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Preview - {flow.name}</h3>
            <p className="text-sm text-gray-600">
              Visualização com as configurações reais do fluxo
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            ✕
          </Button>
        </div>
        
        <div className="relative bg-gradient-to-b from-blue-50 to-white rounded-lg h-full overflow-hidden">
          <div className="p-6 text-center">
            <h4 className="text-xl font-bold text-gray-800 mb-2">Seu Site</h4>
            <p className="text-gray-600 text-sm">
              Preview de como o chat aparecerá com suas configurações
            </p>
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>• Cores: {flow.colors?.primary || '#FF6B35'} / {flow.colors?.secondary || '#3B82F6'}</p>
              <p>• Posição: {flow.position || 'bottom-right'}</p>
              <p>• Perguntas: {flow.questions?.length || 0}</p>
              {flow.avatar_url && <p>• Avatar configurado</p>}
            </div>
          </div>
          
          <FloatingChatButton
            flowData={prepareFlowDataForPreview()}
            position={flow.position || 'bottom-right'}
            onHidePreview={onClose}
            isPreview={true}
          />
        </div>
      </div>
    </div>
  );
};

export default FlowPreviewModal;
