
// EnviaLead - Chat Functionality and Interactions
(function(window) {
  'use strict';

  const EnviaLeadChat = {
    init: function(flowData, colors) {
      this.flowData = flowData;
      this.colors = colors;
      this.questions = this.processQuestions(flowData.questions);
      this.currentQuestionIndex = 0;
      this.responses = {};
      this.isOpen = false;

      console.log('[EnviaLead] Chat inicializado com', this.questions.length, 'perguntas');
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
        welcomeBubble.style.display = 'none';
        if (this.currentQuestionIndex === 0) {
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
          `background: white; color: ${this.colors.text}; border: 1px solid #e5e7eb; border-radius: 18px 18px 18px 4px;` : 
          `background: linear-gradient(45deg, ${this.colors.primary}, ${this.colors.secondary}); color: white; border-radius: 18px 18px 4px 18px;`
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
      
      return typingDiv;
    },

    removeTypingIndicator: function() {
      const typing = document.getElementById('typing-indicator');
      if (typing) {
        typing.remove();
      }
    },

    showNextQuestion: function() {
      if (this.currentQuestionIndex >= this.questions.length) {
        this.showCompletion();
        return;
      }

      const question = this.questions[this.currentQuestionIndex];
      console.log('[EnviaLead] Mostrando pergunta:', question.title);
      
      // Para mensagens do bot
      if (question.type === 'bot_message') {
        const typing = this.showTypingIndicator();
        setTimeout(() => {
          this.removeTypingIndicator();
          this.addMessage(question.title, true);
          this.currentQuestionIndex++;
          setTimeout(() => this.showNextQuestion(), 1000);
        }, 1500);
        return;
      }

      // Mostrar indicador de digitação
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
                   style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
                   onfocus="this.style.borderColor='${this.colors.primary}'"
                   onblur="this.style.borderColor='#e5e7eb'"
                   ${question.required ? 'required' : ''}>
            <button id="send-answer" style="margin-top: 8px; width: 100%; padding: 12px; background: linear-gradient(45deg, ${this.colors.primary}, ${this.colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Enviar</button>
          `;
          break;
          
        case 'select':
          const options = question.options || [];
          inputHTML = `
            <select id="question-input" style="width: 100%; padding: 12px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; background: white;" ${question.required ? 'required' : ''}>
              <option value="">Selecione uma opção...</option>
              ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
            <button id="send-answer" style="margin-top: 8px; width: 100%; padding: 12px; background: linear-gradient(45deg, ${this.colors.primary}, ${this.colors.secondary}); color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Enviar</button>
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
        
        // Salvar resposta
        this.responses[question.id] = answer;
        
        // Mostrar resposta do usuário
        this.addMessage(answer, false);
        
        // Próxima pergunta
        this.currentQuestionIndex++;
        
        // Limpar área de input
        inputArea.innerHTML = '';
        
        // Mostrar próxima pergunta
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
      this.addMessage('Obrigado pelas informações! Em breve entraremos em contato.', true);
      
      // Salvar lead
      window.EnviaLeadAPI.saveLead(this.flowData.id, this.responses);
      
      // Mostrar botão do WhatsApp se configurado
      if (this.flowData.show_whatsapp_button !== false && this.flowData.whatsapp) {
        setTimeout(() => this.showWhatsAppButton(), 2000);
      }
    },

    showWhatsAppButton: function() {
      const inputArea = document.getElementById('envialead-chat-input-area');
      
      // Preparar texto com respostas
      let messageText = 'Olá! Gostaria de continuar nossa conversa. Aqui estão minhas informações:\n\n';
      
      this.questions.forEach(q => {
        if (this.responses[q.id] && q.type !== 'bot_message') {
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
    }
  };

  // Export to global scope
  window.EnviaLeadChat = EnviaLeadChat;

})(window);
