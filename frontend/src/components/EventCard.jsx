import { useState } from 'react';
import api from '../api/axios';
import { useToast } from './Toast';

const categoryColors = {
    Technical: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
    Cultural: { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
    Business: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    Gaming: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
    Creative: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
};

const categoryIcons = { Technical: '💻', Cultural: '🎭', Business: '💼', Gaming: '🎮', Creative: '🎨' };

function Countdown({ targetDate }) {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return <span className="text-xs text-green-400">🔴 Live Now</span>;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return <span className="text-xs text-muted">⏰ {days}d {hours}h left</span>;
    return <span className="text-xs text-yellow-400">⚡ {hours}h left</span>;
}

export default function EventCard({ event, isJoined, onToggle, onReviewClick }) {
    const [joined, setJoined] = useState(isJoined);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const colors = categoryColors[event.category] || categoryColors.Technical;

    const handleToggle = async (e) => {
        e.stopPropagation();
        setLoading(true);
        try {
            if (joined) {
                await api.delete(`/events/${event.id}/leave`);
                setJoined(false);
                addToast('Left event', 'info');
            } else {
                await api.post(`/events/${event.id}/join`);
                setJoined(true);
                addToast(`Joined ${event.name}! +15 pts`, 'success');
            }
            onToggle?.();
        } catch (err) {
            addToast(err.response?.data?.message || 'Action failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const attendeePics = event.joins?.slice(0, 4) || [];
    const extra = (event._count?.joins || event.joins?.length || 0) - 4;

    return (
        <div className={`glass-card glass-card-hover p-5 ${joined ? 'border-green-500/30' : ''}`}
            style={joined ? { borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.03)' } : {}}>
            {/* Category + Countdown */}
            <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                    {categoryIcons[event.category]} {event.category}
                </span>
                <Countdown targetDate={event.startTime} />
            </div>

            {/* Title */}
            <h3 className="font-bold text-primary text-base mb-1">{event.name}</h3>

            {/* Venue & Time */}
            <div className="flex items-center gap-3 text-xs text-muted mb-3">
                <span>📍 {event.venue}</span>
                <span>📅 {new Date(event.startTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
            </div>

            {/* Description */}
            <p className="text-xs text-muted mb-4 line-clamp-2">{event.description}</p>

            {/* Attendees + Join */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {attendeePics.map((j, i) => (
                            <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-bg-primary"
                                style={{ background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)' }}>
                                {j.user?.name?.[0] || '?'}
                            </div>
                        ))}
                    </div>
                    {extra > 0 && <span className="text-xs text-muted">+{extra}</span>}
                    <span className="text-xs text-muted">{event._count?.joins || 0} joined</span>
                </div>
                <button onClick={handleToggle} disabled={loading}
                    className={joined ? 'btn-secondary text-xs px-3 py-1.5 border-red-500/30 text-red-400' : 'btn-primary text-xs px-3 py-1.5'}>
                    {loading ? '...' : joined ? '← Leave' : '+ Join'}
                </button>
            </div>

            {/* Capacity bar and Reviews Action */}
            <div className="mt-3 flex items-center justify-between gap-4">
                {event.maxCapacity ? (
                    <div className="flex-1">
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all"
                                style={{
                                    width: `${Math.min(((event._count?.joins || 0) / event.maxCapacity) * 100, 100)}%`,
                                    background: 'linear-gradient(90deg,#8b5cf6,#22d3ee)',
                                }} />
                        </div>
                        <p className="text-xs text-muted mt-1">{event._count?.joins || 0} / {event.maxCapacity} capacity</p>
                    </div>
                ) : <div className="flex-1" />}
                
                <button 
                    onClick={() => onReviewClick?.(event)}
                    className="btn-secondary text-xs px-3 py-1.5 whitespace-nowrap"
                >
                    ⭐ Reviews
                </button>
            </div>
        </div>
    );
}
