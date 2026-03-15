import { useState } from 'react';
import api from '../api/axios';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';

export default function TeamCard({ team, onRefresh }) {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState('');

    const isMember = team.members?.some(m => m.userId === user?.id);
    const isCreator = team.creatorId === user?.id;
    const isFull = team.members?.length >= team.maxSize;

    const handleJoin = async () => {
        if (!selectedRole && team.rolesNeeded?.length > 0) {
            addToast('Please select a role', 'warning');
            return;
        }
        setLoading(true);
        try {
            await api.post(`/teams/${team.id}/join`, { role: selectedRole || 'Member' });
            addToast(`Joined "${team.name}"! +20 pts`, 'success');
            setShowJoinModal(false);
            onRefresh?.();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to join', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLeave = async () => {
        setLoading(true);
        try {
            await api.delete(`/teams/${team.id}/leave`);
            addToast('Left team', 'info');
            onRefresh?.();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to leave', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="glass-card glass-card-hover p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-bold text-primary">{team.name}</h3>
                        <p className="text-xs text-muted mt-0.5">
                            by {team.creator?.name} · {team.members?.length || 0}/{team.maxSize} members
                        </p>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)' }}>
                        {team.members?.length >= team.maxSize ? '🔴 Full' : '🟢 Open'}
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted mb-4 line-clamp-2">{team.description}</p>

                {/* Roles needed */}
                {team.rolesNeeded?.length > 0 && (
                    <div className="mb-4">
                        <p className="text-xs text-muted mb-2">Roles needed:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {team.rolesNeeded.map(role => (
                                <span key={role} className="skill-tag">{role}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Members */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                        {team.members?.slice(0, 5).map((m, i) => (
                            <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 border-bg-primary"
                                style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
                                {m.user?.name?.[0] || '?'}
                            </div>
                        ))}
                    </div>
                    {team.members?.length === 0 && <span className="text-xs text-muted">No members yet</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {isCreator ? (
                        <span className="btn-secondary text-xs px-3 py-1.5 cursor-default">👑 Your Team</span>
                    ) : isMember ? (
                        <button onClick={handleLeave} disabled={loading}
                            className="btn-secondary text-xs px-3 py-1.5 border-red-500/30 text-red-400">
                            {loading ? '...' : '← Leave'}
                        </button>
                    ) : (
                        <button
                            onClick={() => team.rolesNeeded?.length > 0 ? setShowJoinModal(true) : handleJoin()}
                            disabled={loading || isFull}
                            className="btn-primary text-xs px-3 py-1.5">
                            {isFull ? '🔴 Full' : loading ? '...' : '+ Join Team'}
                        </button>
                    )}
                </div>
            </div>

            {/* Join modal */}
            {showJoinModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
                    <div className="glass-card p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Join {team.name}</h3>
                        <p className="text-muted text-sm mb-4">Select the role you'll take in this team:</p>
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            {team.rolesNeeded.map(role => (
                                <button key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={`p-3 rounded-xl text-sm font-medium transition-all border ${selectedRole === role
                                            ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                                            : 'border-white/10 bg-white/5 text-muted hover:border-purple-400/50'
                                        }`}>
                                    {role}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowJoinModal(false)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={handleJoin} disabled={loading || !selectedRole} className="btn-primary flex-1">
                                {loading ? 'Joining...' : 'Join Team'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
