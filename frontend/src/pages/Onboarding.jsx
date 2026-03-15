import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const SKILLS = ['AI', 'ML', 'Web Dev', 'React', 'Node.js', 'Python', 'Java', 'C++', 'IoT',
    'Cybersecurity', 'UI/UX', 'Figma', 'Marketing', 'Data Science', 'TensorFlow', 'VLSI',
    'Robotics', 'CAD', 'Linux', 'Blockchain'];

const INTERESTS = ['Coding', 'Gaming', 'Music', 'Dance', 'Photography', 'Art', 'Robotics',
    'Research', 'Business', 'Cricket', 'Chess', 'Books', 'Travel', 'CTF', 'Tinkering', 'Electronics'];

const DEPARTMENTS = ['CSE', 'ECE', 'Mechanical', 'Civil', 'Design', 'MBA', 'Physics', 'Mathematics'];
const ORG_CATEGORIES = ['Technical', 'Cultural', 'Sports', 'Music', 'Social', 'Academic', 'Media', 'Other'];

export default function Onboarding() {
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState(0); // Step 0 = account type picker (register only)
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', password: '', department: '', year: '3', bio: '',
        skills: [], interests: [],
        accountType: 'student',
        // Org-specific
        orgCategory: 'Technical', description: '', instagramHandle: '', websiteUrl: '',
    });
    const { login, register } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const toggleTag = (arr, val, field) => {
        const next = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
        setForm(f => ({ ...f, [field]: next }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form.email, form.password, form.loginAccountType || 'student');
            navigate('/');
        } catch (err) {
            addToast(err.response?.data?.message || 'Login failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        setLoading(true);
        try {
            await register(form);
            if (form.accountType === 'organisation') {
                navigate('/org/dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            addToast(err.response?.data?.message || 'Registration failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const totalSteps = form.accountType === 'organisation' ? 2 : 3; // 0:type, then org: 1:basics, 2:details | student: 1:basics, 2:profile, 3:interests
    const progressPercent = step === 0 ? 0 : (step / totalSteps) * 100;

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#080818' }}>
            {/* Background blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle,#8b5cf6,transparent)' }} />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20"
                    style={{ background: 'radial-gradient(circle,#22d3ee,transparent)' }} />
            </div>

            <div className="w-full max-w-md relative">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
                        style={{ background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)' }}>⚡</div>
                    <h1 className="text-3xl font-black gradient-text">LinkUp</h1>
                    <p className="text-muted text-sm mt-1">Your fest, your network, your squad</p>
                </div>

                <div className="glass-card p-8">
                    {/* Login/Register toggle */}
                    <div className="flex rounded-xl overflow-hidden mb-8 border border-white/10">
                        {['Login', 'Register'].map((t, i) => (
                            <button key={t}
                                onClick={() => { setIsLogin(i === 0); setStep(i === 0 ? 1 : 0); }}
                                className={`flex-1 py-2.5 text-sm font-semibold transition-all ${isLogin === (i === 0) ? 'text-white' : 'text-muted'}`}
                                style={isLogin === (i === 0) ? { background: 'linear-gradient(135deg,#8b5cf6,#22d3ee)' } : {}}>
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* ===== LOGIN ===== */}
                    {isLogin && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Account type toggle for login */}
                            <div className="flex rounded-lg overflow-hidden border border-white/10 mb-4">
                                {[{ v: 'student', l: '👤 Student' }, { v: 'organisation', l: '🏛️ Organisation' }].map(t => (
                                    <button key={t.v} type="button" onClick={() => setForm(f => ({ ...f, loginAccountType: t.v }))}
                                        className="flex-1 py-2 text-xs font-semibold transition-all"
                                        style={(form.loginAccountType || 'student') === t.v ? { background: 'rgba(139,92,246,0.2)', color: '#a78bfa' } : { color: '#64748b' }}>
                                        {t.l}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-2">Email</label>
                                <input className="input-dark" type="email" placeholder="arjun@fest.com"
                                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-2">Password</label>
                                <input className="input-dark" type="password" placeholder="••••••••"
                                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-4">
                                {loading ? 'Logging in...' : 'Login →'}
                            </button>
                            <p className="text-xs text-center text-muted mt-4">
                                Students: arjun@fest.com / pass123 | Orgs: techclub@fest.com / pass123
                            </p>
                        </form>
                    )}

                    {/* ===== REGISTER - Multi-step ===== */}
                    {!isLogin && (
                        <div>
                            {/* Progress bar (only after step 0) */}
                            {step > 0 && (
                                <div className="mb-6">
                                    <div className="flex justify-between text-xs text-muted mb-2">
                                        <span>Step {step} of {totalSteps}</span>
                                        <span style={{ color: '#a78bfa' }}>{form.accountType === 'organisation' ? '🏛️ Organisation' : '👤 Student'}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg,#8b5cf6,#22d3ee)' }} />
                                    </div>
                                </div>
                            )}

                            {/* ---- STEP 0: Account Type ---- */}
                            {step === 0 && (
                                <div>
                                    <h3 className="text-lg font-bold text-center mb-2">I am a...</h3>
                                    <p className="text-muted text-sm text-center mb-6">Choose your account type to get started</p>
                                    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                                        {[
                                            { v: 'student', icon: '👤', title: 'Student', desc: 'Connect, find teams, attend events' },
                                            { v: 'organisation', icon: '🏛️', title: 'Organisation', desc: 'Manage your society, post events' }
                                        ].map(t => (
                                            <button key={t.v} onClick={() => setForm(f => ({ ...f, accountType: t.v }))}
                                                style={{ flex: 1, padding: '18px 10px', borderRadius: 14, border: `2px solid ${form.accountType === t.v ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`, background: form.accountType === t.v ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{t.icon}</div>
                                                <div style={{ fontWeight: 700, marginBottom: 4, color: form.accountType === t.v ? '#a78bfa' : '#f8fafc' }}>{t.title}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>{t.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setStep(1)} className="btn-primary w-full py-3">
                                        Continue as {form.accountType === 'student' ? 'Student' : 'Organisation'} →
                                    </button>
                                </div>
                            )}

                            {/* ---- STEP 1: Basics (both types) ---- */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-muted mb-2">{form.accountType === 'organisation' ? 'Organisation Name' : 'Full Name'}</label>
                                        <input className="input-dark" placeholder={form.accountType === 'organisation' ? 'TechClub NITS' : 'Arjun Sharma'}
                                            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted mb-2">Email</label>
                                        <input className="input-dark" type="email" placeholder="you@fest.com"
                                            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted mb-2">Password</label>
                                        <input className="input-dark" type="password" placeholder="Min 6 characters"
                                            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">← Back</button>
                                        <button onClick={() => {
                                            if (!form.name || !form.email || form.password.length < 6) {
                                                addToast('Please fill all fields correctly', 'error'); return;
                                            }
                                            setStep(2);
                                        }} className="btn-primary flex-1 py-3">Next →</button>
                                    </div>
                                </div>
                            )}

                            {/* ---- STEP 2 (Organisation): Details ---- */}
                            {step === 2 && form.accountType === 'organisation' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-muted mb-2">Category</label>
                                        <select className="input-dark bg-transparent" value={form.orgCategory} onChange={e => setForm(f => ({ ...f, orgCategory: e.target.value }))}>
                                            {ORG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted mb-2">Description</label>
                                        <textarea className="input-dark" rows="3" placeholder="What does your society do?"
                                            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted mb-2">Instagram Handle (optional)</label>
                                        <input className="input-dark" placeholder="techclub_nits" value={form.instagramHandle} onChange={e => setForm(f => ({ ...f, instagramHandle: e.target.value }))} />
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                                        <button onClick={handleRegister} disabled={loading} className="btn-primary flex-1 py-3">
                                            {loading ? 'Creating...' : '🚀 Create Organisation'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ---- STEP 2 (Student): Profile ---- */}
                            {step === 2 && form.accountType === 'student' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-muted mb-2">Department</label>
                                        <select className="input-dark bg-transparent" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                                            <option value="">Select department</option>
                                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted mb-2">Year</label>
                                        <select className="input-dark bg-transparent" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}>
                                            {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-muted mb-2">Bio (optional)</label>
                                        <textarea className="input-dark" rows="3" placeholder="Tell people about yourself..."
                                            value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                                        <button onClick={() => {
                                            if (!form.department) { addToast('Please select department', 'error'); return; }
                                            setStep(3);
                                        }} className="btn-primary flex-1 py-3">Next →</button>
                                    </div>
                                </div>
                            )}

                            {/* ---- STEP 3 (Student): Skills & Interests ---- */}
                            {step === 3 && form.accountType === 'student' && (
                                <div>
                                    <div className="mb-5">
                                        <label className="block text-sm text-muted mb-3">Skills ({form.skills.length} selected)</label>
                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                            {SKILLS.map(s => (
                                                <button key={s} type="button"
                                                    onClick={() => toggleTag(form.skills, s, 'skills')}
                                                    className={`skill-tag cursor-pointer transition-all ${form.skills.includes(s) ? 'border-purple-400 bg-purple-500/30 text-purple-200' : ''}`}>
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-sm text-muted mb-3">Interests ({form.interests.length} selected)</label>
                                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                            {INTERESTS.map(i => (
                                                <button key={i} type="button"
                                                    onClick={() => toggleTag(form.interests, i, 'interests')}
                                                    className={`interest-tag cursor-pointer transition-all ${form.interests.includes(i) ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200' : ''}`}>
                                                    {i}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">← Back</button>
                                        <button onClick={handleRegister} disabled={loading} className="btn-primary flex-1 py-3">
                                            {loading ? 'Creating...' : '🚀 Create Account'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
