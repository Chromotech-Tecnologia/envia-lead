
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FlowConnection {
  id: string;
  flow_id: string;
  url: string;
  last_ping: string;
  user_agent: string | null;
  ip_address: unknown | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useFlowConnections = (flowId?: string) => {
  const [connections, setConnections] = useState<FlowConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConnections = async () => {
    if (!flowId) {
      setConnections([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Buscando conexões para fluxo:', flowId);
      
      const { data, error } = await supabase
        .from('flow_connections')
        .select('*')
        .eq('flow_id', flowId)
        .eq('is_active', true)
        .order('last_ping', { ascending: false });

      if (error) {
        console.error('Erro ao buscar conexões:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as conexões",
        });
        return;
      }

      console.log('Conexões encontradas:', data?.length || 0);
      setConnections(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActiveConnections = () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return connections.filter(conn => 
      conn.is_active && new Date(conn.last_ping) > fiveMinutesAgo
    );
  };

  const getConnectionStatus = () => {
    const activeConnections = getActiveConnections();
    return {
      isConnected: activeConnections.length > 0,
      totalConnections: activeConnections.length,
      lastConnection: connections.length > 0 ? connections[0].last_ping : null
    };
  };

  useEffect(() => {
    fetchConnections();
    
    // Refresh connections every 30 seconds
    const interval = setInterval(fetchConnections, 30000);
    
    return () => clearInterval(interval);
  }, [flowId]);

  // Real-time subscription for connection updates
  useEffect(() => {
    if (!flowId) return;

    const channel = supabase
      .channel('flow-connections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flow_connections',
          filter: `flow_id=eq.${flowId}`
        },
        (payload) => {
          console.log('Conexão atualizada:', payload);
          fetchConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [flowId]);

  return {
    connections,
    loading,
    activeConnections: getActiveConnections(),
    connectionStatus: getConnectionStatus(),
    refetch: fetchConnections
  };
};
