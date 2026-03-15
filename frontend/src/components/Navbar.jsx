import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { unreadCount, clearUnread, notifications } = useSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const [showNotifs, setShowNotifs] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    if (!user) return null;

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/', label: 'Dashboard' },
        { path: '/discover', label: 'Discover' },
        { path: '/events', label: 'Events' },
        { path: '/teams', label: 'Teams' },
        { path: '/marketplace', label: 'Marketplace' },
        { path: '/grow', label: 'Grow Hub' },
    ];

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 hidden md:flex items-center justify-between px-6 py-3"
            style={{
                background: 'rgba(8,8,24,0.9)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 active-scale shrink-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg border border-white/10"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)' }}>
                    L
                </div>
                <span className="text-lg font-bold gradient-text">LinkUp</span>
            </Link>

            {/* Nav Links */}
            <nav className="flex items-center gap-1">
                {navLinks.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${location.pathname === link.path
                                ? 'text-purple-400 bg-purple-500/10'
                                : 'text-muted hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {link.label}
                    </Link>
                ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Chat */}
                <Link to="/chat" className="p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all">
                    💬
                </Link>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => { setShowNotifs(!showNotifs); clearUnread(); }}
                        className="p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all relative"
                    >
                        🔔
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white"
                                style={{ background: '#ec4899' }}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    {showNotifs && (
                        <div className="absolute right-0 top-12 w-80 glass-card p-2 max-h-80 overflow-y-auto">
                            <p className="text-xs font-semibold text-muted px-2 py-1 mb-1">Notifications</p>
                            {notifications.length === 0 ? (
                                <p className="text-muted text-sm text-center py-4">No notifications</p>
                            ) : (
                                notifications.slice(0, 10).map((n, i) => (
                                    <div key={i} className="p-3 rounded-lg hover:bg-white/5 transition-all cursor-pointer">
                                        <p className="text-sm text-primary">{n.message}</p>
                                        <p className="text-xs text-muted mt-1">{n.type}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                    >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)' }}>
                            {user.name[0]}
                        </div>
                        <span className="text-sm font-medium text-primary hidden lg:block">{user.name.split(' ')[0]}</span>
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-12 w-48 glass-card p-2">
                            <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm"
                                onClick={() => setShowMenu(false)}>
                                👤 Profile
                            </Link>
                            <Link to="/leaderboard" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm"
                                onClick={() => setShowMenu(false)}>
                                🏆 Leaderboard
                            </Link>
                            <hr className="border-white/10 my-2" />
                            <button onClick={handleLogout}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all text-sm">
                                🚪 Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
