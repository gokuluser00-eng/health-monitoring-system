import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Bell, ShieldAlert, CheckCircle, Info, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMsgContent, setNewMsgContent] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    if (!user?.id) return;
    try {
      const data = await api.getMessages({ patientId: user.id });
      setMessages(data.messages || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsgContent.trim()) return;
    setSending(true);
    try {
      await api.sendMessage({
        patientId: user.id,
        senderRole: 'patient',
        senderName: user.name,
        recipientRole: 'doctor',
        subject: subject.trim() || `Question regarding post-discharge recovery`,
        category: 'general',
        content: newMsgContent.trim()
      });
      setNewMsgContent('');
      setSubject('');
      await fetchMessages();
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const getCategoryBadge = (cat) => {
    if (cat === 'alert_followup') return <span className="badge badge-high"><ShieldAlert size={12} /> Clinical Alert Action</span>;
    if (cat === 'reminder') return <span className="badge badge-info"><Calendar size={12} /> Appointment Reminder</span>;
    if (cat === 'instruction') return <span className="badge badge-mod"><Info size={12} /> Care Instruction</span>;
    return <span className="badge badge-manual">General Message</span>;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={24} color="#0284c7" />
          Care Team Direct Messaging
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
          Secure two-way messaging with Dr. {user.doctorName || "Sarah Jenkins"} and your post-acute nursing team.
        </p>
      </div>

      {/* Send Message Form */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--slate-800)' }}>
          Send a Message or Question to Your Doctor
        </h3>
        <form onSubmit={handleSendMessage}>
          <div className="form-group">
            <input 
              type="text" 
              className="form-input" 
              placeholder="Subject (e.g., question about medication timing, wound swelling, etc.)..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="form-group">
            <textarea 
              className="form-textarea" 
              rows="3" 
              placeholder="Type your message to the medical team..."
              value={newMsgContent}
              onChange={(e) => setNewMsgContent(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '0.55rem 1.25rem', gap: '0.4rem' }}
              disabled={sending}
            >
              <Send size={15} />
              <span>{sending ? 'Sending...' : 'Send Message'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Message Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>
          Communication History ({messages.length})
        </h3>

        {loading ? (
          <p style={{ color: 'var(--slate-500)' }}>Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-500)' }}>
            No messages exchanged yet.
          </div>
        ) : (
          messages.map(msg => {
            const isDoctor = msg.senderRole === 'doctor' || msg.senderRole === 'system';
            return (
              <div 
                key={msg.id} 
                className="glass-panel" 
                style={{
                  padding: '1.25rem',
                  borderLeft: isDoctor ? '4px solid #0284c7' : '4px solid #10b981',
                  background: isDoctor ? '#ffffff' : '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: isDoctor ? '#0369a1' : '#047857' }}>
                      {msg.senderName} ({msg.senderRole === 'doctor' ? 'Healthcare Provider' : msg.senderRole === 'system' ? 'Automated Dispatch' : 'Patient'})
                    </strong>
                    {getCategoryBadge(msg.category)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                    {new Date(msg.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--slate-800)', marginBottom: '0.35rem' }}>
                  {msg.subject}
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--slate-700)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {msg.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
