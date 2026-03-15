import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import TeamCard from '../components/TeamCard';

function TiltCard({ children, className = '', maxTilt = 10 }) {
    const cardRef = useRef(null);
    const [style, setStyle] = useState({});

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate tilt
        const rotateX = ((y - centerY) / centerY) * -maxTilt;
        const rotateY = ((x - centerX) / centerX) * maxTilt;

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
            transition: 'transform 0.1s ease-out',
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
            transition: 'transform 0.5s ease-out',
        });
    };

    return (
        <div
            ref={cardRef}
            className={`transition-all duration-300 ${className}`}
            style={style}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {children}
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <TiltCard maxTilt={15} className="glass-card p-5 flex items-center gap-4 relative overflow-hidden group border border-white/5 hover:border-white/20">
            {/* Background glow orb */}
            <div className="absolute -inset-4 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl rounded-full" style={{ background: color }} />

            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                style={{ background: `linear-gradient(135deg, ${color}, transparent)`, border: `1px solid ${color}` }}>
                {icon}
            </div>
            <div className="relative z-10">
                <p className="text-3xl font-black text-white drop-shadow-md">{value}</p>
                <p className="text-sm text-gray-400 font-medium tracking-wide uppercase mt-1">{label}</p>
            </div>
        </TiltCard>
    );
}

function SkeletonCard() {
    return (
        <div className="glass-card p-5">
            <div className="flex gap-3 mb-4">
                <div className="skeleton w-12 h-12 rounded-xl" />
                <div className="flex-1">
                    <div className="skeleton h-4 w-24 mb-2" />
                    <div className="skeleton h-3 w-16" />
                </div>
            </div>
            <div className="skeleton h-3 w-full mb-2" />
            <div className="skeleton h-3 w-3/4" />
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [stats, setStats] = useState({ connections: 0, events: 0, teams: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [eventRes, teamRes, connRes] = await Promise.all([
                    api.get('/events'),
                    api.get('/teams'),
                    api.get(`/users/${user.id}/connections`),
                ]);
                setEvents(eventRes.data.data.slice(0, 3));
                setTeams(teamRes.data.data.slice(0, 3));
                setStats({
                    connections: connRes.data.data.length,
                    events: eventRes.data.data.filter(e => e.joins?.some(j => j.userId === user.id)).length,
                    teams: teamRes.data.data.filter(t => t.members?.some(m => m.userId === user.id)).length,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user.id]);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? '🌅 Good morning' : hour < 17 ? '☀️ Good afternoon' : '🌙 Good evening';

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 overflow-hidden">
            {/* Professional Hero Section */}
            <TiltCard maxTilt={5} className="mb-10 page-enter relative rounded-3xl p-1 overflow-hidden" style={{ animationDelay: '0ms' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 via-cyan-500/20 to-emerald-500/30 blur-3xl opacity-50" />
                <div className="relative glass-card p-10 md:p-14 rounded-[22px] border border-white/10 flex flex-col items-start overflow-hidden backdrop-blur-xl bg-[#0a0a20]/80 shadow-2xl z-10">
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse" />
                    <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse delay-1000" />

                    <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-cyan-400 uppercase tracking-widest mb-6 inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" /> LinkUp
                    </span>

                    <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-sm">
                        {greeting}, <br /><span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"> {user.name.split(' ')[0]}.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl leading-relaxed mb-8 text-shadow">
                        Welcome to the ultimate college networking platform. Discover groundbreaking hackathon teams, manage your societies, and grow your professional presence.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link to="/discover" className="btn-primary px-8 py-3 rounded-full font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:-translate-y-1 transition-all">
                            Explore Network
                        </Link>
                        <Link to="/events" className="btn-secondary px-8 py-3 rounded-full font-bold transform hover:-translate-y-1 transition-all border border-white/10 hover:border-white/30 hover:bg-white/5">
                            Browse Events
                        </Link>
                    </div>
                </div>
            </TiltCard>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 page-enter" style={{ animationDelay: '100ms' }}>
                <StatCard label="Network Reach" value={stats.connections} icon="🤝" color="rgba(139,92,246,0.6)" />
                <StatCard label="Events Joined" value={stats.events} icon="🎪" color="rgba(34,211,238,0.6)" />
                <StatCard label="Active Teams" value={stats.teams} icon="👥" color="rgba(236,72,153,0.6)" />
                <StatCard label="Impact Score" value={user.networkingScore} icon="🏆" color="rgba(245,158,11,0.6)" />
            </div>

            {/* Active Events */}
            <section className="mb-12 page-enter" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-2xl font-black text-white drop-shadow-md">🚀 Upcoming Top Events</h2>
                    <Link to="/events" className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider flex items-center gap-1 group">
                        View all <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : events.length === 0 ? (
                    <div className="glass-card p-12 text-center rounded-2xl border border-white/5">
                        <p className="text-5xl mb-4 opacity-50">🎪</p>
                        <p className="text-slate-400 text-lg">No upcoming events yet. Check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {events.map(e => (
                            <TiltCard key={e.id} maxTilt={8}>
                                <EventCard event={e} isJoined={e.joins?.some(j => j.userId === user.id)} />
                            </TiltCard>
                        ))}
                    </div>
                )}
            </section>

            {/* Team Posts */}
            <section className="page-enter" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-2xl font-black text-white drop-shadow-md">👥 Latest Teams Recruiting</h2>
                    <Link to="/teams" className="text-sm font-bold text-pink-400 hover:text-pink-300 transition-colors uppercase tracking-wider flex items-center gap-1 group">
                        View all <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : teams.length === 0 ? (
                    <div className="glass-card p-12 text-center rounded-2xl border border-white/5">
                        <p className="text-5xl mb-4 opacity-50">👥</p>
                        <p className="text-slate-400 text-lg">No teams are currently recruiting. Create one!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {teams.map(t => (
                            <TiltCard key={t.id} maxTilt={8}>
                                <TeamCard team={t} />
                            </TiltCard>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
