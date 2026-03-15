const DIFFICULTY_STYLES = {
    Easy: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: '#10b98133' },
    Medium: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '#f59e0b33' },
    Hard: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '#ef444433' },
};

export default function GuideCard({ guide, onClick }) {
    const diff = DIFFICULTY_STYLES[guide.difficulty] || DIFFICULTY_STYLES.Medium;

    return (
        <div className="glass-card glass-card-hover" style={{ padding: 18, cursor: 'pointer' }} onClick={() => onClick?.(guide)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                    🏢
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{guide.company}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{guide.role} • {guide.year}</div>
                </div>
                <div style={{ padding: '3px 10px', borderRadius: 20, background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`, fontSize: '0.72rem', fontWeight: 700 }}>
                    {guide.difficulty}
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10, fontSize: '0.8rem', color: '#94a3b8', marginBottom: 12, flexWrap: 'wrap' }}>
                {guide.stipend && <span>💰 {guide.stipend}</span>}
                <span>⏱️ {guide.duration}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0 }}>
                    {guide.author?.name?.[0]}
                </div>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{guide.author?.name} • Year {guide.author?.year}</span>
                <span style={{ marginLeft: 'auto', color: '#f59e0b', fontWeight: 700, fontSize: '0.82rem' }}>▲ {guide.upvotes}</span>
            </div>
        </div>
    );
}
