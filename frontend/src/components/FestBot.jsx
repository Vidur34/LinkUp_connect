import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function FestBot() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Hey! 👋 I\'m LinkUp Bot! Ask me anything about LinkUp – events, teams, networking, and more. 🎉' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = { role: 'user', content: input };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);
        try {
            const history = newMessages.slice(-10).map(m => ({ role: m.role === 'bot' ? 'assistant' : 'user', content: m.content }));
            const { data } = await api.post('/ai/chat', { message: input, history });
            setMessages(prev => [...prev, { role: 'bot', content: data.data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I\'m having trouble connecting right now. 😅 Try again in a moment!' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setIsOpen(o => !o)}
                style={{
                    position: 'fixed', bottom: '90px', right: '20px', zIndex: 1000,
                    width: 54, height: 54, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(139,92,246,0.5)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    fontSize: '1.5rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                title="FestBot AI Assistant"
            >
                {isOpen ? '✕' : '🤖'}
            </button>

            {/* Chat window */}
            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: '160px', right: '20px', zIndex: 1000,
                    width: 340, height: 480,
                    background: 'rgba(15,15,46,0.97)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139,92,246,0.3)',
                    borderRadius: 20,
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease-out',
                }}>
                    {/* Header */}
                    <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg,rgba(139,92,246,0.3),rgba(34,211,238,0.2))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '1.4rem' }}>🤖</span>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>FestBot</div>
                                <div style={{ fontSize: '0.72rem', color: '#22d3ee' }}>AI Assistant • Always online</div>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                <div style={{
                                    maxWidth: '82%', padding: '10px 13px', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    background: m.role === 'user' ? 'linear-gradient(135deg,#8b5cf6,#22d3ee)' : 'rgba(255,255,255,0.06)',
                                    border: m.role === 'bot' ? '1px solid rgba(255,255,255,0.06)' : 'none',
                                    fontSize: '0.85rem', lineHeight: 1.5, color: '#f8fafc',
                                }}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', gap: 6, padding: '10px 14px' }}>
                                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 8 }}>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask FestBot..."
                            className="input-dark"
                            style={{ fontSize: '0.85rem', padding: '9px 12px' }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="btn-primary"
                            style={{ padding: '9px 14px', borderRadius: 10, flexShrink: 0, fontSize: '0.9rem' }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
