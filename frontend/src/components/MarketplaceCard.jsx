import { useNavigate } from 'react-router-dom';
import VerifiedBadge from './VerifiedBadge';

const categoryColors = {
    Books: '#8b5cf6',
    Electronics: '#22d3ee',
    Instruments: '#ec4899',
    Sports: '#10b981',
    Clothing: '#f59e0b',
    Other: '#94a3b8',
};

export default function MarketplaceCard({ listing, onChatClick }) {
    const navigate = useNavigate();
    const catColor = categoryColors[listing.category] || '#94a3b8';

    const priceDisplay = listing.type === 'free'
        ? <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>FREE</span>
        : listing.type === 'rent'
            ? <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.1rem' }}>₹{listing.rentPerDay}/day</span>
            : <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '1.1rem' }}>₹{listing.price}</span>;

    return (
        <div
            className="glass-card glass-card-hover"
            style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
        >
            {/* Image area */}
            <div
                style={{
                    height: 160, background: 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '3rem',
                }}
                onClick={() => navigate(`/marketplace/${listing.id}`)}
            >
                {listing.images?.[0]
                    ? <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : { Books: '📚', Electronics: '💻', Instruments: '🎸', Sports: '⚽', Clothing: '👕', Other: '📦' }[listing.category] || '📦'
                }
            </div>

            <div style={{ padding: '14px 16px' }} onClick={() => navigate(`/marketplace/${listing.id}`)}>
                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44` }}>
                        {listing.category}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {listing.condition}
                    </span>
                    {listing.type !== 'sell' && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: listing.type === 'free' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: listing.type === 'free' ? '#10b981' : '#f59e0b', border: `1px solid ${listing.type === 'free' ? '#10b98133' : '#f59e0b33'}` }}>
                            {listing.type === 'free' ? 'FREE' : 'FOR RENT'}
                        </span>
                    )}
                </div>

                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {listing.title}
                </h3>
                <div style={{ marginBottom: 12 }}>{priceDisplay}</div>

                {/* Seller info */}
                {listing.seller && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                            {listing.seller.avatar
                                ? <img src={listing.seller.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                : listing.seller.name?.[0]
                            }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, truncate: true, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{listing.seller.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{listing.seller.department} • {listing.seller.email}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Chat button */}
            <div style={{ padding: '0 16px 14px' }}>
                {listing.isAvailable ? (
                    <button
                        className="btn-primary"
                        style={{ width: '100%', padding: '9px', fontSize: '0.85rem' }}
                        onClick={e => { e.stopPropagation(); onChatClick?.(listing); }}
                    >
                        {listing.type === 'rent' ? '💬 Chat to Rent' : listing.type === 'free' ? '💬 Claim for Free' : '💬 Chat to Buy'}
                    </button>
                ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                        ✅ No longer available
                    </div>
                )}
            </div>
        </div>
    );
}
