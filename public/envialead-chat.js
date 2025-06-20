
// EnviaLead Chat Widget - Modular Version
// Este arquivo carrega todos os módulos necessários

(function() {
  'use strict';

  console.log('[EnviaLead] Carregando sistema modular...');

  // Lista dos módulos na ordem correta de carregamento
  const modules = [
    'js/envialead-utils.js',
    'js/envialead-api.js', 
    'js/envialead-widget.js',
    'js/envialead-chat.js',
    'js/envialead-core.js'
  ];

  let loadedModules = 0;
  const totalModules = modules.length;

  function loadNextModule() {
    if (loadedModules >= totalModules) {
      console.log('[EnviaLead] Todos os módulos carregados com sucesso');
      return;
    }

    const moduleUrl = modules[loadedModules];
    const script = document.createElement('script');
    
    script.onload = function() {
      console.log('[EnviaLead] Módulo carregado:', moduleUrl);
      loadedModules++;
      loadNextModule();
    };
    
    script.onerror = function() {
      console.error('[EnviaLead] Erro ao carregar módulo:', moduleUrl);
    };
    
    // Determinar o caminho base do script atual
    const currentScript = document.currentScript;
    const scriptSrc = currentScript ? currentScript.src : '';
    const basePath = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);
    
    script.src = basePath + moduleUrl;
    document.head.appendChild(script);
  }

  // Iniciar carregamento dos módulos
  loadNextModule();

})();
