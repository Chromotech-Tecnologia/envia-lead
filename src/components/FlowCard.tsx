
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Copy, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FloatingChatButton from './FloatingChatButton';

interface FlowCardProps {
  flow: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const FlowCard = ({ flow, onEdit, onDelete, onDuplicate }: FlowCardProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getQuestionCount = () => {
    return flow.questions?.length || 0;
  };

  const getUrlCount = () => {
    return flow.flow_urls?.length || 0;
  };

  const getEmailCount = () => {
    return flow.flow_emails?.length || 0;
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  // Preparar dados do fluxo para o FloatingChatButton (igual ao editor)
  const prepareFlowDataForPreview = () => {
    return {
      id: flow.id,
      name: flow.name,
      description: flow.description,
      welcome_message: flow.welcome_message || 'Olá! Como posso ajudá-lo hoje?',
      avatar_url: flow.avatar_url,
      whatsapp: flow.whatsapp,
      show_whatsapp_button: flow.show_whatsapp_button,
      colors: {
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
        .sort((a: any, b: any) => a.order_index - b.order_index) : []
    };
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                {flow.name}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 mb-3">
                {flow.description || 'Sem descrição'}
              </CardDescription>
              
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={flow.is_active ? "default" : "secondary"}>
                  {flow.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
                
                {flow.primary_color && (
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: flow.primary_color }}
                    title="Cor primária"
                  />
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem onClick={() => onEdit(flow.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(flow.id)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(flow.id)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
            <div>
              <span className="font-medium">{getQuestionCount()}</span>
              <br />
              <span className="text-xs">Perguntas</span>
            </div>
            <div>
              <span className="font-medium">{getUrlCount()}</span>
              <br />
              <span className="text-xs">URLs</span>
            </div>
            <div>
              <span className="font-medium">{getEmailCount()}</span>
              <br />
              <span className="text-xs">E-mails</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mb-4">
            Criado em {formatDate(flow.created_at)}
            {flow.updated_at !== flow.created_at && (
              <span> • Atualizado em {formatDate(flow.updated_at)}</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handlePreviewToggle}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Ocultar Preview' : 'Preview'}
            </Button>
            
            <Button
              onClick={() => onEdit(flow.id)}
              size="sm"
              className="flex-1 envia-lead-gradient hover:opacity-90"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview do Chat - Usando o mesmo componente do editor */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Preview - {flow.name}</h3>
              <Button
                onClick={handlePreviewToggle}
                variant="ghost"
                size="sm"
              >
                ✕
              </Button>
            </div>
            
            <div className="relative bg-gradient-to-b from-blue-50 to-white rounded-lg h-96 overflow-hidden">
              <div className="p-6 text-center">
                <h4 className="text-xl font-bold text-gray-800 mb-2">Seu Site</h4>
                <p className="text-gray-600 text-sm">Preview de como o chat aparecerá</p>
              </div>
              
              <FloatingChatButton
                flowData={prepareFlowDataForPreview()}
                position={flow.button_position || 'bottom-right'}
                onHidePreview={handlePreviewToggle}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FlowCard;
