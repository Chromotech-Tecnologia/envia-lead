
// EnviaLead Chat Widget - Main Entry Point v7.0
// This is the new main file that loads all dependencies and initializes the system

(function() {
  'use strict';

  console.log('[EnviaLead] Inicializando sistema principal v7.0...');

  // Prevent double loading
  if (window.enviaLeadLoaded) {
    console.log('[EnviaLead] Sistema já carregado');
    return;
  }
  window.enviaLeadLoaded = true;

  // Base URL for loading dependencies
  const BASE_URL = 'https://fuzkdrkhvmaimpgzvimq.supabase.co/storage/v1/object/public/chat-widget/js/';

  // Dependencies to load in order
  const dependencies = [
    'envialead-utils.js',
    'envialead-api.js', 
    'envialead-widget.js',
    'envialead-chat.js',
    'envialead-core.js'
  ];

  let loadedCount = 0;

  // Load script function
  function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = () => {
      console.error('[EnviaLead] Erro ao carregar:', src);
      callback();
    };
    document.head.appendChild(script);
  }

  // Load all dependencies
  function loadDependencies() {
    if (loadedCount >= dependencies.length) {
      console.log('[EnviaLead] Todas as dependências carregadas, inicializando...');
      return;
    }

    const dep = dependencies[loadedCount];
    console.log('[EnviaLead] Carregando dependência:', dep);
    
    loadScript(BASE_URL + dep, () => {
      loadedCount++;
      loadDependencies();
    });
  }

  // Start loading dependencies
  loadDependencies();

})();
