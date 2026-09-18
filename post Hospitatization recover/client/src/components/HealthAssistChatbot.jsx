import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  ShieldAlert, 
  PhoneCall, 
  HelpCircle, 
  Sparkles, 
  Minimize2, 
  Maximize2,
  ChevronDown,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HealthAssistChatbot() {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'HealthAssist AI',
      isBot: true,
      text: `Hello! I am **HealthAssist AI**, your post-hospitalization monitoring companion.\n\nYou can ask me about:\n• Explaining medical terms (e.g., *"What does SpO2 mean?"*)\n• Guidance on your daily health check-in\n• Understanding risk factors and alerts\n• Medication and follow-up reminders\n\n*In a medical emergency, please call 911 immediately.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'What does SpO2 mean?',
        'What does Peak Flow mean?',
        'Explain my blood pressure',
        'What if I miss a medication?',
        'How is recovery stage calculated?'
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: user?.name || (role === 'patient' ? 'Patient' : 'Clinician'),
      isBot: false,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.sendChatbotMessage({
        message: text.trim(),
        patientId: user?.id,
        role
      });

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: res.sender || 'HealthAssist AI',
        isBot: true,
        text: res.reply,
        isEmergency: res.isEmergency,
        emergencyHotline: res.emergencyHotline,
        quickActions: res.quickActions,
        suggestions: res.relatedTopics || res.quickSuggestions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'HealthAssist AI',
          isBot: true,
          text: 'I encountered an issue connecting to the clinical knowledge service. Please try again or reach out to your care team.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Widget Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#ffffff',
            borderRadius: '9999px',
            padding: '0.85rem 1.4rem',
            border: 'none',
            boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.4), 0 8px 10px -6px rgba(2, 132, 199, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 700,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
          title="Open HealthAssist AI Assistant"
        >
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={16} />
          </div>
          <span>HealthAssist AI</span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 48px)',
            height: '620px',
            maxHeight: 'calc(100vh - 60px)',
            background: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--slate-200)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>HealthAssist AI</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>Post-Acute Decision Support</div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#ffffff',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Regulatory Reminder Banner */}
          <div style={{ background: '#f0f9ff', borderBottom: '1px solid #bae6fd', padding: '0.4rem 0.85rem', fontSize: '0.72rem', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={12} />
            <span>AI decision support only &bull; Does not diagnose or prescribe.</span>
          </div>

          {/* Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              background: '#f8fafc'
            }}
          >
            {messages.map(m => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.isBot ? 'flex-start' : 'flex-end'
                }}
              >
                {/* Message Bubble */}
                <div
                  style={{
                    maxWidth: '88%',
                    padding: '0.75rem 1rem',
                    borderRadius: m.isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                    background: m.isEmergency 
                      ? '#fee2e2' 
                      : (m.isBot ? '#ffffff' : '#0284c7'),
                    color: m.isEmergency 
                      ? '#991b1b' 
                      : (m.isBot ? 'var(--slate-800)' : '#ffffff'),
                    border: m.isEmergency 
                      ? '1px solid #f87171' 
                      : (m.isBot ? '1px solid var(--slate-200)' : 'none'),
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {m.text}

                  {/* Emergency Actions if Red-Flag / Acute Escalation */}
                  {m.isEmergency && (
                    <div style={{ marginTop: '0.85rem', borderTop: '1px solid #fca5a5', paddingTop: '0.65rem' }}>
                      <a
                        href="tel:911"
                        className="btn btn-emergency"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.4rem',
                          padding: '0.5rem',
                          fontSize: '0.85rem',
                          textDecoration: 'none',
                          fontWeight: 800
                        }}
                      >
                        <PhoneCall size={16} />
                        <span>Call Emergency Services (911)</span>
                      </a>
                    </div>
                  )}
                </div>

                <span style={{ fontSize: '0.65rem', color: 'var(--slate-400)', marginTop: '0.2rem', padding: '0 0.25rem' }}>
                  {m.timestamp}
                </span>

                {/* Quick Topic Suggestions */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem', maxWidth: '90%' }}>
                    {m.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleSend(sug)}
                        style={{
                          fontSize: '0.72rem',
                          background: '#ffffff',
                          border: '1px solid #bfdbfe',
                          color: '#0369a1',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '9999px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--slate-500)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                <RefreshCw size={14} className="spin" />
                <span>HealthAssist AI is formulating guidance...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#ffffff',
              borderTop: '1px solid var(--slate-200)'
            }}
          >
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, fontSize: '0.85rem', padding: '0.6rem 0.85rem' }}
                placeholder="Ask about your vitals, medications, SpO2..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.6rem 0.9rem' }}
                disabled={!inputMessage.trim() || loading}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
