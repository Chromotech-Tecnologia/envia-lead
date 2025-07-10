// EnviaLead Chat Widget - Padrão Simples como Flut
(function() {
  console.log('[EnviaLead] Iniciando widget...');
  
  // Pegar Flow ID da URL do script (padrão Flut)
  let flowId = null;
  const scripts = document.getElementsByTagName('script');
  
  for (let script of scripts) {
    if (script.src && script.src.includes('envialead-chat.js')) {
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
  
  // Criar botão simples
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
  `;
  
  button.onclick = function() {
    alert('EnviaLead Chat funcionando! Flow ID: ' + flowId);
  };
  
  document.body.appendChild(button);
  console.log('[EnviaLead] Botão criado com Flow ID:', flowId);
})();