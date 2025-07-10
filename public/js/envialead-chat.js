// EnviaLead Chat Widget - Versão Ultra Simples
(function() {
  console.log('[EnviaLead] Iniciando versão simples...');
  
  // Extrair Flow ID
  const scripts = document.getElementsByTagName('script');
  let flowId = null;
  
  for (let script of scripts) {
    const content = script.innerHTML || script.textContent || '';
    if (content.includes('EL_')) {
      const match = content.match(/EL_[A-F0-9]{16}/);
      if (match) {
        flowId = match[0];
        break;
      }
    }
  }
  
  console.log('[EnviaLead] Flow ID encontrado:', flowId);
  
  if (!flowId) {
    console.log('[EnviaLead] Nenhum Flow ID encontrado');
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
  console.log('[EnviaLead] Botão criado!');
})();