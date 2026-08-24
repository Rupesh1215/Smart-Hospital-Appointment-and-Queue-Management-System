import { useState, useRef, useEffect } from 'react';
import { MdSmartToy, MdClose, MdSend, MdRefresh } from 'react-icons/md';
import chatbotService from '../services/chatbotService';

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
    <div className="fixed bottom-5 right-5 z-[90]">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-[#2563eb] text-white rounded-full shadow-lg hover:bg-[#1d4ed8] transition-all cursor-pointer"
        >
          <MdSmartToy className="text-xl" />
          <span className="font-semibold text-sm">SmartCare AI</span>
          <span className="w-2 h-2 bg-green-400 rounded-full" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] sm:w-[400px] h-[540px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-chat-enter">
          {/* Header */}
          <div className="px-4 py-3 bg-[#2563eb] text-white flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                <MdSmartToy className="text-xl" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">SmartCare AI</h3>
                <span className="text-xs text-blue-100 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <MdClose className="text-xl" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action)}
                className="whitespace-nowrap px-3 py-1 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-slate-600 hover:text-blue-700 rounded-full text-xs font-medium transition-all cursor-pointer flex-shrink-0"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'AI' && (
                  <div className="w-7 h-7 rounded-md bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                    msg.sender === 'USER'
                      ? 'bg-[#2563eb] text-white rounded-br-sm'
                      : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold">
                  AI
                </div>
                <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl rounded-bl-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="text-xs text-red-500">{error}</span>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                >
                  <MdRefresh className="text-sm" /> Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about doctors, appointments, or your queue..."
              className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-800 placeholder-slate-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="p-2 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <MdSend className="text-lg" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
