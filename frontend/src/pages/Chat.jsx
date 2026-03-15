import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';

function TypingIndicator() {
    return (
        <div className="flex items-center gap-2 px-4 py-2">
            <div className="flex items-center gap-1 px-3 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
            </div>
        </div>
    );
}

export default function Chat() {
    const { userId } = useParams();
    const { user } = useAuth();
    const { socket, isOnline } = useSocket();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeUser, setActiveUser] = useState(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [typingIndicator, setTypingIndicator] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Fetch conversations
    useEffect(() => {
        api.get('/chat/conversations').then(res => setConversations(res.data.data));
    }, []);

    // Open conversation from URL param
    useEffect(() => {
        if (userId) {
            api.get(`/users/${userId}`).then(res => openConversation(res.data.data));
        }
    }, [userId]);

    const openConversation = async (u) => {
        setActiveUser(u);
        navigate(`/chat/${u.id}`, { replace: true });
        const res = await api.get(`/chat/messages/${u.id}`);
        setMessages(res.data.data);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        const onMessage = ({ message }) => {
            if (
                (message.senderId === activeUser?.id && message.receiverId === user.id) ||
                (message.senderId === user.id && message.receiverId === activeUser?.id)
            ) {
                setMessages(prev => {
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
            }
        };

        const onTyping = ({ userId: uid }) => {
            if (uid === activeUser?.id) {
                setTypingIndicator(true);
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setTypingIndicator(false), 2000);
            }
        };

        socket.on('new_message', onMessage);
        socket.on('typing_indicator', onTyping);
        socket.on('stop_typing', () => setTypingIndicator(false));

        return () => {
            socket.off('new_message', onMessage);
            socket.off('typing_indicator', onTyping);
            socket.off('stop_typing');
        };
    }, [socket, activeUser, user.id]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (socket && activeUser) {
            socket.emit('typing', { receiverId: activeUser.id });
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || !activeUser) return;
        const content = input.trim();
        setInput('');
        socket?.emit('stop_typing', { receiverId: activeUser.id });

        try {
            const res = await api.post(`/chat/messages/${activeUser.id}`, { content });
            // Message will come back via socket, but add locally if not using socket
            const msg = res.data.data;
            setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg]);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        } catch (err) {
            console.error(err);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 page-enter">
            <div className="glass-card overflow-hidden flex" style={{ height: 'calc(100vh - 160px)' }}>
                {/* Sidebar */}
                <div className="w-72 flex-shrink-0 border-r border-white/10 flex flex-col" style={{ display: conversations.length || !userId ? 'flex' : 'none' }}>
                    <div className="p-4 border-b border-white/10">
                        <h2 className="font-bold text-primary text-lg">💬 Messages</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-4xl mb-3">💬</p>
                                <p className="text-muted text-sm">No conversations yet</p>
                                <p className="text-xs text-muted mt-2">Connect with people and start chatting!</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <div key={conv.user.id}
                                    onClick={() => openConversation(conv.user)}
                                    className={`flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-white/5 ${activeUser?.id === conv.user.id ? 'bg-white/8' : ''
                                        }`}>
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                            style={{ background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)' }}>
                                            {conv.user.name[0]}
                                        </div>
                                        {isOnline(conv.user.id) && (
                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-bg-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-primary truncate">{conv.user.name}</p>
                                            {conv.unreadCount > 0 && (
                                                <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white flex-shrink-0"
                                                    style={{ background: '#8b5cf6' }}>
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted truncate mt-0.5">{conv.lastMessage}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat area */}
                <div className="flex-1 flex flex-col">
                    {!activeUser ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-6xl mb-4">💬</p>
                                <h3 className="text-xl font-bold text-primary mb-2">Select a conversation</h3>
                                <p className="text-muted">Choose from your conversations or connect with someone new</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat header */}
                            <div className="p-4 border-b border-white/10 flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                                        style={{ background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)' }}>
                                        {activeUser.name[0]}
                                    </div>
                                    {isOnline(activeUser.id) && (
                                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-bg-primary" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-primary">{activeUser.name}</p>
                                    <p className="text-xs text-muted">{isOnline(activeUser.id) ? '🟢 Online' : '⚪ Offline'} · {activeUser.department}</p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.map(msg => {
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${isMe
                                                    ? 'rounded-tr-sm text-white'
                                                    : 'rounded-tl-sm text-primary'
                                                }`}
                                                style={isMe
                                                    ? { background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)' }
                                                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                                <p className="text-sm">{msg.content}</p>
                                                <p className={`text-xs mt-1.5 ${isMe ? 'text-purple-200' : 'text-muted'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && <span className="ml-1">{msg.read ? ' ✓✓' : ' ✓'}</span>}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {typingIndicator && <TypingIndicator />}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-white/10 flex gap-3">
                                <input
                                    className="input-dark flex-1"
                                    placeholder="Type a message..."
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                />
                                <button onClick={sendMessage} disabled={!input.trim()}
                                    className="btn-primary px-5 py-3 disabled:opacity-50">
                                    ➤
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
