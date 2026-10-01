import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyzeSymptoms } from '../api/aiApi';
import { FiMessageCircle, FiX, FiSend, FiMapPin } from 'react-icons/fi';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'Hello! 👋 I\'m your AI Health Assistant. Describe your symptoms and I\'ll help you find the right doctor.\n\nFor example: *"I have a headache and fever since 2 days"*',
  data: null,
};

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text, data: null };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build history for context (exclude initial greeting)
      const history = messages
        .filter(m => m !== INITIAL_MESSAGE)
        .map(m => ({ role: m.role, content: m.content }));

      const { data } = await analyzeSymptoms(text, history);
      const result = data.data;

      const assistantMsg = {
        role: 'assistant',
        content: result.message || 'I couldn\'t process that. Please try again.',
        data: result,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        data: null,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="chatbot-fab"
        onClick={() => setOpen(!open)}
        title="AI Health Assistant"
      >
        {open ? <FiX size={24} /> : <FiMessageCircle size={24} />}
        {!open && <span className="chatbot-fab-badge">AI</span>}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-header-avatar">🤖</div>
              <div>
                <h4>AI Health Assistant</h4>
                <span className="chatbot-status">
                  <span className="chatbot-status-dot" /> Powered by Gemini AI
                </span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button onClick={resetChat} title="New Chat" className="chatbot-action-btn">↺</button>
              <button onClick={() => setOpen(false)} title="Close" className="chatbot-action-btn"><FiX size={16} /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.role}`}>
                {msg.role === 'assistant' && <div className="chatbot-msg-avatar">🤖</div>}
                <div className="chatbot-msg-bubble">
                  <p className="chatbot-msg-text">{msg.content}</p>

                  {/* Condition Tags */}
                  {msg.data?.conditions?.length > 0 && (
                    <div className="chatbot-conditions">
                      <span className="chatbot-label">Possible conditions:</span>
                      <div className="chatbot-tags">
                        {msg.data.conditions.map((c, j) => (
                          <span key={j} className="chatbot-tag">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Urgency Badge */}
                  {msg.data?.urgency && (
                    <div className="chatbot-urgency">
                      <span className={`chatbot-urgency-badge ${msg.data.urgency}`}>
                        {msg.data.urgency === 'emergency' ? '🚨' : msg.data.urgency === 'high' ? '⚠️' : msg.data.urgency === 'moderate' ? '🔶' : '🟢'} {msg.data.urgency.toUpperCase()}
                      </span>
                      {msg.data.specialization && (
                        <span className="chatbot-specialist">
                          → Visit a <strong>{msg.data.specialization}</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Advice */}
                  {msg.data?.advice && (
                    <div className="chatbot-advice">
                      💡 {msg.data.advice}
                    </div>
                  )}

                  {/* Recommended Doctors */}
                  {msg.data?.recommendedDoctors?.length > 0 && (
                    <div className="chatbot-doctors">
                      <span className="chatbot-label">Recommended Doctors:</span>
                      {msg.data.recommendedDoctors.map((doc) => (
                        <Link key={doc._id} to={`/doctors/${doc._id}`} className="chatbot-doctor-card" onClick={() => setOpen(false)}>
                          <div className="chatbot-doctor-avatar">
                            {doc.profileImage?.url
                              ? <img src={doc.profileImage.url} alt="" />
                              : doc.fullName?.[0] || 'D'}
                          </div>
                          <div className="chatbot-doctor-info">
                            <strong>{doc.fullName}</strong>
                            <span>{doc.specialization?.join(', ')}</span>
                            <span className="chatbot-doctor-meta">
                              {doc.experience > 0 && `${doc.experience} yrs • `}
                              ₹{doc.consultationFee}/visit
                              {doc.location?.city && <> • <FiMapPin size={10} /> {doc.location.city}</>}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Disclaimer */}
                  {msg.data?.disclaimer && (
                    <p className="chatbot-disclaimer">{msg.data.disclaimer}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="chatbot-msg assistant">
                <div className="chatbot-msg-avatar">🤖</div>
                <div className="chatbot-msg-bubble">
                  <div className="chatbot-typing">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              className="chatbot-input"
              type="text"
              placeholder="Describe your symptoms..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button className="chatbot-send" onClick={sendMessage} disabled={loading || !input.trim()}>
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
