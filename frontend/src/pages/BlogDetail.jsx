import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import StarRating from '../components/StarRating';
import api from '../api/axios';

function formatDistanceToNow(dateString) {
    const diff = Date.now() - new Date(dateString).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
}

export default function BlogDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [voted, setVoted] = useState(false);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get(`/grow/blogs/${id}`).then(({ data }) => {
            setBlog(data.data);
            setLoading(false);
        }).catch(() => { navigate('/grow'); });
    }, [id]);

    const handleVote = async () => {
        try {
            const { data } = await api.post(`/grow/blogs/${id}/vote`);
            setVoted(data.data.voted);
            setBlog(b => ({ ...b, upvotes: b.upvotes + (data.data.voted ? 1 : -1) }));
        } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
    };

    const addComment = async () => {
        if (!comment.trim()) return;
        setSubmitting(true);
        try {
            const { data } = await api.post(`/grow/blogs/${id}/comment`, { content: comment });
            setBlog(b => ({ ...b, comments: [...(b.comments || []), data.data] }));
            setComment('');
            showToast('Comment added!', 'success');
        } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); } finally { setSubmitting(false); }
    };

    if (loading) return <div style={{ maxWidth: 720, margin: '0 auto', padding: 40 }}><div className="skeleton" style={{ height: 400, borderRadius: 16 }} /></div>;
    if (!blog) return null;

    // Simple markdown renderer
    const renderContent = (content) => {
        const lines = content.split('\n');
        return lines.map((line, i) => {
            if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 12, marginTop: 24 }}>{line.slice(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 10, marginTop: 20, color: '#a78bfa' }}>{line.slice(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8, marginTop: 16, color: '#22d3ee' }}>{line.slice(4)}</h3>;
            if (line.startsWith('- ')) return <li key={i} style={{ color: '#94a3b8', marginBottom: 4, marginLeft: 16 }}>{line.slice(2)}</li>;
            if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight: 700, marginBottom: 8 }}>{line.slice(2, -2)}</p>;
            if (line === '') return <div key={i} style={{ marginBottom: 8 }} />;
            return <p key={i} style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 8 }}>{line}</p>;
        });
    };

    return (
        <div className="page-enter" style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
            <button onClick={() => navigate('/grow')} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                ← Back to Grow Hub
            </button>

            <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                        {blog.author?.avatar ? <img src={blog.author.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" /> : blog.author?.name?.[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{blog.author?.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Year {blog.author?.year} • {blog.author?.department}</div>
                        {blog.author?.bio && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{blog.author.bio}</div>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{blog.createdAt ? formatDistanceToNow(blog.createdAt) : ''}</div>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {(blog.tags || []).map(t => <span key={t} className="skill-tag" style={{ fontSize: '0.72rem' }}>#{t}</span>)}
                </div>

                {/* Content */}
                <div style={{ lineHeight: 1.7 }}>{renderContent(blog.content || '')}</div>

                {/* Vote */}
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                        onClick={handleVote}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 10, border: `1px solid ${voted ? '#f59e0b' : 'rgba(255,255,255,0.15)'}`, background: voted ? 'rgba(245,158,11,0.15)' : 'transparent', color: voted ? '#f59e0b' : '#94a3b8', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                    >
                        ▲ {blog.upvotes} {voted ? 'Upvoted' : 'Upvote'}
                    </button>
                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>💬 {blog.comments?.length || 0} comments</span>
                </div>
            </div>

            {/* Comments */}
            <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>💬 Comments</h3>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <input className="input-dark" placeholder="Write a comment..." value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} />
                    <button className="btn-primary" onClick={addComment} disabled={submitting} style={{ flexShrink: 0, padding: '11px 18px' }}>Post</button>
                </div>
                {(blog.comments || []).map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#22d3ee,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
                            {c.author?.avatar ? <img src={c.author.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="" /> : c.author?.name?.[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 2 }}>{c.author?.name}</div>
                            <div style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5 }}>{c.content}</div>
                        </div>
                    </div>
                ))}
                {(!blog.comments || blog.comments.length === 0) && (
                    <div style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>No comments yet. Be the first!</div>
                )}
            </div>
        </div>
    );
}
