import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import MarketplaceCard from '../components/MarketplaceCard';
import api from '../api/axios';

export default function ListingDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchListing = async () => {
        try {
            const { data } = await api.get(`/marketplace/${id}`);
            setListing(data.data);
        } catch (err) {
            showToast('Listing not found', 'error');
            navigate('/marketplace');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListing();
    }, [id]);

    const handleChat = async () => {
        if (!user) return navigate('/login');
        if (user.id === listing.seller.id) return showToast("You can't chat with yourself!", 'error');
        
        navigate(`/chat?with=${listing.seller.id}&listing=${listing.id}`);
        try {
            await api.post(`/marketplace/${listing.id}/chat`);
        } catch {} // Chat might already exist
    };

    if (loading) return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, display: 'flex', gap: 24 }}>
            <div className="skeleton" style={{ flex: 2, height: 400, borderRadius: 16 }} />
            <div className="skeleton" style={{ flex: 1, height: 300, borderRadius: 16 }} />
        </div>
    );
    if (!listing) return null;

    return (
        <div className="page-enter" style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
            {/* Back button */}
            <button onClick={() => navigate('/marketplace')} style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                ← Back to Marketplace
            </button>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                
                {/* Main Content (Left) */}
                <div style={{ flex: '1 1 600px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Image Area */}
                    <div style={{ width: '100%', height: 400, borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {listing.images?.length > 0 ? (
                            <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ fontSize: '4rem' }}>📦</div>
                        )}
                    </div>

                    {/* Details Card */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>{listing.title}</h1>
                            <div style={{ 
                                fontWeight: 700, fontSize: '1.4rem', 
                                color: listing.type === 'free' ? '#10b981' : '#a78bfa'
                            }}>
                                {listing.type === 'free' ? 'FREE' : `₹${listing.type === 'rent' ? `${listing.rentPerDay}/day` : listing.price}`}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                            <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', fontSize: '0.8rem', fontWeight: 600 }}>{listing.category}</span>
                            <span style={{ padding: '4px 12px', borderRadius: 20, background: 'rgba(34,211,238,0.15)', color: '#22d3ee', fontSize: '0.8rem', fontWeight: 600 }}>{listing.condition}</span>
                            <span style={{ padding: '4px 12px', borderRadius: 20, background: listing.isAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: listing.isAvailable ? '#10b981' : '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>
                                {listing.isAvailable ? 'Available' : 'Sold Out'}
                            </span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Description</h3>
                        <p style={{ color: '#94a3b8', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {listing.description}
                        </p>

                        <div style={{ marginTop: 20, fontSize: '0.8rem', color: '#64748b' }}>
                            Listed on {new Date(listing.createdAt).toLocaleDateString()} • {listing.views} views
                        </div>
                    </div>
                </div>

                {/* Sidebar (Right) */}
                <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Seller Card */}
                    <div className="glass-card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Seller Details</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {listing.seller.avatar ? <img src={listing.seller.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : listing.seller.name[0]}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{listing.seller.name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{listing.seller.department} • Year {listing.seller.year}</div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, marginBottom: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4 }}>EMAIL</div>
                            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', wordBreak: 'break-all' }}>{listing.seller.email}</div>
                        </div>

                        {listing.isAvailable && user?.id !== listing.seller.id && (
                            <button 
                                className="btn-primary" 
                                style={{ width: '100%', padding: '12px 0', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', gap: 8 }}
                                onClick={handleChat}
                            >
                                💬 Chat to {listing.type === 'rent' ? 'Rent' : 'Buy'}
                            </button>
                        )}
                        
                        {user?.id === listing.seller.id && listing.isAvailable && (
                            <button 
                                className="btn-secondary" 
                                style={{ width: '100%', padding: '12px 0', fontSize: '1rem', fontWeight: 600, marginTop: 10 }}
                                onClick={async () => {
                                    try {
                                        await api.put(`/marketplace/${listing.id}/sold`);
                                        showToast('Marked as sold', 'success');
                                        fetchListing();
                                    } catch {
                                        showToast('Error updating listing', 'error');
                                    }
                                }}
                            >
                                ✓ Mark as Sold
                            </button>
                        )}
                    </div>

                    {/* Other listings */}
                    {listing.sellerOtherListings?.length > 0 && (
                        <div className="glass-card" style={{ padding: 20 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 14 }}>More from {listing.seller.name.split(' ')[0]}</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {listing.sellerOtherListings.map(l => (
                                    <div 
                                        key={l.id} 
                                        style={{ display: 'flex', gap: 12, padding: 10, borderRadius: 12, background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onClick={() => navigate(`/marketplace/${l.id}`)}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    >
                                        <div style={{ width: 60, height: 60, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {l.images?.[0] ? <img src={l.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : '📦'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
                                            <div style={{ color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>
                                                {l.type === 'free' ? 'FREE' : `₹${l.type === 'rent' ? `${l.rentPerDay}/d` : l.price}`}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
