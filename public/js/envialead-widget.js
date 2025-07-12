
// EnviaLead Chat Widget - Integração com Sistema
(function() {
  console.log('[EnviaLead] Iniciando widget integrado...');
  
  // Pegar Flow ID da URL do script (padrão Flut)
  let flowId = null;
  const scripts = document.getElementsByTagName('script');
  
  for (let script of scripts) {
    if (script.src && script.src.includes('envialead-widget.js')) {
      const url = new URL(script.src);
      flowId = url.searchParams.get('flow');
      break;
    }
  }
  
  console.log('[EnviaLead] Flow ID da URL:', flowId);
  
  if (!flowId) {
    console.log('[EnviaLead] Nenhum Flow ID encontrado na URL');
    return;
  }
  
  // Buscar dados do fluxo no servidor
  loadFlowData(flowId);
  
  // Função para buscar dados do fluxo
  function loadFlowData(flowId) {
    console.log('[EnviaLead] Buscando dados do fluxo:', flowId);
    
    const apiUrl = 'https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/get-flow-data?flow_id=' + flowId;
    
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(result => {
      if (result.success && result.data) {
        console.log('[EnviaLead] Dados do fluxo carregados:', result.data);
        createChatWidget(result.data);
      } else {
        console.error('[EnviaLead] Erro ao carregar fluxo:', result.error);
        // Criar widget com dados padrão se houver erro
        createChatWidget({
          id: flowId,
          name: 'Chat EnviaLead',
          colors: { primary: '#FF6B35' },
          position: 'bottom-right'
        });
      }
    })
    .catch(error => {
      console.error('[EnviaLead] Erro na requisição:', error);
      // Criar widget com dados padrão se houver erro
      createChatWidget({
        id: flowId,
        name: 'Chat EnviaLead',
        colors: { primary: '#FF6B35' },
        position: 'bottom-right'
      });
    });
  }
  
  // Função para criar o widget de chat
  function createChatWidget(flowData) {
    console.log('[EnviaLead] Criando widget com dados:', flowData);
    
    // Determinar posição
    const position = flowData.position || 'bottom-right';
    const isLeft = position.includes('left');
    const isTop = position.includes('top');
    
    // Criar botão do chat
    const button = document.createElement('div');
    button.innerHTML = '💬';
    button.style.cssText = `
      position: fixed;
      ${isTop ? 'top' : 'bottom'}: 20px;
      ${isLeft ? 'left' : 'right'}: 20px;
      width: 60px;
      height: 60px;
      background: ${flowData.colors?.primary || '#FF6B35'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      cursor: pointer;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.2s ease;
    `;
    
    // Efeito hover
    button.onmouseenter = function() {
      button.style.transform = 'scale(1.1)';
    };
    
    button.onmouseleave = function() {
      button.style.transform = 'scale(1)';
    };
    
    // Ação do clique
    button.onclick = function() {
      openChatModal(flowData);
    };
    
    // Adicionar botão à página
    document.body.appendChild(button);
    console.log('[EnviaLead] Widget criado para fluxo:', flowData.name);
  }
  
  // Função para abrir o modal de chat
  function openChatModal(flowData) {
    console.log('[EnviaLead] Abrindo chat para fluxo:', flowData.name);
    
    // Por enquanto um alert com dados do fluxo
    alert(`Chat ${flowData.name} funcionando!\n\nFlow ID: ${flowData.id}\nCores: ${JSON.stringify(flowData.colors)}\nPosição: ${flowData.position}`);
    
    // TODO: Implementar modal de chat completo
    // createChatModal(flowData);
  }
  
})();
