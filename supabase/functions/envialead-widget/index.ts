import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const flowId = url.searchParams.get('flow');

    if (!flowId) {
      return new Response(
        'console.error("EnviaLead Widget: Flow ID não fornecido");',
        { headers: { ...corsHeaders, 'Content-Type': 'text/javascript' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: flow, error: flowError } = await supabase
      .from('flows')
      .select('*')
      .eq('id', flowId)
      .single();

    if (flowError || !flow || !flow.is_active) {
      return new Response(
        `console.error("EnviaLead Widget: Fluxo não encontrado ou inativo");`,
        { headers: { ...corsHeaders, 'Content-Type': 'text/javascript' } }
      );
    }

    const { data: questions } = await supabase
      .from('questions')
      .select('*')
      .eq('flow_id', flowId)
      .order('order_index');

    const { data: urls } = await supabase
      .from('flow_urls')
      .select('url')
      .eq('flow_id', flowId);

    const currentUrl = req.headers.get('referer') || req.headers.get('origin');
    const allowedUrls = urls?.map(u => u.url) || [];
    
    const platformDomains = [
      'envialead.com.br',
      'envialead.lovable.app',
      'localhost',
      '127.0.0.1'
    ];
    
    const isPlatformDomain = currentUrl ? platformDomains.some(domain => {
      try {
        const url = new URL(currentUrl);
        return url.hostname.includes(domain) || domain.includes(url.hostname);
      } catch {
        return currentUrl.includes(domain);
      }
    }) : false;
    
    if (allowedUrls.length > 0 && currentUrl && !isPlatformDomain) {
      const isAllowed = allowedUrls.some(allowedUrl => {
        try {
          if (allowedUrl === '*' || allowedUrl.startsWith('*.')) return true;
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
          { headers: { ...corsHeaders, 'Content-Type': 'text/javascript' } }
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

    const flowColors = flow.colors as Record<string, string> || {};

    const flowData = {
      id: flow.id,
      name: flow.name,
      description: flow.description,
      colors: {
        primary: flowColors.primary || '#FF6B35',
        secondary: flowColors.secondary || '#3B82F6',
        text: flowColors.text || '#1F2937',
        background: flowColors.background || '#FFFFFF',
        headerText: flowColors.headerText || '#FFFFFF',
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
      button_avatar_url: flow.button_avatar_url,
      attendant_name: flow.attendant_name || 'Atendimento',
      minimum_question: flow.minimum_question || 1,
      welcome_message: flow.welcome_message || 'Olá! Como posso ajudá-lo?',
      final_message: flow.final_message || 'Obrigado pelas informações! Em breve entraremos em contato.',
      final_message_custom: flow.final_message_custom,
      show_whatsapp_button: flow.show_whatsapp_button !== false,
      whatsapp_message_template: flow.whatsapp_message_template || 'Olá, meu nome é #nome e gostaria de mais informações.',
      questions: (questions || []).map(q => ({
        id: q.id,
        type: q.type,
        title: q.title,
        placeholder: q.placeholder,
        options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : null,
        required: q.required || false,
        order: q.order_index,
        variable_name: q.variable_name
      })),
    };

    const widgetScript = `
(function() {
  'use strict';
  
  console.log('[EnviaLead Widget] Iniciando widget para fluxo:', '${flowId}');
  
  const flowData = ${JSON.stringify(flowData)};
  
  let chatButton = null;
  let chatModal = null;
  let welcomeBubble = null;
  let currentItemIndex = 0;
  let userResponses = {};
  let isModalOpen = false;
  let isTyping = false;
  let waitingForInput = false;
  let allItems = [];
  let allQuestions = [];
  let conversationStarted = false;
  
  // Process all items into a single sorted array
  if (flowData.questions) {
    allItems = flowData.questions.map(function(q) {
      return {
        id: q.id,
        type: q.type,
        title: q.title,
        placeholder: q.placeholder,
        required: q.required,
        order: q.order || 0,
        options: q.options || [],
        variable_name: q.variable_name
      };
    }).sort(function(a, b) { return a.order - b.order; });
    
    allQuestions = allItems.filter(function(item) { return item.type !== 'bot_message'; });
  }
  
  // Replace variables in text (matching useChatLogic.ts)
  function replaceVariables(text, responses) {
    var processedText = text;
    var variableMap = {};
    
    allQuestions.forEach(function(question, index) {
      var questionTitle = question.title.toLowerCase();
      var answer = responses[question.id] || '';
      
      if (question.variable_name) {
        variableMap['#' + question.variable_name] = answer;
      }
      
      if (questionTitle.includes('nome')) {
        variableMap['#nome'] = answer;
        variableMap['#name'] = answer;
      }
      if (questionTitle.includes('telefone') || questionTitle.includes('celular')) {
        variableMap['#telefone'] = answer;
        variableMap['#phone'] = answer;
      }
      if (questionTitle.includes('email') || questionTitle.includes('e-mail')) {
        variableMap['#email'] = answer;
      }
      if (questionTitle.includes('empresa') || questionTitle.includes('company')) {
        variableMap['#empresa'] = answer;
        variableMap['#company'] = answer;
      }
      if (questionTitle.includes('cidade') || questionTitle.includes('city')) {
        variableMap['#cidade'] = answer;
        variableMap['#city'] = answer;
      }
      
      variableMap['#resposta' + (index + 1)] = answer;
      variableMap['#answer' + (index + 1)] = answer;
    });
    
    Object.keys(variableMap).forEach(function(variable) {
      if (variableMap[variable]) {
        var escaped = variable.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
        var regex = new RegExp(escaped, 'gi');
        processedText = processedText.replace(regex, variableMap[variable]);
      }
    });
    
    return processedText;
  }

  // Add CSS animations
  function addStyles() {
    var style = document.createElement('style');
    style.textContent = \`
      @keyframes envialead-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes envialead-bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes envialead-fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .envialead-typing-dot {
        width: 8px;
        height: 8px;
        background: #9ca3af;
        border-radius: 50%;
        display: inline-block;
        margin: 0 2px;
        animation: envialead-bounce 1s infinite;
      }
      .envialead-typing-dot:nth-child(2) { animation-delay: 0.1s; }
      .envialead-typing-dot:nth-child(3) { animation-delay: 0.2s; }
    \`;
    document.head.appendChild(style);
  }

  // Show typing indicator in messages container
  function showTypingIndicator() {
    var messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) return null;
    
    var typingDiv = document.createElement('div');
    typingDiv.id = 'envialead-typing';
    typingDiv.style.cssText = \`
      background: white;
      padding: 10px 16px;
      border-radius: 18px 18px 18px 4px;
      max-width: 80px;
      align-self: flex-start;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 4px;
      animation: envialead-fadeIn 0.3s ease;
    \`;
    typingDiv.innerHTML = '<span class="envialead-typing-dot"></span><span class="envialead-typing-dot"></span><span class="envialead-typing-dot"></span>';
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return typingDiv;
  }

  // Remove typing indicator
  function removeTypingIndicator() {
    var typing = document.getElementById('envialead-typing');
    if (typing) typing.remove();
  }

  // Add a bot message to the chat
  function addBotMessage(text) {
    var messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) return;
    
    var processedText = replaceVariables(text, userResponses);
    
    var msgDiv = document.createElement('div');
    msgDiv.style.cssText = \`
      background: white;
      padding: 12px 16px;
      border-radius: 18px 18px 18px 4px;
      max-width: 80%;
      align-self: flex-start;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
      color: \${flowData.colors.text};
      animation: envialead-fadeIn 0.3s ease;
      font-size: 14px;
    \`;
    msgDiv.textContent = processedText;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Add user message to chat
  function addUserMessage(text) {
    var messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) return;
    
    var msgDiv = document.createElement('div');
    msgDiv.style.cssText = \`
      background: linear-gradient(45deg, \${flowData.colors.primary}, \${flowData.colors.secondary});
      color: white;
      padding: 12px 16px;
      border-radius: 18px 18px 4px 18px;
      max-width: 80%;
      align-self: flex-end;
      margin-left: auto;
      animation: envialead-fadeIn 0.3s ease;
      font-size: 14px;
    \`;
    msgDiv.textContent = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Show a question with typing indicator first (matching preview behavior)
  function showQuestionWithTyping(questionText, callback) {
    isTyping = true;
    showTypingIndicator();
    
    setTimeout(function() {
      removeTypingIndicator();
      isTyping = false;
      addBotMessage(questionText);
      if (callback) callback();
    }, 1500);
  }

  // Create chat button
  function createChatButton() {
    if (chatButton) return chatButton;
    
    var button = document.createElement('div');
    button.id = 'envialead-chat-button';
    
    var buttonPosition = flowData.button_position || 'bottom-right';
    var offsetX = flowData.button_offset_x || 0;
    var offsetY = flowData.button_offset_y || 0;
    var buttonSize = flowData.button_size || 60;
    
    var positionStyles = {
      'bottom-right': { bottom: (30 + offsetY) + 'px', right: (20 + offsetX) + 'px' },
      'bottom-left': { bottom: (30 + offsetY) + 'px', left: (20 + offsetX) + 'px' },
      'bottom-center': { bottom: (30 + offsetY) + 'px', left: '50%', transform: 'translateX(calc(-50% + ' + offsetX + 'px))' },
      'top-right': { top: (20 + offsetY) + 'px', right: (20 + offsetX) + 'px' },
      'top-left': { top: (20 + offsetY) + 'px', left: (20 + offsetX) + 'px' },
      'top-center': { top: (20 + offsetY) + 'px', left: '50%', transform: 'translateX(calc(-50% + ' + offsetX + 'px))' },
      'center-right': { top: '50%', right: (20 + offsetX) + 'px', transform: 'translateY(calc(-50% + ' + offsetY + 'px))' },
      'center-left': { top: '50%', left: (20 + offsetX) + 'px', transform: 'translateY(calc(-50% + ' + offsetY + 'px))' },
      'center-center': { top: '50%', left: '50%', transform: 'translate(calc(-50% + ' + offsetX + 'px), calc(-50% + ' + offsetY + 'px))' }
    };

    var posStyle = positionStyles[buttonPosition] || positionStyles['bottom-right'];

    button.style.cssText = \`
      position: fixed;
      width: \${buttonSize}px;
      height: \${buttonSize}px;
      border-radius: 50%;
      background: linear-gradient(45deg, \${flowData.colors.primary}, \${flowData.colors.secondary});
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
      \${Object.entries(posStyle).map(function(e) { return e[0] + ': ' + e[1]; }).join('; ')};
    \`;

    // Use button_avatar_url for the floating button (matching preview)
    var avatarUrl = flowData.button_avatar_url || flowData.avatar_url;
    
    if (avatarUrl && (avatarUrl.startsWith('http') || avatarUrl.startsWith('blob:'))) {
      var img = document.createElement('img');
      img.src = avatarUrl;
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%;';
      img.alt = 'Chat Avatar';
      img.onerror = function() { button.innerHTML = '💬'; };
      button.appendChild(img);
    } else if (avatarUrl && avatarUrl.length <= 2) {
      button.innerHTML = '<span style="font-size: ' + Math.floor(buttonSize * 0.5) + 'px;">' + avatarUrl + '</span>';
    } else {
      button.innerHTML = '💬';
    }

    button.addEventListener('mouseenter', function() {
      button.style.transform = (posStyle.transform ? posStyle.transform + ' ' : '') + 'scale(1.1)';
    });
    
    button.addEventListener('mouseleave', function() {
      button.style.transform = posStyle.transform || 'scale(1)';
    });

    button.addEventListener('click', function() {
      if (isModalOpen) {
        closeChatModal();
      } else {
        hideWelcomeBubble();
        openChatModal();
      }
    });

    chatButton = button;
    return button;
  }

  // Create welcome bubble (matching WelcomeBubble.tsx)
  function createWelcomeBubble() {
    if (welcomeBubble) return;
    
    var buttonSize = flowData.button_size || 60;
    var offsetX = flowData.button_offset_x || 0;
    var offsetY = flowData.button_offset_y || 0;
    var buttonPosition = flowData.button_position || 'bottom-right';
    var clearance = 20;
    var bubbleOffset = buttonSize + clearance;
    
    var bubble = document.createElement('div');
    bubble.id = 'envialead-welcome-bubble';
    
    var posStyles = {};
    if (buttonPosition.includes('right')) {
      posStyles = { bottom: (30 + offsetY + bubbleOffset) + 'px', right: (20 + offsetX) + 'px', left: 'auto' };
    } else if (buttonPosition.includes('left')) {
      posStyles = { bottom: (30 + offsetY + bubbleOffset) + 'px', left: (20 + offsetX) + 'px', right: 'auto' };
    } else if (buttonPosition.includes('center')) {
      posStyles = { bottom: (30 + offsetY + bubbleOffset) + 'px', left: '50%', transform: 'translateX(calc(-50% + ' + offsetX + 'px))', right: 'auto' };
    } else {
      posStyles = { bottom: (30 + offsetY + bubbleOffset) + 'px', right: (20 + offsetX) + 'px', left: 'auto' };
    }
    
    bubble.style.cssText = \`
      position: fixed;
      padding: 16px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      z-index: 9998;
      max-width: 250px;
      width: max-content;
      word-wrap: break-word;
      color: \${flowData.colors.text};
      animation: envialead-fadeIn 0.5s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      \${Object.entries(posStyles).map(function(e) { return e[0] + ': ' + e[1]; }).join('; ')};
    \`;
    
    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = \`
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      background: #e5e7eb;
      border: none;
      border-radius: 50%;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s;
    \`;
    closeBtn.addEventListener('mouseenter', function() { closeBtn.style.background = '#d1d5db'; });
    closeBtn.addEventListener('mouseleave', function() { closeBtn.style.background = '#e5e7eb'; });
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      hideWelcomeBubble();
    });
    
    var text = document.createElement('p');
    text.style.cssText = 'font-size: 14px; margin: 0; padding-right: 16px;';
    text.textContent = flowData.welcome_message;
    
    bubble.appendChild(closeBtn);
    bubble.appendChild(text);
    
    bubble.addEventListener('click', function() {
      hideWelcomeBubble();
      openChatModal();
    });
    
    document.body.appendChild(bubble);
    welcomeBubble = bubble;
  }
  
  function hideWelcomeBubble() {
    if (welcomeBubble) {
      welcomeBubble.remove();
      welcomeBubble = null;
    }
  }

  // Create chat modal
  function createChatModal() {
    if (chatModal) return chatModal;

    var modal = document.createElement('div');
    modal.id = 'envialead-chat-modal';
    
    var chatPosition = flowData.chat_position || 'bottom-right';
    var offsetX = flowData.chat_offset_x || 0;
    var offsetY = flowData.chat_offset_y || 0;
    var chatWidth = flowData.chat_width || 400;
    var chatHeight = flowData.chat_height || 500;
    
    var positionStyles = {
      'bottom-right': { bottom: (100 + offsetY) + 'px', right: (20 + offsetX) + 'px' },
      'bottom-left': { bottom: (100 + offsetY) + 'px', left: (20 + offsetX) + 'px' },
      'bottom-center': { bottom: (100 + offsetY) + 'px', left: '50%', transform: 'translateX(calc(-50% + ' + offsetX + 'px))' },
      'top-right': { top: (80 + offsetY) + 'px', right: (20 + offsetX) + 'px' },
      'top-left': { top: (80 + offsetY) + 'px', left: (20 + offsetX) + 'px' },
      'top-center': { top: (80 + offsetY) + 'px', left: '50%', transform: 'translateX(calc(-50% + ' + offsetX + 'px))' },
      'center-right': { top: '50%', right: (20 + offsetX) + 'px', transform: 'translateY(calc(-50% + ' + offsetY + 'px))' },
      'center-left': { top: '50%', left: (20 + offsetX) + 'px', transform: 'translateY(calc(-50% + ' + offsetY + 'px))' },
      'center-center': { top: '50%', left: '50%', transform: 'translate(calc(-50% + ' + offsetX + 'px), calc(-50% + ' + offsetY + 'px))' }
    };

    var posStyle = positionStyles[chatPosition] || positionStyles['bottom-right'];

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
      \${Object.entries(posStyle).map(function(e) { return e[0] + ': ' + e[1]; }).join('; ')};
    \`;

    // Header (matching ChatWindow.tsx)
    var header = document.createElement('div');
    header.style.cssText = \`
      background: linear-gradient(45deg, \${flowData.colors.primary}, \${flowData.colors.secondary});
      color: \${flowData.colors.headerText};
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    \`;

    var headerInfo = document.createElement('div');
    headerInfo.style.cssText = 'display: flex; align-items: center; gap: 12px;';
    
    // Header avatar (uses avatar_url, not button_avatar_url)
    var avatar = document.createElement('div');
    avatar.style.cssText = \`
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
    \`;
    
    if (flowData.avatar_url && (flowData.avatar_url.startsWith('http') || flowData.avatar_url.startsWith('blob:'))) {
      var avatarImg = document.createElement('img');
      avatarImg.src = flowData.avatar_url;
      avatarImg.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%;';
      avatarImg.alt = 'Avatar';
      avatarImg.onerror = function() { avatar.innerHTML = '👤'; };
      avatar.appendChild(avatarImg);
    } else if (flowData.avatar_url && flowData.avatar_url.length <= 2) {
      avatar.style.fontSize = '20px';
      avatar.textContent = flowData.avatar_url;
    } else {
      avatar.textContent = '👤';
    }
    
    var headerText = document.createElement('div');
    headerText.innerHTML = \`
      <div style="font-size: 14px; font-weight: 600;">\${flowData.attendant_name}</div>
      <div style="font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 5px;">
        <div style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%; animation: envialead-pulse 2s infinite;"></div>
        Online agora
      </div>
    \`;
    
    headerInfo.appendChild(avatar);
    headerInfo.appendChild(headerText);
    
    var closeButton = document.createElement('button');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = \`
      background: none;
      border: none;
      color: \${flowData.colors.headerText};
      font-size: 16px;
      cursor: pointer;
      padding: 4px;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    \`;
    
    closeButton.addEventListener('click', closeChatModal);
    closeButton.addEventListener('mouseenter', function() { closeButton.style.background = 'rgba(255,255,255,0.2)'; });
    closeButton.addEventListener('mouseleave', function() { closeButton.style.background = 'none'; });
    
    header.appendChild(headerInfo);
    header.appendChild(closeButton);

    // Messages container
    var messagesContainer = document.createElement('div');
    messagesContainer.id = 'envialead-messages';
    messagesContainer.style.cssText = \`
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      background: \${flowData.colors.background};
      display: flex;
      flex-direction: column;
      gap: 12px;
    \`;

    // Input container
    var inputContainer = document.createElement('div');
    inputContainer.id = 'envialead-input-container';
    inputContainer.style.cssText = \`
      padding: 16px;
      background: white;
      border-top: 1px solid #e2e8f0;
    \`;

    modal.appendChild(header);
    modal.appendChild(messagesContainer);
    modal.appendChild(inputContainer);

    chatModal = modal;
    return modal;
  }

  function openChatModal() {
    if (isModalOpen) return;
    
    if (chatModal) {
      // Reopen existing modal (preserves conversation)
      chatModal.style.display = 'flex';
    } else {
      var modal = createChatModal();
      document.body.appendChild(modal);
    }
    isModalOpen = true;
    
    if (!conversationStarted) {
      startConversation();
    }
  }

  function closeChatModal() {
    if (!isModalOpen || !chatModal) return;
    chatModal.style.display = 'none';
    isModalOpen = false;
  }

  // Start conversation (matching useChatLogic.ts startConversation)
  function startConversation() {
    conversationStarted = true;
    
    var messagesContainer = document.getElementById('envialead-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    
    // Welcome message first
    setTimeout(function() {
      addBotMessage(flowData.welcome_message);
      
      // Then show first question/item with typing
      setTimeout(function() {
        processNextItem();
      }, 1000);
    }, 500);
  }

  // Sequential processing: iterate through allItems one by one
  function processNextItem() {
    try {
      if (currentItemIndex >= allItems.length) {
        showCompletionMessage();
        return;
      }
      
      var item = allItems[currentItemIndex];
      console.log('[EnviaLead Widget] Processing item', currentItemIndex, item.type, item.title);
      
      if (item.type === 'bot_message') {
        // Bot message: show with typing indicator, then auto-advance
        showQuestionWithTyping(item.title, function() {
          currentItemIndex++;
          // Auto-advance after short delay
          setTimeout(function() {
            processNextItem();
          }, 800);
        });
      } else {
        // Question: show with typing indicator, then wait for input
        showQuestionWithTyping(item.title, function() {
          waitingForInput = true;
          createQuestionInput(item);
        });
      }
    } catch (error) {
      console.error('[EnviaLead Widget] Erro ao processar item:', error);
      // Try to advance past the broken item
      currentItemIndex++;
      setTimeout(function() { processNextItem(); }, 500);
    }
  }

  // Create input for current question (matching ChatInput.tsx)
  function createQuestionInput(question) {
    var inputContainer = document.getElementById('envialead-input-container');
    if (!inputContainer) return;
    
    inputContainer.innerHTML = '';
    
    // Handle select/single type as clickable option buttons
    if ((question.type === 'select' || question.type === 'single') && question.options && question.options.length > 0) {
      question.options.forEach(function(option) {
        var button = document.createElement('button');
        button.textContent = option;
        button.style.cssText = \`
          display: block;
          width: 100%;
          padding: 10px 15px;
          margin-bottom: 8px;
          background: white;
          border: 2px solid \${flowData.colors.primary};
          border-radius: 8px;
          color: \${flowData.colors.primary};
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          text-align: left;
        \`;
        
        button.addEventListener('mouseenter', function() {
          button.style.background = flowData.colors.primary;
          button.style.color = 'white';
        });
        
        button.addEventListener('mouseleave', function() {
          button.style.background = 'white';
          button.style.color = flowData.colors.primary;
        });
        
        button.addEventListener('click', function() {
          handleAnswer(question.id, option);
        });
        
        inputContainer.appendChild(button);
      });
    } else if (question.type === 'radio' && question.options && question.options.length > 0) {
      // Radio buttons
      question.options.forEach(function(option) {
        var label = document.createElement('label');
        label.style.cssText = \`
          display: flex;
          align-items: center;
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 8px;
          transition: background 0.2s;
          font-size: 14px;
        \`;
        label.addEventListener('mouseenter', function() { label.style.background = '#f9fafb'; });
        label.addEventListener('mouseleave', function() { label.style.background = 'white'; });
        
        var radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'envialead-radio';
        radio.value = option;
        radio.style.cssText = 'margin-right: 8px;';
        radio.addEventListener('change', function() {
          handleAnswer(question.id, option);
        });
        
        label.appendChild(radio);
        label.appendChild(document.createTextNode(option));
        inputContainer.appendChild(label);
      });
    } else {
      // Text input (matching preview)
      var inputDiv = document.createElement('div');
      inputDiv.style.cssText = 'display: flex; gap: 8px;';
      
      var input = document.createElement(question.type === 'textarea' ? 'textarea' : 'input');
      input.type = question.type === 'email' ? 'email' : 
                  question.type === 'phone' ? 'tel' : 'text';
      input.placeholder = question.placeholder || 'Digite sua resposta...';
      input.style.cssText = \`
        flex: 1;
        padding: 10px 12px;
        border: 2px solid \${flowData.colors.primary};
        border-radius: 8px;
        outline: none;
        font-size: 14px;
        transition: border-color 0.2s;
        \${question.type === 'textarea' ? 'resize: vertical; min-height: 60px;' : ''}
      \`;
      
      // Phone mask
      if (question.type === 'phone') {
        input.addEventListener('input', function(e) {
          var value = e.target.value.replace(/\\D/g, '');
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
      }
      
      // Email lowercase
      if (question.type === 'email') {
        input.addEventListener('input', function(e) {
          e.target.value = e.target.value.replace(/\\s/g, '').toLowerCase();
        });
      }
      
      var sendButton = document.createElement('button');
      sendButton.innerHTML = '➤';
      sendButton.style.cssText = \`
        padding: 10px 14px;
        background: linear-gradient(45deg, \${flowData.colors.primary}, \${flowData.colors.secondary});
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        transition: opacity 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      \`;
      
      sendButton.addEventListener('mouseenter', function() { sendButton.style.opacity = '0.85'; });
      sendButton.addEventListener('mouseleave', function() { sendButton.style.opacity = '1'; });
      
      var handleSend = function() {
        var value = input.value.trim();
        if (!value) return;
        
        // Validate email
        if (question.type === 'email') {
          var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(value)) {
            input.style.borderColor = '#ef4444';
            return;
          }
        }
        
        // Validate phone
        if (question.type === 'phone') {
          var cleanPhone = value.replace(/\\D/g, '');
          if (cleanPhone.length < 10) {
            input.style.borderColor = '#ef4444';
            return;
          }
        }
        
        handleAnswer(question.id, value);
      };
      
      sendButton.addEventListener('click', handleSend);
      input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      });
      
      inputDiv.appendChild(input);
      inputDiv.appendChild(sendButton);
      inputContainer.appendChild(inputDiv);
      
      setTimeout(function() { input.focus(); }, 100);
    }
  }

  // Handle user answer
  function handleAnswer(questionId, answer) {
    if (!waitingForInput) return;
    waitingForInput = false;
    
    userResponses[questionId] = answer;
    addUserMessage(answer);
    
    currentItemIndex++;
    
    // Clear input
    var inputContainer = document.getElementById('envialead-input-container');
    if (inputContainer) inputContainer.innerHTML = '';
    
    // Process next item with delay (matching preview timing)
    setTimeout(function() {
      processNextItem();
    }, 1000);
  }

  // Show completion message (matching useChatLogic.ts)
  function showCompletionMessage() {
    var inputContainer = document.getElementById('envialead-input-container');
    if (!inputContainer) return;
    
    inputContainer.innerHTML = '';
    
    // Use configured final message
    var finalMessage = flowData.final_message_custom || flowData.final_message;
    var processedFinalMessage = replaceVariables(finalMessage, userResponses);
    
    // Show with typing indicator
    showQuestionWithTyping(processedFinalMessage, function() {
      // Show completion UI in input area
      var completionDiv = document.createElement('div');
      completionDiv.style.cssText = 'text-align: center; padding: 8px 0;';
      
      var successText = document.createElement('p');
      successText.textContent = 'Informações enviadas com sucesso!';
      successText.style.cssText = 'color: #16a34a; font-weight: 500; margin: 0 0 12px 0; font-size: 14px;';
      completionDiv.appendChild(successText);
      
      // WhatsApp button
      if (flowData.show_whatsapp_button && flowData.whatsapp) {
        var whatsappButton = document.createElement('button');
        whatsappButton.innerHTML = '💬 Continuar no WhatsApp';
        whatsappButton.style.cssText = \`
          width: 100%;
          padding: 10px 20px;
          background: #25d366;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        \`;
        
        whatsappButton.addEventListener('mouseenter', function() { whatsappButton.style.background = '#128c7e'; });
        whatsappButton.addEventListener('mouseleave', function() { whatsappButton.style.background = '#25d366'; });
        
        whatsappButton.addEventListener('click', function() {
          var message = replaceVariables(flowData.whatsapp_message_template, userResponses);
          var whatsappUrl = 'https://wa.me/' + flowData.whatsapp.replace(/\\D/g, '') + '?text=' + encodeURIComponent(message);
          window.open(whatsappUrl, '_blank');
        });
        
        completionDiv.appendChild(whatsappButton);
      }
      
      inputContainer.appendChild(completionDiv);
    });
    
    // Save lead
    var minQuestions = flowData.minimum_question || 1;
    var answeredCount = Object.keys(userResponses).length;
    saveLead(answeredCount >= minQuestions);
  }

  // Save lead
  async function saveLead(completed) {
    try {
      await fetch('https://fuzkdrkhvmaimpgzvimq.supabase.co/functions/v1/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // Initialize widget
  function initWidget() {
    if (document.getElementById('envialead-chat-button')) {
      console.log('[EnviaLead Widget] Widget já está carregado');
      return;
    }
    
    addStyles();
    
    var button = createChatButton();
    document.body.appendChild(button);
    
    // Show welcome bubble after 2 seconds (matching preview behavior)
    setTimeout(function() {
      if (!isModalOpen) {
        createWelcomeBubble();
      }
    }, 2000);
    
    console.log('[EnviaLead Widget] Widget carregado com sucesso');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();
`;

    return new Response(
      widgetScript,
      { headers: { ...corsHeaders, 'Content-Type': 'text/javascript' } }
    );

  } catch (error) {
    console.error('Erro na function envialead-widget:', error);
    return new Response(
      `console.error("EnviaLead Widget: Erro interno do servidor");`,
      { headers: { ...corsHeaders, 'Content-Type': 'text/javascript' } }
    );
  }
});
