
(function() {
  console.log('[EnviaLead] Script iniciado');
  
  if (window.enviaLeadLoaded) {
    console.log('[EnviaLead] Script já carregado');
    return;
  }
  window.enviaLeadLoaded = true;

  // Extrair ID do fluxo do atributo do script
  let flowId = null;
  const currentScript = document.currentScript;
  
  if (currentScript) {
    flowId = currentScript.getAttribute('data-flow-id');
  }
  
  // Fallback: buscar em todos os scripts
  if (!flowId) {
    const scripts = document.querySelectorAll('script[data-flow-id]');
    if (scripts.length > 0) {
      flowId = scripts[scripts.length - 1].getAttribute('data-flow-id');
    }
  }
  
  // Fallback: usar variável global
  if (!flowId) {
    flowId = window.enviaLeadId;
  }
  
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
      
      let actualFlowId = flowId;
      
      // Se o ID começa com EL_, converter para o ID real
      if (flowId.startsWith('EL_')) {
        console.log('[EnviaLead] Convertendo ID do formato EL_...');
        
        const response = await fetch(`https://fuzkdrkhvmaimpgzvimq.supabase.co/rest/v1/flows?select=*,questions(*),flow_urls(*),flow_emails(*)`, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
          }
        });

        if (response.ok) {
          const allFlows = await response.json();
          console.log('[EnviaLead] Fluxos encontrados:', allFlows.length);
          
          for (const flow of allFlows) {
            const code = `EL_${flow.id.replace(/-/g, '').substring(0, 16).toUpperCase()}`;
            if (code === flowId) {
              actualFlowId = flow.id;
              console.log('[EnviaLead] Flow ID convertido:', flowId, '->', actualFlowId);
              break;
            }
          }
        }
      }

      // Buscar o fluxo específico
      const flowResponse = await fetch(`https://fuzkdrkhvmaimpgzvimq.supabase.co/rest/v1/flows?id=eq.${actualFlowId}&select=*,questions(*),flow_urls(*),flow_emails(*)`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
        }
      });

      if (!flowResponse.ok) {
        throw new Error(`HTTP ${flowResponse.status} - ${flowResponse.statusText}`);
      }

      const flows = await flowResponse.json();
      console.log('[EnviaLead] Resposta da API:', flows);

      if (!flows || flows.length === 0) {
        console.error('[EnviaLead] Fluxo não encontrado para ID:', actualFlowId);
        return;
      }

      const flow = flows[0];
      console.log('[EnviaLead] Fluxo encontrado:', flow.name);
      
      // Verificar se o fluxo está ativo
      if (!flow.is_active) {
        console.log('[EnviaLead] Fluxo está inativo');
        return;
      }

      // Verificar URLs autorizadas
      const authorizedUrls = flow.flow_urls?.map(urlObj => urlObj.url) || [];
      console.log('[EnviaLead] URLs autorizadas:', authorizedUrls);
      
      if (authorizedUrls.length > 0) {
        const isUrlAuthorized = authorizedUrls.some(url => {
          if (url === '*') return true;
          return currentUrl.includes(url.replace(/^https?:\/\//, '').replace(/\/$/, ''));
        });

        if (!isUrlAuthorized) {
          console.log('[EnviaLead] URL não autorizada:', currentUrl);
          return;
        }
      }

      console.log('[EnviaLead] Criando widget do chat...');
      createChatWidget(flow);

    } catch (error) {
      console.error('[EnviaLead] Erro ao buscar dados do fluxo:', error);
    }
  }

  // Função para criar o widget do chat
  function createChatWidget(flowData) {
    console.log('[EnviaLead] Criando widget para fluxo:', flowData.name);

    // Processar perguntas ordenadas
    const questions = flowData.questions ? flowData.questions
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

    console.log('[EnviaLead] Perguntas processadas:', questions.length);

    const colors = flowData.colors || {
      primary: '#FF6B35',
      secondary: '#3B82F6',
      text: '#1F2937',
      background: '#FFFFFF'
    };

    const buttonPosition = flowData.button_position || flowData.position || 'bottom-right';
    const chatPosition = flowData.chat_position || flowData.position || 'bottom-right';
    const welcomeMessage = flowData.welcome_message || 'Olá! Como posso ajudá-lo?';

    // Criar container principal
    const chatContainer = document.createElement('div');
    chatContainer.id = 'envialead-chat-container';
    chatContainer.style.cssText = `
      position: fixed;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ${getPositionStyles(buttonPosition)}
    `;

    // Botão flutuante
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
    `;
    floatingButton.innerHTML = '💬';

    // Hover effects
    floatingButton.addEventListener('mouseenter', () => {
      floatingButton.style.transform = 'scale(1.1)';
      floatingButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
    });
    floatingButton.addEventListener('mouseleave', () => {
      floatingButton.style.transform = 'scale(1)';
      floatingButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    });

    // Bolha de boas-vindas
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
      animation: slideIn 0.3s ease-out;
    `;

    welcomeBubble.innerHTML = `
      <div style="position: relative;">
        <button id="envialead-close-welcome" style="position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; border: none; background: #f3f4f6; border-radius: 50%; cursor: pointer; font-size: 12px; color: #6b7280; display: flex; align-items: center; justify-content: center;">×</button>
        <p style="margin: 0; font-size: 14px; color: ${colors.text}; line-height: 1.4;">${welcomeMessage}</p>
      </div>
    `;

    // Janela do chat
    const chatWindow = document.createElement('div');
    chatWindow.id = 'envialead-chat-window';
    const chatWindowPosition = getChatWindowPosition(chatPosition);
    chatWindow.style.cssText = `
      position: fixed;
      ${chatWindowPosition}
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 10001;
      animation: chatSlideIn 0.3s ease-out;
    `;

    // Adicionar animações CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes chatSlideIn {
        from { opacity: 0; transform: scale(0.9) translateY(20px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
    `;
    document.head.appendChild(style);

    // Header do chat
    const chatHeader = document.createElement('div');
    chatHeader.style.cssText = `
      background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary});
      color: white;
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    chatHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        ${flowData.avatar_url ? 
          `<img src="${flowData.avatar_url}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;" alt="Avatar">` : 
          '<div style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 14px;">👤</div>'
        }
        <div>
          <div style="font-weight: 600; font-size: 14px;">Atendimento</div>
          <div style="font-size: 12px; opacity: 0.9;">Online</div>
        </div>
      </div>
      <button id="envialead-close-chat" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">×</button>
    `;

    // Área de mensagens
    const chatMessages = document.createElement('div');
    chatMessages.id = 'envialead-chat-messages';
    chatMessages.style.cssText = `
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: #f9fafb;
    `;

    // Área de input
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

    // Variáveis do chat
    let currentQuestionIndex = 0;
    let responses = {};
    let isOpen = false;

    // Event listeners
    floatingButton.addEventListener('click', toggleChat);
    
    // Fechar bolha de boas-vindas
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

      const closeChatBtn = document.getElementById('envialead-close-chat');
      if (closeChatBtn) {
        closeChatBtn.addEventListener('click', toggleChat);
      }
    }, 100);

    function toggleChat() {
      isOpen = !isOpen;
      if (isOpen) {
        chatWindow.style.display = 'flex';
        welcomeBubble.style.display = 'none';
        if (currentQuestionIndex === 0) {
          setTimeout(() => showNextQuestion(), 500);
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
        animation: messageSlideIn 0.3s ease-out;
      `;
      
      const messageBubble = document.createElement('div');
      messageBubble.style.cssText = `
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.4;
        ${isBot ? 
          `background: white; color: ${colors.text}; border: 1px solid #e5e7eb; border-radius: 18px 18px 18px 4px;` : 
          `background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}); color: white; border-radius: 18px 18px 4px 18px;`
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
        <div style="background: white; border: 1px solid #e5e7eb; padding: 10px 14px; border-radius: 18px 18px 18px 4px; font-size: 14px;">
          <div style="display: flex; gap: 4px; align-items: center;">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: typing 1.4s infinite;"></div>
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: typing 1.4s infinite 0.2s;"></div>
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #9ca3af; animation: typing 1.4s infinite 0.4s;"></div>
          </div>
        </div>
      `;
      
      chatMessages.appendChild(typingDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      
      // Adicionar animação de digitação
      if (!document.getElementById('typing-animation')) {
        const typingStyle = document.createElement('style');
        typingStyle.id = 'typing-animation';
        typingStyle.textContent = `
          @keyframes typing {
            0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
            30% { opacity: 1; transform: scale(1); }
          }
          @keyframes messageSlideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `;
        document.head.appendChild(typingStyle);
      }
      
      return typingDiv;
    }

    function removeTypingIndicator() {
      const typing = document.getElementById('typing-indicator');
      if (typing) {
        typing.remove();
      }
    }

    function showNextQuestion() {
      if (currentQuestionIndex >= questions.length) {
        showCompletion();
        return;
      }

      const question = questions[currentQuestionIndex];
      console.log('[EnviaLead] Mostrando pergunta:', question.title);
      
      // Para mensagens do bot
      if (question.type === 'bot_message') {
        const typing = showTypingIndicator();
        setTimeout(() => {
          removeTypingIndicator();
          addMessage(question.title, true);
          currentQuestionIndex++;
          setTimeout(() => showNextQuestion(), 1000);
        }, 1500);
        return;
      }

      // Mostrar indicador de digitação
      const typing = showTypingIndicator();
      
      setTimeout(() => {
        removeTypingIndicator();
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
            <input type="${question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 'text'}" 
                   id="question-input" 
                   placeholder="${question.placeholder || 'Digite sua resposta...'}" 
                   style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                   onfocus="this.style.borderColor='${colors.primary}'"
                   onblur="this.style.borderColor='#e5e7eb'"
                   ${question.required ? 'required' : ''}>
            <button id="send-answer" style="margin-top: 8px; width: 100%; padding: 12px; background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Enviar</button>
          `;
          break;
          
        case 'select':
          const options = question.options || [];
          inputHTML = `
            <select id="question-input" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; background: white;" ${question.required ? 'required' : ''}>
              <option value="">Selecione uma opção...</option>
              ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
            <button id="send-answer" style="margin-top: 8px; width: 100%; padding: 12px; background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Enviar</button>
          `;
          break;
          
        case 'radio':
          const radioOptions = question.options || [];
          inputHTML = `
            <div style="margin-bottom: 12px; max-height: 200px; overflow-y: auto;">
              ${radioOptions.map((opt, idx) => `
                <label style="display: block; margin-bottom: 8px; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; cursor: pointer; transition: all 0.2s; background: white;" 
                       onmouseover="this.style.borderColor='${colors.primary}'; this.style.backgroundColor='#f8fafc';" 
                       onmouseout="this.style.borderColor='#e5e7eb'; this.style.backgroundColor='white';"
                       onclick="this.querySelector('input').checked=true; this.style.borderColor='${colors.primary}'; this.style.backgroundColor='#f0f9ff';">
                  <input type="radio" name="question-radio" value="${opt}" style="margin-right: 10px;" ${question.required ? 'required' : ''}>
                  ${opt}
                </label>
              `).join('')}
            </div>
            <button id="send-answer" style="width: 100%; padding: 12px; background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Enviar</button>
          `;
          break;
      }
      
      inputArea.innerHTML = inputHTML;
      
      // Event listeners
      const sendBtn = document.getElementById('send-answer');
      const input = document.getElementById('question-input');
      
      function sendAnswer() {
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
        
        // Salvar resposta
        responses[question.id] = answer;
        
        // Mostrar resposta do usuário
        addMessage(answer, false);
        
        // Próxima pergunta
        currentQuestionIndex++;
        
        // Limpar área de input
        inputArea.innerHTML = '';
        
        // Mostrar próxima pergunta
        setTimeout(() => showNextQuestion(), 1000);
      }
      
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
    }

    function showCompletion() {
      addMessage('Obrigado pelas informações! Em breve entraremos em contato.', true);
      
      // Salvar lead
      saveLead();
      
      // Mostrar botão do WhatsApp se configurado
      if (flowData.show_whatsapp_button !== false && flowData.whatsapp) {
        setTimeout(() => showWhatsAppButton(), 2000);
      }
    }

    function showWhatsAppButton() {
      const inputArea = document.getElementById('envialead-chat-input-area');
      
      // Preparar texto com respostas
      let messageText = 'Olá! Gostaria de continuar nossa conversa. Aqui estão minhas informações:\n\n';
      
      questions.forEach(q => {
        if (responses[q.id] && q.type !== 'bot_message') {
          messageText += `${q.title}: ${responses[q.id]}\n`;
        }
      });
      
      const whatsappNumber = flowData.whatsapp.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
      
      inputArea.innerHTML = `
        <a href="${whatsappUrl}" target="_blank" style="display: block; width: 100%; padding: 12px; background: #25d366; color: white; text-decoration: none; border-radius: 8px; text-align: center; font-size: 14px; font-weight: 600; transition: background 0.2s;" onmouseover="this.style.background='#22c55e'" onmouseout="this.style.background='#25d366'">
          💬 Continuar no WhatsApp
        </a>
      `;
    }

    async function saveLead() {
      try {
        const leadData = {
          flow_id: flowData.id,
          responses: responses,
          completed: true,
          user_agent: navigator.userAgent,
          url: currentUrl
        };

        console.log('[EnviaLead] Salvando lead:', leadData);

        const response = await fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/rest/v1/leads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1emtkcmtodm1haW1wZ3p2aW1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTQxNDcsImV4cCI6MjA2NTkzMDE0N30.W6NKS_KVV933V0TZm7hKWhdAaLmZs9XhaPvR49jUruA'
          },
          body: JSON.stringify(leadData)
        });

        if (response.ok) {
          console.log('[EnviaLead] Lead salvo com sucesso');
        } else {
          console.error('[EnviaLead] Erro ao salvar lead:', response.status);
        }
      } catch (error) {
        console.error('[EnviaLead] Erro ao salvar lead:', error);
      }
    }

    console.log('[EnviaLead] Widget criado com sucesso');
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

  function getChatWindowPosition(position) {
    const positions = {
      'bottom-right': 'bottom: 90px; right: 20px;',
      'bottom-left': 'bottom: 90px; left: 20px;',
      'center': 'top: 50%; left: 50%; transform: translate(-50%, -50%);'
    };
    
    return positions[position] || positions['bottom-right'];
  }

  // Inicializar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchFlowData);
  } else {
    fetchFlowData();
  }

})();
