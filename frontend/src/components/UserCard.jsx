import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchBadge from './MatchBadge';
import api from '../api/axios';
import { useToast } from './Toast';

export default function UserCard({ user, matchScore, matchReasons = [], sharedSkills = [], onConnect }) {
    const [status, setStatus] = useState(user.connectionStatus || 'none');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();
    const navigate = useNavigate();

    const handleConnect = async (e) => {
        e.stopPropagation();
        if (status !== 'none') return;
        setLoading(true);
        try {
            await api.post(`/users/connect/${user.id}`);
            setStatus('accepted');
            addToast(`Connection request sent to ${user.name}!`, 'success');
            onConnect?.();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to send request', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getConnectButton = () => {
        if (status === 'accepted' || status === 'pending' || status === 'connected') return (
            <span className="px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20">
                ✓ Connected
            </span>
        );
        return (
            <button
                onClick={handleConnect}
                disabled={loading}
                className="btn-primary text-xs px-3 py-1.5"
            >
                {loading ? '...' : '+ Connect'}
            </button>
        );
    };

    const departmentColors = {
        CSE: 'text-purple-400 bg-purple-500/10',
        ECE: 'text-cyan-400 bg-cyan-500/10',
        Design: 'text-pink-400 bg-pink-500/10',
        MBA: 'text-yellow-400 bg-yellow-500/10',
        Mechanical: 'text-orange-400 bg-orange-500/10',
    };
    const deptClass = departmentColors[user.department] || 'text-gray-400 bg-gray-500/10';

    return (
        <div
            className="glass-card glass-card-hover p-5 cursor-pointer"
            onClick={() => navigate(`/profile/${user.id}`)}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)' }}>
                        {user.name[0]}
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary text-sm">{user.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${deptClass}`}>
                                {user.department}
                            </span>
                            <span className="text-xs text-muted">Y{user.year}</span>
                        </div>
                    </div>
                </div>
                {matchScore !== undefined && <MatchBadge score={matchScore} />}
            </div>

            {/* Skills */}
            {user.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                    {user.skills.slice(0, 4).map(skill => (
                        <span key={skill} className={`skill-tag ${sharedSkills.includes(skill) ? 'border-purple-400/50 bg-purple-500/20' : ''}`}>
                            {skill}
                        </span>
                    ))}
                    {user.skills.length > 4 && <span className="skill-tag">+{user.skills.length - 4}</span>}
                </div>
            )}

            {/* Match reasons */}
            {matchReasons?.length > 0 && (
                <p className="text-xs text-muted mb-3 italic">💡 {matchReasons[0]}</p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-xs text-muted">🏆 {user.networkingScore} pts</span>
                {getConnectButton()}
            </div>
        </div>
    );
}
