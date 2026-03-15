import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
    const location = useLocation();
    const { user } = useAuth();
    if (!user) return null;

    const isOrg = user.accountType === 'organisation';

    const navItems = isOrg ? [
        { path: '/', icon: '🏠', label: 'Home' },
        { path: '/org/dashboard', icon: '🏛️', label: 'Dashboard' },
        { path: '/events', icon: '🎪', label: 'Events' },
        { path: '/chat', icon: '💬', label: 'Chat' },
    ] : [
        { path: '/', icon: '🏠', label: 'Home' },
        { path: '/discover', icon: '🔍', label: 'Discover' },
        { path: '/marketplace', icon: '🛒', label: 'Shop' },
        { path: '/grow', icon: '🌱', label: 'Grow' },
        { path: '/events', icon: '🎪', label: 'Events' },
    ];

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
            style={{
                background: 'rgba(8,8,24,0.97)',
                backdropFilter: 'blur(20px)',
                borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
        >
            <div className="flex justify-around items-center py-2">
                {navItems.map(item => {
                    const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200"
                            style={active ? {
                                background: 'rgba(139,92,246,0.15)',
                            } : {}}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className={`text-xs font-medium ${active ? 'text-purple-400' : 'text-muted'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
