import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
        const d = payload[0].payload;
        return (
            <div className="glass-card p-3 text-sm">
                <p className="font-bold text-primary">{d.name}</p>
                <p className="text-purple-400">Score: {d.score}</p>
                <p className="text-xs text-muted mt-1">{d.department} · Y{d.year}</p>
            </div>
        );
    }
    return null;
};

export default function Leaderboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users/leaderboard').then(res => {
            setLeaders(res.data.data);
        }).finally(() => setLoading(false));
    }, []);

    const chartData = leaders.slice(0, 10).map(u => ({
        name: u.name.split(' ')[0],
        score: u.networkingScore,
        department: u.department,
        year: u.year,
        id: u.id,
    }));

    const myRank = leaders.findIndex(l => l.id === user.id) + 1;

    const getRankBadge = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-black gradient-text mb-2">🏆 Leaderboard</h1>
                <p className="text-muted">Top networkers at the fest</p>
                {myRank > 0 && (
                    <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl"
                        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                        <span className="text-purple-400 font-medium">Your rank:</span>
                        <span className="text-white font-black text-lg">#{myRank}</span>
                        <span className="text-purple-400">with {user.networkingScore} pts</span>
                    </div>
                )}
            </div>

            {/* Bar Chart */}
            {!loading && chartData.length > 0 && (
                <div className="glass-card p-6 mb-8">
                    <h3 className="font-bold text-primary mb-4">Top 10 Scores</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                                {chartData.map((entry, i) => (
                                    <Cell key={i}
                                        fill={entry.id === user.id ? '#22d3ee' : i < 3 ? '#8b5cf6' : 'rgba(139,92,246,0.5)'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Leaderboard list */}
            <div className="space-y-3">
                {loading ? (
                    [...Array(10)].map((_, i) => (
                        <div key={i} className="glass-card p-4 flex items-center gap-4">
                            <div className="skeleton w-10 h-10 rounded-xl" />
                            <div className="skeleton w-12 h-12 rounded-full" />
                            <div className="flex-1">
                                <div className="skeleton h-4 w-32 mb-2" />
                                <div className="skeleton h-3 w-20" />
                            </div>
                            <div className="skeleton w-16 h-6 rounded-full" />
                        </div>
                    ))
                ) : (
                    leaders.map((leader, idx) => {
                        const rank = idx + 1;
                        const isMe = leader.id === user.id;
                        return (
                            <div key={leader.id}
                                onClick={() => navigate(`/profile/${leader.id}`)}
                                className={`glass-card p-4 flex items-center gap-4 cursor-pointer transition-all hover:bg-white/5 ${isMe ? 'border-purple-400/40' : ''
                                    }`}
                                style={isMe ? { borderColor: 'rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.05)' } : {}}>
                                {/* Rank */}
                                <div className="w-10 text-center text-xl font-black">
                                    {getRankBadge(rank)}
                                </div>

                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                                    style={{
                                        background: rank === 1
                                            ? 'linear-gradient(135deg,#f59e0b,#fbbf24)'
                                            : rank === 2
                                                ? 'linear-gradient(135deg,#94a3b8,#cbd5e1)'
                                                : rank === 3
                                                    ? 'linear-gradient(135deg,#92400e,#b45309)'
                                                    : 'linear-gradient(135deg,#8b5cf6,#22d3ee)',
                                    }}>
                                    {leader.name[0]}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-primary flex items-center gap-2">
                                        {leader.name}
                                        {isMe && <span className="text-xs text-purple-400 font-normal">(you)</span>}
                                    </p>
                                    <p className="text-xs text-muted">{leader.department} · Year {leader.year}</p>
                                    <div className="flex gap-2 mt-1">
                                        {leader.skills?.slice(0, 2).map(s => (
                                            <span key={s} className="skill-tag" style={{ fontSize: '10px', padding: '2px 8px' }}>{s}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xl font-black gradient-text">{leader.networkingScore}</p>
                                    <p className="text-xs text-muted">pts</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Score breakdown */}
            <div className="glass-card p-6 mt-8">
                <h3 className="font-bold text-primary mb-4">📊 How Scores Are Calculated</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { action: '🤝 Connect', pts: '+10 pts' },
                        { action: '🎪 Join Event', pts: '+15 pts' },
                        { action: '👥 Join Team', pts: '+20 pts' },
                        { action: '🚀 Post Team', pts: '+25 pts' },
                    ].map(item => (
                        <div key={item.action} className="text-center p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <p className="text-sm text-primary font-medium mb-1">{item.action}</p>
                            <p className="text-lg font-bold gradient-text">{item.pts}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
