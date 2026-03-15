import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import MarketplaceCard from '../components/MarketplaceCard';
import api from '../api/axios';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Instruments', 'Sports', 'Clothing', 'Other'];
const TYPES = ['All', 'sell', 'rent', 'free'];

function SkeletonCard() {
    return (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: 160 }} />
            <div style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 18, width: '80%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '40%', marginBottom: 12 }} />
                <div className="skeleton" style={{ height: 36 }} />
            </div>
        </div>
    );
}

function PostListingModal({ onClose, onSuccess }) {
    const { showToast } = useToast();
    const [form, setForm] = useState({ title: '', description: '', price: '', type: 'sell', rentPerDay: '', category: 'Books', images: '', condition: 'Good' });
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [rawKeywords, setRawKeywords] = useState('');

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const autoFill = async () => {
        if (!rawKeywords) return showToast('Enter what you are selling first!', 'error');
        setAiLoading(true);
        try {
            const { data } = await api.post('/ai/marketplace-listing', { rawKeywords });
            if (data.data) {
                set('title', data.data.title);
                set('description', data.data.description);
                showToast('AI drafted your listing! ✨', 'success');
            }
        } catch(err) {
             showToast('Failed to auto-fill listing', 'error');
        } finally {
            setAiLoading(false);
        }
    };

    const submit = async () => {
        if (!form.title || !form.description) return showToast('Title and description required', 'error');
        setLoading(true);
        try {
            const images = form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [];
            await api.post('/marketplace', { ...form, images, price: parseFloat(form.price) || 0, rentPerDay: form.rentPerDay ? parseFloat(form.rentPerDay) : null });
            showToast('Listing posted! 🎉', 'success');
            onSuccess?.();
            onClose();
        } catch (err) {
            showToast(err.response?.data?.message || 'Error posting listing', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
            <div style={{ background: '#0f0f2e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ fontWeight: 700, fontSize: '1.2rem', background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📦 Post a Listing</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>

                {/* AI Helper Banner */}
                <div style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.2)', padding: 16, borderRadius: 12, marginBottom: 20 }}>
                    <p style={{ fontSize: '0.85rem', color: '#22d3ee', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        ✨ AI Auto-Lister
                    </p>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input className="input-dark" style={{ flex: 1, fontSize: '0.85rem', padding: '8px 12px' }} placeholder="E.g. Selling used macbook m1..." value={rawKeywords} onChange={e => setRawKeywords(e.target.value)} />
                        <button className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem', whiteSpace: 'nowrap' }} onClick={autoFill} disabled={aiLoading}>
                            {aiLoading ? 'Thinking...' : 'Magic Fill'}
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input className="input-dark" placeholder="Title" value={form.title} onChange={e => set('title', e.target.value)} />
                    <textarea className="input-dark" placeholder="Description" value={form.description} onChange={e => set('description', e.target.value)} style={{ minHeight: 80, resize: 'vertical' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <select className="input-dark" value={form.category} onChange={e => set('category', e.target.value)}>
                            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select className="input-dark" value={form.type} onChange={e => set('type', e.target.value)}>
                            <option value="sell">For Sale</option>
                            <option value="rent">For Rent</option>
                            <option value="free">Free</option>
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {form.type !== 'free' && (
                            <input className="input-dark" type="number" placeholder="Price (₹)" value={form.price} onChange={e => set('price', e.target.value)} />
                        )}
                        {form.type === 'rent' && (
                            <input className="input-dark" type="number" placeholder="Rent/day (₹)" value={form.rentPerDay} onChange={e => set('rentPerDay', e.target.value)} />
                        )}
                        <select className="input-dark" value={form.condition} onChange={e => set('condition', e.target.value)}>
                            {['New', 'Like New', 'Good', 'Fair'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <input className="input-dark" placeholder="Image URLs (comma-separated, optional)" value={form.images} onChange={e => set('images', e.target.value)} />
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                        <button className="btn-primary" style={{ flex: 1 }} onClick={submit} disabled={loading}>
                            {loading ? 'Posting...' : 'Post Listing'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Marketplace() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('browse'); // 'browse' | 'mine'
    const [category, setCategory] = useState('All');
    const [type, setType] = useState('All');
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const params = {};
            if (category !== 'All') params.category = category;
            if (type !== 'All') params.type = type;
            if (search) params.search = search;
            const endpoint = tab === 'mine' ? '/marketplace/my' : '/marketplace';
            const { data } = await api.get(endpoint, { params });
            setListings(data.data);
        } catch (err) {
            showToast('Failed to load listings', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchListings(); }, [category, type, tab]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') fetchListings();
    };

    const handleChat = (listing) => {
        navigate(`/chat?with=${listing.seller?.id}&listing=${listing.id}`);
        api.post(`/marketplace/${listing.id}/chat`).catch(() => {});
    };

    return (
        <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontWeight: 800, fontSize: '1.8rem', background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        🛒 Marketplace
                    </h1>
                    <p style={{ color: '#94a3b8', marginTop: 4 }}>Buy, sell, and rent items with fellow students</p>
                </div>
                <button className="btn-primary" style={{ flexShrink: 0 }} onClick={() => setShowModal(true)}>
                    + Post Listing
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
                {[{ key: 'browse', label: '🛍️ Browse' }, { key: 'mine', label: '📦 My Listings' }].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s', background: tab === t.key ? 'linear-gradient(135deg,#8b5cf6,#22d3ee)' : 'transparent', color: tab === t.key ? '#fff' : '#94a3b8' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {tab === 'browse' && (
                <>
                    {/* Search */}
                    <div style={{ marginBottom: 14 }}>
                        <input className="input-dark" placeholder="🔍 Search listings..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch} style={{ maxWidth: 400 }} />
                    </div>

                    {/* Category filters */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                        {CATEGORIES.map(c => (
                            <button key={c} onClick={() => setCategory(c)} style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid', cursor: 'pointer', fontWeight: 500, fontSize: '0.82rem', transition: 'all 0.2s', background: category === c ? 'linear-gradient(135deg,#8b5cf6,#22d3ee)' : 'rgba(255,255,255,0.04)', borderColor: category === c ? 'transparent' : 'rgba(255,255,255,0.1)', color: category === c ? '#fff' : '#94a3b8' }}>
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Type filters */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        {[{ v: 'All', l: 'All' }, { v: 'sell', l: 'For Sale' }, { v: 'rent', l: 'For Rent' }, { v: 'free', l: 'Free' }].map(t => (
                            <button key={t.v} onClick={() => setType(t.v)} style={{ padding: '4px 12px', borderRadius: 12, border: '1px solid', cursor: 'pointer', fontSize: '0.78rem', transition: 'all 0.2s', background: type === t.v ? 'rgba(139,92,246,0.2)' : 'transparent', borderColor: type === t.v ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.1)', color: type === t.v ? '#a78bfa' : '#64748b' }}>
                                {t.l}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Listings grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                    : listings.length === 0
                        ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📦</div>
                            <p>{tab === 'mine' ? "You haven't posted any listings yet." : 'No listings found. Be the first!'}</p>
                        </div>
                        : listings.map(l => <MarketplaceCard key={l.id} listing={l} onChatClick={handleChat} />)
                }
            </div>

            {showModal && <PostListingModal onClose={() => setShowModal(false)} onSuccess={fetchListings} />}

            {/* FAB */}
            <button
                className="btn-primary"
                style={{ position: 'fixed', bottom: 90, right: 85, width: 52, height: 52, borderRadius: '50%', fontSize: '1.4rem', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}
                onClick={() => setShowModal(true)}
                title="Post a listing"
            >
                +
            </button>
        </div>
    );
}
