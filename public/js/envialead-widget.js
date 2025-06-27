
// EnviaLead - Widget Creation and DOM Manipulation
(function(window) {
  'use strict';

  const EnviaLeadWidget = {
    createFloatingButton: function(colors, buttonPosition) {
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

    createWelcomeBubble: function(welcomeMessage, colors) {
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

      return welcomeBubble;
    },

    createChatWindow: function(chatPosition, colors, flowData) {
      const chatWindow = document.createElement('div');
      chatWindow.id = 'envialead-chat-window';
      const chatWindowPosition = window.EnviaLeadUtils.getChatWindowPosition(chatPosition);
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
            <div style="font-weight: 600; font-size: 14px;">${flowData.name || 'Atendimento'}</div>
            <div style="font-size: 12px; opacity: 0.9;">Online</div>
          </div>
        </div>
        <button id="envialead-close-chat" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='none'">×</button>
      `;

      const chatMessages = document.createElement('div');
      chatMessages.id = 'envialead-chat-messages';
      chatMessages.style.cssText = `
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background: #f9fafb;
      `;

      const chatInputArea = document.createElement('div');
      chatInputArea.id = 'envialead-chat-input-area';
      chatInputArea.style.cssText = `
        padding: 16px;
        border-top: 1px solid #e5e7eb;
        background: white;
      `;

      chatWindow.appendChild(chatHeader);
      chatWindow.appendChild(chatMessages);
      chatWindow.appendChild(chatInputArea);

      return chatWindow;
    },

    createMainContainer: function(buttonPosition) {
      const chatContainer = document.createElement('div');
      chatContainer.id = 'envialead-chat-container';
      chatContainer.style.cssText = `
        position: fixed;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ${window.EnviaLeadUtils.getPositionStyles(buttonPosition)}
      `;
      return chatContainer;
    },

    removeExistingWidget: function() {
      const existing = document.getElementById('envialead-chat-container');
      if (existing) {
        console.log('[EnviaLead] Widget já existe, removendo...');
        existing.remove();
      }
    }
  };

  // Export to global scope
  window.EnviaLeadWidget = EnviaLeadWidget;
  console.log('[EnviaLead] Módulo EnviaLeadWidget carregado');

})(window);
