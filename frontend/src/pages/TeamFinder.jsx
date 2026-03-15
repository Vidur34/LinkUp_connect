import { useEffect, useState } from 'react';
import api from '../api/axios';
import TeamCard from '../components/TeamCard';
import { useToast } from '../components/Toast';

const ROLES = ['Frontend Dev', 'Backend Dev', 'ML Engineer', 'UI/UX Designer', 'Business Analyst',
    'DevOps', 'Mobile Dev', 'Data Scientist', 'Marketing', 'CAD Designer', 'Embedded Dev'];

export default function TeamFinder() {
    const [teams, setTeams] = useState([]);
    const [suggested, setSuggested] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', rolesNeeded: [], maxSize: '4' });
    const [creating, setCreating] = useState(false);
    const { addToast } = useToast();

    const fetchTeams = async () => {
        const [allRes, sugRes] = await Promise.all([
            api.get('/teams'),
            api.get('/teams/suggestions'),
        ]);
        setTeams(allRes.data.data);
        setSuggested(sugRes.data.data);
        setLoading(false);
    };

    useEffect(() => { fetchTeams(); }, []);

    const toggleRole = (role) => {
        setForm(f => ({
            ...f,
            rolesNeeded: f.rolesNeeded.includes(role)
                ? f.rolesNeeded.filter(r => r !== role)
                : [...f.rolesNeeded, role],
        }));
    };

    const handleCreate = async () => {
        if (!form.name.trim()) { addToast('Team name required', 'error'); return; }
        setCreating(true);
        try {
            await api.post('/teams', form);
            addToast('Team created! +25 pts 🎉', 'success');
            setShowModal(false);
            setForm({ name: '', description: '', rolesNeeded: [], maxSize: '4' });
            fetchTeams();
        } catch (err) {
            addToast(err.response?.data?.message || 'Failed', 'error');
        } finally {
            setCreating(false);
        }
    };

    const displayed = tab === 'suggested' ? suggested : teams;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 page-enter">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black gradient-text-pink mb-1">Team Finder</h1>
                    <p className="text-muted">Find your perfect project team</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary px-6 py-3">
                    + Post a Team
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
                {[['all', '📋 All Teams'], ['suggested', '✨ Suggested for You']].map(([key, label]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${tab === key
                                ? 'border-purple-400/50 text-purple-300 bg-purple-500/15'
                                : 'border-white/10 text-muted hover:text-white'
                            }`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Teams grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="glass-card p-5">
                            <div className="skeleton h-5 w-32 mb-3" />
                            <div className="skeleton h-3 w-full mb-2" />
                            <div className="skeleton h-3 w-3/4" />
                        </div>
                    ))}
                </div>
            ) : displayed.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <p className="text-5xl mb-4">👥</p>
                    <h3 className="text-xl font-bold mb-2">{tab === 'suggested' ? 'No suggested teams' : 'No teams yet'}</h3>
                    <p className="text-muted mb-6">Be the first to post a team!</p>
                    <button onClick={() => setShowModal(true)} className="btn-primary px-8 py-3">Post a Team</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayed.map(t => <TeamCard key={t.id} team={t} onRefresh={fetchTeams} />)}
                </div>
            )}

            {/* Create Team Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
                    <div className="glass-card p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6 gradient-text">Create a Team</h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm text-muted mb-2">Team Name *</label>
                                <input className="input-dark" placeholder="e.g., AI Dream Squad"
                                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-2">Description</label>
                                <textarea className="input-dark" rows="3" placeholder="What will your team build?"
                                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-2">Max Team Size</label>
                                <select className="input-dark bg-transparent" value={form.maxSize}
                                    onChange={e => setForm(f => ({ ...f, maxSize: e.target.value }))}>
                                    {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} members</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-3">Roles Needed ({form.rolesNeeded.length} selected)</label>
                                <div className="flex flex-wrap gap-2">
                                    {ROLES.map(r => (
                                        <button key={r} type="button" onClick={() => toggleRole(r)}
                                            className={`skill-tag cursor-pointer ${form.rolesNeeded.includes(r) ? 'border-purple-400 bg-purple-500/25' : ''}`}>
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowModal(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                            <button onClick={handleCreate} disabled={creating} className="btn-primary flex-1 py-3">
                                {creating ? 'Creating...' : '🚀 Create Team'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
