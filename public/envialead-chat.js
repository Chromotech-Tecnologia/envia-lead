
(function() {
  console.log('[EnviaLead] Script iniciado');
  
  if (window.enviaLeadLoaded) {
    console.log('[EnviaLead] Script já carregado');
    return;
  }
  window.enviaLeadLoaded = true;

  const flowId = window.enviaLeadId;
  const currentUrl = window.location.href;
  
  console.log('[EnviaLead] Flow ID:', flowId);
  console.log('[EnviaLead] URL atual:', currentUrl);

  if (!flowId) {
    console.error('[EnviaLead] ID do fluxo não fornecido');
    return;
  }

  // Função para buscar dados do fluxo
  async function fetchFlowData() {
    try {
      console.log('[EnviaLead] Buscando dados do fluxo...');
      
      const response = await fetch(`https://fuzkdrkhvmaimpgzvimq.supabase.co/rest/v1/flows?id=eq.${flowId}&select=*,questions(*),flow_urls(*),flow_emails(*)`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const flows = await response.json();
      console.log('[EnviaLead] Dados recebidos:', flows);

      if (!flows || flows.length === 0) {
        throw new Error('Fluxo não encontrado');
      }

      const flow = flows[0];
      
      // Verificar se a URL atual está autorizada para este fluxo
      const isUrlAuthorized = flow.flow_urls && flow.flow_urls.some(urlObj => {
        const authorizedUrl = urlObj.url;
        return currentUrl.includes(authorizedUrl) || authorizedUrl === '*';
      });

      if (!isUrlAuthorized) {
        console.log('[EnviaLead] URL não autorizada para este fluxo');
        return;
      }

      // Verificar se o fluxo está ativo
      if (!flow.is_active) {
        console.log('[EnviaLead] Fluxo está inativo');
        return;
      }

      console.log('[EnviaLead] Criando widget do chat...');
      createChatWidget(flow);

    } catch (error) {
      console.error('[EnviaLead] Erro ao buscar dados do fluxo:', error);
    }
  }

  // Função para criar o widget do chat
  function createChatWidget(flowData) {
    console.log('[EnviaLead] Dados do fluxo para widget:', flowData);

    // Processar perguntas
    const questions = flowData.questions ? flowData.questions.map(q => ({
      id: q.id,
      type: q.type,
      title: q.title,
      placeholder: q.placeholder,
      required: q.required,
      order: q.order_index,
      options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : []
    })).sort((a, b) => a.order - b.order) : [];

    const colors = flowData.colors || {
      primary: '#FF6B35',
      secondary: '#3B82F6',
      text: '#1F2937',
      background: '#FFFFFF'
    };

    const position = flowData.position || 'bottom-right';
    const welcomeMessage = flowData.welcome_message || 'Olá! Como posso ajudá-lo?';
    const whatsapp = flowData.whatsapp;
    const showWhatsappButton = flowData.show_whatsapp_button !== false;

    // Criar elementos do DOM
    const chatContainer = document.createElement('div');
    chatContainer.id = 'envialead-chat-container';
    chatContainer.style.cssText = `
      position: fixed;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ${getPositionStyles(position)}
    `;

    // Botão flutuante
    const floatingButton = document.createElement('div');
    floatingButton.id = 'envialead-floating-button';
    floatingButton.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${colors.primary};
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      font-size: 24px;
    `;
    floatingButton.innerHTML = '💬';
    floatingButton.addEventListener('mouseenter', () => {
      floatingButton.style.transform = 'scale(1.1)';
    });
    floatingButton.addEventListener('mouseleave', () => {
      floatingButton.style.transform = 'scale(1)';
    });

    // Mensagem de boas-vindas
    const welcomeBubble = document.createElement('div');
    welcomeBubble.id = 'envialead-welcome-bubble';
    welcomeBubble.style.cssText = `
      position: absolute;
      bottom: 70px;
      right: 0;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 12px 16px;
      max-width: 250px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: block;
      opacity: 1;
      transition: all 0.3s ease;
    `;
    welcomeBubble.innerHTML = `
      <div style="position: relative;">
        <button id="envialead-close-welcome" style="position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border: none; background: #f3f4f6; border-radius: 50%; cursor: pointer; font-size: 12px; color: #6b7280;">×</button>
        <p style="margin: 0; font-size: 14px; color: ${colors.text};">${welcomeMessage}</p>
      </div>
    `;

    // Fechar mensagem de boas-vindas
    setTimeout(() => {
      const closeBtn = document.getElementById('envialead-close-welcome');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          welcomeBubble.style.opacity = '0';
          setTimeout(() => {
            welcomeBubble.style.display = 'none';
          }, 300);
        });
      }
    }, 100);

    // Chat window
    const chatWindow = document.createElement('div');
    chatWindow.id = 'envialead-chat-window';
    chatWindow.style.cssText = `
      position: absolute;
      bottom: 70px;
      right: 0;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
    `;

    // Chat header
    const chatHeader = document.createElement('div');
    chatHeader.style.cssText = `
      background: ${colors.primary};
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    chatHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        ${flowData.avatar_url ? `<img src="${flowData.avatar_url}" style="width: 32px; height: 32px; border-radius: 50%;" alt="Avatar">` : '<div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px;">👤</div>'}
        <div>
          <div style="font-weight: 600; font-size: 14px;">Atendimento</div>
          <div style="font-size: 12px; opacity: 0.9;">Online</div>
        </div>
      </div>
      <button id="envialead-close-chat" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
    `;

    // Chat messages
    const chatMessages = document.createElement('div');
    chatMessages.id = 'envialead-chat-messages';
    chatMessages.style.cssText = `
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9fafb;
    `;

    // Chat input area
    const chatInputArea = document.createElement('div');
    chatInputArea.id = 'envialead-chat-input-area';
    chatInputArea.style.cssText = `
      padding: 16px;
      border-top: 1px solid #e5e7eb;
      background: white;
    `;

    // Montar estrutura
    chatWindow.appendChild(chatHeader);
    chatWindow.appendChild(chatMessages);
    chatWindow.appendChild(chatInputArea);
    
    chatContainer.appendChild(floatingButton);
    chatContainer.appendChild(welcomeBubble);
    chatContainer.appendChild(chatWindow);
    
    document.body.appendChild(chatContainer);

    // Lógica do chat
    let currentQuestionIndex = 0;
    let responses = {};
    let isOpen = false;

    // Event listeners
    floatingButton.addEventListener('click', () => {
      toggleChat();
    });

    document.getElementById('envialead-close-chat').addEventListener('click', () => {
      toggleChat();
    });

    function toggleChat() {
      isOpen = !isOpen;
      if (isOpen) {
        chatWindow.style.display = 'flex';
        welcomeBubble.style.display = 'none';
        if (currentQuestionIndex === 0) {
          showNextQuestion();
        }
      } else {
        chatWindow.style.display = 'none';
      }
    }

    function addMessage(text, isBot = true) {
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        margin-bottom: 12px;
        display: flex;
        ${isBot ? 'justify-content: flex-start' : 'justify-content: flex-end'};
      `;
      
      const messageBubble = document.createElement('div');
      messageBubble.style.cssText = `
        max-width: 80%;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 14px;
        ${isBot ? 
          `background: white; color: ${colors.text}; border: 1px solid #e5e7eb;` : 
          `background: ${colors.primary}; color: white;`
        }
      `;
      messageBubble.textContent = text;
      
      messageDiv.appendChild(messageBubble);
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function showTypingIndicator() {
      const typingDiv = document.createElement('div');
      typingDiv.id = 'typing-indicator';
      typingDiv.style.cssText = `
        margin-bottom: 12px;
        display: flex;
        justify-content: flex-start;
      `;
      
      typingDiv.innerHTML = `
        <div style="background: white; border: 1px solid #e5e7eb; padding: 8px 12px; border-radius: 12px; font-size: 14px;">
          <span style="opacity: 0.6;">...</span>
        </div>
      `;
      
      chatMessages.appendChild(typingDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      setTimeout(() => {
        if (document.getElementById('typing-indicator')) {
          chatMessages.removeChild(typingDiv);
        }
      }, 1500);
    }

    function showNextQuestion() {
      if (currentQuestionIndex >= questions.length) {
        showCompletion();
        return;
      }

      const question = questions[currentQuestionIndex];
      
      // Para mensagens do bot, apenas exibir sem input
      if (question.type === 'bot_message') {
        showTypingIndicator();
        setTimeout(() => {
          addMessage(question.title, true);
          currentQuestionIndex++;
          setTimeout(() => showNextQuestion(), 1000);
        }, 1500);
        return;
      }

      // Mostrar indicador de digitação
      showTypingIndicator();
      
      setTimeout(() => {
        addMessage(question.title, true);
        showQuestionInput(question);
      }, 1500);
    }

    function showQuestionInput(question) {
      const inputArea = document.getElementById('envialead-chat-input-area');
      
      let inputHTML = '';
      
      switch (question.type) {
        case 'text':
        case 'email':
        case 'phone':
          inputHTML = `
            <input type="${question.type}" 
                   id="question-input" 
                   placeholder="${question.placeholder || 'Digite sua resposta...'}" 
                   style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none;"
                   ${question.required ? 'required' : ''}>
            <button id="send-answer" style="margin-top: 8px; width: 100%; padding: 8px; background: ${colors.primary}; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Enviar</button>
          `;
          break;
          
        case 'select':
          const options = question.options || [];
          inputHTML = `
            <select id="question-input" style="width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none;" ${question.required ? 'required' : ''}>
              <option value="">Selecione uma opção...</option>
              ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
            <button id="send-answer" style="margin-top: 8px; width: 100%; padding: 8px; background: ${colors.primary}; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Enviar</button>
          `;
          break;
          
        case 'radio':
          const radioOptions = question.options || [];
          inputHTML = `
            <div style="margin-bottom: 8px;">
              ${radioOptions.map((opt, idx) => `
                <label style="display: block; margin-bottom: 4px; font-size: 14px; cursor: pointer;">
                  <input type="radio" name="question-radio" value="${opt}" style="margin-right: 8px;" ${question.required ? 'required' : ''}>
                  ${opt}
                </label>
              `).join('')}
            </div>
            <button id="send-answer" style="width: 100%; padding: 8px; background: ${colors.primary}; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">Enviar</button>
          `;
          break;
      }
      
      inputArea.innerHTML = inputHTML;
      
      // Event listener para enviar resposta
      const sendBtn = document.getElementById('send-answer');
      const input = document.getElementById('question-input');
      
      function sendAnswer() {
        let answer = '';
        
        if (question.type === 'radio') {
          const selected = document.querySelector('input[name="question-radio"]:checked');
          answer = selected ? selected.value : '';
        } else {
          answer = input ? input.value : '';
        }
        
        if (question.required && !answer.trim()) {
          alert('Por favor, responda esta pergunta.');
          return;
        }
        
        // Salvar resposta
        responses[question.id] = answer;
        
        // Mostrar resposta do usuário
        addMessage(answer, false);
        
        // Próxima pergunta
        currentQuestionIndex++;
        
        // Limpar área de input
        inputArea.innerHTML = '';
        
        // Mostrar próxima pergunta após delay
        setTimeout(() => showNextQuestion(), 1000);
      }
      
      sendBtn.addEventListener('click', sendAnswer);
      
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            sendAnswer();
          }
        });
        input.focus();
      }
    }

    function showCompletion() {
      addMessage('Obrigado pelas informações! Em breve entraremos em contato.', true);
      
      // Salvar lead
      saveLead();
      
      // Mostrar botão do WhatsApp se configurado
      if (showWhatsappButton && whatsapp) {
        setTimeout(() => {
          showWhatsAppButton();
        }, 2000);
      }
    }

    function showWhatsAppButton() {
      const inputArea = document.getElementById('envialead-chat-input-area');
      
      // Preparar texto com todas as respostas
      let messageText = 'Olá! Gostaria de continuar nossa conversa. Aqui estão minhas informações:\n\n';
      
      questions.forEach(q => {
        if (responses[q.id] && q.type !== 'bot_message') {
          messageText += `${q.title}: ${responses[q.id]}\n`;
        }
      });
      
      const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(messageText)}`;
      
      inputArea.innerHTML = `
        <a href="${whatsappUrl}" target="_blank" style="display: block; width: 100%; padding: 12px; background: #25d366; color: white; text-decoration: none; border-radius: 8px; text-align: center; font-size: 14px; font-weight: 600;">
          💬 Continuar no WhatsApp
        </a>
      `;
    }

    async function saveLead() {
      try {
        const leadData = {
          flow_id: flowId,
          responses: responses,
          completed: true,
          ip_address: null, // Será preenchido pelo backend se necessário
          user_agent: navigator.userAgent
        };

        await fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/rest/v1/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
          },
          body: JSON.stringify(leadData)
        });

        console.log('[EnviaLead] Lead salvo com sucesso');
      } catch (error) {
        console.error('[EnviaLead] Erro ao salvar lead:', error);
      }
    }
  }

  function getPositionStyles(position) {
    const positions = {
      'bottom-right': 'bottom: 20px; right: 20px;',
      'bottom-left': 'bottom: 20px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
      'center-right': 'top: 50%; right: 20px; transform: translateY(-50%);',
      'center-left': 'top: 50%; left: 20px; transform: translateY(-50%);'
    };
    
    return positions[position] || positions['bottom-right'];
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchFlowData);
  } else {
    fetchFlowData();
  }
})();
