import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import VerifiedBadge from '../components/VerifiedBadge';
import api from '../api/axios';

export default function OrgProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    const fetchOrg = async () => {
        try {
            const { data } = await api.get(`/orgs/${id}`);
            setOrg(data.data);
            setFollowing(data.data.isFollowing || false);
        } catch { navigate('/discover'); } finally { setLoading(false); }
    };

    useEffect(() => { fetchOrg(); }, [id]);

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            const { data } = await api.post(`/orgs/${id}/follow`);
            setFollowing(data.data.following);
            setOrg(o => ({ ...o, followers: data.data.followers }));
            showToast(data.data.following ? `Following ${org.name}!` : `Unfollowed ${org.name}`, 'success');
        } catch (err) {
            showToast(err.response?.data?.message || 'Error', 'error');
        } finally { setFollowLoading(false); }
    };

    if (loading) return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
            <div className="skeleton" style={{ height: 200, borderRadius: 16, marginBottom: 20 }} />
            <div className="skeleton" style={{ height: 100, borderRadius: 16 }} />
        </div>
    );
    if (!org) return null;

    const isOwnOrg = user?.accountType === 'organisation' && user?.id === org.id;

    return (
        <div className="page-enter" style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
            {/* Cover */}
            <div style={{ position: 'relative', height: 200, borderRadius: 20, overflow: 'hidden', marginBottom: -50, background: org.coverImage ? `url(${org.coverImage}) center/cover` : 'linear-gradient(135deg,#8b5cf6,#22d3ee)' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
            </div>

            {/* Profile card */}
            <div className="glass-card" style={{ padding: '60px 24px 24px', position: 'relative' }}>
                {/* Avatar */}
                <div style={{ position: 'absolute', top: -40, left: 24, width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', border: '3px solid #080818', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                    {org.avatar ? <img src={org.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" /> : org.name?.[0]}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <h1 style={{ fontWeight: 800, fontSize: '1.5rem' }}>{org.name}</h1>
                            {org.isVerified && <VerifiedBadge size={22} />}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 6 }}>
                            <span style={{ padding: '2px 10px', borderRadius: 20, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)', marginRight: 8 }}>{org.category}</span>
                            <span>👥 {org.followers} followers</span>
                        </div>
                        {org.description && <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>{org.description}</p>}
                        <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: '0.82rem', color: '#64748b', flexWrap: 'wrap' }}>
                            {org.instagramHandle && <a href={`https://instagram.com/${org.instagramHandle}`} target="_blank" rel="noreferrer" style={{ color: '#ec4899', textDecoration: 'none' }}>📸 @{org.instagramHandle}</a>}
                            {org.websiteUrl && <a href={org.websiteUrl} target="_blank" rel="noreferrer" style={{ color: '#22d3ee', textDecoration: 'none' }}>🌐 Website</a>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {isOwnOrg ? (
                            <button className="btn-secondary" onClick={() => navigate('/org/dashboard')} style={{ padding: '9px 18px' }}>Edit Profile</button>
                        ) : user?.accountType !== 'organisation' && (
                            <button
                                className={following ? 'btn-secondary' : 'btn-primary'}
                                onClick={handleFollow}
                                disabled={followLoading}
                                style={{ padding: '9px 22px', minWidth: 120 }}
                            >
                                {followLoading ? '...' : following ? '✓ Following' : '+ Follow'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Events */}
            {org.events?.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 14 }}>📅 Events</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {org.events.map(ev => (
                            <div key={ev.id} className="glass-card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{ev.name}</div>
                                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{ev.venue} • {new Date(ev.startTime).toLocaleDateString()}</div>
                                </div>
                                <span style={{ padding: '2px 8px', borderRadius: 12, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: '0.72rem' }}>{ev.category}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
