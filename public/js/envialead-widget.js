
(function() {
  console.log('[EnviaLead] Widget carregado');
  
  // CSS MOVIDO PARA O TOPO - PRIMEIRA COISA A SER EXECUTADA
  const styles = `
    #envialead-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    #envialead-button {
      background-color: #2563eb;
      color: white;
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    }
    
    #envialead-button:hover {
      background-color: #3b82f6;
      transform: scale(1.1);
    }
    
    #envialead-chat-window {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 360px;
      height: 520px;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      overflow: hidden;
      display: none;
      z-index: 10000;
      border: 1px solid #e5e7eb;
    }
    
    #envialead-header {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      color: white;
      padding: 16px;
      text-align: center;
      font-weight: 600;
      font-size: 16px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    #envialead-messages {
      padding: 16px;
      overflow-y: auto;
      height: 360px;
      background-color: #f9fafb;
    }
    
    .envialead-message {
      margin-bottom: 12px;
      padding: 12px 16px;
      border-radius: 18px;
      max-width: 85%;
      clear: both;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.4;
    }
    
    .envialead-bot-message {
      background-color: white;
      color: #374151;
      float: left;
      border: 1px solid #e5e7eb;
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .envialead-user-message {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      color: white;
      float: right;
      border-radius: 18px 18px 4px 18px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    #envialead-input-container {
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background-color: white;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .envialead-input-field {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 24px;
      font-size: 14px;
      outline: none;
      transition: all 0.2s ease;
    }
    
    .envialead-input-field:focus {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    .envialead-input-field.error {
      border-color: #ef4444;
      background-color: #fef2f2;
      animation: shake 0.5s ease-in-out;
    }
    
    .envialead-input-field.success {
      border-color: #10b981;
      background-color: #f0fdf4;
    }
    
    .envialead-textarea {
      resize: vertical;
      min-height: 80px;
      border-radius: 12px;
    }
    
    .envialead-send-button {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    
    .envialead-send-button:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    
    .envialead-send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    #envialead-whatsapp-button {
      background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 24px;
      cursor: pointer;
      transition: all 0.2s ease;
      margin: 12px 16px;
      font-weight: 600;
      font-size: 14px;
      display: none;
      width: calc(100% - 32px);
    }
    
    #envialead-whatsapp-button:hover {
      background: linear-gradient(135deg, #128c7e 0%, #0d7c66 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
    }
    
    .envialead-radio-group {
      margin: 8px 0;
    }
    
    .envialead-radio-option {
      display: flex;
      align-items: center;
      margin: 8px 0;
      padding: 12px;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .envialead-radio-option:hover {
      border-color: #2563eb;
      background-color: #f8fafc;
    }
    
    .envialead-radio-option.selected {
      border-color: #2563eb;
      background-color: #eff6ff;
    }
    
    .envialead-radio-option input[type="radio"] {
      margin-right: 8px;
      transform: scale(1.2);
    }
    
    .envialead-typing-container {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 12px;
    }
    
    .envialead-typing-bubble {
      background-color: white;
      border: 1px solid #e5e7eb;
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 12px 16px;
      max-width: 85%;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .envialead-typing-dot {
      width: 8px;
      height: 8px;
      background-color: #9ca3af;
      border-radius: 50%;
      animation: envialead-typing-bounce 1.4s infinite ease-in-out;
    }
    
    .envialead-typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .envialead-typing-dot:nth-child(2) { animation-delay: -0.16s; }
    .envialead-typing-dot:nth-child(3) { animation-delay: 0s; }
    
    @keyframes envialead-typing-bounce {
      0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
      }
      40% {
        transform: scale(1.2);
        opacity: 1;
      }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    
    .envialead-error-message {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
      margin-left: 16px;
      font-weight: 500;
    }
    
    .envialead-success-message {
      color: #10b981;
      font-size: 12px;
      margin-top: 4px;
      margin-left: 16px;
      font-weight: 500;
    }
  `;
  
  // INJETAR CSS IMEDIATAMENTE
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
  console.log('[EnviaLead] CSS injetado com sucesso');
  
  // Criar elementos do widget
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'envialead-widget-container';
  
  const chatButton = document.createElement('button');
  chatButton.id = 'envialead-button';
  chatButton.innerHTML = '💬';
  
  const chatWindow = document.createElement('div');
  chatWindow.id = 'envialead-chat-window';
  
  const chatHeader = document.createElement('div');
  chatHeader.id = 'envialead-header';
  chatHeader.innerText = 'EnviaLead Chat';
  
  const messagesContainer = document.createElement('div');
  messagesContainer.id = 'envialead-messages';
  
  const inputContainer = document.createElement('div');
  inputContainer.id = 'envialead-input-container';
  
  const whatsAppButton = document.createElement('button');
  whatsAppButton.id = 'envialead-whatsapp-button';
  whatsAppButton.innerHTML = '💬 Continuar no WhatsApp';
  
  // Adicionar elementos ao DOM
  chatWindow.appendChild(chatHeader);
  chatWindow.appendChild(messagesContainer);
  chatWindow.appendChild(inputContainer);
  chatWindow.appendChild(whatsAppButton);
  
  widgetContainer.appendChild(chatButton);
  widgetContainer.appendChild(chatWindow);
  
  document.body.appendChild(widgetContainer);
  console.log('[EnviaLead] Elementos DOM criados');
  
  // Variáveis globais
  window.enviaLeadData = {};
  window.enviaLeadCurrentQuestion = 0;
  // INICIALIZAR VAZIO AQUI E REINICIALIZAR NO enviaLeadInit
  window.enviaLeadResponses = {};
  
  // MÁSCARAS E VALIDAÇÕES CORRIGIDAS
  const inputMasks = {
    // Máscara de telefone brasileira rigorosa
    applyPhoneMask: function(input) {
      console.log('[EnviaLead] Aplicando máscara de telefone');
      
      input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        console.log('[EnviaLead] Telefone digitado:', value);
        
        // Limitar a 11 dígitos
        if (value.length > 11) {
          value = value.substring(0, 11);
        }
        
        // Aplicar máscara progressiva
        if (value.length <= 2) {
          value = value.replace(/(\d{0,2})/, '($1');
        } else if (value.length <= 6) {
          value = value.replace(/(\d{2})(\d{0,4})/, '($1) $2');
        } else if (value.length <= 10) {
          value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
          value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
        
        e.target.value = value;
        console.log('[EnviaLead] Máscara aplicada:', value);
      });
      
      input.addEventListener('blur', function(e) {
        const isValid = inputMasks.validatePhone(e.target.value);
        console.log('[EnviaLead] Validação telefone:', isValid);
        
        if (isValid) {
          e.target.classList.remove('error');
          e.target.classList.add('success');
          inputMasks.removeErrorMessage(e.target);
          inputMasks.showSuccessMessage(e.target, 'Telefone válido!');
        } else {
          e.target.classList.remove('success');
          e.target.classList.add('error');
          inputMasks.removeSuccessMessage(e.target);
          inputMasks.showErrorMessage(e.target, 'Digite um telefone válido com DDD');
        }
      });
    },
    
    // Máscara de email rigorosa
    applyEmailMask: function(input) {
      console.log('[EnviaLead] Aplicando máscara de email');
      
      input.addEventListener('input', function(e) {
        // Remove espaços e converte para lowercase
        e.target.value = e.target.value.replace(/\s/g, '').toLowerCase();
      });
      
      input.addEventListener('blur', function(e) {
        const isValid = inputMasks.validateEmail(e.target.value);
        console.log('[EnviaLead] Validação email:', isValid);
        
        if (isValid) {
          e.target.classList.remove('error');
          e.target.classList.add('success');
          inputMasks.removeErrorMessage(e.target);
          inputMasks.showSuccessMessage(e.target, 'Email válido!');
        } else {
          e.target.classList.remove('success');
          e.target.classList.add('error');
          inputMasks.removeSuccessMessage(e.target);
          inputMasks.showErrorMessage(e.target, 'Digite um email válido (ex: nome@dominio.com)');
        }
      });
    },
    
    // Validação rigorosa de telefone
    validatePhone: function(phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      console.log('[EnviaLead] Validando telefone limpo:', cleanPhone);
      
      // Deve ter 10 ou 11 dígitos
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        console.log('[EnviaLead] Telefone inválido: tamanho incorreto');
        return false;
      }
      
      // Verificar DDD válido (11 a 99)
      const ddd = parseInt(cleanPhone.substring(0, 2));
      if (ddd < 11 || ddd > 99) {
        console.log('[EnviaLead] Telefone inválido: DDD inválido');
        return false;
      }
      
      if (cleanPhone.length === 11) {
        // Celular: deve começar com 9
        const firstDigit = cleanPhone.substring(2, 3);
        if (firstDigit !== '9') {
          console.log('[EnviaLead] Celular inválido: não começa com 9');
          return false;
        }
      } else if (cleanPhone.length === 10) {
        // Fixo: deve começar com 2, 3, 4 ou 5
        const firstDigit = cleanPhone.substring(2, 3);
        if (!['2', '3', '4', '5'].includes(firstDigit)) {
          console.log('[EnviaLead] Fixo inválido: não começa com 2,3,4,5');
          return false;
        }
      }
      
      console.log('[EnviaLead] Telefone válido!');
      return true;
    },
    
    // Validação rigorosa de email
    validateEmail: function(email) {
      // Regex rigorosa que exige domínio válido
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailRegex.test(email);
      console.log('[EnviaLead] Validando email:', email, 'Válido:', isValid);
      return isValid;
    },
    
    // Mostrar mensagem de erro
    showErrorMessage: function(input, message) {
      this.removeErrorMessage(input);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'envialead-error-message';
      errorDiv.textContent = message;
      input.parentNode.appendChild(errorDiv);
    },
    
    // Mostrar mensagem de sucesso
    showSuccessMessage: function(input, message) {
      this.removeSuccessMessage(input);
      const successDiv = document.createElement('div');
      successDiv.className = 'envialead-success-message';
      successDiv.textContent = message;
      input.parentNode.appendChild(successDiv);
    },
    
    // Remover mensagem de erro
    removeErrorMessage: function(input) {
      const existing = input.parentNode.querySelector('.envialead-error-message');
      if (existing) existing.remove();
    },
    
    // Remover mensagem de sucesso
    removeSuccessMessage: function(input) {
      const existing = input.parentNode.querySelector('.envialead-success-message');
      if (existing) existing.remove();
    }
  };
  
  // FUNÇÃO DE SUBSTITUIÇÃO DE VARIÁVEIS COMPLETAMENTE CORRIGIDA
  function replaceVariables(text, responses) {
    console.log('[EnviaLead] ==> INÍCIO replaceVariables');
    console.log('[EnviaLead] Texto original:', text);
    console.log('[EnviaLead] Respostas recebidas:', responses);
    console.log('[EnviaLead] Perguntas disponíveis:', window.enviaLeadData.questions);
    
    if (!text || !responses || Object.keys(responses).length === 0) {
      console.warn('[EnviaLead] Parâmetros inválidos para substituição');
      return text;
    }
    
    let result = text;
    
    // ESTRATÉGIA 1: Mapear variáveis comuns baseado nas respostas diretas
    const commonVariables = {
      '#nome': null,
      '#name': null,
      '#email': null,
      '#telefone': null,
      '#phone': null,
      '#empresa': null,
      '#company': null,
      '#cidade': null,
      '#city': null
    };
    
    // Procurar nas respostas por palavras-chave
    Object.keys(responses).forEach(key => {
      const value = responses[key];
      if (!value) return;
      
      const keyLower = key.toLowerCase();
      console.log(`[EnviaLead] Analisando resposta: ${key} = ${value}`);
      
      // Mapear por palavras-chave no título da pergunta
      if (keyLower.includes('nome') || keyLower.includes('name')) {
        commonVariables['#nome'] = value;
        commonVariables['#name'] = value;
        console.log(`[EnviaLead] Mapeado nome: ${value}`);
      }
      if (keyLower.includes('email') || keyLower.includes('e-mail')) {
        commonVariables['#email'] = value;
        console.log(`[EnviaLead] Mapeado email: ${value}`);
      }
      if (keyLower.includes('telefone') || keyLower.includes('celular') || keyLower.includes('phone')) {
        commonVariables['#telefone'] = value;
        commonVariables['#phone'] = value;
        console.log(`[EnviaLead] Mapeado telefone: ${value}`);
      }
      if (keyLower.includes('empresa') || keyLower.includes('company')) {
        commonVariables['#empresa'] = value;
        commonVariables['#company'] = value;
        console.log(`[EnviaLead] Mapeado empresa: ${value}`);
      }
      if (keyLower.includes('cidade') || keyLower.includes('city')) {
        commonVariables['#cidade'] = value;
        commonVariables['#city'] = value;
        console.log(`[EnviaLead] Mapeado cidade: ${value}`);
      }
    });
    
    // ESTRATÉGIA 2: Se não encontrou pelas palavras-chave, usar primeira resposta para nome
    if (!commonVariables['#nome'] && !commonVariables['#name']) {
      const firstResponse = Object.values(responses)[0];
      if (firstResponse) {
        commonVariables['#nome'] = firstResponse;
        commonVariables['#name'] = firstResponse;
        console.log(`[EnviaLead] Usando primeira resposta como nome: ${firstResponse}`);
      }
    }
    
    // ESTRATÉGIA 3: Mapear por posição das perguntas
    if (window.enviaLeadData.questions && Array.isArray(window.enviaLeadData.questions)) {
      window.enviaLeadData.questions.forEach((question, index) => {
        const answerId = responses[question.id];
        const answerTitle = responses[question.title];
        const answer = answerId || answerTitle;
        
        if (answer) {
          commonVariables[`#resposta${index + 1}`] = answer;
          commonVariables[`#answer${index + 1}`] = answer;
          console.log(`[EnviaLead] Mapeado por posição ${index + 1}: ${answer}`);
        }
      });
    }
    
    console.log('[EnviaLead] Variáveis mapeadas:', commonVariables);
    
    // APLICAR SUBSTITUIÇÕES
    Object.keys(commonVariables).forEach(variable => {
      const value = commonVariables[variable];
      if (value) {
        const regex = new RegExp(variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const before = result;
        result = result.replace(regex, value);
        if (before !== result) {
          console.log(`[EnviaLead] ✅ Substituído ${variable} por "${value}"`);
        }
      }
    });
    
    console.log('[EnviaLead] Resultado final:', result);
    console.log('[EnviaLead] ==> FIM replaceVariables');
    
    return result;
  }
  
  // SIMULAÇÃO DE DIGITAÇÃO CORRIGIDA DEFINITIVAMENTE
  function showTypingIndicator() {
    console.log('[EnviaLead] Iniciando simulação de digitação');
    
    const messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) {
      console.error('[EnviaLead] Container de mensagens não encontrado');
      return;
    }
    
    // Remove indicador anterior se existir
    const existingIndicator = document.getElementById('envialead-typing-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
      console.log('[EnviaLead] Indicador anterior removido');
    }
    
    // Criar container principal do typing indicator
    const typingContainer = document.createElement('div');
    typingContainer.id = 'envialead-typing-indicator';
    typingContainer.className = 'envialead-typing-container';
    
    // Criar bolha de digitação
    const typingBubble = document.createElement('div');
    typingBubble.className = 'envialead-typing-bubble';
    
    // Criar os três pontos animados
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'envialead-typing-dot';
      typingBubble.appendChild(dot);
    }
    
    typingContainer.appendChild(typingBubble);
    messagesContainer.appendChild(typingContainer);
    
    // Scroll para o final
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    console.log('[EnviaLead] Indicador de digitação criado e exibido');
    
    // Verificar se foi criado corretamente e as animações estão funcionando
    setTimeout(() => {
      const createdIndicator = document.getElementById('envialead-typing-indicator');
      const dots = createdIndicator ? createdIndicator.querySelectorAll('.envialead-typing-dot') : [];
      console.log('[EnviaLead] Indicador criado:', !!createdIndicator, 'Pontos criados:', dots.length);
      
      if (dots.length === 3) {
        console.log('[EnviaLead] ✅ Simulação de digitação funcionando no site destino');
      } else {
        console.error('[EnviaLead] ❌ Problema na criação dos pontos de digitação');
      }
    }, 100);
  }
  
  function hideTypingIndicator() {
    console.log('[EnviaLead] Escondendo indicador de digitação');
    
    const typingIndicator = document.getElementById('envialead-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
      console.log('[EnviaLead] Indicador de digitação removido');
    } else {
      console.log('[EnviaLead] Nenhum indicador de digitação encontrado para remover');
    }
  }
  
  // FUNÇÃO DE ARMAZENAMENTO DE RESPOSTA CORRIGIDA
  function storeResponse(questionId, questionTitle, answer) {
    console.log('[EnviaLead] ==> ARMAZENANDO RESPOSTA');
    console.log('[EnviaLead] Question ID:', questionId);
    console.log('[EnviaLead] Question Title:', questionTitle);
    console.log('[EnviaLead] Answer:', answer);
    
    // Armazenar por ID e por título
    window.enviaLeadResponses[questionId] = answer;
    window.enviaLeadResponses[questionTitle] = answer;
    
    // MAPEAMENTO IMEDIATO PARA VARIÁVEIS COMUNS
    const titleLower = questionTitle.toLowerCase();
    
    if (titleLower.includes('nome') || titleLower.includes('name')) {
      window.enviaLeadResponses['#nome'] = answer;
      window.enviaLeadResponses['#name'] = answer;
      console.log('[EnviaLead] Mapeado imediatamente para #nome/#name');
    }
    if (titleLower.includes('email') || titleLower.includes('e-mail')) {
      window.enviaLeadResponses['#email'] = answer;
      console.log('[EnviaLead] Mapeado imediatamente para #email');
    }
    if (titleLower.includes('telefone') || titleLower.includes('celular') || titleLower.includes('phone')) {
      window.enviaLeadResponses['#telefone'] = answer;
      window.enviaLeadResponses['#phone'] = answer;
      console.log('[EnviaLead] Mapeado imediatamente para #telefone/#phone');
    }
    if (titleLower.includes('empresa') || titleLower.includes('company')) {
      window.enviaLeadResponses['#empresa'] = answer;
      window.enviaLeadResponses['#company'] = answer;
      console.log('[EnviaLead] Mapeado imediatamente para #empresa/#company');
    }
    if (titleLower.includes('cidade') || titleLower.includes('city')) {
      window.enviaLeadResponses['#cidade'] = answer;
      window.enviaLeadResponses['#city'] = answer;
      console.log('[EnviaLead] Mapeado imediatamente para #cidade/#city');
    }
    
    console.log('[EnviaLead] Estado atual do enviaLeadResponses:', window.enviaLeadResponses);
    console.log('[EnviaLead] ==> FIM ARMAZENAMENTO');
  }
  
  // Função para inicializar o widget
  window.enviaLeadInit = function(flowId) {
    console.log('[EnviaLead] ==> INICIALIZANDO WIDGET');
    console.log('[EnviaLead] Flow ID:', flowId);
    
    // REINICIALIZAR RESPOSTAS - CORREÇÃO CRÍTICA
    window.enviaLeadResponses = {};
    console.log('[EnviaLead] Respostas reinicializadas');
    
    // Obter dados do flow
    fetch(`https://fuzkdrkhvmaimpgzvimq.supabase.co/rest/v1/flows?id=eq.${flowId}`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        window.enviaLeadData = data[0];
        console.log('[EnviaLead] Dados do flow carregados:', window.enviaLeadData);
        
        // Obter perguntas do flow
        fetch(`https://fuzkdrkhvmaimpgzvimq.supabase.co/rest/v1/questions?flow_id=eq.${flowId}&order=order_index`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
          }
        })
        .then(response => response.json())
        .then(questions => {
          window.enviaLeadData.questions = questions;
          console.log('[EnviaLead] Perguntas carregadas:', window.enviaLeadData.questions);
          
          // Adicionar mensagem de boas-vindas
          addMessage(window.enviaLeadData.welcome_message || 'Olá! Como posso ajudá-lo?', true);
          
          // Mostrar primeira pergunta com delay
          if (window.enviaLeadData.questions.length > 0) {
            setTimeout(() => {
              showTypingIndicator();
              setTimeout(() => {
                hideTypingIndicator();
                showQuestion(window.enviaLeadData.questions[0]);
              }, 2000);
            }, 1000);
          }
          
          console.log('[EnviaLead] ==> WIDGET INICIALIZADO COM SUCESSO');
        })
        .catch(error => {
          console.error('[EnviaLead] Erro ao obter perguntas:', error);
        });
      } else {
        console.error('[EnviaLead] Flow não encontrado');
      }
    })
    .catch(error => {
      console.error('[EnviaLead] Erro ao obter dados do flow:', error);
    });
  };
  
  // Evento de clique no botão
  chatButton.addEventListener('click', function() {
    const isVisible = chatWindow.style.display === 'block';
    chatWindow.style.display = isVisible ? 'none' : 'block';
    console.log('[EnviaLead] Chat window toggled:', !isVisible);
  });
  
  // Função para mostrar botão do WhatsApp
  function showWhatsAppButton() {
    console.log('[EnviaLead] ==> MOSTRANDO BOTÃO WHATSAPP');
    
    whatsAppButton.style.display = 'block';
    
    whatsAppButton.addEventListener('click', function() {
      console.log('[EnviaLead] ==> BOTÃO WHATSAPP CLICADO');
      console.log('[EnviaLead] Dados do flow:', window.enviaLeadData);
      console.log('[EnviaLead] Respostas disponíveis:', window.enviaLeadResponses);
      
      // Corrigir mensagem do WhatsApp - usar whatsapp_text em vez de whatsapp_message_template
      console.log('[EnviaLead] Dados do flow completos:', window.enviaLeadData);
      
      let message = '';
      if (window.enviaLeadData.whatsapp_text) {
        message = window.enviaLeadData.whatsapp_text;
        console.log('[EnviaLead] Usando whatsapp_text:', message);
      } else if (window.enviaLeadData.whatsapp_message_template) {
        message = window.enviaLeadData.whatsapp_message_template;
        console.log('[EnviaLead] Fallback para whatsapp_message_template:', message);
      } else {
        message = 'Olá! Gostaria de saber mais informações.';
        console.log('[EnviaLead] Usando mensagem padrão');
      }
      
      // Substituir variáveis no template
      message = replaceVariables(message, window.enviaLeadResponses);
      console.log('[EnviaLead] Mensagem final após substituição:', message);
      
      // Verificar se houve substituição
      if (message === window.enviaLeadData.whatsapp_message_template) {
        console.warn('[EnviaLead] ⚠️ NENHUMA VARIÁVEL FOI SUBSTITUÍDA!');
        
        // Fallback: usar primeira resposta como nome se template contém #nome
        if (message.includes('#nome') || message.includes('#name')) {
          const firstResponse = Object.values(window.enviaLeadResponses)[0];
          if (firstResponse) {
            message = message.replace(/#nome/gi, firstResponse);
            message = message.replace(/#name/gi, firstResponse);
            console.log('[EnviaLead] Aplicado fallback para nome:', firstResponse);
          }
        }
      } else {
        console.log('[EnviaLead] ✅ Variáveis substituídas com sucesso!');
      }
      
      // Preparar URL do WhatsApp
      const whatsappNumber = window.enviaLeadData.whatsapp ? window.enviaLeadData.whatsapp.replace(/\D/g, '') : '';
      const encodedMessage = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
      
      console.log('[EnviaLead] Número WhatsApp:', whatsappNumber);
      console.log('[EnviaLead] Mensagem final:', message);
      console.log('[EnviaLead] URL final:', whatsappURL);
      
      // Abrir WhatsApp
      window.open(whatsappURL, '_blank');
    });
  }
  
  // Função para adicionar mensagem
  function addMessage(message, isBot = false) {
    console.log('[EnviaLead] Adicionando mensagem:', message);
    
    const messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) {
      console.error('[EnviaLead] Container de mensagens não encontrado');
      return;
    }
    
    const messageElement = document.createElement('div');
    messageElement.className = `envialead-message ${isBot ? 'envialead-bot-message' : 'envialead-user-message'}`;
    messageElement.innerHTML = `<div class="envialead-message-content">${message}</div>`;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    console.log('[EnviaLead] Mensagem adicionada:', { message, isBot });
  }
  
  // Função para mostrar pergunta COM MÁSCARA APLICADA
  function showQuestion(question) {
    console.log('[EnviaLead] ==> MOSTRANDO PERGUNTA');
    console.log('[EnviaLead] Pergunta:', question);
    
    const inputContainer = document.getElementById('envialead-input-container');
    if (!inputContainer) {
      console.error('[EnviaLead] Container de input não encontrado');
      return;
    }
    
    // Limpar container anterior
    inputContainer.innerHTML = '';
    
    // Adicionar pergunta às mensagens
    addMessage(question.title, true);
    
    // Criar input baseado no tipo da pergunta
    let inputHTML = '';
    
    switch (question.type) {
      case 'text':
        inputHTML = `
          <input 
            type="text" 
            id="envialead-text-input" 
            placeholder="${question.placeholder || 'Digite sua resposta...'}"
            class="envialead-input-field"
            ${question.required ? 'required' : ''}
          />
          <button id="envialead-send-button" class="envialead-send-button" style="background-image: url('/lovable-uploads/2cf5bfaa-1cc5-41f3-a3f4-19b19b70cd20.png'); background-size: 20px 20px; background-repeat: no-repeat; background-position: center;">
            
          </button>
        `;
        break;
        
      case 'email':
        inputHTML = `
          <input 
            type="email" 
            id="envialead-email-input" 
            placeholder="${question.placeholder || 'Digite seu email...'}"
            class="envialead-input-field"
            ${question.required ? 'required' : ''}
          />
          <button id="envialead-send-button" class="envialead-send-button" style="background-image: url('/lovable-uploads/2cf5bfaa-1cc5-41f3-a3f4-19b19b70cd20.png'); background-size: 20px 20px; background-repeat: no-repeat; background-position: center;">
            
          </button>
        `;
        break;
        
      case 'phone':
        inputHTML = `
          <input 
            type="tel" 
            id="envialead-phone-input" 
            placeholder="${question.placeholder || 'Digite seu telefone...'}"
            class="envialead-input-field"
            ${question.required ? 'required' : ''}
          />
          <button id="envialead-send-button" class="envialead-send-button" style="background-image: url('/lovable-uploads/2cf5bfaa-1cc5-41f3-a3f4-19b19b70cd20.png'); background-size: 20px 20px; background-repeat: no-repeat; background-position: center;">
            
          </button>
        `;
        break;
        
      case 'textarea':
        inputHTML = `
          <textarea 
            id="envialead-textarea-input" 
            placeholder="${question.placeholder || 'Digite sua resposta...'}"
            class="envialead-input-field envialead-textarea"
            rows="3"
            ${question.required ? 'required' : ''}
          ></textarea>
          <button id="envialead-send-button" class="envialead-send-button" style="background-image: url('/lovable-uploads/2cf5bfaa-1cc5-41f3-a3f4-19b19b70cd20.png'); background-size: 20px 20px; background-repeat: no-repeat; background-position: center;">
            
          </button>
        `;
        break;
        
      case 'radio':
        inputHTML = '<div class="envialead-radio-group">';
        question.options.forEach((option, index) => {
          inputHTML += `
            <div class="envialead-radio-option" data-value="${option}">
              <input 
                type="radio" 
                id="envialead-radio-${index}" 
                name="envialead-radio" 
                value="${option}"
                ${question.required ? 'required' : ''}
              />
              <label for="envialead-radio-${index}">${option}</label>
            </div>
          `;
        });
        inputHTML += '</div>';
        break;
        
      default:
        inputHTML = `
          <input 
            type="text" 
            id="envialead-text-input" 
            placeholder="${question.placeholder || 'Digite sua resposta...'}"
            class="envialead-input-field"
            ${question.required ? 'required' : ''}
          />
          <button id="envialead-send-button" class="envialead-send-button" style="background-image: url('/lovable-uploads/2cf5bfaa-1cc5-41f3-a3f4-19b19b70cd20.png'); background-size: 20px 20px; background-repeat: no-repeat; background-position: center;">
            
          </button>
        `;
    }
    
    inputContainer.innerHTML = inputHTML;
    
    // Aplicar máscaras baseadas no tipo IMEDIATAMENTE
    const input = inputContainer.querySelector('input, textarea');
    if (input) {
      if (question.type === 'phone') {
        console.log('[EnviaLead] Aplicando máscara telefone ao input');
        inputMasks.applyPhoneMask(input);
      } else if (question.type === 'email') {
        console.log('[EnviaLead] Aplicando máscara email ao input');
        inputMasks.applyEmailMask(input);
      }
      
      // Focar no input
      setTimeout(() => input.focus(), 100);
      
      // Adicionar evento de Enter para envio
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendAnswer();
        }
      });
    }
    
    // Adicionar eventos para botão de envio
    const sendButton = document.getElementById('envialead-send-button');
    if (sendButton) {
      sendButton.addEventListener('click', handleSendAnswer);
    }
    
    // Adicionar eventos para radio buttons
    const radioOptions = inputContainer.querySelectorAll('.envialead-radio-option');
    radioOptions.forEach(option => {
      option.addEventListener('click', function() {
        // Remover seleção anterior
        radioOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Adicionar seleção atual
        this.classList.add('selected');
        
        // Marcar radio button
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          
          // Enviar resposta após delay
          setTimeout(() => handleSendAnswer(), 500);
        }
      });
    });
  }
  
  // Função para processar resposta
  function handleSendAnswer() {
    console.log('[EnviaLead] ==> PROCESSANDO RESPOSTA');
    
    const currentQuestion = window.enviaLeadData.questions[window.enviaLeadCurrentQuestion];
    if (!currentQuestion) {
      console.error('[EnviaLead] Pergunta atual não encontrada');
      return;
    }
    
    let answer = '';
    let isValid = true;
    
    // Obter resposta baseada no tipo da pergunta
    switch (currentQuestion.type) {
      case 'text':
        const textInput = document.getElementById('envialead-text-input');
        answer = textInput ? textInput.value.trim() : '';
        break;
        
      case 'email':
        const emailInput = document.getElementById('envialead-email-input');
        answer = emailInput ? emailInput.value.trim() : '';
        if (answer && !inputMasks.validateEmail(answer)) {
          isValid = false;
          console.log('[EnviaLead] Email inválido:', answer);
        }
        break;
        
      case 'phone':
        const phoneInput = document.getElementById('envialead-phone-input');
        answer = phoneInput ? phoneInput.value.trim() : '';
        if (answer && !inputMasks.validatePhone(answer)) {
          isValid = false;
          console.log('[EnviaLead] Telefone inválido:', answer);
        }
        break;
        
      case 'textarea':
        const textareaInput = document.getElementById('envialead-textarea-input');
        answer = textareaInput ? textareaInput.value.trim() : '';
        break;
        
      case 'radio':
        const selectedRadio = document.querySelector('input[name="envialead-radio"]:checked');
        answer = selectedRadio ? selectedRadio.value : '';
        break;
        
      default:
        const defaultInput = document.getElementById('envialead-text-input');
        answer = defaultInput ? defaultInput.value.trim() : '';
    }
    
    // Validar resposta obrigatória
    if (currentQuestion.required && !answer) {
      console.log('[EnviaLead] Resposta obrigatória não preenchida');
      return;
    }
    
    // Validar formato se necessário
    if (!isValid) {
      console.log('[EnviaLead] Resposta inválida');
      return;
    }
    
    console.log('[EnviaLead] Resposta válida:', answer);
    
    // ARMAZENAR RESPOSTA COM FUNÇÃO CORRIGIDA
    storeResponse(currentQuestion.id, currentQuestion.title, answer);
    
    // Mostrar resposta do usuário
    addMessage(answer, false);
    
    // Limpar input
    const inputContainer = document.getElementById('envialead-input-container');
    if (inputContainer) {
      inputContainer.innerHTML = '';
    }
    
    // Salvar lead parcial
    saveLead(false);
    
    // Próxima pergunta
    window.enviaLeadCurrentQuestion++;
    
    if (window.enviaLeadCurrentQuestion < window.enviaLeadData.questions.length) {
      // Mostrar indicador de digitação
      showTypingIndicator();
      
      // Próxima pergunta após delay
      setTimeout(() => {
        hideTypingIndicator();
        const nextQuestion = window.enviaLeadData.questions[window.enviaLeadCurrentQuestion];
        showQuestion(nextQuestion);
      }, 2000);
    } else {
      // Finalizar conversa
      showTypingIndicator();
      
      setTimeout(() => {
        hideTypingIndicator();
        const finalMessage = window.enviaLeadData.final_message || 'Obrigado pelo seu contato! Em breve entraremos em contato.';
        addMessage(finalMessage, true);
        
        // Salvar lead completo
        saveLead(true);
        
        // Mostrar botão WhatsApp se configurado
        if (window.enviaLeadData.show_whatsapp_button && window.enviaLeadData.whatsapp) {
          setTimeout(() => {
            showWhatsAppButton();
          }, 1000);
        }
      }, 2000);
    }
  }
  
  // Função para salvar lead
  function saveLead(completed = false) {
    console.log('[EnviaLead] Salvando lead:', { completed, responses: window.enviaLeadResponses });
    
    const leadData = {
      flow_id: window.enviaLeadData.id,
      responses: window.enviaLeadResponses,
      completed: completed,
      user_agent: navigator.userAgent,
      url: window.location.href
    };
    
    // Chamada para edge function
    fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/save-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData)
    })
    .then(response => response.json())
    .then(data => {
      console.log('[EnviaLead] Lead salvo:', data);
      if (data.success) {
        console.log('[EnviaLead] Lead salvo com sucesso:', data.lead_id);
      }
    })
    .catch(error => {
      console.error('[EnviaLead] Erro ao salvar lead:', error);
    });
  }
})();
