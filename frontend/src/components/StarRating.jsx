export default function StarRating({ rating = 0, onChange, size = 20, readonly = false }) {
    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map(star => (
                <svg
                    key={star}
                    width={size}
                    height={size}
                    viewBox="0 0 24 24"
                    style={{ cursor: readonly ? 'default' : 'pointer', transition: 'transform 0.15s' }}
                    onClick={() => !readonly && onChange?.(star)}
                    onMouseEnter={e => { if (!readonly) e.currentTarget.style.transform = 'scale(1.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                >
                    <polygon
                        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                        fill={star <= rating ? '#f59e0b' : 'rgba(255,255,255,0.1)'}
                        stroke={star <= rating ? '#f59e0b' : 'rgba(255,255,255,0.2)'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ))}
        </div>
    );
}
