import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Monitor,
  Smartphone,
  Globe,
  MessageSquare,
  MapPin
} from 'lucide-react';

interface LeadDetailsModalProps {
  lead: any;
  isOpen: boolean;
  onClose: () => void;
}

const LeadDetailsModal = ({ lead, isOpen, onClose }: LeadDetailsModalProps) => {
  if (!lead) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getDeviceIcon = (userAgent: string) => {
    if (!userAgent) return Monitor;
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return Smartphone;
    }
    return Monitor;
  };

  const DeviceIcon = getDeviceIcon(lead.user_agent);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Nome:</span>
                  <span>{lead.responses?.nome || lead.nome || 'Não informado'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Email:</span>
                  <span>{lead.responses?.email || lead.email || 'Não informado'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Telefone:</span>
                  <span>{lead.responses?.telefone || lead.telefone || 'Não informado'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Fluxo:</span>
                  <span>{lead.flows?.name || lead.fluxo || 'Não informado'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status e Timing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Status e Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <Badge variant={(lead.completed || lead.status === 'completo') ? 'default' : 'secondary'}>
                    {(lead.completed || lead.status === 'completo') ? 'Completo' : 'Incompleto'}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Data:</span>
                  <span>
                    {lead.created_at 
                      ? formatDate(lead.created_at).date
                      : lead.dataHora?.split(' ')[0] || 'Não informado'
                    }
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Horário:</span>
                  <span>
                    {lead.created_at 
                      ? formatDate(lead.created_at).time
                      : lead.dataHora?.split(' ')[1] || 'Não informado'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Técnicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Globe className="w-5 h-5" />
                Informações Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DeviceIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Dispositivo:</span>
                  <span>{lead.dispositivo || 'Não identificado'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">IP:</span>
                  <span className="font-mono text-sm">
                    {lead.ip_address || 'Não registrado'}
                  </span>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-start gap-2">
                    <Monitor className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <span className="font-medium">User Agent:</span>
                      <p className="text-sm text-gray-600 mt-1 break-all">
                        {lead.user_agent || 'Não registrado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Respostas do Lead */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="w-5 h-5" />
                Respostas do Questionário
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lead.responses && Object.keys(lead.responses).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(lead.responses).map(([question, answer], index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm text-gray-700 mb-1">
                        {question}
                      </p>
                      <p className="text-gray-900">
                        {String(answer)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : lead.respostas ? (
                <div className="space-y-3">
                  {Object.entries(lead.respostas).map(([question, answer], index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-sm text-gray-700 mb-1">
                        {question}
                      </p>
                      <p className="text-gray-900">
                        {String(answer)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma resposta registrada
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailsModal;