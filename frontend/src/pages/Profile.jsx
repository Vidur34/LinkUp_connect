import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useToast } from '../components/Toast';

const SKILLS = ['AI', 'ML', 'Web Dev', 'React', 'Node.js', 'Python', 'Java', 'C++', 'IoT',
    'Cybersecurity', 'UI/UX', 'Figma', 'Marketing', 'Data Science', 'TensorFlow', 'VLSI', 'Robotics'];
const INTERESTS = ['Coding', 'Gaming', 'Music', 'Dance', 'Photography', 'Art', 'Robotics',
    'Research', 'Business', 'Cricket', 'Chess', 'Books', 'Travel', 'CTF'];

function Badge({ icon, label, color }) {
    return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium glass-card"
            style={{ borderColor: color, color }}>
            {icon} {label}
        </div>
    );
}

function IcebreakerModal({ targetUserId, onClose, onSend }) {
    const [icebreakers, setIcebreakers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        api.post('/ai/generate-icebreakers', { targetUserId })
            .then(res => setIcebreakers(res.data.data))
            .finally(() => setLoading(false));
    }, [targetUserId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="glass-card w-full max-w-md p-6 border border-white/10" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold gradient-text mb-4">✨ AI Icebreakers</h3>
                {loading ? (
                    <div className="flex flex-col items-center py-6">
                        <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin mb-4" />
                        <p className="text-muted text-sm">Generating personalized openers...</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {icebreakers.length > 0 ? icebreakers.map((ib, i) => (
                            <button key={i} onClick={() => onSend(ib)} className="text-left p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm text-white">
                                "{ib}"
                            </button>
                        )) : (
                            <p className="text-muted text-sm">Could not generate icebreakers. Just say Hi!</p>
                        )}
                    </div>
                )}
                <div className="mt-6 flex flex-col gap-2">
                    <button onClick={() => onSend("Hi there! I'd love to connect with you on LinkUp.")} className="btn-secondary w-full py-2 text-sm">
                        Just send a standard request
                    </button>
                    <button onClick={onClose} className="text-muted text-sm py-2 hover:text-white transition">Cancel</button>
                </div>
            </div>
        </div>
    );
}

export default function Profile() {
    const { id } = useParams();
    const { user: currentUser, updateUser } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const profileId = id || currentUser.id;
    const isOwnProfile = profileId === currentUser.id;

    const [profile, setProfile] = useState(null);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [showQR, setShowQR] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('none');
    const [aiIdeasLoading, setAiIdeasLoading] = useState(false);
    const [projectIdeas, setProjectIdeas] = useState([]);
    
    // New states
    const [saving, setSaving] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [showIcebreaker, setShowIcebreaker] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            const [pRes, cRes] = await Promise.all([
                api.get(`/users/${profileId}`),
                api.get(`/users/${profileId}/connections`),
            ]);
            setProfile(pRes.data.data);
            setConnections(cRes.data.data);
            setConnectionStatus(pRes.data.data.connectionStatus || 'none');
            setLoading(false);
        };
        fetchProfile();
    }, [profileId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put(`/users/${currentUser.id}`, editForm);
            updateUser(res.data.data);
            setProfile(res.data.data);
            setEditing(false);
            addToast('Profile updated!', 'success');
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed to update', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleConnectClick = () => {
        setShowIcebreaker(true);
    };

    const handleSendConnection = async (message) => {
        try {
            await api.post(`/users/connect/${profile.id}`);
            await api.post(`/chat/messages/${profile.id}`, { content: message });
            setConnectionStatus('connected');
            setShowIcebreaker(false);
            addToast('Connection request & message sent! 🤝', 'success');
        } catch (err) {
            setShowIcebreaker(false);
            if (err.response?.status === 409) {
                setConnectionStatus('connected');
                addToast('Connection request already sent!', 'info');
            } else {
                addToast(err.response?.data?.message || 'Failed to connect', 'error');
            }
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('resume', file);
        setAiLoading(true);
        try {
            const { data } = await api.post('/ai/parse-resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const aiData = data.data;
            setEditForm(prev => ({
                ...prev,
                bio: aiData.bio || prev.bio,
                skills: Array.from(new Set([...prev.skills, ...(aiData.skills || [])])),
                interests: Array.from(new Set([...prev.interests, ...(aiData.interests || [])]))
            }));
            addToast('Profile auto-filled from Resume! ✨', 'success');
        } catch (err) {
            addToast('Failed to parse resume', 'error');
        } finally {
            setAiLoading(false);
        }
    };

    const generateIdeas = async () => {
        setAiIdeasLoading(true);
        try {
            const { data } = await api.post('/ai/project-ideas', {
                skills: profile.skills,
                interests: profile.interests
            });
            setProjectIdeas(data.data || []);
            addToast('Project ideas generated! 💡', 'success');
        } catch (err) {
            addToast('Failed to generate ideas', 'error');
        } finally {
            setAiIdeasLoading(false);
        }
    };

    const startEdit = () => {
        setEditForm({
            name: profile.name,
            bio: profile.bio || '',
            department: profile.department,
            year: profile.year,
            skills: [...profile.skills],
            interests: [...profile.interests],
        });
        setEditing(true);
    };

    const toggleEditTag = (arr, val, field) => {
        const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
        setEditForm(f => ({ ...f, [field]: next }));
    };

    const getBadges = () => {
        const badges = [];
        if (connections.length >= 5) badges.push({ icon: '🔗', label: 'Connector', color: '#8b5cf6' });
        if ((profile?._count?.teamMemberships || 0) >= 1) badges.push({ icon: '👥', label: 'Team Player', color: '#22d3ee' });
        if ((profile?._count?.eventJoins || 0) >= 3) badges.push({ icon: '🎪', label: 'Event Hopper', color: '#ec4899' });
        if ((profile?.networkingScore || 0) >= 80) badges.push({ icon: '🔥', label: 'Networker', color: '#f59e0b' });
        return badges;
    };

    const qrData = profile ? JSON.stringify({
        id: profile.id, name: profile.name,
        skills: profile.skills?.slice(0, 3),
        interests: profile.interests?.slice(0, 3),
    }) : '';

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="glass-card p-8">
                    <div className="flex gap-6 mb-8">
                        <div className="skeleton w-24 h-24 rounded-2xl" />
                        <div className="flex-1">
                            <div className="skeleton h-7 w-40 mb-3" />
                            <div className="skeleton h-4 w-24 mb-2" />
                            <div className="skeleton h-4 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return <div className="text-center py-20 text-muted">User not found</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
            {/* Profile Card */}
            <div className="glass-card p-8 mb-6">
                {/* Cover gradient */}
                <div className="h-24 rounded-xl mb-6 -mx-4 -mt-4"
                    style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(34,211,238,0.3))' }} />

                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black -mt-16 flex-shrink-0 border-4 border-bg-primary"
                        style={{ background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)' }}>
                        {profile.name[0]}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        {editing ? (
                            <input className="input-dark text-xl font-bold mb-2" value={editForm.name}
                                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                        ) : (
                            <h1 className="text-2xl font-black text-primary">{profile.name}</h1>
                        )}
                        <p className="text-muted text-sm">{profile.department} · Year {profile.year}</p>
                        {editing ? (
                            <textarea className="input-dark mt-2 text-sm" rows="2" placeholder="Bio..."
                                value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} />
                        ) : profile.bio && (
                            <p className="text-sm text-muted mt-2">{profile.bio}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                        {isOwnProfile && (
                            <>
                                <button onClick={() => setShowQR(!showQR)} className="btn-secondary px-4 py-2 text-sm">
                                    📱 QR
                                </button>
                                {editing ? (
                                    <>
                                        <button onClick={() => setEditing(false)} className="btn-secondary px-4 py-2 text-sm">Cancel</button>
                                        <label className={`btn-secondary cursor-pointer px-4 py-2 text-sm flex items-center gap-2 ${aiLoading ? 'opacity-50' : ''}`}>
                                            {aiLoading ? 'Parsing...' : '📄 PDF Autofill'}
                                            <input type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} disabled={aiLoading} />
                                        </label>
                                        <button onClick={handleSave} disabled={saving || aiLoading} className="btn-primary px-4 py-2 text-sm">
                                            {saving ? '...' : 'Save'}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={startEdit} className="btn-primary px-4 py-2 text-sm">✏️ Edit</button>
                                )}
                            </>
                        )}
                        {!isOwnProfile && (
                            <>
                                <button
                                    onClick={handleConnectClick}
                                    disabled={connectionStatus !== 'none'}
                                    className={`px-4 py-2 text-sm rounded-xl font-bold transition-all ${
                                        connectionStatus === 'none' 
                                            ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-white hover:scale-105 shadow-lg shadow-emerald-500/20' 
                                            : 'bg-white/10 text-muted cursor-not-allowed'
                                    }`}
                                >
                                    {['connected', 'accepted', 'pending'].includes(connectionStatus) ? '✓ Connected' : '🤝 Connect'}
                                </button>
                                <button onClick={() => navigate(`/chat/${profile.id}`)} className="btn-primary px-4 py-2 text-sm">
                                    💬 Message
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* QR Code */}
                {showQR && (
                    <div className="mt-6 p-6 rounded-xl flex flex-col items-center bg-white text-center">
                        <QRCodeSVG value={qrData} size={180} />
                        <p className="text-gray-600 text-sm mt-3 font-medium">Scan to connect with {profile.name}</p>
                    </div>
                )}

                {/* Score */}
                <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted">Networking Score</span>
                        <span className="text-2xl font-black gradient-text">{profile.networkingScore} pts</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                            width: `${Math.min(profile.networkingScore, 100)}%`,
                            background: 'linear-gradient(90deg,#8b5cf6,#22d3ee)',
                        }} />
                    </div>
                    <p className="text-xs text-muted mt-2">Connections ×10 + Events ×15 + Teams ×20</p>
                </div>
            </div>

            {/* Badges */}
            {getBadges().length > 0 && (
                <div className="glass-card p-6 mb-6">
                    <h3 className="font-bold text-primary mb-4">🏅 Badges</h3>
                    <div className="flex flex-wrap gap-3">
                        {getBadges().map(b => <Badge key={b.label} {...b} />)}
                    </div>
                </div>
            )}

            {/* Skills & Interests */}
            <div className="glass-card p-6 mb-6">
                <h3 className="font-bold text-primary mb-4">🛠️ Skills</h3>
                {editing ? (
                    <div className="flex flex-wrap gap-2">
                        {SKILLS.map(s => (
                            <button key={s} onClick={() => toggleEditTag(editForm.skills, s, 'skills')}
                                className={`skill-tag cursor-pointer ${editForm.skills?.includes(s) ? 'border-purple-400 bg-purple-500/25' : ''}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {profile.skills?.map(s => <span key={s} className="skill-tag">{s}</span>)}
                    </div>
                )}

                <h3 className="font-bold text-primary mb-4 mt-6">💖 Interests</h3>
                {editing ? (
                    <div className="flex flex-wrap gap-2">
                        {INTERESTS.map(i => (
                            <button key={i} onClick={() => toggleEditTag(editForm.interests, i, 'interests')}
                                className={`interest-tag cursor-pointer ${editForm.interests?.includes(i) ? 'border-cyan-400 bg-cyan-500/20' : ''}`}>
                                {i}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {profile.interests?.map(i => <span key={i} className="interest-tag">{i}</span>)}
                    </div>
                )}
                
                {/* AI Project Ideas */}
                {!editing && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-primary">💡 Suggested Projects</h3>
                            <button 
                                onClick={generateIdeas} 
                                disabled={aiIdeasLoading}
                                className="btn-secondary px-3 py-1.5 text-xs flex items-center gap-2"
                            >
                                {aiIdeasLoading ? '...' : '✨ Generate with AI'}
                            </button>
                        </div>
                        
                        {projectIdeas.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {projectIdeas.map((proj, idx) => (
                                    <div key={idx} className="p-4 rounded-xl relative overflow-hidden group" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.2)' }}>
                                        <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400" />
                                        <h4 className="font-bold text-sm text-cyan-400 mb-1">{proj.title}</h4>
                                        <p className="text-xs text-muted mb-2 leading-relaxed">{proj.description}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {(proj.techStack || []).map(t => (
                                                <span key={t} className="text-[10px] px-2 py-0.5 rounded border border-white/10 text-gray-400">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {projectIdeas.length === 0 && !aiIdeasLoading && (
                            <p className="text-xs text-muted text-center py-4">Click generate to see what {profile.name.split(' ')[0]} could build!</p>
                        )}
                    </div>
                )}
            </div>

            {/* Connections */}
            {connections.length > 0 && (
                <div className="glass-card p-6">
                    <h3 className="font-bold text-primary mb-4">🤝 Connections ({connections.length})</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {connections.slice(0, 12).map(c => (
                            <div key={c.id} onClick={() => navigate(`/profile/${c.id}`)}
                                className="flex flex-col items-center gap-2 cursor-pointer group">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform"
                                    style={{ background: 'linear-gradient(135deg,#ec4899,#8b5cf6)' }}>
                                    {c.name[0]}
                                </div>
                                <p className="text-xs text-muted text-center truncate w-full">{c.name.split(' ')[0]}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {showIcebreaker && (
                <IcebreakerModal 
                    targetUserId={profile.id} 
                    onClose={() => setShowIcebreaker(false)} 
                    onSend={handleSendConnection} 
                />
            )}
        </div>
    );
}
