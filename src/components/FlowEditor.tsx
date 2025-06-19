
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save,
  Plus,
  Trash2,
  GripVertical,
  MessageSquare,
  Type,
  CheckSquare,
  RadioButton,
  Settings,
  Eye,
  Mail,
  MessageCircle,
  Palette
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Switch,
} from "@/components/ui/switch";

interface FlowEditorProps {
  flow?: any;
  isEditing: boolean;
}

const FlowEditor = ({ flow, isEditing }: FlowEditorProps) => {
  const [flowData, setFlowData] = useState({
    name: flow?.name || 'Novo Fluxo',
    description: flow?.description || '',
    emails: flow?.emails || [''],
    whatsapp: flow?.whatsapp || '',
    avatar: flow?.avatar || '',
    position: flow?.position || 'bottom-right',
    urls: flow?.urls || [''],
    colors: {
      primary: flow?.colors?.primary || '#3B82F6',
      secondary: flow?.colors?.secondary || '#F8FAFC',
      text: flow?.colors?.text || '#1F2937',
      background: flow?.colors?.background || '#FFFFFF'
    },
    questions: flow?.questions || [
      {
        id: 1,
        type: 'text',
        title: 'Qual é o seu nome?',
        placeholder: 'Digite seu nome completo',
        required: true,
        order: 1
      }
    ],
    minimumQuestion: flow?.minimumQuestion || 3
  });

  const questionTypes = [
    { value: 'text', label: 'Texto Livre', icon: Type },
    { value: 'multiple', label: 'Múltipla Escolha', icon: CheckSquare },
    { value: 'single', label: 'Escolha Única', icon: RadioButton },
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'phone', label: 'Telefone', icon: MessageCircle }
  ];

  const positionOptions = [
    { value: 'bottom-right', label: 'Inferior Direito' },
    { value: 'bottom-left', label: 'Inferior Esquerdo' },
    { value: 'center', label: 'Centro da Tela' },
    { value: 'top-center', label: 'Superior Centralizado' },
    { value: 'bottom-center', label: 'Inferior Centralizado' }
  ];

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: 'text',
      title: 'Nova pergunta',
      placeholder: '',
      required: false,
      order: flowData.questions.length + 1,
      options: []
    };
    setFlowData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const removeQuestion = (id: number) => {
    setFlowData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setFlowData(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    }));
  };

  const addEmail = () => {
    setFlowData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const addUrl = () => {
    setFlowData(prev => ({
      ...prev,
      urls: [...prev.urls, '']
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {isEditing ? 'Editar Fluxo' : 'Criar Novo Fluxo'}
          </CardTitle>
          <CardDescription>
            Configure as perguntas, aparência e comportamento do seu chat
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Configurações Básicas</TabsTrigger>
          <TabsTrigger value="questions">Perguntas</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="integration">Integração</TabsTrigger>
        </TabsList>

        {/* Configurações Básicas */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Fluxo</Label>
                  <Input
                    id="name"
                    value={flowData.name}
                    onChange={(e) => setFlowData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Ex: Captação de Leads - Produtos"
                  />
                </div>
                
                <div>
                  <Label htmlFor="position">Posição na Tela</Label>
                  <Select value={flowData.position} onValueChange={(value) => setFlowData(prev => ({...prev, position: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={flowData.description}
                  onChange={(e) => setFlowData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Descreva o objetivo deste fluxo..."
                />
              </div>

              <div>
                <Label htmlFor="whatsapp">Número do WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={flowData.whatsapp}
                  onChange={(e) => setFlowData(prev => ({...prev, whatsapp: e.target.value}))}
                  placeholder="Ex: 5511999999999"
                />
              </div>
            </CardContent>
          </Card>

          {/* URLs de Exibição */}
          <Card>
            <CardHeader>
              <CardTitle>URLs de Exibição</CardTitle>
              <CardDescription>
                Configure em quais páginas este chat será exibido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {flowData.urls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...flowData.urls];
                      newUrls[index] = e.target.value;
                      setFlowData(prev => ({...prev, urls: newUrls}));
                    }}
                    placeholder="Ex: www.seusite.com/produtos"
                  />
                  {flowData.urls.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newUrls = flowData.urls.filter((_, i) => i !== index);
                        setFlowData(prev => ({...prev, urls: newUrls}));
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addUrl}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar URL
              </Button>
            </CardContent>
          </Card>

          {/* E-mails Destinatários */}
          <Card>
            <CardHeader>
              <CardTitle>E-mails Destinatários</CardTitle>
              <CardDescription>
                E-mails que receberão os leads capturados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {flowData.emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      const newEmails = [...flowData.emails];
                      newEmails[index] = e.target.value;
                      setFlowData(prev => ({...prev, emails: newEmails}));
                    }}
                    placeholder="email@exemplo.com"
                  />
                  {flowData.emails.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const newEmails = flowData.emails.filter((_, i) => i !== index);
                        setFlowData(prev => ({...prev, emails: newEmails}));
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" onClick={addEmail}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar E-mail
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Perguntas */}
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Editor de Perguntas</CardTitle>
                  <CardDescription>
                    Configure as perguntas do seu fluxo de conversa
                  </CardDescription>
                </div>
                <Button onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Pergunta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="minimumQuestion">Pergunta Mínima para Envio</Label>
                <Select 
                  value={flowData.minimumQuestion.toString()} 
                  onValueChange={(value) => setFlowData(prev => ({...prev, minimumQuestion: parseInt(value)}))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {flowData.questions.map((_, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        Pergunta {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  Leads que responderem até esta pergunta serão enviados mesmo que não concluam o fluxo
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {flowData.questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                      <Badge variant="outline">Pergunta {index + 1}</Badge>
                      <span className="font-medium">{question.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {question.required && (
                        <Badge variant="secondary">Obrigatória</Badge>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeQuestion(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tipo de Pergunta</Label>
                      <Select 
                        value={question.type} 
                        onValueChange={(value) => updateQuestion(question.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map(type => {
                            const Icon = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch 
                        id={`required-${question.id}`}
                        checked={question.required}
                        onCheckedChange={(checked) => updateQuestion(question.id, 'required', checked)}
                      />
                      <Label htmlFor={`required-${question.id}`}>Obrigatória</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Título da Pergunta</Label>
                    <Input
                      value={question.title}
                      onChange={(e) => updateQuestion(question.id, 'title', e.target.value)}
                      placeholder="Ex: Qual é o seu nome?"
                    />
                  </div>
                  
                  {(question.type === 'text' || question.type === 'email') && (
                    <div>
                      <Label>Placeholder</Label>
                      <Input
                        value={question.placeholder || ''}
                        onChange={(e) => updateQuestion(question.id, 'placeholder', e.target.value)}
                        placeholder="Texto de exemplo para o usuário"
                      />
                    </div>
                  )}
                  
                  {(question.type === 'multiple' || question.type === 'single') && (
                    <div>
                      <Label>Opções</Label>
                      <div className="space-y-2">
                        {(question.options || []).map((option, optIndex) => (
                          <div key={optIndex} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(question.options || [])];
                                newOptions[optIndex] = e.target.value;
                                updateQuestion(question.id, 'options', newOptions);
                              }}
                              placeholder={`Opção ${optIndex + 1}`}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
                                updateQuestion(question.id, 'options', newOptions);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newOptions = [...(question.options || []), ''];
                            updateQuestion(question.id, 'options', newOptions);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Opção
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Design */}
        <TabsContent value="design" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Personalização Visual
              </CardTitle>
              <CardDescription>
                Configure as cores e aparência do chat
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Esquema de Cores</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="primary-color" className="text-sm">Cor Principal</Label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          id="primary-color"
                          value={flowData.colors.primary}
                          onChange={(e) => setFlowData(prev => ({
                            ...prev,
                            colors: { ...prev.colors, primary: e.target.value }
                          }))}
                          className="w-12 h-10 border rounded"
                        />
                        <Input 
                          value={flowData.colors.primary}
                          onChange={(e) => setFlowData(prev => ({
                            ...prev,
                            colors: { ...prev.colors, primary: e.target.value }
                          }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="background-color" className="text-sm">Cor de Fundo</Label>
                      <div className="flex gap-2 mt-1">
                        <input
                          type="color"
                          id="background-color"
                          value={flowData.colors.background}
                          onChange={(e) => setFlowData(prev => ({
                            ...prev,
                            colors: { ...prev.colors, background: e.target.value }
                          }))}
                          className="w-12 h-10 border rounded"
                        />
                        <Input 
                          value={flowData.colors.background}
                          onChange={(e) => setFlowData(prev => ({
                            ...prev,
                            colors: { ...prev.colors, background: e.target.value }
                          }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Avatar do Atendente</Label>
                  <Input
                    value={flowData.avatar}
                    onChange={(e) => setFlowData(prev => ({...prev, avatar: e.target.value}))}
                    placeholder="URL da imagem do avatar"
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    URL da imagem que aparecerá como avatar do atendente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integração */}
        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Código de Integração</CardTitle>
              <CardDescription>
                Copie e cole este código no <code>&lt;head&gt;</code> do seu site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg">
                <code className="text-sm">
                  {`<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://leadgenpro.com/chat.js';
    script.setAttribute('data-flow-id', '${flow?.id || 'FLOW_ID'}');
    script.setAttribute('data-position', '${flowData.position}');
    script.setAttribute('data-primary-color', '${flowData.colors.primary}');
    document.head.appendChild(script);
  })();
</script>`}
                </code>
              </div>
              <Button variant="outline" className="mt-4">
                Copiar Código
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ações */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Visualizar
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Salvar Fluxo
        </Button>
      </div>
    </div>
  );
};

export default FlowEditor;
