import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';

export function useNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const { socket } = useSocket();

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            // We don't have a dedicated notifications endpoint, using the socket context ones
            setLoading(false);
        } catch {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handler = (notif) => {
            setNotifications(prev => [notif, ...prev]);
        };
        socket.on('notification', handler);
        return () => socket.off('notification', handler);
    }, [socket]);

    return { notifications, loading, fetchNotifications };
}
