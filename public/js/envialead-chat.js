
// EnviaLead Chat Widget - Sistema Completo v9.0
// Script principal otimizado com monitoramento de conexões

(function() {
  'use strict';

  console.log('[EnviaLead] Iniciando sistema v9.0...');

  // Prevent double loading
  if (window.enviaLeadLoaded) {
    console.log('[EnviaLead] Sistema já carregado');
    return;
  }
  window.enviaLeadLoaded = true;

  // Global configuration
  window.EnviaLeadConfig = {
    API_BASE: 'https://fuzkdrkhvmaimpgzvimq.supabase.co',
    API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
  };

  // Utility functions
  const EnviaLeadUtils = {
    extractFlowId: function() {
      let flowId = null;
      
      console.log('[EnviaLead] Extraindo Flow ID...');
      
      // Method 1: Check data-flow-id on current script
      const currentScript = document.currentScript;
      if (currentScript) {
        flowId = currentScript.getAttribute('data-flow-id');
        console.log('[EnviaLead] Flow ID do script atual:', flowId);
      }
      
      // Method 2: Search all scripts with data-flow-id
      if (!flowId) {
        const scripts = document.querySelectorAll('script[data-flow-id]');
        console.log('[EnviaLead] Scripts com data-flow-id encontrados:', scripts.length);
        if (scripts.length > 0) {
          flowId = scripts[scripts.length - 1].getAttribute('data-flow-id');
          console.log('[EnviaLead] Flow ID dos scripts:', flowId);
        }
      }
      
      // Method 3: Check global variable
      if (!flowId) {
        flowId = window.enviaLeadId;
        console.log('[EnviaLead] Flow ID da variável global:', flowId);
      }
      
      // Method 4: Check for EnviaLead code format (EL_XXXXXXXX)
      if (!flowId) {
        const allScripts = document.querySelectorAll('script');
        for (const script of allScripts) {
          const src = script.src;
          if (src && src.includes('envialead')) {
            const match = src.match(/data-flow-id[="]([^"&]+)/);
            if (match) {
              flowId = match[1];
              break;
            }
          }
        }
      }
      
      console.log('[EnviaLead] Flow ID final extraído:', flowId);
      return flowId;
    },

    convertFlowId: async function(flowId) {
      console.log('[EnviaLead] Convertendo Flow ID:', flowId);
      
      if (!flowId) return null;
      
      // Se não começar com EL_, é provavelmente um UUID direto
      if (!flowId.startsWith('EL_')) {
        console.log('[EnviaLead] Flow ID já no formato UUID');
        return flowId;
      }

      try {
        const response = await fetch(`${window.EnviaLeadConfig.API_BASE}/rest/v1/flows?select=*`, {
          headers: {
            'apikey': window.EnviaLeadConfig.API_KEY,
            'Authorization': `Bearer ${window.EnviaLeadConfig.API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const allFlows = await response.json();
          console.log('[EnviaLead] Total de fluxos encontrados:', allFlows.length);
          
          for (const flow of allFlows) {
            const code = `EL_${flow.id.replace(/-/g, '').substring(0, 16).toUpperCase()}`;
            if (code === flowId) {
              console.log('[EnviaLead] Flow ID convertido:', flowId, '->', flow.id);
              return flow.id;
            }
          }
          
          console.error('[EnviaLead] Flow ID não encontrado:', flowId);
        }
      } catch (error) {
        console.error('[EnviaLead] Erro aoConverter Flow ID:', error);
      }

      return null;
    },

    fetchFlowData: async function(flowId) {
      try {
        console.log('[EnviaLead] Buscando dados do fluxo:', flowId);
        
        const actualFlowId = await this.convertFlowId(flowId);
        if (!actualFlowId) {
          console.error('[EnviaLead] Flow ID inválido');
          return null;
        }

        const response = await fetch(`${window.EnviaLeadConfig.API_BASE}/rest/v1/flows?id=eq.${actualFlowId}&select=*,questions(*),flow_urls(*),flow_emails(*)`, {
          headers: {
            'apikey': window.EnviaLeadConfig.API_KEY,
            'Authorization': `Bearer ${window.EnviaLeadConfig.API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const flows = await response.json();
        if (!flows || flows.length === 0) {
          console.error('[EnviaLead] Fluxo não encontrado');
          return null;
        }

        const flow = flows[0];
        console.log('[EnviaLead] Fluxo encontrado:', flow.name);
        
        // Registrar conexão
        this.registerConnection(actualFlowId);
        
        return flow;
      } catch (error) {
        console.error('[EnviaLead] Erro ao buscar fluxo:', error);
        return null;
      }
    },

    registerConnection: async function(flowId) {
      try {
        const connectionData = {
          flow_id: flowId,
          url: window.location.href,
          user_agent: navigator.userAgent,
          last_ping: new Date().toISOString()
        };

        console.log('[EnviaLead] Registrando conexão:', connectionData);

        await fetch(`${window.EnviaLeadConfig.API_BASE}/rest/v1/flow_connections`, {
          method: 'POST',
          headers: {
            'apikey': window.EnviaLeadConfig.API_KEY,
            'Authorization': `Bearer ${window.EnviaLeadConfig.API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(connectionData)
        });

        // Ping periódico para manter conexão ativa
        setInterval(() => {
          this.pingConnection(flowId);
        }, 60000); // A cada minuto

      } catch (error) {
        console.error('[EnviaLead] Erro ao registrar conexão:', error);
      }
    },

    pingConnection: async function(flowId) {
      try {
        await fetch(`${window.EnviaLeadConfig.API_BASE}/rest/v1/flow_connections?flow_id=eq.${flowId}&url=eq.${encodeURIComponent(window.location.href)}`, {
          method: 'PATCH',
          headers: {
            'apikey': window.EnviaLeadConfig.API_KEY,
            'Authorization': `Bearer ${window.EnviaLeadConfig.API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            last_ping: new Date().toISOString(),
            is_active: true
          })
        });
      } catch (error) {
        console.error('[EnviaLead] Erro no ping:', error);
      }
    },

    isUrlAuthorized: function(currentUrl, currentDomain, authorizedUrls) {
      console.log('[EnviaLead] Verificando autorização...');
      console.log('[EnviaLead] URL atual:', currentUrl);
      console.log('[EnviaLead] URLs autorizadas:', authorizedUrls);
      
      if (!authorizedUrls || authorizedUrls.length === 0) {
        console.log('[EnviaLead] Sem restrições de URL');
        return true;
      }

      const validUrls = authorizedUrls.filter(url => url && url.trim() !== '');
      if (validUrls.length === 0) {
        return true;
      }

      for (const authorizedUrl of validUrls) {
        if (authorizedUrl === '*') {
          return true;
        }
        
        const normalizedAuth = authorizedUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        const normalizedCurrent = currentUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        if (normalizedCurrent === normalizedAuth || 
            normalizedCurrent.includes(normalizedAuth) || 
            currentDomain.includes(normalizedAuth.split('/')[0])) {
          console.log('[EnviaLead] URL autorizada');
          return true;
        }
      }

      console.log('[EnviaLead] URL não autorizada');
      return false;
    }
  };

  // Widget creation functions
  const EnviaLeadWidget = {
    createFloatingButton: function(colors, buttonPosition, avatarUrl) {
      const floatingButton = document.createElement('div');
      floatingButton.id = 'envialead-floating-button';
      floatingButton.style.cssText = `
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary});
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        font-size: 24px;
        overflow: hidden;
        position: relative;
        z-index: 9999;
      `;

      if (avatarUrl) {
        floatingButton.innerHTML = `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" alt="Avatar">`;
      } else {
        floatingButton.innerHTML = '💬';
      }

      floatingButton.addEventListener('mouseenter', () => {
        floatingButton.style.transform = 'scale(1.1)';
        floatingButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
      });
      floatingButton.addEventListener('mouseleave', () => {
        floatingButton.style.transform = 'scale(1)';
        floatingButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      });

      return floatingButton;
    },

    createWelcomeBubble: function(welcomeMessage, colors, buttonPosition) {
      const welcomeBubble = document.createElement('div');
      welcomeBubble.id = 'envialead-welcome-bubble';
      
      // Position bubble opposite to button
      let bubblePosition = '';
      if (buttonPosition.includes('right')) {
        bubblePosition = 'right: 0; left: auto;';
      } else if (buttonPosition.includes('left')) {
        bubblePosition = 'left: 0; right: auto;';
      } else {
        bubblePosition = 'right: 0; left: auto;';
      }
      
      welcomeBubble.style.cssText = `
        position: absolute;
        bottom: 70px;
        ${bubblePosition}
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px 20px;
        max-width: 280px;
        min-width: 220px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: block;
        opacity: 1;
        transition: all 0.3s ease;
        animation: slideIn 0.3s ease-out;
        word-wrap: break-word;
        z-index: 9998;
      `;

      welcomeBubble.innerHTML = `
        <div style="position: relative;">
          <button id="envialead-close-welcome" style="position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border: none; background: #f3f4f6; border-radius: 50%; cursor: pointer; font-size: 12px; color: #6b7280; display: flex; align-items: center; justify-content: center;">×</button>
          <p style="margin: 0; font-size: 14px; color: ${colors.text}; line-height: 1.4;">${welcomeMessage}</p>
        </div>
      `;

      return welcomeBubble;
    },

    createChatWindow: function(colors, flowData, buttonPosition) {
      const chatWindow = document.createElement('div');
      chatWindow.id = 'envialead-chat-window';
      
      // Position window opposite to button
      let windowPosition = this.getChatWindowPosition(buttonPosition);
      
      chatWindow.style.cssText = `
        position: fixed;
        width: 350px;
        height: 500px;
        ${windowPosition}
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      chatWindow.innerHTML = `
        <!-- Header -->
        <div id="envialead-chat-header" style="
          background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary});
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        ">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${flowData.avatar_url ? 
              `<img src="${flowData.avatar_url}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" alt="Avatar">` : 
              '<div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;">👤</div>'
            }
            <div>
              <div style="font-weight: 600; font-size: 14px;">${flowData.name || 'Atendimento'}</div>
              <div style="font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 4px;">
                <div style="width: 6px; height: 6px; background: #10b981; border-radius: 50%; animation: pulse 2s infinite;"></div>
                Online agora
              </div>
            </div>
          </div>
          <button id="envialead-close-chat" style="
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: background 0.2s;
          " onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">×</button>
        </div>

        <!-- Messages -->
        <div id="envialead-chat-messages" style="
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          background: #f9fafb;
          display: flex;
          flex-direction: column;
          gap: 12px;
        "></div>

        <!-- Input Area -->
        <div id="envialead-chat-input-area" style="
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          background: white;
        "></div>
      `;

      return chatWindow;
    },

    getChatWindowPosition: function(buttonPosition) {
      const positions = {
        'bottom-right': 'bottom: 100px; right: 20px;',
        'bottom-left': 'bottom: 100px; left: 20px;',
        'bottom-center': 'bottom: 100px; left: 50%; transform: translateX(-50%);',
        'top-right': 'top: 90px; right: 20px;',
        'top-left': 'top: 90px; left: 20px;',
        'top-center': 'top: 90px; left: 50%; transform: translateX(-50%);',
        'center-right': 'top: 50%; right: 100px; transform: translateY(-50%);',
        'center-left': 'top: 50%; left: 100px; transform: translateY(-50%);',
        'center-center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
      };
      return positions[buttonPosition] || positions['bottom-right'];
    },

    getPositionStyles: function(position) {
      const positions = {
        'bottom-right': 'bottom: 80px; right: 20px;',
        'bottom-left': 'bottom: 80px; left: 20px;',
        'bottom-center': 'bottom: 80px; left: 50%; transform: translateX(-50%);',
        'top-right': 'top: 20px; right: 20px;',
        'top-left': 'top: 20px; left: 20px;',
        'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
        'center-right': 'top: 50%; right: 20px; transform: translateY(-50%);',
        'center-left': 'top: 50%; left: 20px; transform: translateY(-50%);',
        'center-center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
      };
      
      return positions[position] || positions['bottom-right'];
    }
  };

  // Chat functionality
  const EnviaLeadChat = {
    init: function(flowData, colors) {
      this.flowData = flowData;
      this.colors = colors;
      this.questions = this.processQuestions(flowData.questions);
      this.currentQuestionIndex = 0;
      this.responses = {};
      this.isOpen = false;
      this.isTyping = false;
    },

    processQuestions: function(questions) {
      return questions ? questions
        .map(q => ({
          id: q.id,
          type: q.type,
          title: q.title,
          placeholder: q.placeholder,
          required: q.required,
          order: q.order_index || 0,
          options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : []
        }))
        .sort((a, b) => a.order - b.order) : [];
    },

    toggleChat: function() {
      this.isOpen = !this.isOpen;
      console.log('[EnviaLead] Toggle chat:', this.isOpen);
      
      const chatWindow = document.getElementById('envialead-chat-window');
      const welcomeBubble = document.getElementById('envialead-welcome-bubble');
      
      if (this.isOpen) {
        chatWindow.style.display = 'flex';
        if (welcomeBubble) welcomeBubble.style.display = 'none';
        if (this.currentQuestionIndex === 0 && this.questions.length > 0) {
          setTimeout(() => this.showWelcomeMessage(), 1000);
        }
      } else {
        chatWindow.style.display = 'none';
      }
    },

    showWelcomeMessage: function() {
      const welcomeMsg = this.flowData.welcome_message || 'Olá! Como posso ajudá-lo hoje?';
      this.addMessage(welcomeMsg, true);
      setTimeout(() => this.showNextQuestion(), 2000);
    },

    addMessage: function(text, isBot = true) {
      const chatMessages = document.getElementById('envialead-chat-messages');
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        display: flex;
        ${isBot ? 'justify-content: flex-start' : 'justify-content: flex-end'};
        animation: messageSlideIn 0.3s ease-out;
      `;
      
      const messageBubble = document.createElement('div');
      messageBubble.style.cssText = `
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
        ${isBot ? 
          `background: white; color: ${this.colors.text}; border: 1px solid #e5e7eb; border-radius: 16px 16px 16px 4px;` : 
          `background: linear-gradient(45deg, ${this.colors.primary}, ${this.colors.secondary}); color: white; border-radius: 16px 16px 4px 16px;`
        }
      `;
      messageBubble.textContent = text;
      
      messageDiv.appendChild(messageBubble);
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    showTypingIndicator: function() {
      const chatMessages = document.getElementById('envialead-chat-messages');
      const typingDiv = document.createElement('div');
      typingDiv.id = 'typing-indicator';
      typingDiv.style.cssText = `
        display: flex;
        justify-content: flex-start;
        margin-bottom: 8px;
      `;
      
      typingDiv.innerHTML = `
        <div style="background: white; border: 1px solid #e5e7eb; padding: 12px 16px; border-radius: 16px 16px 16px 4px; display: flex; gap: 4px; align-items: center;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: typing 1.4s infinite;"></div>
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: typing 1.4s infinite 0.2s;"></div>
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: typing 1.4s infinite 0.4s;"></div>
        </div>
      `;
      
      chatMessages.appendChild(typingDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      this.isTyping = true;
      
      return typingDiv;
    },

    removeTypingIndicator: function() {
      const typing = document.getElementById('typing-indicator');
      if (typing) {
        typing.remove();
      }
      this.isTyping = false;
    },

    showNextQuestion: function() {
      if (this.currentQuestionIndex >= this.questions.length) {
        this.showCompletion();
        return;
      }

      const question = this.questions[this.currentQuestionIndex];
      console.log('[EnviaLead] Showing question:', question.title);
      
      // Show typing indicator
      const typing = this.showTypingIndicator();
      
      setTimeout(() => {
        this.removeTypingIndicator();
        this.addMessage(question.title, true);
        this.showQuestionInput(question);
      }, 1500);
    },

    showQuestionInput: function(question) {
      const inputArea = document.getElementById('envialead-chat-input-area');
      
      let inputHTML = '';
      
      switch (question.type) {
        case 'text':
        case 'email':
        case 'phone':
          inputHTML = `
            <input type="${question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 'text'}" 
                   id="question-input" 
                   placeholder="${question.placeholder || 'Digite sua resposta...'}" 
                   style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s; margin-bottom: 8px;"
                   onfocus="this.style.borderColor='${this.colors.primary}'"
                   onblur="this.style.borderColor='#e5e7eb'"
                   ${question.required ? 'required' : ''}>
            <button id="send-answer" style="width: 100%; padding: 12px; background: linear-gradient(45deg, ${this.colors.primary}, ${this.colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Enviar</button>
          `;
          break;
          
        case 'select':
          const options = question.options || [];
          inputHTML = `
            <select id="question-input" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; background: white; margin-bottom: 8px;" ${question.required ? 'required' : ''}>
              <option value="">Selecione uma opção...</option>
              ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
            <button id="send-answer" style="width: 100%; padding: 12px; background: linear-gradient(45deg, ${this.colors.primary}, ${this.colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Enviar</button>
          `;
          break;
          
        case 'radio':
          const radioOptions = question.options || [];
          inputHTML = `
            <div style="margin-bottom: 12px; max-height: 200px; overflow-y: auto;">
              ${radioOptions.map((opt, idx) => `
                <label style="display: block; margin-bottom: 8px; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; cursor: pointer; transition: all 0.2s; background: white;" 
                       onmouseover="this.style.borderColor='${this.colors.primary}'; this.style.backgroundColor='#f8fafc';" 
                       onmouseout="this.style.borderColor='#e5e7eb'; this.style.backgroundColor='white';"
                       onclick="this.querySelector('input').checked=true; this.style.borderColor='${this.colors.primary}'; this.style.backgroundColor='#f0f9ff';">
                  <input type="radio" name="question-radio" value="${opt}" style="margin-right: 10px;" ${question.required ? 'required' : ''}>
                  ${opt}
                </label>
              `).join('')}
            </div>
            <button id="send-answer" style="width: 100%; padding: 12px; background: linear-gradient(45deg, ${this.colors.primary}, ${this.colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Enviar</button>
          `;
          break;
      }
      
      inputArea.innerHTML = inputHTML;
      
      // Event listeners
      const sendBtn = document.getElementById('send-answer');
      const input = document.getElementById('question-input');
      
      const sendAnswer = () => {
        let answer = '';
        
        if (question.type === 'radio') {
          const selected = document.querySelector('input[name="question-radio"]:checked');
          answer = selected ? selected.value : '';
        } else {
          answer = input ? input.value.trim() : '';
        }
        
        if (question.required && !answer) {
          alert('Por favor, responda esta pergunta.');
          return;
        }
        
        // Save response
        this.responses[question.id] = answer;
        
        // Show user response
        this.addMessage(answer, false);
        
        // Next question
        this.currentQuestionIndex++;
        
        // Clear input area
        inputArea.innerHTML = '';
        
        // Show next question
        setTimeout(() => this.showNextQuestion(), 1000);
      };
      
      if (sendBtn) {
        sendBtn.addEventListener('click', sendAnswer);
      }
      
      if (input) {
        input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            sendAnswer();
          }
        });
        input.focus();
      }
    },

    showCompletion: function() {
      this.addMessage('Obrigado! Suas informações foram recebidas. Em breve entraremos em contato.', true);
      
      // Save lead
      this.saveLead();
      
      // Show WhatsApp button if configured
      if (this.flowData.whatsapp) {
        setTimeout(() => this.showWhatsAppButton(), 2000);
      }
    },

    showWhatsAppButton: function() {
      const inputArea = document.getElementById('envialead-chat-input-area');
      
      // Prepare message text with responses
      let messageText = 'Olá! Gostaria de continuar nossa conversa. Aqui estão minhas informações:\n\n';
      
      this.questions.forEach(q => {
        if (this.responses[q.id]) {
          messageText += `${q.title}: ${this.responses[q.id]}\n`;
        }
      });
      
      const whatsappNumber = this.flowData.whatsapp.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
      
      inputArea.innerHTML = `
        <a href="${whatsappUrl}" target="_blank" style="display: block; width: 100%; padding: 12px; background: #25d366; color: white; text-decoration: none; border-radius: 8px; text-align: center; font-size: 14px; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='#22c55e'" onmouseout="this.style.background='#25d366'">
          💬 Continuar no WhatsApp
        </a>
      `;
    },

    saveLead: async function() {
      try {
        const leadData = {
          flow_id: this.flowData.id,
          responses: this.responses,
          ip_address: null, // Could be retrieved via external service
          user_agent: navigator.userAgent,
          completed: true,
          company_id: this.flowData.company_id
        };

        console.log('[EnviaLead] Salvando lead:', leadData);

        await fetch(`${window.EnviaLeadConfig.API_BASE}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'apikey': window.EnviaLeadConfig.API_KEY,
            'Authorization': `Bearer ${window.EnviaLeadConfig.API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(leadData)
        });

        console.log('[EnviaLead] Lead salvo com sucesso');
      } catch (error) {
        console.error('[EnviaLead] Erro ao salvar lead:', error);
      }
    }
  };

  // Main initialization
  async function initializeEnviaLead() {
    console.log('[EnviaLead] Iniciando inicialização...');
    
    const flowId = EnviaLeadUtils.extractFlowId();
    if (!flowId) {
      console.error('[EnviaLead] Flow ID não encontrado');
      return;
    }

    console.log('[EnviaLead] Flow ID extraído:', flowId);

    const flowData = await EnviaLeadUtils.fetchFlowData(flowId);
    if (!flowData) {
      console.error('[EnviaLead] Dados do fluxo não encontrados');
      return;
    }

    if (!flowData.is_active) {
      console.log('[EnviaLead] Fluxo inativo');
      return;
    }

    const currentUrl = window.location.href;
    const currentDomain = window.location.hostname;
    const authorizedUrls = flowData.flow_urls ? flowData.flow_urls.map(u => u.url) : [];

    if (!EnviaLeadUtils.isUrlAuthorized(currentUrl, currentDomain, authorizedUrls)) {
      console.log('[EnviaLead] URL não autorizada para este fluxo');
      return;
    }

    console.log('[EnviaLead] Criando widget...');
    createWidget(flowData);
  }

  function createWidget(flowData) {
    const colors = {
      primary: flowData.colors?.primary || '#FF6B35',
      secondary: flowData.colors?.secondary || '#3B82F6',
      text: flowData.colors?.text || '#1F2937'
    };

    const buttonPosition = flowData.position || 'bottom-right';
    
    // Remove existing widget
    const existing = document.getElementById('envialead-chat-container');
    if (existing) existing.remove();

    // Create main container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'envialead-chat-container';
    chatContainer.style.cssText = `
      position: fixed;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ${EnviaLeadWidget.getPositionStyles(buttonPosition)}
    `;

    // Create floating button
    const floatingButton = EnviaLeadWidget.createFloatingButton(colors, buttonPosition, flowData.avatar_url);
    
    // Create welcome bubble
    const welcomeBubble = EnviaLeadWidget.createWelcomeBubble(
      flowData.welcome_message || 'Olá! Como posso ajudá-lo hoje?', 
      colors,
      buttonPosition
    );

    // Create chat window
    const chatWindow = EnviaLeadWidget.createChatWindow(colors, flowData, buttonPosition);

    chatContainer.appendChild(floatingButton);
    chatContainer.appendChild(welcomeBubble);
    chatContainer.appendChild(chatWindow);
    document.body.appendChild(chatContainer);

    // Initialize chat logic
    EnviaLeadChat.init(flowData, colors);

    // Add event listeners
    floatingButton.addEventListener('click', () => {
      console.log('[EnviaLead] Botão clicado - toggle chat');
      EnviaLeadChat.toggleChat();
    });

    const closeChat = document.getElementById('envialead-close-chat');
    if (closeChat) {
      closeChat.addEventListener('click', () => {
        EnviaLeadChat.toggleChat();
      });
    }

    const closeWelcome = document.getElementById('envialead-close-welcome');
    if (closeWelcome) {
      closeWelcome.addEventListener('click', () => {
        welcomeBubble.style.display = 'none';
      });
    }

    console.log('[EnviaLead] Widget criado com sucesso!');
  }

  // Add CSS animations
  function injectStyles() {
    if (document.getElementById('envialead-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'envialead-styles';
    style.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes messageSlideIn {
        from { opacity: 0; transform: translateX(-10px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes typing {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      #envialead-chat-container * {
        box-sizing: border-box;
      }
    `;
    document.head.appendChild(style);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectStyles();
      initializeEnviaLead();
    });
  } else {
    injectStyles();
    initializeEnviaLead();
  }

})();
