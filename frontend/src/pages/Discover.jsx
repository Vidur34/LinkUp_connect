import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import UserCard from '../components/UserCard';
import VerifiedBadge from '../components/VerifiedBadge';

function SocietiesTab() {
    const navigate = useNavigate();
    const [orgs, setOrgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const CATS = ['All', 'Technical', 'Cultural', 'Sports', 'Music', 'Social', 'Academic'];

    useEffect(() => {
        api.get('/orgs', { params: category !== 'All' ? { category } : {} })
            .then(r => setOrgs(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [category]);

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {CATS.map(c => (
                    <button key={c} onClick={() => setCategory(c)} style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid', cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.2s', background: category === c ? 'linear-gradient(135deg,#8b5cf6,#22d3ee)' : 'rgba(255,255,255,0.04)', borderColor: category === c ? 'transparent' : 'rgba(255,255,255,0.1)', color: category === c ? '#fff' : '#94a3b8' }}>
                        {c}
                    </button>
                ))}
            </div>
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 16 }}>
                    {[...Array(4)].map((_, i) => <div key={i} className="glass-card skeleton" style={{ height: 180 }} />)}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 16 }}>
                    {orgs.map(org => (
                        <div key={org.id} className="glass-card glass-card-hover" style={{ padding: 20, cursor: 'pointer' }} onClick={() => navigate(`/org/${org.id}`)}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem', flexShrink: 0 }}>
                                    {org.avatar ? <img src={org.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" /> : org.name?.[0]}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{org.name}</span>
                                        {org.isVerified && <VerifiedBadge size={16} />}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{org.category}</div>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#a78bfa' }}>{org.followers}</div>
                                    <div style={{ fontSize: '0.65rem', color: '#64748b' }}>followers</div>
                                </div>
                            </div>
                            {org.description && <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{org.description}</p>}
                            <button className="btn-primary" style={{ width: '100%', marginTop: 14, padding: '8px', fontSize: '0.82rem' }}>View Society →</button>
                        </div>
                    ))}
                    {orgs.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏛️</div>
                            <p>No societies found for this category.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Discover() {
    const [users, setUsers] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [tab, setTab] = useState('people'); // 'people' | 'societies'

    const filters = ['All', 'High Match', 'Same Dept', 'Same Year'];

    useEffect(() => {
        api.get('/users').then(res => {
            setUsers(res.data.data);
            setFiltered(res.data.data);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = [...users];
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(u =>
                u.name.toLowerCase().includes(q) ||
                u.department?.toLowerCase().includes(q) ||
                u.skills?.some(s => s.toLowerCase().includes(q))
            );
        }
        if (filter === 'High Match') result = result.filter(u => u.matchScore >= 70);
        if (filter === 'Same Dept') result = result.sort((a, b) => b.matchScore - a.matchScore);
        if (filter === 'Same Year') result = result.sort((a, b) => b.matchScore - a.matchScore);
        setFiltered(result);
    }, [search, filter, users]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 page-enter">
            <div className="mb-6">
                <h1 className="text-3xl font-black gradient-text mb-1">Discover</h1>
                <p className="text-muted">Find your crew and societies at the fest</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
                {[{ key: 'people', label: '👥 People' }, { key: 'societies', label: '🏛️ Societies' }].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s', background: tab === t.key ? 'linear-gradient(135deg,#8b5cf6,#22d3ee)' : 'transparent', color: tab === t.key ? '#fff' : '#94a3b8' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'societies' ? <SocietiesTab /> : (
                <>
                    {/* Search + Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="relative flex-1">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">🔍</span>
                            <input className="input-dark pl-10" placeholder="Search by name, department or skill..."
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                            {filters.map(f => (
                                <button key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${filter === f
                                        ? 'border-purple-400/50 text-purple-300 bg-purple-500/15'
                                        : 'border-white/10 text-muted hover:text-white hover:border-white/20'
                                        }`}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-muted text-sm mb-6">{filtered.length} people found</p>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="glass-card p-5">
                                    <div className="flex gap-3 mb-4">
                                        <div className="skeleton w-12 h-12 rounded-xl" />
                                        <div className="flex-1">
                                            <div className="skeleton h-4 w-24 mb-2" />
                                            <div className="skeleton h-3 w-16" />
                                        </div>
                                    </div>
                                    <div className="skeleton h-3 w-full mb-2" />
                                    <div className="skeleton h-3 w-3/4" />
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="glass-card p-16 text-center">
                            <p className="text-5xl mb-4">🔍</p>
                            <h3 className="text-xl font-bold text-primary mb-2">No results found</h3>
                            <p className="text-muted">Try a different search or clear filters</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map(u => (
                                <UserCard key={u.id} user={u} matchScore={u.matchScore}
                                    matchReasons={u.matchReasons} sharedSkills={u.sharedSkills || []} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
