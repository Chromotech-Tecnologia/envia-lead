
// EnviaLead Chat Widget - Integração com Sistema
(function() {
  console.log('[EnviaLead] Iniciando widget integrado...');
  
  // Pegar Flow ID da URL do script (padrão Flut)
  let flowId = null;
  const scripts = document.getElementsByTagName('script');
  
  for (let script of scripts) {
    if (script.src && script.src.includes('envialead-widget.js')) {
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
  
  // Buscar dados do fluxo no servidor
  loadFlowData(flowId);
  
  // Função para buscar dados do fluxo
  function loadFlowData(flowId) {
    console.log('[EnviaLead] Buscando dados do fluxo:', flowId);
    
    const apiUrl = 'https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/get-flow-data?flow_id=' + flowId;
    
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Referer': window.location.href
      }
    })
    .then(response => response.json())
    .then(result => {
      if (result.success && result.data) {
        console.log('[EnviaLead] Dados do fluxo carregados:', result.data);
        createChatWidget(result.data);
      } else {
        console.error('[EnviaLead] Erro ao carregar fluxo:', result.error);
        // Criar widget com dados padrão se houver erro
        createChatWidget({
          id: flowId,
          name: 'Chat EnviaLead',
          colors: { primary: '#FF6B35' },
          position: 'bottom-right'
        });
      }
    })
    .catch(error => {
      console.error('[EnviaLead] Erro na requisição:', error);
      // Criar widget com dados padrão se houver erro
      createChatWidget({
        id: flowId,
        name: 'Chat EnviaLead',
        colors: { primary: '#FF6B35' },
        position: 'bottom-right'
      });
    });
  }
  
  // Função para criar o widget de chat
  function createChatWidget(flowData) {
    console.log('[EnviaLead] Criando widget com dados:', flowData);
    
    // Determinar posição
    const position = flowData.position || 'bottom-right';
    const isLeft = position.includes('left');
    const isTop = position.includes('top');
    
    // Criar botão do chat
    const button = document.createElement('div');
    
    // Determinar o conteúdo do botão baseado no avatar
    if (flowData.avatar_url) {
      if (flowData.avatar_url.startsWith('http') || flowData.avatar_url.startsWith('blob:')) {
        // É uma imagem
        button.innerHTML = `<img src="${flowData.avatar_url}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
      } else {
        // É um emoji
        button.innerHTML = flowData.avatar_url;
      }
    } else {
      // Usar ícone padrão
      button.innerHTML = '💬';
    }
    
    button.style.cssText = `
      position: fixed;
      ${isTop ? 'top' : 'bottom'}: 20px;
      ${isLeft ? 'left' : 'right'}: 20px;
      width: 60px;
      height: 60px;
      background: ${flowData.colors?.primary || '#FF6B35'};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: white;
      cursor: pointer;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: transform 0.2s ease;
      overflow: hidden;
    `;
    
    // Efeito hover
    button.onmouseenter = function() {
      button.style.transform = 'scale(1.1)';
    };
    
    button.onmouseleave = function() {
      button.style.transform = 'scale(1)';
    };
    
    // Ação do clique
    button.onclick = function() {
      openChatModal(flowData);
    };
    
    // Adicionar botão à página
    document.body.appendChild(button);
    console.log('[EnviaLead] Widget criado para fluxo:', flowData.name);
  }
  
  // Estado do chat
  let chatState = {
    isOpen: false,
    currentQuestionIndex: 0,
    responses: {},
    isTyping: false
  };

  // Função para abrir o modal de chat
  function openChatModal(flowData) {
    console.log('[EnviaLead] Abrindo chat para fluxo:', flowData.name);
    
    if (chatState.isOpen) {
      closeChatModal();
      return;
    }
    
    chatState.isOpen = true;
    createChatModal(flowData);
  }

  // Função para fechar o chat
  function closeChatModal() {
    const existingModal = document.getElementById('envialead-chat-modal');
    if (existingModal) {
      existingModal.remove();
    }
    chatState.isOpen = false;
  }

  // Função para criar o modal de chat completo
  function createChatModal(flowData) {
    const modal = document.createElement('div');
    modal.id = 'envialead-chat-modal';
    modal.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 350px;
      height: 500px;
      background: white;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 999998;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Header do chat
    const header = document.createElement('div');
    header.style.cssText = `
      background: ${flowData.colors?.primary || '#FF6B35'};
      color: white;
      padding: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    
    const headerInfo = document.createElement('div');
    headerInfo.style.cssText = 'display: flex; align-items: center; gap: 10px;';
    
    const avatar = document.createElement('div');
    avatar.style.cssText = `
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      overflow: hidden;
    `;
    
    // Usar o mesmo avatar do botão
    if (flowData.avatar_url) {
      if (flowData.avatar_url.startsWith('http') || flowData.avatar_url.startsWith('blob:')) {
        avatar.innerHTML = `<img src="${flowData.avatar_url}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
      } else {
        avatar.textContent = flowData.avatar_url;
      }
    } else {
      avatar.textContent = '🤖';
    }
    
    const titleDiv = document.createElement('div');
    const title = document.createElement('div');
    title.textContent = flowData.name || 'Chat';
    title.style.cssText = 'font-weight: bold; font-size: 16px;';
    
    const status = document.createElement('div');
    status.textContent = 'Online';
    status.style.cssText = 'font-size: 12px; opacity: 0.9;';
    
    titleDiv.appendChild(title);
    titleDiv.appendChild(status);
    headerInfo.appendChild(avatar);
    headerInfo.appendChild(titleDiv);
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    closeBtn.onclick = closeChatModal;
    
    header.appendChild(headerInfo);
    header.appendChild(closeBtn);

    // Container das mensagens
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'chat-messages';
    messagesContainer.style.cssText = `
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #f8f9fa;
    `;

    // Container do input
    const inputContainer = document.createElement('div');
    inputContainer.id = 'chat-input-container';
    inputContainer.style.cssText = `
      padding: 15px;
      border-top: 1px solid #e0e0e0;
      background: white;
    `;

    modal.appendChild(header);
    modal.appendChild(messagesContainer);
    modal.appendChild(inputContainer);
    document.body.appendChild(modal);

    // Iniciar conversa
    startConversation(flowData);
  }

  // Função para iniciar a conversa
  function startConversation(flowData) {
    const messagesContainer = document.getElementById('chat-messages');
    
    // Mensagem de boas-vindas
    const welcomeMsg = document.createElement('div');
    welcomeMsg.style.cssText = `
      background: #e3f2fd;
      padding: 15px;
      border-radius: 15px;
      margin-bottom: 15px;
      border: 1px solid #bbdefb;
    `;
    welcomeMsg.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 5px;">Olá! 👋</div>
      <div>${flowData.description || 'Bem-vindo ao nosso chat! Vou fazer algumas perguntas para te ajudar melhor.'}</div>
    `;
    messagesContainer.appendChild(welcomeMsg);

    // Mostrar primeira pergunta
    if (flowData.questions && flowData.questions.length > 0) {
      setTimeout(() => showNextQuestion(flowData), 1000);
    } else {
      showNoQuestionsMessage();
    }
  }

  // Função para mostrar a próxima pergunta
  function showNextQuestion(flowData) {
    const question = flowData.questions[chatState.currentQuestionIndex];
    if (!question) {
      showCompletionMessage(flowData);
      return;
    }

    const messagesContainer = document.getElementById('chat-messages');
    const inputContainer = document.getElementById('chat-input-container');

    // Mensagem da pergunta
    const questionMsg = document.createElement('div');
    questionMsg.style.cssText = `
      background: white;
      padding: 15px;
      border-radius: 15px;
      margin-bottom: 15px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    `;
    questionMsg.innerHTML = `
      <div style="font-weight: bold; color: ${flowData.colors?.primary || '#FF6B35'}; margin-bottom: 8px;">
        Pergunta ${chatState.currentQuestionIndex + 1}:
      </div>
      <div>${question.title}</div>
    `;
    messagesContainer.appendChild(questionMsg);

    // Criar input baseado no tipo de pergunta
    inputContainer.innerHTML = '';
    
    if (question.type === 'single' || question.type === 'multiple' || question.type === 'select' || question.type === 'radio') {
      // Opções de múltipla escolha
      const options = question.options || [];
      options.forEach((option, index) => {
        const optionBtn = document.createElement('button');
        optionBtn.textContent = option;
        optionBtn.style.cssText = `
          display: block;
          width: 100%;
          padding: 12px;
          margin-bottom: 8px;
          background: #f5f5f5;
          border: 2px solid #ddd;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        `;
        
        optionBtn.onmouseover = function() {
          this.style.background = flowData.colors?.primary || '#FF6B35';
          this.style.color = 'white';
          this.style.borderColor = flowData.colors?.primary || '#FF6B35';
        };
        
        optionBtn.onmouseout = function() {
          this.style.background = '#f5f5f5';
          this.style.color = 'black';
          this.style.borderColor = '#ddd';
        };
        
        optionBtn.onclick = function() {
          handleAnswer(question.id, option, flowData);
        };
        
        inputContainer.appendChild(optionBtn);
      });
    } else {
      // Input de texto
      const inputGroup = document.createElement('div');
      inputGroup.style.cssText = 'display: flex; gap: 10px;';
      
      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.placeholder = question.placeholder || 'Digite sua resposta...';
      textInput.style.cssText = `
        flex: 1;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 25px;
        outline: none;
        font-size: 14px;
      `;
      
      const sendBtn = document.createElement('button');
      sendBtn.innerHTML = '📤';
      sendBtn.style.cssText = `
        padding: 12px 16px;
        background: ${flowData.colors?.primary || '#FF6B35'};
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
      `;
      
      const handleSend = () => {
        const value = textInput.value.trim();
        if (value) {
          handleAnswer(question.id, value, flowData);
        }
      };
      
      sendBtn.onclick = handleSend;
      textInput.onkeypress = function(e) {
        if (e.key === 'Enter') {
          handleSend();
        }
      };
      
      inputGroup.appendChild(textInput);
      inputGroup.appendChild(sendBtn);
      inputContainer.appendChild(inputGroup);
      
      textInput.focus();
    }

    // Scroll para baixo
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Função para lidar com a resposta
  function handleAnswer(questionId, answer, flowData) {
    chatState.responses[questionId] = answer;
    
    // Mostrar resposta do usuário
    const messagesContainer = document.getElementById('chat-messages');
    const userMsg = document.createElement('div');
    userMsg.style.cssText = `
      background: ${flowData.colors?.primary || '#FF6B35'};
      color: white;
      padding: 12px 18px;
      border-radius: 18px;
      margin-bottom: 15px;
      margin-left: 50px;
      text-align: right;
    `;
    userMsg.textContent = answer;
    messagesContainer.appendChild(userMsg);

    // Próxima pergunta
    chatState.currentQuestionIndex++;
    setTimeout(() => showNextQuestion(flowData), 800);
    
    // Salvar lead parcial no banco
    saveLead(flowData, false);
  }

  // Função para mostrar mensagem de conclusão
  function showCompletionMessage(flowData) {
    const messagesContainer = document.getElementById('chat-messages');
    const inputContainer = document.getElementById('chat-input-container');

    // Salvar lead completo no banco
    saveLead(flowData, true);

    const completionMsg = document.createElement('div');
    completionMsg.style.cssText = `
      background: #e8f5e8;
      padding: 15px;
      border-radius: 15px;
      margin-bottom: 15px;
      border: 1px solid #4caf50;
      text-align: center;
    `;
    completionMsg.innerHTML = `
      <div style="font-weight: bold; color: #2e7d32; margin-bottom: 8px;">✅ Obrigado!</div>
      <div>Suas respostas foram registradas com sucesso.</div>
    `;
    messagesContainer.appendChild(completionMsg);

    // Botão do WhatsApp se configurado
    inputContainer.innerHTML = '';
    if (flowData.whatsapp) {
      const whatsappBtn = document.createElement('button');
      whatsappBtn.innerHTML = '💬 Continuar no WhatsApp';
      whatsappBtn.style.cssText = `
        width: 100%;
        padding: 15px;
        background: #25d366;
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-weight: bold;
        font-size: 16px;
      `;
      
      whatsappBtn.onclick = function() {
        const responses = Object.values(chatState.responses).join('\n');
        const message = `Olá! Vim através do chat do site.\n\nMinhas respostas:\n${responses}`;
        const whatsappUrl = `https://wa.me/${flowData.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
      };
      
      inputContainer.appendChild(whatsappBtn);
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Função para quando não há perguntas
  function showNoQuestionsMessage() {
    const messagesContainer = document.getElementById('chat-messages');
    const noQuestionsMsg = document.createElement('div');
    noQuestionsMsg.style.cssText = `
      background: #fff3cd;
      padding: 15px;
      border-radius: 15px;
      margin-bottom: 15px;
      border: 1px solid #ffeaa7;
      text-align: center;
    `;
    noQuestionsMsg.innerHTML = `
      <div>Este chat ainda não possui perguntas configuradas.</div>
      <div style="margin-top: 10px; font-size: 14px; opacity: 0.8;">Entre em contato conosco para mais informações.</div>
    `;
    messagesContainer.appendChild(noQuestionsMsg);
  }

  // Função para salvar lead no banco
  function saveLead(flowData, completed) {
    const leadData = {
      flow_id: flowData.id,
      responses: chatState.responses,
      completed: completed,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/save-lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': window.location.href
      },
      body: JSON.stringify(leadData)
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        console.log('[EnviaLead] Lead salvo com sucesso:', result);
      } else {
        console.error('[EnviaLead] Erro ao salvar lead:', result.error);
      }
    })
    .catch(error => {
      console.error('[EnviaLead] Erro na requisição de save lead:', error);
    });
  }
  
})();
