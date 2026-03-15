import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const { token, user } = useAuth();
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!token || !user) return;

        const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
        });

        socketRef.current = socket;

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));

        socket.on('user_online', ({ userId }) => {
            setOnlineUsers(prev => new Set([...prev, userId]));
        });
        socket.on('user_offline', ({ userId }) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                next.delete(userId);
                return next;
            });
        });

        socket.on('notification', (notif) => {
            setNotifications(prev => [notif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        socket.on('connection_request', (data) => {
            setNotifications(prev => [{
                type: 'connection_request',
                message: `${data.from.name} sent you a connection request`,
                createdAt: new Date(),
            }, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        socket.on('connection_accepted', (data) => {
            setNotifications(prev => [{
                type: 'connection_accepted',
                message: `${data.by.name} accepted your connection request`,
                createdAt: new Date(),
            }, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            socket.disconnect();
        };
    }, [token, user]);

    const clearUnread = () => setUnreadCount(0);
    const isOnline = (userId) => onlineUsers.has(userId);

    return (
        <SocketContext.Provider value={{
            socket: socketRef.current,
            isConnected,
            onlineUsers,
            notifications,
            unreadCount,
            clearUnread,
            isOnline,
        }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error('useSocket must be used within SocketProvider');
    return ctx;
}
