import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import VerifiedBadge from '../components/VerifiedBadge';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function OrgDashboard() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [org, setOrg] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState(false);
    const [form, setForm] = useState({});
    const [eventModal, setEventModal] = useState(false);
    const [eventForm, setEventForm] = useState({ name: '', description: '', venue: '', startTime: '', endTime: '', category: 'Technical', maxCapacity: '' });

    useEffect(() => {
        if (!user || user.accountType !== 'organisation') { navigate('/'); return; }
        const fetchData = async () => {
            try {
                const { data } = await api.get(`/orgs/${user.id}`);
                setOrg(data.data);
                setEvents(data.data.events || []);
                setForm({ name: data.data.name, description: data.data.description || '', category: data.data.category, instagramHandle: data.data.instagramHandle || '', websiteUrl: data.data.websiteUrl || '' });
            } catch { navigate('/'); } finally { setLoading(false); }
        };
        fetchData();
    }, [user]);

    const saveProfile = async () => {
        try {
            await api.put(`/orgs/${user.id}`, form);
            setOrg(o => ({ ...o, ...form }));
            showToast('Profile updated!', 'success');
            setEditModal(false);
        } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
    };

    const createEvent = async () => {
        try {
            await api.post('/events', { ...eventForm, orgId: user.id });
            showToast('Event created! 🎉', 'success');
            setEventModal(false);
            const { data } = await api.get(`/orgs/${user.id}`);
            setEvents(data.data.events || []);
        } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
    };

    // Mock follower growth chart data
    const chartData = [
        { month: 'Sep', followers: Math.max(0, (org?.followers || 0) - 60) },
        { month: 'Oct', followers: Math.max(0, (org?.followers || 0) - 45) },
        { month: 'Nov', followers: Math.max(0, (org?.followers || 0) - 30) },
        { month: 'Dec', followers: Math.max(0, (org?.followers || 0) - 20) },
        { month: 'Jan', followers: Math.max(0, (org?.followers || 0) - 10) },
        { month: 'Feb', followers: org?.followers || 0 },
    ];

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}><div className="skeleton" style={{ height: 300, borderRadius: 16 }} /></div>;
    if (!org) return null;

    const canAddEvent = org.isVerified;

    return (
        <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
            {/* Cover + Profile */}
            <div style={{ position: 'relative', height: 180, borderRadius: 20, overflow: 'hidden', marginBottom: -40, background: org.coverImage ? `url(${org.coverImage}) center/cover` : 'linear-gradient(135deg,#8b5cf6,#22d3ee)' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
            </div>
            <div className="glass-card" style={{ padding: '52px 24px 24px', marginBottom: 24, position: 'relative' }}>
                <div style={{ position: 'absolute', top: -36, left: 24, width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', border: '3px solid #080818' }}>
                    {org.avatar ? <img src={org.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" /> : org.name?.[0]}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <h1 style={{ fontWeight: 800, fontSize: '1.4rem' }}>{org.name}</h1>
                            {org.isVerified && <VerifiedBadge size={20} />}
                        </div>
                        <div style={{ fontSize: '0.83rem', color: '#94a3b8' }}>
                            <span style={{ padding: '2px 8px', borderRadius: 16, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', marginRight: 8 }}>{org.category}</span>
                            <span>👥 {org.followers} followers</span>
                        </div>
                    </div>
                    <button className="btn-secondary" onClick={() => setEditModal(true)} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>✏️ Edit Profile</button>
                </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
                {[
                    { label: 'Followers', value: org.followers, icon: '👥', color: '#8b5cf6' },
                    { label: 'Events', value: events.length, icon: '📅', color: '#22d3ee' },
                    { label: 'Status', value: org.isVerified ? 'Verified ✅' : `${100 - org.followers} more for ✅`, icon: '🏅', color: org.isVerified ? '#10b981' : '#f59e0b' },
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '16px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ fontWeight: 800, fontSize: '1.2rem', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Follower growth chart */}
            <div className="glass-card" style={{ padding: 20, marginBottom: 24 }}>
                <h2 style={{ fontWeight: 700, marginBottom: 16 }}>📈 Follower Growth</h2>
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                        <Tooltip contentStyle={{ background: '#0f0f2e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, color: '#f8fafc' }} />
                        <Bar dataKey="followers" fill="url(#grad)" radius={[6, 6, 0, 0]} />
                        <defs>
                            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.6} />
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Events section */}
            <div className="glass-card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontWeight: 700 }}>📅 Your Events</h2>
                    {canAddEvent ? (
                        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setEventModal(true)}>+ Add Event</button>
                    ) : (
                        <div style={{ fontSize: '0.78rem', color: '#f59e0b', padding: '6px 12px', background: 'rgba(245,158,11,0.1)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)' }}>
                            Reach 100 followers to unlock event creation
                        </div>
                    )}
                </div>
                {events.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📅</div>
                        <p>{canAddEvent ? 'No events yet. Create your first one!' : `Get ${100 - org.followers} more followers to create events.`}</p>
                    </div>
                ) : events.map(ev => (
                    <div key={ev.id} className="glass-card" style={{ padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>{ev.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{ev.venue} • {new Date(ev.startTime).toLocaleDateString()}</div>
                        </div>
                        <span style={{ padding: '2px 8px', borderRadius: 12, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: '0.72rem' }}>{ev.category}</span>
                    </div>
                ))}
            </div>

            {/* Edit modal */}
            {editModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEditModal(false)}>
                    <div style={{ background: '#0f0f2e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontWeight: 700, marginBottom: 16 }}>✏️ Edit Profile</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <input className="input-dark" placeholder="Org Name" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            <textarea className="input-dark" placeholder="Description" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ minHeight: 80 }} />
                            <select className="input-dark" value={form.category || ''} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                {['Technical', 'Cultural', 'Sports', 'Music', 'Social', 'Academic', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input className="input-dark" placeholder="Instagram handle" value={form.instagramHandle || ''} onChange={e => setForm(f => ({ ...f, instagramHandle: e.target.value }))} />
                            <input className="input-dark" placeholder="Website URL" value={form.websiteUrl || ''} onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))} />
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setEditModal(false)}>Cancel</button>
                                <button className="btn-primary" style={{ flex: 1 }} onClick={saveProfile}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create event modal */}
            {eventModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setEventModal(false)}>
                    <div style={{ background: '#0f0f2e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontWeight: 700, marginBottom: 16 }}>📅 Create Event</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[['name', 'Event Name'], ['description', 'Description'], ['venue', 'Venue']].map(([k, p]) => (
                                k === 'description' ? <textarea key={k} className="input-dark" placeholder={p} value={eventForm[k]} onChange={e => setEventForm(f => ({ ...f, [k]: e.target.value }))} style={{ minHeight: 60 }} />
                                    : <input key={k} className="input-dark" placeholder={p} value={eventForm[k]} onChange={e => setEventForm(f => ({ ...f, [k]: e.target.value }))} />
                            ))}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <input className="input-dark" type="datetime-local" value={eventForm.startTime} onChange={e => setEventForm(f => ({ ...f, startTime: e.target.value }))} />
                                <input className="input-dark" type="datetime-local" value={eventForm.endTime} onChange={e => setEventForm(f => ({ ...f, endTime: e.target.value }))} />
                            </div>
                            <select className="input-dark" value={eventForm.category} onChange={e => setEventForm(f => ({ ...f, category: e.target.value }))}>
                                {['Technical', 'Cultural', 'Sports', 'Business', 'Gaming', 'Creative', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input className="input-dark" type="number" placeholder="Max capacity (optional)" value={eventForm.maxCapacity} onChange={e => setEventForm(f => ({ ...f, maxCapacity: e.target.value }))} />
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setEventModal(false)}>Cancel</button>
                                <button className="btn-primary" style={{ flex: 1 }} onClick={createEvent}>Create Event</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
