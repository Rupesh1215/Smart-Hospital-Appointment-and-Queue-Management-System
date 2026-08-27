import { useState, useRef, useEffect } from 'react';
import { MdSmartToy, MdClose, MdSend, MdRefresh } from 'react-icons/md';
import chatbotService from '../services/chatbotService';
import './ChatbotWidget.css';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'AI',
      text: "Hello! I'm SmartCare AI. I can help you find doctors, check appointment availability, book appointments, and track your queue. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const quickActions = [
    'Find a Doctor',
    'Book Appointment',
    'Check Queue',
    'Departments',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    setError(null);
    const userMsg = { sender: 'USER', text: query, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'USER' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await chatbotService.sendMessage(query, history);
      const aiReply = res.data?.data?.reply || 'Sorry, I could not process your request right now.';

      setMessages((prev) => [
        ...prev,
        { sender: 'AI', text: aiReply, timestamp: new Date() },
      ]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setError('Failed to get a response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'USER');
    if (lastUserMsg) {
      setError(null);
      handleSend(lastUserMsg.text);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-trigger-btn"
        >
          <MdSmartToy size={20} />
          <span className="chatbot-trigger-text">SmartCare AI</span>
          <span className="status-dot" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-header-icon">
                <MdSmartToy size={20} />
              </div>
              <div>
                <h3 className="chatbot-header-title">SmartCare AI</h3>
                <span className="chatbot-header-status">
                  <span className="status-dot" />
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="chatbot-close-btn"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="chatbot-quick-actions">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action)}
                className="chatbot-quick-action-btn"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-message-row ${msg.sender === 'USER' ? 'user' : 'ai'}`}
              >
                {msg.sender === 'AI' && (
                  <div className="chatbot-ai-avatar">AI</div>
                )}
                <div
                  className={`chatbot-message-bubble ${msg.sender === 'USER' ? 'user' : 'ai'}`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-message-row ai">
                <div className="chatbot-ai-avatar">AI</div>
                <div className="chatbot-typing-indicator">
                  <div className="chatbot-dot" />
                  <div className="chatbot-dot" />
                  <div className="chatbot-dot" />
                </div>
              </div>
            )}

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px 0' }}>
                <span style={{ fontSize: '12px', color: '#ef4444' }}>{error}</span>
                <button
                  onClick={handleRetry}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500 }}
                >
                  <MdRefresh size={14} /> Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about doctors, appointments, or your queue..."
              className="chatbot-input"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="chatbot-send-btn"
            >
              <MdSend size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
