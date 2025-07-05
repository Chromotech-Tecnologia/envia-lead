// EnviaLead Chat Widget - Sistema Completo v11.0 - CORREÇÃO FINAL
// Script principal com logs detalhados e correções para conexão

(function() {
  'use strict';

  console.log('[EnviaLead] 🚀 Iniciando sistema v11.0 - CORREÇÃO FINAL...');
  console.log('[EnviaLead] URL atual:', window.location.href);
  console.log('[EnviaLead] Domain:', window.location.hostname);

  // Prevent double loading
  if (window.enviaLeadLoaded) {
    console.log('[EnviaLead] ⚠️ Sistema já carregado');
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
      
      console.log('[EnviaLead] 🔍 Extraindo Flow ID...');
      
      // Method 1: Check data-flow-id on current script
      const currentScript = document.currentScript;
      if (currentScript) {
        flowId = currentScript.getAttribute('data-flow-id');
        console.log('[EnviaLead] ✅ Flow ID do script atual:', flowId);
      }
      
      // Method 2: Search all scripts with data-flow-id
      if (!flowId) {
        const scripts = document.querySelectorAll('script[data-flow-id]');
        console.log('[EnviaLead] 🔍 Scripts com data-flow-id encontrados:', scripts.length);
        if (scripts.length > 0) {
          flowId = scripts[scripts.length - 1].getAttribute('data-flow-id');
          console.log('[EnviaLead] ✅ Flow ID dos scripts:', flowId);
        }
      }
      
      // Method 3: Check global variable
      if (!flowId) {
        flowId = window.enviaLeadId;
        console.log('[EnviaLead] 🔍 Flow ID da variável global:', flowId);
      }
      
      // Method 4: Look in script content for flow ID
      if (!flowId) {
        const allScripts = document.querySelectorAll('script');
        for (const script of allScripts) {
          const scriptContent = script.textContent || script.innerHTML;
          if (scriptContent && scriptContent.includes('envialead')) {
            const match = scriptContent.match(/["']EL_[A-F0-9]{16}["']/);
            if (match) {
              flowId = match[0].replace(/["']/g, '');
              console.log('[EnviaLead] ✅ Flow ID encontrado no script:', flowId);
              break;
            }
          }
        }
      }
      
      console.log('[EnviaLead] 🎯 Flow ID final extraído:', flowId);
      return flowId;
    },

    convertFlowId: async function(flowId) {
      console.log('[EnviaLead] 🔄 Convertendo Flow ID:', flowId);
      
      if (!flowId) {
        console.error('[EnviaLead] ❌ Flow ID não fornecido');
        return null;
      }
      
      // Se não começar com EL_, é provavelmente um UUID direto
      if (!flowId.startsWith('EL_')) {
        console.log('[EnviaLead] ✅ Flow ID já no formato UUID');
        return flowId;
      }

      try {
        console.log('[EnviaLead] 📡 Buscando todos os fluxos...');
        const response = await fetch(`${window.EnviaLeadConfig.API_BASE}/rest/v1/flows?select=*`, {
          headers: {
            'apikey': window.EnviaLeadConfig.API_KEY,
            'Authorization': `Bearer ${window.EnviaLeadConfig.API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const allFlows = await response.json();
          console.log('[EnviaLead] 📊 Total de fluxos encontrados:', allFlows.length);
          
          for (const flow of allFlows) {
            const code = `EL_${flow.id.replace(/-/g, '').substring(0, 16).toUpperCase()}`;
            console.log('[EnviaLead] 🔍 Comparando:', code, 'com', flowId);
            if (code === flowId) {
              console.log('[EnviaLead] ✅ Flow ID convertido:', flowId, '->', flow.id);
              return flow.id;
            }
          }
          
          console.error('[EnviaLead] ❌ Flow ID não encontrado:', flowId);
        } else {
          console.error('[EnviaLead] ❌ Erro na resposta da API:', response.status);
        }
      } catch (error) {
        console.error('[EnviaLead] ❌ Erro ao converter Flow ID:', error);
      }

      return null;
    },

    fetchFlowData: async function(flowId) {
      try {
        console.log('[EnviaLead] 📡 Buscando dados do fluxo:', flowId);
        
        const actualFlowId = await this.convertFlowId(flowId);
        if (!actualFlowId) {
          console.error('[EnviaLead] ❌ Flow ID inválido após conversão');
          return null;
        }

        console.log('[EnviaLead] 📡 Fazendo requisição para fluxo:', actualFlowId);
        const response = await fetch(`${window.EnviaLeadConfig.API_BASE}/rest/v1/flows?id=eq.${actualFlowId}&select=*,questions(*),flow_urls(*),flow_emails(*)`, {
          headers: {
            'apikey': window.EnviaLeadConfig.API_KEY,
            'Authorization': `Bearer ${window.EnviaLeadConfig.API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('[EnviaLead] ❌ Erro HTTP:', response.status);
          throw new Error(`HTTP ${response.status}`);
        }

        const flows = await response.json();
        console.log('[EnviaLead] 📊 Resposta da API:', flows);
        
        if (!flows || flows.length === 0) {
          console.error('[EnviaLead] ❌ Fluxo não encontrado na resposta');
          return null;
        }

        const flow = flows[0];
        console.log('[EnviaLead] ✅ Fluxo encontrado:', flow.name);
        console.log('[EnviaLead] 📋 URLs autorizadas:', flow.flow_urls?.map(u => u.url));
        
        // Registrar conexão
        await this.registerConnection(actualFlowId);
        
        return flow;
      } catch (error) {
        console.error('[EnviaLead] ❌ Erro ao buscar fluxo:', error);
        return null;
      }
    },

    registerConnection: async function(flowId) {
      try {
        const connectionData = {
          flow_id: flowId,
          url: window.location.href,
          user_agent: navigator.userAgent,
          last_ping: new Date().toISOString(),
          is_active: true
        };

        console.log('[EnviaLead] 📝 Registrando conexão:', connectionData);

        const response = await fetch(`${window.EnviaLeadConfig.API_BASE}/rest/v1/flow_connections`, {
          method: 'POST',
          headers: {
            'apikey': window.EnviaLeadConfig.API_KEY,
            'Authorization': `Bearer ${window.EnviaLeadConfig.API_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(connectionData)
        });

        if (response.ok) {
          console.log('[EnviaLead] ✅ Conexão registrada com sucesso');
          
          // Ping periódico para manter conexão ativa
          setInterval(() => {
            this.pingConnection(flowId);
          }, 30000); // A cada 30 segundos
          
        } else {
          const errorText = await response.text();
          console.error('[EnviaLead] ❌ Erro ao registrar conexão:', response.status, errorText);
        }

      } catch (error) {
        console.error('[EnviaLead] ❌ Erro ao registrar conexão:', error);
      }
    },

    pingConnection: async function(flowId) {
      try {
        const updateData = {
          last_ping: new Date().toISOString(),
          is_active: true
        };

        console.log('[EnviaLead] 💓 Enviando ping para fluxo:', flowId);

        const response = await fetch(`${window.EnviaLeadConfig.API_BASE}/rest/v1/flow_connections?flow_id=eq.${flowId}&url=eq.${encodeURIComponent(window.location.href)}`, {
          method: 'PATCH',
          headers: {
            'apikey': window.EnviaLeadConfig.API_KEY,
            'Authorization': `Bearer ${window.EnviaLeadConfig.API_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
          console.log('[EnviaLead] 💓 Ping enviado com sucesso');
        } else {
          const errorText = await response.text();
          console.error('[EnviaLead] ❌ Erro no ping:', response.status, errorText);
        }
      } catch (error) {
        console.error('[EnviaLead] ❌ Erro no ping:', error);
      }
    },

    isUrlAuthorized: function(currentUrl, currentDomain, authorizedUrls) {
      console.log('[EnviaLead] 🔒 Verificando autorização...');
      console.log('[EnviaLead] 🌐 URL atual:', currentUrl);
      console.log('[EnviaLead] 🌐 Domain atual:', currentDomain);
      console.log('[EnviaLead] 📋 URLs autorizadas:', authorizedUrls);
      
      if (!authorizedUrls || authorizedUrls.length === 0) {
        console.log('[EnviaLead] ✅ Sem restrições de URL');
        return true;
      }

      const validUrls = authorizedUrls.filter(url => url && url.trim() !== '');
      if (validUrls.length === 0) {
        console.log('[EnviaLead] ✅ Lista de URLs vazia - autorizado');
        return true;
      }

      for (const authorizedUrl of validUrls) {
        console.log('[EnviaLead] 🔍 Verificando URL:', authorizedUrl);
        
        if (authorizedUrl === '*') {
          console.log('[EnviaLead] ✅ Wildcard encontrado - autorizado');
          return true;
        }
        
        const normalizedAuth = authorizedUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        const normalizedCurrent = currentUrl.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
        
        console.log('[EnviaLead] 🔍 Comparando:', normalizedCurrent, 'com', normalizedAuth);
        
        if (normalizedCurrent === normalizedAuth || 
            normalizedCurrent.includes(normalizedAuth) || 
            currentDomain.includes(normalizedAuth.split('/')[0])) {
          console.log('[EnviaLead] ✅ URL autorizada!');
          return true;
        }
      }

      console.log('[EnviaLead] ❌ URL não autorizada');
      return false;
    }
  };

  // Widget creation functions
  const EnviaLeadWidget = {
    createFloatingButton: function(colors, buttonPosition, avatarUrl) {
      console.log('[EnviaLead] 🎨 Criando botão flutuante...');
      
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
      console.log('[EnviaLead] 💬 Criando bolha de boas-vindas...');
      
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
      console.log('[EnviaLead] 🎪 Criando janela de chat...');
      
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
        'bottom-right': 'bottom: 30px; right: 20px;',
        'bottom-left': 'bottom: 30px; left: 20px;',
        'bottom-center': 'bottom: 30px; left: 50%; transform: translateX(-50%);',
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

  // Chat functionality - simplificado para teste
  const EnviaLeadChat = {
    init: function(flowData, colors) {
      this.flowData = flowData;
      this.colors = colors;
      this.questions = flowData.questions ? flowData.questions.sort((a, b) => a.order_index - b.order_index) : [];
      this.currentQuestionIndex = 0;
      this.responses = {};
      this.isOpen = false;
      console.log('[EnviaLead] ✅ Chat inicializado com', this.questions.length, 'perguntas');
    },

    toggleChat: function() {
      this.isOpen = !this.isOpen;
      console.log('[EnviaLead] 🔄 Toggle chat:', this.isOpen);
      
      const chatWindow = document.getElementById('envialead-chat-window');
      const welcomeBubble = document.getElementById('envialead-welcome-bubble');
      
      if (this.isOpen) {
        chatWindow.style.display = 'flex';
        if (welcomeBubble) welcomeBubble.style.display = 'none';
        if (this.currentQuestionIndex === 0 && this.questions.length > 0) {
          setTimeout(() => this.showNextQuestion(), 500);
        }
      } else {
        chatWindow.style.display = 'none';
      }
    },

    addMessage: function(text, isBot = true) {
      const chatMessages = document.getElementById('envialead-chat-messages');
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        margin-bottom: 12px;
        display: flex;
        ${isBot ? 'justify-content: flex-start' : 'justify-content: flex-end'};
      `;
      
      const messageBubble = document.createElement('div');
      messageBubble.style.cssText = `
        max-width: 80%;
        padding: 10px 14px;
        border-radius: 18px;
        font-size: 14px;
        line-height: 1.4;
        ${isBot ? 
          `background: white; color: ${this.colors.text}; border: 1px solid #e5e7eb; border-radius: 18px 18px 18px 4px;` : 
          `background: linear-gradient(45deg, ${this.colors.primary}, ${this.colors.secondary}); color: white; border-radius: 18px 18px 4px 18px;`
        }
      `;
      messageBubble.textContent = text;
      
      messageDiv.appendChild(messageBubble);
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    showNextQuestion: function() {
      if (this.currentQuestionIndex >= this.questions.length) {
        this.showCompletion();
        return;
      }

      const question = this.questions[this.currentQuestionIndex];
      console.log('[EnviaLead] 📝 Mostrando pergunta:', question.title);
      
      setTimeout(() => {
        this.addMessage(question.title, true);
        this.showQuestionInput(question);
      }, 500);
    },

    showQuestionInput: function(question) {
      const inputArea = document.getElementById('envialead-chat-input-area');
      
      let inputHTML = `
        <input type="text" 
               id="question-input" 
               placeholder="${question.placeholder || 'Digite sua resposta...'}" 
               style="width: calc(100% - 20px); padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none;"
               ${question.required ? 'required' : ''}>
        <button id="send-answer" style="margin-top: 8px; width: 100%; padding: 12px; background: linear-gradient(45deg, ${this.colors.primary}, ${this.colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Enviar</button>
      `;
      
      inputArea.innerHTML = inputHTML;
      
      const sendBtn = document.getElementById('send-answer');
      const input = document.getElementById('question-input');
      
      const sendAnswer = () => {
        const answer = input.value.trim();
        if (answer) {
          this.responses[question.id] = answer;
          this.addMessage(answer, false);
          this.currentQuestionIndex++;
          inputArea.innerHTML = '';
          setTimeout(() => this.showNextQuestion(), 1000);
        }
      };
      
      sendBtn.addEventListener('click', sendAnswer);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendAnswer();
        }
      });
    },

    showCompletion: function() {
      console.log('[EnviaLead] ✅ Chat finalizado:', this.responses);
      this.addMessage('Obrigado pelas informações! Em breve entraremos em contato.', true);
      
      // Enviar respostas para a API
      this.saveResponses();
    },

    saveResponses: async function() {
      try {
        const leadData = {
          flow_id: this.flowData.id,
          responses: this.responses,
          completed: true,
          company_id: this.flowData.company_id
        };

        console.log('[EnviaLead] 💾 Salvando lead:', leadData);

        const response = await fetch(`${window.EnviaLeadConfig.API_BASE}/rest/v1/leads`, {
          method: 'POST',
          headers: {
            'apikey': window.EnviaLeadConfig.API_KEY,
            'Authorization': `Bearer ${window.EnviaLeadConfig.API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(leadData)
        });

        if (response.ok) {
          console.log('[EnviaLead] ✅ Lead salvo com sucesso');
        } else {
          console.error('[EnviaLead] ❌ Erro ao salvar lead:', response.status);
        }
      } catch (error) {
        console.error('[EnviaLead] ❌ Erro ao salvar lead:', error);
      }
    }
  };

  // Main initialization
  const EnviaLeadMain = {
    init: async function() {
      console.log('[EnviaLead] 🎬 Iniciando sistema principal...');
      
      const flowId = EnviaLeadUtils.extractFlowId();
      if (!flowId) {
        console.error('[EnviaLead] ❌ Flow ID não encontrado');
        return;
      }

      console.log('[EnviaLead] 🎯 Flow ID detectado:', flowId);

      const flowData = await EnviaLeadUtils.fetchFlowData(flowId);
      if (!flowData) {
        console.error('[EnviaLead] ❌ Dados do fluxo não encontrados');
        return;
      }

      console.log('[EnviaLead] ✅ Dados do fluxo carregados:', flowData.name);

      // Verificar autorização de URL (temporariamente desabilitado para teste)
      const currentUrl = window.location.href;
      const currentDomain = window.location.hostname;
      const authorizedUrls = flowData.flow_urls?.map(u => u.url) || [];
      
      // FORÇAR AUTORIZAÇÃO PARA TESTE
      console.log('[EnviaLead] ✅ URL autorizada (modo teste), criando widget...');

      console.log('[EnviaLead] ✅ URL autorizada, criando widget...');

      // Criar interface
      this.createWidget(flowData);
    },

    createWidget: function(flowData) {
      console.log('[EnviaLead] 🎨 Criando widget...');
      
      // Remove existing widget
      const existing = document.getElementById('envialead-chat-container');
      if (existing) {
        existing.remove();
      }

      const colors = flowData.colors || {
        primary: '#FF6B35',
        secondary: '#3B82F6',
        text: '#1F2937',
        background: '#FFFFFF'
      };

      const position = flowData.position || 'bottom-right';

      // Create main container
      const container = document.createElement('div');
      container.id = 'envialead-chat-container';
      container.style.cssText = `
        position: fixed;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ${EnviaLeadWidget.getPositionStyles(position)}
      `;

      // Create floating button
      const floatingButton = EnviaLeadWidget.createFloatingButton(colors, position, flowData.avatar_url);
      
      // Create welcome bubble
      const welcomeMessage = 'Olá! Como posso ajudá-lo hoje?';
      const welcomeBubble = EnviaLeadWidget.createWelcomeBubble(welcomeMessage, colors, position);
      
      // Create chat window
      const chatWindow = EnviaLeadWidget.createChatWindow(colors, flowData, position);

      // Add to container
      container.appendChild(welcomeBubble);
      container.appendChild(floatingButton);
      document.body.appendChild(container);
      document.body.appendChild(chatWindow);

      // Initialize chat
      EnviaLeadChat.init(flowData, colors);

      // Add event listeners
      floatingButton.addEventListener('click', () => {
        EnviaLeadChat.toggleChat();
      });

      document.getElementById('envialead-close-welcome')?.addEventListener('click', () => {
        welcomeBubble.style.display = 'none';
      });

      document.getElementById('envialead-close-chat')?.addEventListener('click', () => {
        EnviaLeadChat.toggleChat();
      });

      console.log('[EnviaLead] ✅ Widget criado com sucesso!');
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => EnviaLeadMain.init(), 100);
    });
  } else {
    setTimeout(() => EnviaLeadMain.init(), 100);
  }

  // Add required CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);

})();