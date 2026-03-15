import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import BlogCard from '../components/BlogCard';
import GuideCard from '../components/GuideCard';
import MentorCard from '../components/MentorCard';
import api from '../api/axios';

const BLOG_CATEGORIES = ['All', 'Internship Journey', 'College Life', 'Technical', 'Career Advice', 'Fest Experience'];
const COMPANIES = ['All', 'Google', 'Microsoft', 'Amazon', 'Flipkart', 'Infosys', 'TCS', 'Wipro'];

function BlogsTab() {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [search, setSearch] = useState('');
    const [showWriteModal, setShowWriteModal] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', category: 'College Life', tags: '' });
    const [aiLoading, setAiLoading] = useState(false);
    const [aiTopic, setAiTopic] = useState('');

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const params = {};
            if (category !== 'All') params.category = category;
            if (search) params.search = search;
            const { data } = await api.get('/grow/blogs', { params });
            setBlogs(data.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchBlogs(); }, [category]);

    const generateOutline = async () => {
        if (!aiTopic.trim()) return;
        setAiLoading(true);
        try {
            const { data } = await api.post('/ai/blog-outline', { topic: aiTopic });
            const { title, outline } = data.data;
            const content = `# ${title}\n\n${outline.map(o => `## ${o.heading}\n\n${o.description}`).join('\n\n')}`;
            setForm(f => ({ ...f, title, content }));
            showToast('AI outline generated! ✨', 'success');
        } catch { showToast('AI error', 'error'); } finally { setAiLoading(false); }
    };

    const submitBlog = async () => {
        if (!form.title || !form.content) return showToast('Title and content required', 'error');
        try {
            const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
            await api.post('/grow/blogs', { ...form, tags });
            showToast('Blog published! 🎉', 'success');
            setShowWriteModal(false);
            fetchBlogs();
        } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <input className="input-dark" placeholder="🔍 Search blogs..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchBlogs()} style={{ maxWidth: 320 }} />
                <button className="btn-primary" onClick={() => setShowWriteModal(true)}>✏️ Write Blog</button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {BLOG_CATEGORIES.map(c => (
                    <button key={c} onClick={() => setCategory(c)} style={{ padding: '5px 14px', borderRadius: 20, border: '1px solid', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s', background: category === c ? 'linear-gradient(135deg,#8b5cf6,#22d3ee)' : 'rgba(255,255,255,0.04)', borderColor: category === c ? 'transparent' : 'rgba(255,255,255,0.1)', color: category === c ? '#fff' : '#94a3b8' }}>
                        {c}
                    </button>
                ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
                {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card skeleton" style={{ height: 200 }} />)
                    : blogs.length === 0 ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}><div style={{ fontSize: '3rem', marginBottom: 12 }}>📝</div><p>No blogs yet. Write the first one!</p></div>
                        : blogs.map(b => <BlogCard key={b.id} blog={b} onClick={() => navigate(`/grow/blog/${b.id}`)} />)}
            </div>

            {/* Write Blog Modal */}
            {showWriteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setShowWriteModal(false)}>
                    <div style={{ background: '#0f0f2e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 16 }}>✏️ Write a Blog</h2>
                        {/* AI outline generator */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 14, padding: 12, background: 'rgba(139,92,246,0.08)', borderRadius: 12, border: '1px solid rgba(139,92,246,0.2)' }}>
                            <input className="input-dark" placeholder="Topic for AI outline..." value={aiTopic} onChange={e => setAiTopic(e.target.value)} style={{ fontSize: '0.85rem' }} />
                            <button className="btn-primary" onClick={generateOutline} disabled={aiLoading} style={{ flexShrink: 0, padding: '9px 14px', fontSize: '0.82rem' }}>
                                {aiLoading ? '...' : '✨ AI'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <input className="input-dark" placeholder="Blog Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            <select className="input-dark" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                {BLOG_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input className="input-dark" placeholder="Tags (comma separated, e.g. Internship, React)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                            <textarea className="input-dark" placeholder="Write your blog here (Markdown supported)..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ minHeight: 200, resize: 'vertical', fontSize: '0.88rem', lineHeight: 1.6 }} />
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowWriteModal(false)}>Cancel</button>
                                <button className="btn-primary" style={{ flex: 1 }} onClick={submitBlog}>Publish Blog</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function GuidesTab() {
    const { showToast } = useToast();
    const [guides, setGuides] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [coverModal, setCoverModal] = useState(null);
    const [coverForm, setCoverForm] = useState({ skills: '', company: '', role: '' });
    const [coverLetter, setCoverLetter] = useState('');
    const [prepModal, setPrepModal] = useState(false);
    const [prepForm, setPrepForm] = useState({ company: '', role: '', skills: '' });
    const [prepQuestions, setPrepQuestions] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        Promise.all([api.get('/grow/guides'), api.get('/grow/guides/companies')]).then(([g, c]) => {
            setGuides(g.data.data);
            setCompanies([{ company: 'All', count: g.data.data.length }, ...c.data.data]);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const filtered = selectedCompany && selectedCompany !== 'All'
        ? guides.filter(g => g.company.toLowerCase() === selectedCompany.toLowerCase())
        : guides;

    const generateCoverLetter = async () => {
        setAiLoading(true);
        try {
            const { data } = await api.post('/ai/cover-letter', coverForm);
            setCoverLetter(data.data.coverLetter);
        } catch { showToast('AI error', 'error'); } finally { setAiLoading(false); }
    };

    const generateInterviewPrep = async () => {
        setAiLoading(true);
        try {
            const { data } = await api.post('/ai/interview-prep', prepForm);
            setPrepQuestions(data.data || []);
            showToast('Interview prep generated! 🎯', 'success');
        } catch { showToast('AI error', 'error'); } finally { setAiLoading(false); }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
            {/* Company sidebar */}
            <div className="glass-card" style={{ padding: 16, alignSelf: 'start', position: 'sticky', top: 80 }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12, color: '#94a3b8' }}>COMPANIES</h3>
                {companies.map(c => (
                    <button key={c.company} onClick={() => setSelectedCompany(c.company)} style={{ width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', marginBottom: 2, background: selectedCompany === c.company ? 'rgba(139,92,246,0.15)' : 'transparent', color: selectedCompany === c.company ? '#a78bfa' : '#f8fafc', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>🏢 {c.company}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.count}</span>
                    </button>
                ))}
            </div>

            {/* Guides list */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ fontWeight: 700 }}>{selectedCompany || 'All'} Guides</h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setPrepModal(true)}>🎯 Mock Interview</button>
                        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => setCoverModal(true)}>📝 Cover Letter</button>
                    </div>
                </div>
                {loading ? <div className="skeleton" style={{ height: 200, borderRadius: 16 }} />
                    : filtered.length === 0 ? <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}><div style={{ fontSize: '3rem', marginBottom: 12 }}>🏢</div><p>No guides for this company yet.</p></div>
                        : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {filtered.map(g => (
                                <div key={g.id}>
                                    <GuideCard guide={g} onClick={() => setSelected(selected?.id === g.id ? null : g)} />
                                    {selected?.id === g.id && (
                                        <div className="glass-card" style={{ padding: 20, marginTop: 8, borderTop: '2px solid rgba(139,92,246,0.3)' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                                <div><h4 style={{ color: '#a78bfa', marginBottom: 6, fontSize: '0.85rem' }}>📄 Resume Tips</h4><p style={{ fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.6 }}>{g.resumeTips}</p></div>
                                                <div><h4 style={{ color: '#22d3ee', marginBottom: 6, fontSize: '0.85rem' }}>📋 Application Process</h4><p style={{ fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.6 }}>{g.applicationProcess}</p></div>
                                            </div>
                                            <div style={{ marginBottom: 14 }}>
                                                <h4 style={{ color: '#10b981', marginBottom: 8, fontSize: '0.85rem' }}>🎯 Interview Rounds</h4>
                                                {(g.interviewRounds || []).map((r, i) => (
                                                    <div key={i} style={{ padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 10, marginBottom: 8, borderLeft: '3px solid #8b5cf6' }}>
                                                        <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>{r.round}</div>
                                                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: 4 }}>{r.description}</div>
                                                        <div style={{ fontSize: '0.78rem', color: '#22d3ee' }}>💡 {r.tips}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div><h4 style={{ color: '#f59e0b', marginBottom: 6, fontSize: '0.85rem' }}>📅 Timeline</h4><p style={{ fontSize: '0.83rem', color: '#94a3b8' }}>{g.timeline}</p></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                }
            </div>

            {/* Cover letter modal */}
            {coverModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setCoverModal(false)}>
                    <div style={{ background: '#0f0f2e', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 520 }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontWeight: 700, marginBottom: 16 }}>📝 Generate Cover Letter</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
                            <input className="input-dark" placeholder="Company (e.g. Google)" value={coverForm.company} onChange={e => setCoverForm(f => ({ ...f, company: e.target.value }))} />
                            <input className="input-dark" placeholder="Role (e.g. SWE Intern)" value={coverForm.role} onChange={e => setCoverForm(f => ({ ...f, role: e.target.value }))} />
                            <textarea className="input-dark" placeholder="Your skills (e.g. Python, React, ML)" value={coverForm.skills} onChange={e => setCoverForm(f => ({ ...f, skills: e.target.value }))} style={{ minHeight: 72 }} />
                            <button className="btn-primary" onClick={generateCoverLetter} disabled={aiLoading}>{aiLoading ? '✨ Generating...' : '✨ Generate with AI'}</button>
                        </div>
                        {coverLetter && (
                            <div style={{ padding: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 10, fontSize: '0.85rem', lineHeight: 1.7, color: '#f8fafc', whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto' }}>
                                {coverLetter}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Interview Prep modal */}
            {prepModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setPrepModal(false)}>
                    <div style={{ background: '#0f0f2e', border: '1px solid rgba(34,211,238,0.3)', borderRadius: 20, padding: 28, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontWeight: 700, marginBottom: 16, color: '#22d3ee' }}>🎯 AI Interview Prep</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                            <input className="input-dark" placeholder="Target Company (e.g. Amazon)" value={prepForm.company} onChange={e => setPrepForm(f => ({ ...f, company: e.target.value }))} />
                            <input className="input-dark" placeholder="Role (e.g. Frontend Engineer)" value={prepForm.role} onChange={e => setPrepForm(f => ({ ...f, role: e.target.value }))} />
                            <textarea className="input-dark" placeholder="Your skills (e.g. React, JS, Tailwind)" value={prepForm.skills} onChange={e => setPrepForm(f => ({ ...f, skills: e.target.value }))} style={{ minHeight: 60 }} />
                            <button className="btn-primary" onClick={generateInterviewPrep} disabled={aiLoading} style={{ background: 'linear-gradient(135deg,#0ea5e9,#22d3ee)' }}>{aiLoading ? '✨ Generating...' : '✨ Generate Questions'}</button>
                        </div>
                        {prepQuestions.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {prepQuestions.map((q, i) => (
                                    <div key={i} style={{ padding: 14, background: 'rgba(34,211,238,0.05)', borderRadius: 10, borderLeft: '3px solid #22d3ee' }}>
                                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#22d3ee', marginBottom: 4 }}>{q.focus}</div>
                                        <div style={{ fontSize: '0.88rem', color: '#f8fafc', lineHeight: 1.5 }}>{q.question}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function MentorsTab() {
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [skillFilter, setSkillFilter] = useState('');

    const fetchMentors = async () => {
        setLoading(true);
        try {
            const params = skillFilter ? { skill: skillFilter } : {};
            const { data } = await api.get('/grow/mentors', { params });
            setMentors(data.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchMentors(); }, []);

    return (
        <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' }}>
                <input className="input-dark" placeholder="🔍 Filter by skill..." value={skillFilter} onChange={e => setSkillFilter(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchMentors()} style={{ maxWidth: 280 }} />
                <button className="btn-secondary" onClick={fetchMentors} style={{ padding: '11px 18px' }}>Search</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 16 }}>
                {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card skeleton" style={{ height: 200 }} />)
                    : mentors.length === 0 ? <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}><div style={{ fontSize: '3rem', marginBottom: 12 }}>🎓</div><p>No mentors yet. Become one from your profile settings!</p></div>
                        : mentors.map(m => <MentorCard key={m.id} mentor={m} onEndorse={fetchMentors} />)}
            </div>
        </div>
    );
}

export default function Grow() {
    const [activeTab, setActiveTab] = useState('blogs');

    const tabs = [
        { key: 'blogs', label: '📝 Senior Blogs', icon: '📝' },
        { key: 'guides', label: '🏢 Internship Guides', icon: '🏢' },
        { key: 'mentors', label: '🎓 Skill Mentors', icon: '🎓' },
    ];

    return (
        <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontWeight: 800, fontSize: '1.8rem', background: 'linear-gradient(135deg,#10b981,#22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    🌱 Grow Hub
                </h1>
                <p style={{ color: '#94a3b8', marginTop: 4 }}>Learn from seniors, find mentors, ace your internships</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 5, width: 'fit-content' }}>
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', transition: 'all 0.2s', background: activeTab === t.key ? 'linear-gradient(135deg,#10b981,#22d3ee)' : 'transparent', color: activeTab === t.key ? '#fff' : '#94a3b8' }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === 'blogs' && <BlogsTab />}
            {activeTab === 'guides' && <GuidesTab />}
            {activeTab === 'mentors' && <MentorsTab />}
        </div>
    );
}
