
// EnviaLead Chat Widget - Produção Simples
(function() {
  console.log('[EnviaLead] Iniciando widget de produção...');
  
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
  
  // Criar botão do chat
  const button = document.createElement('div');
  button.innerHTML = '💬';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background: #FF6B35;
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
  
  // Ação do clique - aqui vamos abrir o chat real
  button.onclick = function() {
    openChatWidget(flowId);
  };
  
  // Função para abrir o widget de chat
  function openChatWidget(flowId) {
    // Por enquanto um alert, depois será o chat real
    alert('Chat EnviaLead será aberto aqui! Flow ID: ' + flowId);
    
    // TODO: Implementar abertura do chat modal/popup
    // createChatModal(flowId);
  }
  
  // Adicionar botão à página
  document.body.appendChild(button);
  console.log('[EnviaLead] Widget criado com Flow ID:', flowId);
  
  // Registrar conexão (enviar ping para o servidor)
  registerConnection(flowId);
  
  // Função para registrar conexão
  function registerConnection(flowId) {
    try {
      const data = {
        flow_id: flowId,
        url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      // Enviar para API (implementar depois)
      console.log('[EnviaLead] Registrando conexão:', data);
      
    } catch (error) {
      console.log('[EnviaLead] Erro ao registrar conexão:', error);
    }
  }
  
})();
