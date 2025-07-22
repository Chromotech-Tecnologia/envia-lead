
(function() {
  console.log('[EnviaLead] Widget carregado');
  
  // Estilos do widget
  const styles = `
    #envialead-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
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
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      transition: background-color 0.3s ease;
    }
    
    #envialead-button:hover {
      background-color: #3b82f6;
    }
    
    #envialead-chat-window {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 350px;
      height: 500px;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      overflow: hidden;
      display: none;
      z-index: 10000;
    }
    
    #envialead-header {
      background-color: #2563eb;
      color: white;
      padding: 15px;
      text-align: center;
      font-weight: bold;
      border-bottom: 1px solid rgba(0,0,0,0.1);
    }
    
    #envialead-messages {
      padding: 15px;
      overflow-y: auto;
      height: 350px;
    }
    
    .envialead-message {
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 8px;
      max-width: 80%;
      clear: both;
    }
    
    .envialead-bot-message {
      background-color: #f0f0f0;
      color: #333;
      float: left;
    }
    
    .envialead-user-message {
      background-color: #e2e8f0;
      color: #333;
      float: right;
    }
    
    #envialead-input-container {
      padding: 15px;
      border-top: 1px solid rgba(0,0,0,0.1);
      display: flex;
    }
    
    .envialead-input-field {
      flex: 1;
      padding: 10px;
      border: 1px solid #d1d5db;
      border-radius: 5px;
      margin-right: 10px;
      font-size: 14px;
    }
    
    .envialead-input-field:focus {
      outline: none;
      border-color: #2563eb;
    }
    
    .envialead-input-field.error {
      border-color: #ef4444;
      background-color: #fef2f2;
    }
    
    .envialead-textarea {
      resize: vertical;
      height: 80px;
    }
    
    #envialead-send-button {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    
    #envialead-send-button:hover {
      background-color: #3b82f6;
    }
    
    #envialead-whatsapp-button {
      background-color: #25d366;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      margin-top: 10px;
      display: none;
    }
    
    #envialead-whatsapp-button:hover {
      background-color: #128c7e;
    }
    
    .envialead-radio-group {
      margin-bottom: 10px;
    }
    
    .envialead-radio-option {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
    
    .envialead-radio-option input[type="radio"] {
      margin-right: 5px;
    }
    
    .envialead-typing-indicator {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background-color: #f0f0f0;
      border-radius: 18px;
      margin-bottom: 10px;
      width: fit-content;
    }
    
    .envialead-typing-dot {
      width: 8px;
      height: 8px;
      background-color: #9ca3af;
      border-radius: 50%;
      margin-right: 5px;
      animation: envialead-typing 1.5s infinite;
    }
    
    .envialead-typing-dot:nth-child(2) {
      animation-delay: 0.5s;
    }
    
    .envialead-typing-dot:nth-child(3) {
      animation-delay: 1s;
    }
    
    .envialead-typing-dot:last-child {
      margin-right: 0;
    }
    
    @keyframes envialead-typing {
      0% {
        opacity: 0.4;
        transform: scale(1);
      }
      50% {
        opacity: 1;
        transform: scale(1.2);
      }
      100% {
        opacity: 0.4;
        transform: scale(1);
      }
    }
  `;
  
  // Adicionar estilos ao head
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
  
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
  whatsAppButton.innerText = 'Fale conosco no WhatsApp';
  
  // Adicionar elementos ao DOM
  chatWindow.appendChild(chatHeader);
  chatWindow.appendChild(messagesContainer);
  chatWindow.appendChild(inputContainer);
  chatWindow.appendChild(whatsAppButton);
  
  widgetContainer.appendChild(chatButton);
  widgetContainer.appendChild(chatWindow);
  
  document.body.appendChild(widgetContainer);
  
  // Variáveis globais
  window.enviaLeadData = {};
  window.enviaLeadCurrentQuestion = 0;
  window.enviaLeadResponses = {};
  
  // Função para inicializar o widget
  window.enviaLeadInit = function(flowId) {
    console.log('[EnviaLead] Inicializando widget com flow ID:', flowId);
    
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
        console.log('[EnviaLead] Dados do flow:', window.enviaLeadData);
        
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
          console.log('[EnviaLead] Perguntas do flow:', window.enviaLeadData.questions);
          
          // Adicionar mensagem de boas-vindas
          addMessage(window.enviaLeadData.welcome_message || 'Olá! Como posso ajudá-lo?', true);
          
          // Mostrar primeira pergunta
          if (window.enviaLeadData.questions.length > 0) {
            setTimeout(() => {
              showQuestion(window.enviaLeadData.questions[0]);
            }, 500);
          }
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
    chatWindow.style.display = chatWindow.style.display === 'none' ? 'block' : 'none';
  });
  
  // Função para mostrar botão do WhatsApp
  function showWhatsAppButton() {
    whatsAppButton.style.display = 'block';
    
    whatsAppButton.addEventListener('click', function() {
      // Usar o template configurado com substituição de variáveis
      let message = window.enviaLeadData.whatsapp_message_template || 'Olá, gostaria de mais informações.';
      
      // Substituir variáveis no template
      message = replaceVariables(message, window.enviaLeadResponses);
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/${window.enviaLeadData.whatsapp}?text=${encodedMessage}`;
      window.open(whatsappURL, '_blank');
    });
  }

  // Função para substituir variáveis
  function replaceVariables(text, responses) {
    let result = text;
    
    // Mapear respostas para variáveis comuns
    const variableMap = {};
    
    // Iterar sobre as perguntas para mapear variáveis
    if (window.enviaLeadData.questions) {
      window.enviaLeadData.questions.forEach(question => {
        const answer = responses[question.title];
        if (answer) {
          const questionLower = question.title.toLowerCase();
          
          // Mapear para variáveis comuns
          if (questionLower.includes('nome')) {
            variableMap['#nome'] = answer;
          }
          if (questionLower.includes('email')) {
            variableMap['#email'] = answer;
          }
          if (questionLower.includes('telefone') || questionLower.includes('celular')) {
            variableMap['#telefone'] = answer;
          }
          if (questionLower.includes('empresa')) {
            variableMap['#empresa'] = answer;
          }
        }
      });
    }
    
    // Substituir as variáveis no texto
    Object.keys(variableMap).forEach(variable => {
      const regex = new RegExp(variable, 'gi');
      result = result.replace(regex, variableMap[variable]);
    });
    
    console.log('[EnviaLead] Template original:', text);
    console.log('[EnviaLead] Variáveis mapeadas:', variableMap);
    console.log('[EnviaLead] Resultado final:', result);
    
    return result;
  }

  // Função para aplicar máscara de telefone
  function applyPhoneMask(input) {
    input.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      
      // Limitar a 11 dígitos
      if (value.length > 11) {
        value = value.substring(0, 11);
      }
      
      // Aplicar máscara
      if (value.length <= 10) {
        value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      } else {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
      
      e.target.value = value;
    });
    
    input.addEventListener('blur', function(e) {
      const isValid = validatePhone(e.target.value);
      if (!isValid) {
        e.target.classList.add('error');
      } else {
        e.target.classList.remove('error');
      }
    });
  }

  // Função para aplicar máscara de email
  function applyEmailMask(input) {
    input.addEventListener('input', function(e) {
      // Remove espaços em branco
      e.target.value = e.target.value.replace(/\s/g, '');
    });
    
    input.addEventListener('blur', function(e) {
      const isValid = validateEmail(e.target.value);
      if (!isValid) {
        e.target.classList.add('error');
      } else {
        e.target.classList.remove('error');
      }
    });
  }

  // Função para validar telefone
  function validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verificar se tem DDD (11 dígitos com 9 ou 10 dígitos com 8)
    if (cleanPhone.length === 11) {
      // Celular: DDD + 9 + 8 dígitos
      const ddd = cleanPhone.substring(0, 2);
      const firstDigit = cleanPhone.substring(2, 3);
      return parseInt(ddd) >= 11 && parseInt(ddd) <= 99 && firstDigit === '9';
    } else if (cleanPhone.length === 10) {
      // Fixo: DDD + 8 dígitos
      const ddd = cleanPhone.substring(0, 2);
      const firstDigit = cleanPhone.substring(2, 3);
      return parseInt(ddd) >= 11 && parseInt(ddd) <= 99 && ['2', '3', '4', '5'].includes(firstDigit);
    }
    
    return false;
  }

  // Função para validar email
  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Função para mostrar indicador de digitação
  function showTypingIndicator() {
    console.log('[EnviaLead] Mostrando indicador de digitação');
    
    const messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) {
      console.error('[EnviaLead] Container de mensagens não encontrado');
      return;
    }
    
    // Remove indicador anterior se existir
    const existingIndicator = document.getElementById('envialead-typing-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    
    // Criar nova mensagem de digitação
    const typingMessage = document.createElement('div');
    typingMessage.id = 'envialead-typing-indicator';
    typingMessage.className = 'envialead-message envialead-bot-message';
    
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'envialead-typing-indicator';
    
    // Criar os pontos de digitação
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'envialead-typing-dot';
      typingIndicator.appendChild(dot);
    }
    
    typingMessage.appendChild(typingIndicator);
    messagesContainer.appendChild(typingMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    console.log('[EnviaLead] Indicador de digitação criado e adicionado');
  }

  // Função para esconder indicador de digitação
  function hideTypingIndicator() {
    console.log('[EnviaLead] Escondendo indicador de digitação');
    
    const typingIndicator = document.getElementById('envialead-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
      console.log('[EnviaLead] Indicador de digitação removido');
    }
  }

  // Função para adicionar mensagem
  function addMessage(message, isBot = false) {
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

  // Função para mostrar pergunta
  function showQuestion(question) {
    console.log('[EnviaLead] Mostrando pergunta:', question);
    
    const inputContainer = document.getElementById('envialead-input-container');
    if (!inputContainer) {
      console.error('[EnviaLead] Container de input não encontrado');
      return;
    }
    
    // Limpar container anterior
    inputContainer.innerHTML = '';
    
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
        `;
        break;
        
      case 'radio':
        inputHTML = '<div class="envialead-radio-group">';
        question.options.forEach((option, index) => {
          inputHTML += `
            <div class="envialead-radio-option">
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
        `;
    }
    
    // Adicionar botão de envio para inputs de texto
    if (question.type !== 'radio') {
      inputHTML += `
        <button id="envialead-send-button" class="envialead-send-button">
          Enviar
        </button>
      `;
    }
    
    inputContainer.innerHTML = inputHTML;
    
    // Aplicar máscaras baseadas no tipo
    const input = inputContainer.querySelector('input, textarea');
    if (input) {
      if (question.type === 'phone') {
        applyPhoneMask(input);
      } else if (question.type === 'email') {
        applyEmailMask(input);
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
    const radioButtons = inputContainer.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', function() {
        if (this.checked) {
          setTimeout(() => handleSendAnswer(), 300);
        }
      });
    });
  }

  // Função para processar resposta
  function handleSendAnswer() {
    console.log('[EnviaLead] Processando resposta');
    
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
        if (answer && !validateEmail(answer)) {
          isValid = false;
          if (emailInput) {
            emailInput.classList.add('error');
            emailInput.focus();
          }
        }
        break;
        
      case 'phone':
        const phoneInput = document.getElementById('envialead-phone-input');
        answer = phoneInput ? phoneInput.value.trim() : '';
        if (answer && !validatePhone(answer)) {
          isValid = false;
          if (phoneInput) {
            phoneInput.classList.add('error');
            phoneInput.focus();
          }
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
    
    // Armazenar resposta usando o título da pergunta
    window.enviaLeadResponses[currentQuestion.title] = answer;
    
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
        addMessage(nextQuestion.title, true);
        
        setTimeout(() => {
          showQuestion(nextQuestion);
        }, 500);
      }, 1500);
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
      }, 1500);
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

  // Função para testar envio de email
  window.enviaLeadTestEmail = function() {
    console.log('[EnviaLead] Testando envio de email');
    
    fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/test-email')
    .then(response => response.json())
    .then(data => {
      console.log('[EnviaLead] Teste de email:', data);
      alert(data.message);
    })
    .catch(error => {
      console.error('[EnviaLead] Erro ao testar email:', error);
      alert('Erro ao testar email: ' + error.message);
    });
  };
})();
