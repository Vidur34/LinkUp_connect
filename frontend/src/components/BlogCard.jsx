import { formatDistanceToNow } from 'date-fns';

const CATEGORY_COLORS = {
    'Internship Journey': '#8b5cf6',
    'College Life': '#22d3ee',
    'Technical': '#10b981',
    'Career Advice': '#f59e0b',
    'Fest Experience': '#ec4899',
};

function readTime(content) {
    const words = content?.split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(words / 200));
}

export default function BlogCard({ blog, onClick }) {
    const catColor = CATEGORY_COLORS[blog.category] || '#8b5cf6';
    const excerpt = blog.content?.replace(/#+\s[^\n]*/g, '').replace(/\n{2,}/g, ' ').trim().slice(0, 120) + '...';

    return (
        <div className="glass-card glass-card-hover" style={{ padding: 20, cursor: 'pointer' }} onClick={() => onClick?.(blog)}>
            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                    {blog.author?.avatar
                        ? <img src={blog.author.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                        : blog.author?.name?.[0]}
                </div>
                <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{blog.author?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        Year {blog.author?.year} • {blog.author?.department}
                        {blog.author?.year >= 3 && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 10, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontSize: '0.65rem' }}>Senior</span>}
                    </div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#64748b' }}>
                    {readTime(blog.content)} min read
                </div>
            </div>

            {/* Category + Tags */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: `${catColor}22`, color: catColor, border: `1px solid ${catColor}44` }}>
                    {blog.category}
                </span>
                {(blog.tags || []).slice(0, 3).map(t => (
                    <span key={t} className="skill-tag" style={{ fontSize: '0.68rem', padding: '1px 7px' }}>#{t}</span>
                ))}
            </div>

            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6, lineHeight: 1.4 }}>{blog.title}</h3>
            <p style={{ fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: 14 }}>{excerpt}</p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f59e0b', fontWeight: 700 }}>
                    ▲ {blog.upvotes}
                </span>
                <span>💬 {blog._count?.comments || 0}</span>
                <span style={{ marginLeft: 'auto', color: '#64748b' }}>
                    {blog.createdAt ? formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true }) : ''}
                </span>
            </div>
        </div>
    );
}
