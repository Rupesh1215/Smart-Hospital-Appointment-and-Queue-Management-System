import api from './api';

const chatbotService = {
  sendMessage: (message, conversationHistory = []) =>
    api.post('/chatbot/message', { message, conversationHistory }),
};

export default chatbotService;
