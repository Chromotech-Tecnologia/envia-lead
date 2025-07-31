import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const flowId = url.searchParams.get('flow');

    if (!flowId) {
      return new Response(
        'console.error("EnviaLead Widget: Flow ID não fornecido");',
        {
          headers: { ...corsHeaders, 'Content-Type': 'text/javascript' }
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Buscar dados do fluxo
    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .select(`
        *,
        button_position,
        chat_position,
        button_offset_x,
        button_offset_y,
        chat_offset_x,
        chat_offset_y,
        chat_width,
        chat_height,
        button_size
      `)
      .eq('id', flowId)
      .single();

    if (flowError || !flow || !flow.is_active) {
      return new Response(
        `console.error("EnviaLead Widget: Fluxo não encontrado ou inativo");`,
        {
          headers: { ...corsHeaders, 'Content-Type': 'text/javascript' }
        }
      );
    }

    // Buscar perguntas do fluxo
    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('flow_id', flowId)
      .order('order_index');

    // Buscar URLs do fluxo
    const { data: urls } = await supabase
      .from('flow_urls')
      .select('url')
      .eq('flow_id', flowId);

    // Verificar se a URL atual está nas URLs permitidas (se houver)
    const currentUrl = req.headers.get('referer') || req.headers.get('origin');
    const allowedUrls = urls?.map(u => u.url) || [];
    
    if (allowedUrls.length > 0 && currentUrl) {
      const isAllowed = allowedUrls.some(allowedUrl => {
        try {
          const allowed = new URL(allowedUrl);
          const current = new URL(currentUrl);
          return allowed.hostname === current.hostname;
        } catch {
          return false;
        }
      });

      if (!isAllowed) {
        return new Response(
          `console.error("EnviaLead Widget: URL não autorizada para este fluxo");`,
          {
            headers: { ...corsHeaders, 'Content-Type': 'text/javascript' }
          }
        );
      }
    }

    // Registrar conexão
    if (currentUrl) {
      const { data: existingConnection } = await supabase
        .from('flow_connections')
        .select('id')
        .eq('flow_id', flowId)
        .eq('url', currentUrl)
        .maybeSingle();

      if (existingConnection) {
        await supabase
          .from('flow_connections')
          .update({
            last_ping: new Date().toISOString(),
            is_active: true,
            user_agent: req.headers.get('user-agent'),
            ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'
          })
          .eq('id', existingConnection.id);
      } else {
        await supabase
          .from('flow_connections')
          .insert({
            flow_id: flowId,
            url: currentUrl,
            user_agent: req.headers.get('user-agent'),
            ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0',
            last_ping: new Date().toISOString(),
            is_active: true
          });
      }
    }

    // Formatar dados do fluxo
    const flowData = {
      id: flow.id,
      name: flow.name,
      description: flow.description,
      colors: flow.colors || {
        primary: '#FF6B35',
        secondary: '#3B82F6',
        text: '#1F2937',
        background: '#FFFFFF'
      },
      position: flow.position || 'bottom-right',
      button_position: flow.button_position || 'bottom-right',
      chat_position: flow.chat_position || 'bottom-right',
      button_offset_x: flow.button_offset_x || 0,
      button_offset_y: flow.button_offset_y || 0,
      chat_offset_x: flow.chat_offset_x || 0,
      chat_offset_y: flow.chat_offset_y || 0,
      chat_width: flow.chat_width || 400,
      chat_height: flow.chat_height || 500,
      button_size: flow.button_size || 60,
      whatsapp: flow.whatsapp,
      avatar_url: flow.avatar_url,
      minimum_question: flow.minimum_question || 1,
      questions: (questions || []).map(q => ({
        id: q.id,
        type: q.type,
        title: q.title,
        placeholder: q.placeholder,
        options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : null,
        required: q.required || false,
        order: q.order_index
      })),
      welcome_message: flow.welcome_message || 'Olá! Como posso ajudá-lo?',
      show_whatsapp_button: flow.show_whatsapp_button !== false,
      whatsapp_message_template: flow.whatsapp_message_template || 'Olá, meu nome é #nome e gostaria de mais informações.'
    };

    // Gerar o código JavaScript do widget
    const widgetScript = `
(function() {
  'use strict';
  
  console.log('[EnviaLead Widget] Iniciando widget para fluxo:', '${flowId}');
  
  const flowData = ${JSON.stringify(flowData)};
  
  // Variáveis globais
  let chatButton = null;
  let chatModal = null;
  let currentQuestionIndex = 0;
  let userResponses = {};
  let isModalOpen = false;

  // Função para criar o botão do chat
  function createChatButton() {
    if (chatButton) return chatButton;
    
    const button = document.createElement('div');
    button.id = 'envialead-chat-button';
    
    // Posição e offsets do botão
    const buttonPosition = flowData.button_position || 'bottom-right';
    const offsetX = flowData.button_offset_x || 0;
    const offsetY = flowData.button_offset_y || 0;
    const buttonSize = flowData.button_size || 60;
    
    const positionStyles = {
      'bottom-right': { bottom: \`\${30 + offsetY}px\`, right: \`\${20 + offsetX}px\` },
      'bottom-left': { bottom: \`\${30 + offsetY}px\`, left: \`\${20 + offsetX}px\` },
      'bottom-center': { bottom: \`\${30 + offsetY}px\`, left: '50%', transform: \`translateX(calc(-50% + \${offsetX}px))\` },
      'top-right': { top: \`\${20 + offsetY}px\`, right: \`\${20 + offsetX}px\` },
      'top-left': { top: \`\${20 + offsetY}px\`, left: \`\${20 + offsetX}px\` },
      'top-center': { top: \`\${20 + offsetY}px\`, left: '50%', transform: \`translateX(calc(-50% + \${offsetX}px))\` },
      'center-right': { top: '50%', right: \`\${20 + offsetX}px\`, transform: \`translateY(calc(-50% + \${offsetY}px))\` },
      'center-left': { top: '50%', left: \`\${20 + offsetX}px\`, transform: \`translateY(calc(-50% + \${offsetY}px))\` },
      'center-center': { top: '50%', left: '50%', transform: \`translate(calc(-50% + \${offsetX}px), calc(-50% + \${offsetY}px))\` }
    };

    const posStyle = positionStyles[buttonPosition] || positionStyles['bottom-right'];

    // Estilo do botão
    button.style.cssText = \`
      position: fixed;
      width: \${buttonSize}px;
      height: \${buttonSize}px;
      border-radius: 50%;
      background: linear-gradient(45deg, \${flowData.colors?.primary || '#FF6B35'}, \${flowData.colors?.secondary || '#3B82F6'});
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: \${Math.floor(buttonSize * 0.4)}px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      transition: transform 0.3s ease;
      overflow: hidden;
      \${Object.entries(posStyle).map(([key, value]) => \`\${key}: \${value}\`).join('; ')};
    \`;

    // Conteúdo do botão
    if (flowData.avatar_url && (flowData.avatar_url.startsWith('http') || flowData.avatar_url.startsWith('blob:'))) {
      const img = document.createElement('img');
      img.src = flowData.avatar_url;
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%;';
      img.alt = 'Chat Avatar';
      button.appendChild(img);
    } else if (flowData.avatar_url) {
      button.innerHTML = \`<span style="font-size: \${Math.floor(buttonSize * 0.4)}px;">\${flowData.avatar_url}</span>\`;
    } else {
      button.innerHTML = '💬';
    }

    // Eventos
    button.addEventListener('mouseenter', () => {
      button.style.transform = (posStyle.transform ? posStyle.transform + ' ' : '') + 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = posStyle.transform || 'scale(1)';
    });

    button.addEventListener('click', () => {
      if (isModalOpen) {
        closeChatModal();
      } else {
        openChatModal();
      }
    });

    chatButton = button;
    return button;
  }

  // Função para criar o modal do chat
  function createChatModal() {
    if (chatModal) return chatModal;

    const modal = document.createElement('div');
    modal.id = 'envialead-chat-modal';
    
    // Posição e dimensões do modal
    const chatPosition = flowData.chat_position || 'bottom-right';
    const offsetX = flowData.chat_offset_x || 0;
    const offsetY = flowData.chat_offset_y || 0;
    const chatWidth = flowData.chat_width || 400;
    const chatHeight = flowData.chat_height || 500;
    
    const positionStyles = {
      'bottom-right': { bottom: \`\${100 + offsetY}px\`, right: \`\${20 + offsetX}px\` },
      'bottom-left': { bottom: \`\${100 + offsetY}px\`, left: \`\${20 + offsetX}px\` },
      'bottom-center': { bottom: \`\${100 + offsetY}px\`, left: '50%', transform: \`translateX(calc(-50% + \${offsetX}px))\` },
      'top-right': { top: \`\${80 + offsetY}px\`, right: \`\${20 + offsetX}px\` },
      'top-left': { top: \`\${80 + offsetY}px\`, left: \`\${20 + offsetX}px\` },
      'top-center': { top: \`\${80 + offsetY}px\`, left: '50%', transform: \`translateX(calc(-50% + \${offsetX}px))\` },
      'center-right': { top: '50%', right: \`\${20 + offsetX}px\`, transform: \`translateY(calc(-50% + \${offsetY}px))\` },
      'center-left': { top: '50%', left: \`\${20 + offsetX}px\`, transform: \`translateY(calc(-50% + \${offsetY}px))\` },
      'center-center': { top: '50%', left: '50%', transform: \`translate(calc(-50% + \${offsetX}px), calc(-50% + \${offsetY}px))\` }
    };

    const posStyle = positionStyles[chatPosition] || positionStyles['bottom-right'];

    modal.style.cssText = \`
      position: fixed;
      width: \${chatWidth}px;
      height: \${chatHeight}px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      \${Object.entries(posStyle).map(([key, value]) => \`\${key}: \${value}\`).join('; ')};
    \`;

    // Header do chat
    const header = document.createElement('div');
    header.style.cssText = \`
      background: linear-gradient(45deg, \${flowData.colors?.primary || '#FF6B35'}, \${flowData.colors?.secondary || '#3B82F6'});
      color: white;
      padding: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
    \`;

    const headerInfo = document.createElement('div');
    headerInfo.style.cssText = 'display: flex; align-items: center; gap: 10px;';
    
    const avatar = document.createElement('div');
    avatar.style.cssText = \`
      width: 35px;
      height: 35px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    \`;
    
    if (flowData.avatar_url && (flowData.avatar_url.startsWith('http') || flowData.avatar_url.startsWith('blob:'))) {
      const img = document.createElement('img');
      img.src = flowData.avatar_url;
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%;';
      img.alt = 'Avatar';
      avatar.appendChild(img);
    } else {
      avatar.innerHTML = flowData.avatar_url || '👤';
    }
    
    const headerText = document.createElement('div');
    headerText.innerHTML = \`
      <div style="font-size: 14px; font-weight: 600;">Atendimento</div>
      <div style="font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 5px;">
        <div style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: pulse 2s infinite;"></div>
        Online agora
      </div>
    \`;
    
    headerInfo.appendChild(avatar);
    headerInfo.appendChild(headerText);
    
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = \`
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 5px;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    \`;
    
    closeButton.addEventListener('click', closeChatModal);
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.background = 'rgba(255,255,255,0.2)';
    });
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.background = 'none';
    });
    
    header.appendChild(headerInfo);
    header.appendChild(closeButton);

    // Container de mensagens
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'envialead-messages';
    messagesContainer.style.cssText = \`
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 15px;
    \`;

    // Container de input
    const inputContainer = document.createElement('div');
    inputContainer.id = 'envialead-input-container';
    inputContainer.style.cssText = \`
      padding: 15px;
      background: white;
      border-top: 1px solid #e2e8f0;
    \`;

    // CSS para animação
    const style = document.createElement('style');
    style.textContent = \`
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    \`;
    document.head.appendChild(style);

    modal.appendChild(header);
    modal.appendChild(messagesContainer);
    modal.appendChild(inputContainer);

    chatModal = modal;
    return modal;
  }

  // Função para abrir o modal
  function openChatModal() {
    if (isModalOpen) return;
    
    const modal = createChatModal();
    document.body.appendChild(modal);
    isModalOpen = true;
    
    // Iniciar conversa
    startConversation();
  }

  // Função para fechar o modal
  function closeChatModal() {
    if (!isModalOpen || !chatModal) return;
    
    document.body.removeChild(chatModal);
    isModalOpen = false;
  }

  // Função para iniciar a conversa
  function startConversation() {
    if (!isModalOpen || !chatModal) return;
    
    const messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) return;
    
    // Limpar mensagens
    messagesContainer.innerHTML = '';
    
    // Mensagem de boas-vindas
    const welcomeMessage = document.createElement('div');
    welcomeMessage.style.cssText = \`
      background: white;
      padding: 12px 16px;
      border-radius: 18px 18px 18px 4px;
      max-width: 80%;
      align-self: flex-start;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      color: \${flowData.colors?.text || '#1F2937'};
    \`;
    welcomeMessage.textContent = flowData.welcome_message || 'Olá! Como posso ajudá-lo?';
    messagesContainer.appendChild(welcomeMessage);
    
    // Mostrar primeira pergunta
    setTimeout(() => showNextQuestion(), 1000);
  }

  // Função para mostrar próxima pergunta
  function showNextQuestion() {
    if (!flowData.questions || currentQuestionIndex >= flowData.questions.length) {
      showCompletionMessage();
      return;
    }
    
    const question = flowData.questions[currentQuestionIndex];
    if (!question) return;
    
    const messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) return;
    
    // Adicionar pergunta
    const questionDiv = document.createElement('div');
    questionDiv.style.cssText = \`
      background: white;
      padding: 12px 16px;
      border-radius: 18px 18px 18px 4px;
      max-width: 80%;
      align-self: flex-start;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      color: \${flowData.colors?.text || '#1F2937'};
    \`;
    questionDiv.textContent = question.title;
    messagesContainer.appendChild(questionDiv);
    
    // Criar input
    createQuestionInput(question);
    
    // Scroll para baixo
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Função para criar input da pergunta
  function createQuestionInput(question) {
    const inputContainer = document.getElementById('envialead-input-container');
    if (!inputContainer) return;
    
    inputContainer.innerHTML = '';
    
    if (question.type === 'select' && question.options) {
      // Select múltipla escolha
      question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.style.cssText = \`
          display: block;
          width: 100%;
          padding: 10px 15px;
          margin-bottom: 8px;
          background: white;
          border: 2px solid \${flowData.colors?.primary || '#FF6B35'};
          border-radius: 8px;
          color: \${flowData.colors?.primary || '#FF6B35'};
          cursor: pointer;
          transition: all 0.2s;
        \`;
        
        button.addEventListener('mouseenter', () => {
          button.style.background = flowData.colors?.primary || '#FF6B35';
          button.style.color = 'white';
        });
        
        button.addEventListener('mouseleave', () => {
          button.style.background = 'white';
          button.style.color = flowData.colors?.primary || '#FF6B35';
        });
        
        button.addEventListener('click', () => {
          handleAnswer(question.id, option);
        });
        
        inputContainer.appendChild(button);
      });
    } else {
      // Input de texto
      const inputDiv = document.createElement('div');
      inputDiv.style.cssText = 'display: flex; gap: 8px;';
      
      const input = document.createElement(question.type === 'textarea' ? 'textarea' : 'input');
      input.type = question.type === 'email' ? 'email' : 
                  question.type === 'phone' ? 'tel' : 'text';
      input.placeholder = question.placeholder || 'Digite sua resposta...';
      input.style.cssText = \`
        flex: 1;
        padding: 12px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        outline: none;
        font-size: 14px;
        \${question.type === 'textarea' ? 'resize: vertical; min-height: 60px;' : ''}
      \`;
      
      input.addEventListener('focus', () => {
        input.style.borderColor = flowData.colors?.primary || '#FF6B35';
      });
      
      input.addEventListener('blur', () => {
        input.style.borderColor = '#e2e8f0';
      });
      
      // Aplicar máscaras baseadas no tipo
      if (question.type === 'phone') {
        input.addEventListener('input', (e) => {
          let value = e.target.value.replace(/\\D/g, '');
          if (value.length > 11) value = value.substring(0, 11);
          
          if (value.length <= 2) {
            value = value.replace(/(\\d{0,2})/, '($1');
          } else if (value.length <= 6) {
            value = value.replace(/(\\d{2})(\\d{0,4})/, '($1) $2');
          } else if (value.length <= 10) {
            value = value.replace(/(\\d{2})(\\d{4})(\\d{0,4})/, '($1) $2-$3');
          } else {
            value = value.replace(/(\\d{2})(\\d{5})(\\d{0,4})/, '($1) $2-$3');
          }
          
          e.target.value = value;
        });
        
        input.addEventListener('blur', (e) => {
          const cleanPhone = e.target.value.replace(/\\D/g, '');
          const isValid = cleanPhone.length >= 10 && cleanPhone.length <= 11;
          
          if (isValid && cleanPhone.length >= 2) {
            const ddd = parseInt(cleanPhone.substring(0, 2));
            const isValidDDD = ddd >= 11 && ddd <= 99;
            
            if (isValidDDD) {
              if (cleanPhone.length === 11) {
                const firstDigit = cleanPhone.substring(2, 3);
                if (firstDigit === '9') {
                  e.target.style.borderColor = '#10b981';
                } else {
                  e.target.style.borderColor = '#ef4444';
                }
              } else if (cleanPhone.length === 10) {
                const firstDigit = cleanPhone.substring(2, 3);
                if (['2', '3', '4', '5'].includes(firstDigit)) {
                  e.target.style.borderColor = '#10b981';
                } else {
                  e.target.style.borderColor = '#ef4444';
                }
              } else {
                e.target.style.borderColor = '#ef4444';
              }
            } else {
              e.target.style.borderColor = '#ef4444';
            }
          } else {
            e.target.style.borderColor = '#ef4444';
          }
        });
      } else if (question.type === 'email') {
        input.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/\\s/g, '').toLowerCase();
        });
        
        input.addEventListener('blur', (e) => {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
          const isValid = emailRegex.test(e.target.value);
          e.target.style.borderColor = isValid ? '#10b981' : '#ef4444';
        });
      }
      
      const sendButton = document.createElement('button');
      sendButton.innerHTML = '→';
      sendButton.style.cssText = \`
        padding: 12px 16px;
        background: \${flowData.colors?.primary || '#FF6B35'};
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 18px;
        transition: background 0.2s;
      \`;
      
      sendButton.addEventListener('mouseenter', () => {
        sendButton.style.background = flowData.colors?.secondary || '#3B82F6';
      });
      
      sendButton.addEventListener('mouseleave', () => {
        sendButton.style.background = flowData.colors?.primary || '#FF6B35';
      });
      
      const handleSend = () => {
        const value = input.value.trim();
        if (value) {
          handleAnswer(question.id, value);
        }
      };
      
      sendButton.addEventListener('click', handleSend);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      });
      
      inputDiv.appendChild(input);
      inputDiv.appendChild(sendButton);
      inputContainer.appendChild(inputDiv);
      
      input.focus();
    }
  }

  // Função para processar resposta
  function handleAnswer(questionId, answer) {
    userResponses[questionId] = answer;
    
    // Adicionar resposta do usuário às mensagens
    const messagesContainer = document.getElementById('envialead-messages');
    if (messagesContainer) {
      const answerDiv = document.createElement('div');
      answerDiv.style.cssText = \`
        background: \${flowData.colors?.primary || '#FF6B35'};
        color: white;
        padding: 12px 16px;
        border-radius: 18px 18px 4px 18px;
        max-width: 80%;
        align-self: flex-end;
        margin-left: auto;
      \`;
      answerDiv.textContent = answer;
      messagesContainer.appendChild(answerDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    currentQuestionIndex++;
    
    // Mostrar próxima pergunta após delay
    setTimeout(() => showNextQuestion(), 500);
  }

  // Função para mostrar mensagem de conclusão
  function showCompletionMessage() {
    const messagesContainer = document.getElementById('envialead-messages');
    const inputContainer = document.getElementById('envialead-input-container');
    
    if (!messagesContainer || !inputContainer) return;
    
    // Limpar input
    inputContainer.innerHTML = '';
    
    // Verificar se respondeu perguntas suficientes
    const minQuestions = flowData.minimum_question || 1;
    const answeredCount = Object.keys(userResponses).length;
    const isCompleted = answeredCount >= minQuestions;
    
    // Mensagem de agradecimento
    const thankYouDiv = document.createElement('div');
    thankYouDiv.style.cssText = \`
      background: white;
      padding: 12px 16px;
      border-radius: 18px 18px 18px 4px;
      max-width: 80%;
      align-self: flex-start;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      color: \${flowData.colors?.text || '#1F2937'};
    \`;
    thankYouDiv.textContent = isCompleted ? 
      'Obrigado pelas informações! Em breve entraremos em contato.' :
      'Obrigado! Suas informações foram registradas.';
    messagesContainer.appendChild(thankYouDiv);
    
    // Botão WhatsApp se configurado
    if (flowData.show_whatsapp_button && flowData.whatsapp) {
      const whatsappDiv = document.createElement('div');
      whatsappDiv.style.cssText = 'margin-top: 10px;';
      
      const whatsappButton = document.createElement('button');
      whatsappButton.innerHTML = '📱 Continuar no WhatsApp';
      whatsappButton.style.cssText = \`
        background: #25d366;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.2s;
      \`;
      
      whatsappButton.addEventListener('mouseenter', () => {
        whatsappButton.style.background = '#128c7e';
      });
      
      whatsappButton.addEventListener('mouseleave', () => {
        whatsappButton.style.background = '#25d366';
      });
      
      whatsappButton.addEventListener('click', () => {
        // Usar o template configurado e substituir variáveis
        let message = flowData.whatsapp_message_template || 'Olá! Vim através do chat do site.';
        
        // Substituir variáveis no template
        Object.entries(userResponses).forEach(([questionId, answer]) => {
          const question = flowData.questions.find(q => q.id === questionId);
          if (question) {
            const questionTitle = question.title.toLowerCase();
            
            // Mapear para variáveis conhecidas
            if (questionTitle.includes('nome') || questionTitle.includes('name')) {
              message = message.replace(/#nome/gi, answer);
              message = message.replace(/#name/gi, answer);
            }
            if (questionTitle.includes('email')) {
              message = message.replace(/#email/gi, answer);
            }
            if (questionTitle.includes('telefone') || questionTitle.includes('phone')) {
              message = message.replace(/#telefone/gi, answer);
              message = message.replace(/#phone/gi, answer);
            }
            if (questionTitle.includes('empresa') || questionTitle.includes('company')) {
              message = message.replace(/#empresa/gi, answer);
              message = message.replace(/#company/gi, answer);
            }
            if (questionTitle.includes('cidade') || questionTitle.includes('city')) {
              message = message.replace(/#cidade/gi, answer);
              message = message.replace(/#city/gi, answer);
            }
          }
        });
        
        const whatsappUrl = \`https://wa.me/\${flowData.whatsapp.replace(/\\D/g, '')}?text=\${encodeURIComponent(message)}\`;
        window.open(whatsappUrl, '_blank');
      });
      
      whatsappDiv.appendChild(whatsappButton);
      inputContainer.appendChild(whatsappDiv);
    }
    
    // Salvar lead
    saveLead(isCompleted);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Função para salvar o lead
  async function saveLead(completed) {
    try {
      await fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/save-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flow_id: flowData.id,
          responses: userResponses,
          completed: completed
        })
      });
      console.log('[EnviaLead Widget] Lead salvo com sucesso');
    } catch (error) {
      console.error('[EnviaLead Widget] Erro ao salvar lead:', error);
    }
  }

  // Inicializar widget
  function initWidget() {
    // Verificar se já existe
    if (document.getElementById('envialead-chat-button')) {
      console.log('[EnviaLead Widget] Widget já está carregado');
      return;
    }
    
    console.log('[EnviaLead Widget] Criando botão do chat');
    const button = createChatButton();
    document.body.appendChild(button);
    
    console.log('[EnviaLead Widget] Widget carregado com sucesso');
  }

  // Aguardar DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();
`;

    return new Response(
      widgetScript,
      {
        headers: { ...corsHeaders, 'Content-Type': 'text/javascript' }
      }
    );

  } catch (error) {
    console.error('Erro na function envialead-widget:', error);
    return new Response(
      `console.error("EnviaLead Widget: Erro interno do servidor");`,
      {
        headers: { ...corsHeaders, 'Content-Type': 'text/javascript' }
      }
    );
  }
});