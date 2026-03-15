import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import api from '../api/axios';

export default function MentorCard({ mentor, onEndorse }) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [endorsing, setEndorsing] = useState(null);

    const handleEndorse = async (skill) => {
        if (!user) return;
        setEndorsing(skill);
        try {
            const { data } = await api.post(`/grow/mentors/endorse/${mentor.id}/${encodeURIComponent(skill)}`);
            showToast(data.data.endorsed ? `Endorsed ${skill}!` : `Removed endorsement for ${skill}`, 'success');
            onEndorse?.();
        } catch (err) {
            showToast(err.response?.data?.message || 'Error', 'error');
        } finally {
            setEndorsing(null);
        }
    };

    return (
        <div className="glass-card glass-card-hover" style={{ padding: 20 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0 }}>
                    {mentor.avatar
                        ? <img src={mentor.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                        : mentor.name?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{mentor.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Year {mentor.year} • {mentor.department}</div>
                    <div style={{ fontSize: '0.72rem', color: '#22d3ee', marginTop: 2 }}>{mentor.email}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b' }}>{mentor.totalEndorsements}</div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>endorsements</div>
                </div>
            </div>

            {mentor.mentorBio && (
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>{mentor.mentorBio}</p>
            )}

            {/* Skills with endorsement counts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                {(mentor.skillEndorsements || []).map(({ skill, count }) => (
                    <button
                        key={skill}
                        onClick={() => handleEndorse(skill)}
                        disabled={endorsing === skill || !user || user.id === mentor.id}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
                            borderRadius: 20, fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
                            background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
                            border: '1px solid rgba(139,92,246,0.3)', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.3)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; }}
                    >
                        {skill}
                        {count > 0 && <span style={{ background: '#8b5cf6', color: '#fff', borderRadius: 10, padding: '0 5px', fontSize: '0.65rem', fontWeight: 700 }}>+{count}</span>}
                    </button>
                ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}
                    onClick={() => window.location.href = `mailto:${mentor.email}`}>
                    ✉️ Email
                </button>
                <button className="btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}>
                    💬 Message
                </button>
            </div>
        </div>
    );
}
