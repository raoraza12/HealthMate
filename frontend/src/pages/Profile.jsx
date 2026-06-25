import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import maleAvatar from '../assets/avatar_male.png';
import femaleAvatar from '../assets/avatar_female.png';
import {
    User, Mail, Shield, Phone, Stethoscope, FileText, ToggleLeft, ToggleRight,
    Save, Activity, HeartPulse, Users, MessageSquare, AlertTriangle, Clock,
    TrendingUp, CalendarDays, Globe, ArrowRight, Sparkles, ChevronRight,
    Bot, UploadCloud, Eye, Send, Inbox, CheckCircle2, Star, Zap
} from 'lucide-react';

/* ── Animated Stat Ring ──────────────────────────────────────── */
const StatRing = ({ value, label, icon: Icon, accent, maxVal = 100, delay = 0 }) => {
    const pct = maxVal > 0 ? Math.min((value / maxVal) * 100, 100) : 0;
    const radius = 38;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (pct / 100) * circ;

    return (
        <div className="fade-in hm-card hm-card-lift" style={{
            padding: '24px 20px', textAlign: 'center', cursor: 'default',
            animationDelay: `${delay}s`, position: 'relative', overflow: 'hidden',
        }}>
            {/* Decorative glow */}
            <div style={{
                position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                background: accent + '10', borderRadius: '50%', filter: 'blur(20px)',
            }} />
            <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 14px' }}>
                <svg width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="44" cy="44" r={radius} fill="none" stroke={accent + '15'} strokeWidth="6" />
                    <circle cx="44" cy="44" r={radius} fill="none" stroke={accent} strokeWidth="6"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                </svg>
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexDirection: 'column',
                }}>
                    <Icon style={{ width: 20, height: 20, color: accent, marginBottom: 2 }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</span>
                </div>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{label}</p>
        </div>
    );
};

/* ── Quick Action Card ───────────────────────────────────────── */
const QuickAction = ({ to, icon: Icon, label, desc, accent, delay = 0 }) => (
    <Link to={to} className="fade-in hm-card hm-card-lift" style={{
        padding: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16,
        animationDelay: `${delay}s`, cursor: 'pointer',
    }}>
        <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 100%)`,
            border: `1.5px solid ${accent}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon style={{ width: 22, height: 22, color: accent }} />
        </div>
        <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: 3 }}>{label}</h4>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>{desc}</p>
        </div>
        <ChevronRight style={{ width: 16, height: 16, color: '#cbd5e1', flexShrink: 0 }} />
    </Link>
);

/* ── Activity Item ───────────────────────────────────────────── */
const ActivityItem = ({ activity, isLast }) => {
    const iconMap = {
        FileText, MessageSquare, HeartPulse, Users, Activity,
    };
    const IconComp = iconMap[activity.icon] || Activity;

    return (
        <div style={{
            display: 'flex', gap: 14, position: 'relative',
            paddingBottom: isLast ? 0 : 20,
        }}>
            {/* Timeline line */}
            {!isLast && (
                <div style={{
                    position: 'absolute', left: 19, top: 40, bottom: 0, width: 2,
                    background: `linear-gradient(to bottom, ${activity.accent}30, transparent)`,
                }} />
            )}
            <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: activity.accent + '15', border: `1.5px solid ${activity.accent}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <IconComp style={{ width: 17, height: 17, color: activity.accent }} />
            </div>
            <div style={{ flex: 1, paddingTop: 2 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 650, color: 'var(--text-secondary)', marginBottom: 3 }}>
                    {activity.title}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: 4 }}>
                    {activity.subtitle}
                </p>
                <span style={{
                    fontSize: '0.68rem', color: '#cbd5e1', fontWeight: 500,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                }}>
                    <Clock style={{ width: 10, height: 10 }} />
                    {new Date(activity.date).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
            </div>
        </div>
    );
};

/* ── Friend Card (mini) ──────────────────────────────────────── */
const FriendChip = ({ friend }) => (
    <Link to={`/chat/${friend._id}`} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
        borderRadius: 14, background: '#f8fafc', border: '1px solid #f1f5f9',
        textDecoration: 'none', transition: 'all 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.borderColor = '#bae6fd'; }}
    onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#f1f5f9'; }}
    >
        <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: friend.role === 'doctor'
                ? 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                : 'linear-gradient(135deg, #059669, #0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '0.8rem', fontWeight: 700,
        }}>
            {friend.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {friend.name}
            </p>
            <span style={{
                fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                color: friend.role === 'doctor' ? '#0369a1' : '#047857',
            }}>
                {friend.role === 'doctor' ? `Dr. • ${friend.specialty || 'General'}` : 'Patient'}
            </span>
        </div>
        <MessageSquare style={{ width: 14, height: 14, color: '#94a3b8', flexShrink: 0 }} />
    </Link>
);

/* ════════════════════════════════════════════════════════════════
   ═══ MAIN PROFILE DASHBOARD COMPONENT ═══
   ════════════════════════════════════════════════════════════════ */
const Profile = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [previewAvatar, setPreviewAvatar] = useState(null);

    // Editable form state
    const [form, setForm] = useState({
        specialty: '', bio: '', phone: '', isAvailable: true, name: '', gender: 'male', avatar: ''
    });

    const token = localStorage.getItem('token');
    const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

    const fetchDashboard = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/dashboard-stats', axiosConfig);
            setData(res.data);
            setForm({
                specialty: res.data.user.specialty || '',
                bio: res.data.user.bio || '',
                phone: res.data.user.phone || '',
                isAvailable: res.data.user.isAvailable !== false,
                name: res.data.user.name || '',
                gender: res.data.user.gender || 'male',
                avatar: res.data.user.avatar || '',
            });
        } catch (err) {
            console.error('Dashboard stats error:', err);
            toast.error('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDashboard(); }, []);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            return toast.error('File size maximum limit is 5MB.');
        }

        setPreviewAvatar(URL.createObjectURL(file));
        setUploadingAvatar(true);

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const res = await axios.post('http://localhost:5000/api/auth/avatar', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            localStorage.setItem('userAvatar', res.data.avatar);
            setForm(prev => ({ ...prev, avatar: res.data.avatar }));
            toast.success('Tasveer successfully upload ho gayi! 📸');
        } catch (err) {
            console.error('Error uploading avatar:', err);
            toast.error(err.response?.data?.msg || 'Failed to upload image.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.put('http://localhost:5000/api/auth/profile', form, axiosConfig);
            localStorage.setItem('userName', res.data.name);
            localStorage.setItem('userGender', res.data.gender || 'male');
            localStorage.setItem('userAvatar', res.data.avatar || '');
            
            toast.success('Profile updated successfully! 💾');
            setEditMode(false);
            fetchDashboard();
        } catch (err) {
            console.error('Error updating profile:', err);
            toast.error('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
                <div style={{ width: 48, height: 48, border: '4px solid #d1fae5', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: '#94a3b8', fontWeight: 500 }}>Loading your dashboard...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <p style={{ color: '#ef4444', fontWeight: 600 }}>Unable to load dashboard data.</p>
            </div>
        );
    }

    const { user, stats, friends, activities } = data;
    const isDoctor = user.role === 'doctor';
    const initials = user.name ? user.name[0].toUpperCase() : 'U';

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return { text: 'Good Morning', emoji: '🌤️' };
        if (h < 17) return { text: 'Good Afternoon', emoji: '☀️' };
        return { text: 'Good Evening', emoji: '🌙' };
    };
    const greeting = getGreeting();

    const quickActions = isDoctor ? [
        { to: '/public-feed', icon: Globe, label: 'Public Cases', desc: 'Browse publicly shared patient reports', accent: '#0ea5e9' },
        { to: '/connections', icon: Users, label: 'Find Connections', desc: 'Discover patients & professionals', accent: '#7c3aed' },
        { to: '/chat', icon: MessageSquare, label: 'Chat Room', desc: 'Message your connected patients', accent: '#d97706' },
        { to: '/ai-agent', icon: Bot, label: 'AI Medical Assistant', desc: 'Ask medical queries to AI agent', accent: '#059669' },
    ] : [
        { to: '/upload', icon: UploadCloud, label: 'Upload Report', desc: 'Upload and get AI analysis', accent: '#7c3aed' },
        { to: '/add-vitals', icon: HeartPulse, label: 'Log Vitals', desc: 'Track BP, sugar, weight & more', accent: '#e11d48' },
        { to: '/connections', icon: Users, label: 'Find Doctors', desc: 'Connect with doctors & patients', accent: '#0ea5e9' },
        { to: '/ai-agent', icon: Bot, label: 'AI Health Assistant', desc: 'Get medical guidance from AI', accent: '#059669' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: 48 }}>

            {/* ═══ HEADER BANNER ═══════════════════════════════════════ */}
            <div style={{
                background: isDoctor
                    ? 'linear-gradient(135deg, rgba(240,249,255,0.95) 0%, rgba(255,255,255,0.97) 40%, rgba(237,233,254,0.7) 100%)'
                    : 'linear-gradient(135deg, rgba(236,253,245,0.95) 0%, rgba(255,255,255,0.97) 40%, rgba(224,242,254,0.7) 100%)',
                borderBottom: '1px solid #e2e8f0',
                padding: '32px 36px 28px',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: -60, right: -30, width: 220, height: 220, background: isDoctor ? 'rgba(14,165,233,0.06)' : 'rgba(5,150,105,0.06)', borderRadius: '50%', filter: 'blur(50px)' }} />
                <div style={{ position: 'absolute', bottom: -40, left: 60, width: 180, height: 180, background: 'rgba(124,58,237,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{
                        width: 88, height: 88, borderRadius: 24, flexShrink: 0,
                        overflow: 'hidden',
                        boxShadow: isDoctor
                            ? '0 10px 30px rgba(14,165,233,0.25)'
                            : '0 10px 30px rgba(5,150,105,0.25)',
                        border: '3px solid rgba(255,255,255,0.8)',
                        background: '#f8fafc',
                    }}>
                        <img 
                            src={user.avatar || (user.gender === 'female' ? femaleAvatar : maleAvatar)} 
                            alt={user.name} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <div className="pulse-dot" />
                            <span style={{ color: isDoctor ? '#0284c7' : '#059669', fontSize: '0.82rem', fontWeight: 600 }}>
                                {greeting.emoji} {greeting.text}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 850, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>
                            {isDoctor ? `Dr. ${user.name}` : user.name}
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                            <span style={{
                                fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                                padding: '4px 12px', borderRadius: 8,
                                background: isDoctor ? '#e0f2fe' : '#ecfdf5',
                                color: isDoctor ? '#0369a1' : '#047857',
                                border: `1px solid ${isDoctor ? '#bae6fd' : '#a7f3d0'}`,
                            }}>
                                {isDoctor ? '🩺 Doctor' : '💚 Patient'}
                            </span>
                            {isDoctor && user.specialty && (
                                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 550 }}>
                                    • {user.specialty}
                                </span>
                            )}
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CalendarDays style={{ width: 13, height: 13 }} />
                                Joined {stats.daysSinceJoined === 0 ? 'today' : `${stats.daysSinceJoined}d ago`}
                            </span>
                        </div>
                    </div>

                    {/* Edit profile button */}
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={editMode ? 'btn-danger' : 'btn-secondary'}
                        style={{ padding: '10px 20px', fontSize: '0.85rem', alignSelf: 'flex-start' }}
                    >
                        {editMode ? '✕ Cancel' : '✏️ Edit Profile'}
                    </button>
                </div>
            </div>

            {/* ═══ MAIN CONTENT ════════════════════════════════════════ */}
            <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* ── STATS RINGS ROW ────────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
                    <StatRing icon={FileText} value={stats.totalReports} label="Reports" accent="#7c3aed" maxVal={Math.max(stats.totalReports, 10)} delay={0} />
                    <StatRing icon={HeartPulse} value={stats.totalVitals} label="Vitals Logged" accent="#e11d48" maxVal={Math.max(stats.totalVitals, 10)} delay={0.08} />
                    <StatRing icon={Users} value={stats.totalFriends} label="Connections" accent="#0ea5e9" maxVal={Math.max(stats.totalFriends, 10)} delay={0.16} />
                    <StatRing icon={Send} value={stats.totalMessagesSent} label="Msgs Sent" accent="#d97706" maxVal={Math.max(stats.totalMessagesSent, 10)} delay={0.24} />
                    <StatRing icon={AlertTriangle} value={stats.totalAbnormal} label="Abnormal Flags" accent="#ef4444" maxVal={Math.max(stats.totalAbnormal, 10)} delay={0.32} />
                    {isDoctor && <StatRing icon={Eye} value={stats.sharedWithMe} label="Shared Reports" accent="#8b5cf6" maxVal={Math.max(stats.sharedWithMe, 10)} delay={0.4} />}
                </div>

                {/* ── TWO-COLUMN LAYOUT ──────────────────────────────── */}
                <div className="profile-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

                    {/* LEFT: Quick Actions + Friends */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* Quick Actions */}
                        <div>
                            <h2 style={{
                                fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                <Zap style={{ width: 18, height: 18, color: '#d97706' }} /> Quick Actions
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {quickActions.map((qa, i) => (
                                    <QuickAction key={qa.to} {...qa} delay={i * 0.08} />
                                ))}
                            </div>
                        </div>

                        {/* Friends / Connections */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                <h2 style={{
                                    fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                }}>
                                    <Users style={{ width: 18, height: 18, color: '#0ea5e9' }} /> My Connections
                                    <span style={{
                                        fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
                                        borderRadius: 99, background: '#e0f2fe', color: '#0369a1',
                                    }}>
                                        {friends.length}
                                    </span>
                                </h2>
                                <Link to="/connections" style={{
                                    fontSize: '0.78rem', color: '#0ea5e9', fontWeight: 600,
                                    textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4,
                                }}>
                                    View All <ArrowRight style={{ width: 13, height: 13 }} />
                                </Link>
                            </div>

                            {friends.length === 0 ? (
                                <div className="hm-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
                                        background: '#f0f9ff', border: '2px dashed #bae6fd',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Users style={{ width: 24, height: 24, color: '#93c5fd' }} />
                                    </div>
                                    <p style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 4 }}>No connections yet</p>
                                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: 16 }}>
                                        Discover doctors and patients to connect with
                                    </p>
                                    <Link to="/connections" className="btn-primary" style={{ display: 'inline-flex', padding: '9px 18px', fontSize: '0.82rem' }}>
                                        <Users style={{ width: 14, height: 14 }} /> Explore Connections
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {friends.slice(0, 5).map(f => <FriendChip key={f._id} friend={f} />)}
                                    {friends.length > 5 && (
                                        <Link to="/connections" style={{
                                            fontSize: '0.78rem', color: '#0ea5e9', fontWeight: 600,
                                            textDecoration: 'none', textAlign: 'center', padding: '8px 0',
                                        }}>
                                            +{friends.length - 5} more connections →
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Activity Timeline + Account Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* Recent Activity */}
                        <div>
                            <h2 style={{
                                fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                <Activity style={{ width: 18, height: 18, color: '#059669' }} /> Recent Activity
                            </h2>

                            {activities.length === 0 ? (
                                <div className="hm-card" style={{ padding: '36px 20px', textAlign: 'center' }}>
                                    <div style={{
                                        width: 56, height: 56, borderRadius: 16, margin: '0 auto 12px',
                                        background: '#ecfdf5', border: '2px dashed #a7f3d0',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Activity style={{ width: 24, height: 24, color: '#6ee7b7' }} />
                                    </div>
                                    <p style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 4 }}>No activity yet</p>
                                    <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                        Upload reports, log vitals, or chat to see your activity here
                                    </p>
                                </div>
                            ) : (
                                <div className="hm-card" style={{ padding: 20 }}>
                                    {activities.map((act, i) => (
                                        <ActivityItem key={i} activity={act} isLast={i === activities.length - 1} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Account Summary Card */}
                        <div className="hm-card fade-in" style={{
                            padding: 24,
                            background: 'linear-gradient(135deg, rgba(236,253,245,0.5) 0%, rgba(255,255,255,1) 50%, rgba(237,233,254,0.3) 100%)',
                        }}>
                            <h3 style={{
                                fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 18,
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                <Shield style={{ width: 17, height: 17, color: '#059669' }} /> Account Overview
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { icon: Mail, label: 'Email', value: user.email, accent: '#0ea5e9' },
                                    { icon: Phone, label: 'Phone', value: user.phone || 'Not set', accent: '#7c3aed' },
                                    { icon: CalendarDays, label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' }), accent: '#059669' },
                                    ...(isDoctor ? [
                                        { icon: Stethoscope, label: 'Specialty', value: user.specialty || 'Not set', accent: '#d97706' },
                                        { icon: CheckCircle2, label: 'Availability', value: user.isAvailable ? '✅ Available' : '❌ Unavailable', accent: '#059669' },
                                    ] : []),
                                    { icon: Inbox, label: 'Unread Messages', value: `${stats.unreadMessages} messages`, accent: '#e11d48' },
                                    { icon: Globe, label: 'Public Reports', value: `${stats.publicReports} shared publicly`, accent: '#8b5cf6' },
                                ].map(({ icon: Ic, label, value, accent }, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '10px 14px', borderRadius: 12,
                                        background: '#f8fafc', border: '1px solid #f1f5f9',
                                    }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                                            background: accent + '12', border: `1px solid ${accent}20`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Ic style={{ width: 15, height: 15, color: accent }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, marginBottom: 1 }}>{label}</p>
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 650 }}>{value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* AI Tip Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%)',
                            border: '1px solid #a7f3d0', borderRadius: 18,
                            padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start',
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                                background: '#d1fae5', border: '1px solid #a7f3d0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Sparkles style={{ width: 18, height: 18, color: '#059669' }} />
                            </div>
                            <div>
                                <p style={{ fontWeight: 750, color: '#065f46', marginBottom: 4, fontSize: '0.875rem' }}>
                                    💡 Pro Tip
                                </p>
                                <p style={{ color: '#047857', fontSize: '0.8rem', lineHeight: 1.6 }}>
                                    {isDoctor
                                        ? 'Keep your profile updated with your specialty and bio — patients trust doctors with detailed profiles!'
                                        : 'Upload your reports regularly and connect with doctors for personalized health advice. Use the AI assistant for quick medical queries.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── EDIT PROFILE SECTION ─────────────────────────────── */}
                {editMode && (
                    <div className="hm-card fade-in" style={{
                        padding: 32, border: '2px solid #bae6fd',
                        background: 'linear-gradient(135deg, rgba(240,249,255,0.5) 0%, #fff 100%)',
                    }}>
                        <h3 style={{
                            fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 24,
                            display: 'flex', alignItems: 'center', gap: 8,
                            borderBottom: '1px solid #f1f5f9', paddingBottom: 14,
                        }}>
                            ✏️ Edit Profile Settings
                        </h3>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Profile Picture Upload */}
                            <div style={{
                                background: '#f8fafc',
                                padding: 20,
                                borderRadius: 16,
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 20,
                                flexWrap: 'wrap'
                            }}>
                                <div style={{
                                    width: 68, height: 68, borderRadius: '50%',
                                    overflow: 'hidden', border: '2.5px solid #fff',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    background: '#f1f5f9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {uploadingAvatar ? (
                                        <div style={{ width: 22, height: 22, border: '3px solid #059669', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    ) : (
                                        <img 
                                            src={previewAvatar || (form.avatar || (form.gender === 'female' ? femaleAvatar : maleAvatar))} 
                                            alt="Avatar Preview" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 200 }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: 4 }}>Profile Picture (Tasveer)</h4>
                                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: 12 }}>Apni gallery se ek pyari pic upload karein ya default AI avatar rehne dein.</p>
                                    <label style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '8px 18px', borderRadius: 10, background: '#fff',
                                        border: '1.5px solid #cbd5e1', color: 'var(--text-secondary)', fontSize: '0.8rem',
                                        fontWeight: 650, cursor: 'pointer', transition: 'all 0.2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                    >
                                        <UploadCloud style={{ width: 14, height: 14, color: '#64748b' }} /> Choose Photo
                                        <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                                    </label>
                                    {form.avatar && (
                                        <button
                                            type="button"
                                            onClick={() => setForm(prev => ({ ...prev, avatar: '' }))}
                                            style={{
                                                marginLeft: 12, background: 'none', border: 'none',
                                                color: '#ef4444', fontSize: '0.78rem', fontWeight: 600,
                                                cursor: 'pointer', textDecoration: 'underline'
                                            }}
                                        >
                                            Remove Photo
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Name & Gender inputs */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 7 }}>Full Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <User style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                            placeholder="Aapka naam"
                                            className="hm-input"
                                            style={{ paddingLeft: 42 }}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 7 }}>Gender (Jins)</label>
                                    <select
                                        value={form.gender}
                                        onChange={e => setForm({ ...form, gender: e.target.value })}
                                        className="hm-input"
                                        style={{ height: 44, padding: '0 14px', fontWeight: 550, color: 'var(--text-secondary)' }}
                                    >
                                        <option value="male">🙋‍♂️ Male (Mera)</option>
                                        <option value="female">🙋‍♀️ Female (Meri)</option>
                                    </select>
                                </div>
                            </div>
                            {/* Phone */}
                            <div style={{ display: 'grid', gridTemplateColumns: isDoctor ? '1fr 1fr' : '1fr', gap: 20 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 7 }}>Phone Number</label>
                                    <div style={{ position: 'relative' }}>
                                        <Phone style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
                                        <input
                                            type="text"
                                            value={form.phone}
                                            onChange={e => setForm({ ...form, phone: e.target.value })}
                                            placeholder="e.g. +92 300 1234567"
                                            className="hm-input"
                                            style={{ paddingLeft: 42 }}
                                        />
                                    </div>
                                </div>
                                {isDoctor && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 7 }}>Medical Specialty</label>
                                        <div style={{ position: 'relative' }}>
                                            <Stethoscope style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
                                            <input
                                                type="text"
                                                value={form.specialty}
                                                onChange={e => setForm({ ...form, specialty: e.target.value })}
                                                placeholder="e.g. Cardiologist, General Physician"
                                                className="hm-input"
                                                style={{ paddingLeft: 42 }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Doctor availability toggle */}
                            {isDoctor && (
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: '#f8fafc', padding: '16px 20px', borderRadius: 14,
                                    border: '1px solid #e2e8f0',
                                }}>
                                    <div>
                                        <h4 style={{ fontSize: '0.875rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: 3 }}>Available for Patients</h4>
                                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Disable if you're not accepting connections.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, isAvailable: !form.isAvailable })}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: form.isAvailable ? '#059669' : '#94a3b8' }}
                                    >
                                        {form.isAvailable
                                            ? <ToggleRight style={{ width: 44, height: 44 }} />
                                            : <ToggleLeft style={{ width: 44, height: 44 }} />
                                        }
                                    </button>
                                </div>
                            )}

                            {/* Doctor Bio */}
                            {isDoctor && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 7 }}>Doctor Biography</label>
                                    <div style={{ position: 'relative' }}>
                                        <FileText style={{ position: 'absolute', left: 14, top: 14, width: 16, height: 16, color: '#94a3b8' }} />
                                        <textarea
                                            value={form.bio}
                                            onChange={e => setForm({ ...form, bio: e.target.value })}
                                            placeholder="Explain your work experience, clinic locations, timing details..."
                                            className="hm-input"
                                            style={{ paddingLeft: 42, paddingTop: 12, minHeight: 120, resize: 'vertical' }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Theme Settings Selector */}
                            <div style={{
                                background: 'var(--bg-subtle)',
                                padding: 20,
                                borderRadius: 16,
                                border: '1px solid var(--border)',
                                marginTop: 10
                            }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: 6 }}>App Theme (Rang)</h4>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 14 }}>HealthMate ka visual style customize karein. Aapko kaunsa theme sabse attractive lagta hai?</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
                                    {[
                                        { id: 'mint', label: '🍃 Clean Mint', primary: '#059669', bg: 'var(--bg-surface)' },
                                        { id: 'aura', label: '🔮 Aura Violet', primary: '#7c3aed', bg: 'var(--bg-surface)' },
                                        { id: 'cyber', label: '🌌 Cyber Dark', primary: '#0ea5e9', bg: 'var(--bg-surface)' },
                                        { id: 'ocean', label: '🌊 Deep Ocean', primary: '#3b82f6', bg: 'var(--bg-surface)' }
                                    ].map(themeOpt => {
                                        const isSelected = (localStorage.getItem('appTheme') || 'mint') === themeOpt.id;
                                        return (
                                            <button
                                                key={themeOpt.id}
                                                type="button"
                                                onClick={() => {
                                                    localStorage.setItem('appTheme', themeOpt.id);
                                                    document.documentElement.className = '';
                                                    if (themeOpt.id !== 'mint') {
                                                        document.documentElement.classList.add(`theme-${themeOpt.id}`);
                                                    }
                                                    window.dispatchEvent(new Event('storage'));
                                                    toast.success(`${themeOpt.label} theme applied! 🎨`);
                                                }}
                                                style={{
                                                    padding: '12px 14px',
                                                    borderRadius: 12,
                                                    border: `2px solid ${isSelected ? themeOpt.primary : 'var(--border)'}`,
                                                    background: themeOpt.bg,
                                                    color: 'var(--text-primary)',
                                                    cursor: 'pointer',
                                                    fontWeight: 700,
                                                    fontSize: '0.82rem',
                                                    textAlign: 'center',
                                                    boxShadow: isSelected ? `0 4px 12px ${themeOpt.primary}25` : 'none',
                                                    transition: 'all 0.2s',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 6
                                                }}
                                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = themeOpt.primary; }}
                                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
                                            >
                                                <div style={{ width: 18, height: 18, borderRadius: '50%', background: themeOpt.primary, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                                                {themeOpt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={saving}
                                className="btn-primary"
                                style={{
                                    width: 'fit-content', display: 'flex', alignItems: 'center', gap: 8,
                                    alignSelf: 'flex-end', padding: '12px 28px', opacity: saving ? 0.7 : 1,
                                }}
                            >
                                <Save style={{ width: 17, height: 17 }} /> {saving ? 'Saving...' : 'Save Settings'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
