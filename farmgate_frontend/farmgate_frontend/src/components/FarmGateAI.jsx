import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Minimize2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { processMessage, QUICK_ACTIONS, WELCOME_MESSAGE } from '../utils/assistantEngine';

function renderMarkdown(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part.split('\n').map((line, j, arr) => (
      <span key={`${i}-${j}`}>
        {line}
        {j < arr.length - 1 && <br />}
      </span>
    ));
  });
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  return (
    <div className={`fgai-msg ${isUser ? 'fgai-msg-user' : 'fgai-msg-ai'}`}>
      {!isUser && <div className="fgai-msg-avatar">🌱</div>}
      <div className="fgai-msg-content">
        <div className="fgai-msg-text">{renderMarkdown(message.text)}</div>
        {message.actions?.length > 0 && (
          <div className="fgai-msg-actions">
            {message.actions.map((action, i) => (
              <button
                key={i}
                type="button"
                className="fgai-action-btn"
                onClick={() => message.onAction?.(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
        {message.links?.length > 0 && (
          <div className="fgai-msg-links">
            {message.links.map((link, i) => (
              <button
                key={i}
                type="button"
                className="fgai-link-btn"
                onClick={() => message.onAction?.({ type: 'navigate', value: link.path })}
              >
                {link.label} →
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="fgai-msg fgai-msg-ai">
      <div className="fgai-msg-avatar">🌱</div>
      <div className="fgai-msg-content">
        <div className="fgai-typing">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}

export default function FarmGateAI({ showBackToTop }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [welcomed, setWelcomed] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const cartCtx = useCart();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    if (open && !welcomed) {
      setWelcomed(true);
      setMessages([{ role: 'ai', text: WELCOME_MESSAGE.text, id: 'welcome' }]);
    }
  }, [open, welcomed]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSend = useCallback(async (text) => {
    const trimmed = (typeof text === 'string' ? text : input).trim();
    if (!trimmed || typing) return;

    setInput('');
    const userMsg = { role: 'user', text: trimmed, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    const delay = 600 + Math.random() * 800;
    await new Promise(r => setTimeout(r, delay));

    try {
      const response = await processMessage(trimmed, {
        user,
        cart: cartCtx.cart,
        total: cartCtx.total,
        itemCount: cartCtx.itemCount,
        addToCart: cartCtx.addToCart,
        removeFromCart: cartCtx.removeFromCart,
        updateQty: cartCtx.updateQty,
        clearCart: cartCtx.clearCart,
      });

      const aiMsg = {
        role: 'ai',
        text: response.text,
        actions: response.actions,
        links: response.links,
        id: Date.now() + 1,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Sorry, something went wrong. Please try again!',
        id: Date.now() + 1,
      }]);
    } finally {
      setTyping(false);
    }
  }, [input, typing, user, cartCtx]);

  const handleAction = useCallback((action) => {
    if (action.type === 'navigate') {
      // Set flag to trigger auto-scroll on destination page
      sessionStorage.setItem('scrollFromAI', 'true');
      navigate(action.value);
      setOpen(false);
    } else if (action.type === 'send') {
      handleSend(action.value);
    }
  }, [navigate, handleSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action) => {
    handleSend(action.message);
  };

  return (
    <>
      {open && (
        <div className="fgai-overlay" onClick={() => setOpen(false)} aria-hidden="true" />
      )}

      <div className={`fgai-panel ${open ? 'fgai-panel-open' : ''}`} role="dialog" aria-label="farm2door AI chat">
        <div className="fgai-header">
          <div className="fgai-header-info">
            <span className="fgai-header-icon">🌱</span>
            <div>
              <div className="fgai-header-title">farm2door AI</div>
              <div className="fgai-header-sub">Smart shopping & farming assistant</div>
            </div>
          </div>
          <div className="fgai-header-actions">
            <button type="button" className="fgai-icon-btn" onClick={() => setOpen(false)} aria-label="Minimize chat">
              <Minimize2 size={18} />
            </button>
            <button type="button" className="fgai-icon-btn" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="fgai-messages">
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              message={{
                ...msg,
                onAction: msg.onAction || handleAction,
              }}
            />
          ))}
          {typing && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && !typing && (
          <div className="fgai-quick-actions">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.id}
                type="button"
                className="fgai-quick-btn"
                onClick={() => handleQuickAction(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        <div className="fgai-input-area">
          <input
            ref={inputRef}
            type="text"
            className="fgai-input"
            placeholder="Ask about mangoes, orders, farming…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={typing}
            aria-label="Chat message"
          />
          <button
            type="button"
            className="fgai-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || typing}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>

        <div className="fgai-footer-note">
          <Sparkles size={12} />
          <span>Image & voice features coming soon</span>
        </div>
      </div>

      <button
        type="button"
        className={`fgai-fab ${open ? 'fgai-fab-hidden' : ''} ${showBackToTop ? 'fgai-fab-stacked' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Open farm2door AI assistant"
        title="farm2door AI"
      >
        <span className="fgai-fab-icon">🌱</span>
        <span className="fgai-fab-label">farm2door AI</span>
      </button>
    </>
  );
}
