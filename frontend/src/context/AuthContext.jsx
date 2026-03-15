import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('fc_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [token, setToken] = useState(() => localStorage.getItem('fc_token') || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verify token on mount
        if (token) {
            api.get('/auth/me')
                .then(res => {
                    setUser(res.data.data);
                    localStorage.setItem('fc_user', JSON.stringify(res.data.data));
                })
                .catch(() => logout())
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password, accountType) => {
        const res = await api.post('/auth/login', { email, password, accountType });
        const { user, token } = res.data.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('fc_token', token);
        localStorage.setItem('fc_user', JSON.stringify(user));
        return user;
    };

    const register = async (formData) => {
        const res = await api.post('/auth/register', formData);
        const { user, token } = res.data.data;
        setUser(user);
        setToken(token);
        localStorage.setItem('fc_token', token);
        localStorage.setItem('fc_user', JSON.stringify(user));
        return user;
    };

    const logout = async () => {
        try { await api.post('/auth/logout'); } catch { }
        setUser(null);
        setToken(null);
        localStorage.removeItem('fc_token');
        localStorage.removeItem('fc_user');
    };

    const updateUser = (newUserData) => {
        const updated = { ...user, ...newUserData };
        setUser(updated);
        localStorage.setItem('fc_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
