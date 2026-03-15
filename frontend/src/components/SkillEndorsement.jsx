import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';

export default function SkillEndorsement({ mentorId, skillName, initialEndorsements = 0, endorsedByMe = false }) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [endorsements, setEndorsements] = useState(initialEndorsements);
    const [hasEndorsed, setHasEndorsed] = useState(endorsedByMe);
    const [loading, setLoading] = useState(false);

    const isOwnProfile = user?.id === mentorId;

    const handleEndorse = async () => {
        if (isOwnProfile) return;
        if (!user) return showToast('Please login to endorse skills', 'error');
        
        setLoading(true);
        try {
            await api.post(`/grow/mentors/endorse/${mentorId}/${encodeURIComponent(skillName)}`);
            setHasEndorsed(true);
            setEndorsements(prev => prev + 1);
            showToast(`Endorsed ${skillName}!`, 'success');
        } catch (err) {
            // If already endorsed or other error
            showToast(err.response?.data?.message || 'Error endorsing skill', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            background: hasEndorsed ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${hasEndorsed ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 20,
            padding: '4px 12px',
            fontSize: '0.85rem',
            gap: 8,
            transition: 'all 0.2s',
            cursor: (!isOwnProfile && !hasEndorsed) ? 'pointer' : 'default'
        }}
        onClick={(!isOwnProfile && !hasEndorsed && !loading) ? handleEndorse : undefined}
        onMouseEnter={e => {
            if (!isOwnProfile && !hasEndorsed) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }
        }}
        onMouseLeave={e => {
            if (!isOwnProfile && !hasEndorsed) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }
        }}
        >
            <span style={{ 
                color: hasEndorsed ? '#10b981' : '#e2e8f0', 
                fontWeight: 500 
            }}>
                {skillName}
            </span>
            
            {endorsements > 0 && (
                <div style={{ 
                    background: hasEndorsed ? '#10b981' : 'rgba(255,255,255,0.15)',
                    color: hasEndorsed ? '#fff' : '#94a3b8',
                    padding: '2px 6px',
                    borderRadius: 12,
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {endorsements}
                </div>
            )}

            {!isOwnProfile && !hasEndorsed && (
                <span style={{ 
                    color: '#94a3b8', 
                    fontSize: '0.8rem',
                    marginLeft: 2,
                    opacity: 0.7
                }}>
                    +
                </span>
            )}
        </div>
    );
}
