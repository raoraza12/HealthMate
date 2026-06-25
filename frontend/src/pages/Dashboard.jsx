import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Activity, HeartPulse, FileText, UploadCloud, Calendar,
    TrendingUp, AlertTriangle, CheckCircle2, Droplets, Thermometer,
    Weight, ArrowRight, Plus, Clock, Sparkles, Users, MessageSquare,
    User as UserIcon, Bot, ChevronRight, Zap, Globe, Shield,
    Star, Send, Eye, Inbox
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   ═══ SUB COMPONENTS ═══
   ═══════════════════════════════════════════════════════════════ */

/* ── Health Score Ring ────────────────────────────────────────── */
const HealthScoreRing = ({ score, delay = 0 }) => {
    const radius = 52;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (score / 100) * circ;
    const getColor = (s) => {
        if (s >= 80) return '#059669';
        if (s >= 60) return '#d97706';
        if (s >= 40) return '#ea580c';
        return '#ef4444';
    };
    const getLabel = (s) => {
        if (s >= 80) return 'Excellent';
        if (s >= 60) return 'Good';
        if (s >= 40) return 'Fair';
        return 'Needs Attention';
    };
    const color = getColor(score);

    return (
        <div className="fade-in" style={{
            display: 'flex', alignItems: 'center', gap: 24,
            animationDelay: `${delay}s`,
        }}>
            <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r={radius} fill="none" stroke={color + '15'} strokeWidth="8" />
                    <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="8"
                        strokeDasharray={circ} strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 2s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                </svg>
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{ fontSize: '2rem', fontWeight: 850, color, lineHeight: 1 }}>{score}</span>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>/ 100</span>
                </div>
            </div>
            <div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Health Score
                </p>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color, marginBottom: 6 }}>
                    {getLabel(score)}
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, maxWidth: 260 }}>
                    Based on your vitals tracking, reports uploaded, and overall health monitoring activity.
                </p>
            </div>
        </div>
    );
};

/* ── Vital Stat Card (premium) ───────────────────────────────── */
const VitalCard = ({ icon: Icon, label, value, unit, accent, trend, delay = 0 }) => (
    <div className="fade-in hm-card hm-card-lift" style={{
        padding: 22, animationDelay: `${delay}s`, cursor: 'default',
        position: 'relative', overflow: 'hidden',
    }}>
        {/* Top color bar */}
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, ${accent}, ${accent}60)`,
        }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 100%)`,
                border: `1.5px solid ${accent}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon style={{ width: 20, height: 20, color: accent }} />
            </div>
            {trend && (
                <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px',
                    borderRadius: 99, 
                    background: trend === 'normal' ? '#ecfdf5' : '#fffbeb',
                    color: trend === 'normal' ? '#059669' : '#d97706',
                    border: `1px solid ${trend === 'normal' ? '#a7f3d0' : '#fde68a'}`,
                }}>
                    {trend === 'normal' ? '✓ Normal' : '⚠ Watch'}
                </span>
            )}
        </div>
        <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, marginBottom: 6 }}>{label}</p>
        {value ? (
            <p style={{ fontSize: '1.6rem', fontWeight: 850, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {value} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{unit}</span>
            </p>
        ) : (
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic' }}>Not logged yet</p>
        )}
    </div>
);

/* ── Summary Stat ─────────────────────────────────────────────── */
const SummaryCard = ({ icon: Icon, value, label, accent, delay = 0 }) => (
    <div className="fade-in hm-card" style={{
        padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16,
        animationDelay: `${delay}s`, position: 'relative', overflow: 'hidden',
    }}>
        <div style={{
            position: 'absolute', top: -15, right: -15, width: 60, height: 60,
            background: accent + '08', borderRadius: '50%', filter: 'blur(15px)',
        }} />
        <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}20 0%, ${accent}08 100%)`,
            border: `1.5px solid ${accent}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon style={{ width: 24, height: 24, color: accent }} />
        </div>
        <div>
            <p style={{ fontSize: '1.75rem', fontWeight: 850, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, marginTop: 3 }}>{label}</p>
        </div>
    </div>
);

/* ── Quick Action Link ───────────────────────────────────────── */
const QuickAction = ({ to, icon: Icon, label, desc, accent, delay = 0 }) => (
    <Link to={to} className="fade-in hm-card hm-card-lift" style={{
        padding: '18px 20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 16,
        animationDelay: `${delay}s`,
    }}>
        <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: `linear-gradient(135deg, ${accent}18, ${accent}08)`,
            border: `1.5px solid ${accent}25`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
            <Icon style={{ width: 20, height: 20, color: accent }} />
        </div>
        <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</h4>
            <p style={{ fontSize: '0.73rem', color: '#94a3b8', lineHeight: 1.4 }}>{desc}</p>
        </div>
        <ChevronRight style={{ width: 16, height: 16, color: '#cbd5e1', flexShrink: 0 }} />
    </Link>
);

/* ── Connected Doctor Chip ───────────────────────────────────── */
const DoctorChip = ({ doc, onChat }) => (
    <div className="hm-card" style={{
        padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
        background: '#fff', border: '1px solid #f1f5f9',
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
                width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                background: doc.role === 'doctor'
                    ? 'linear-gradient(135deg, #0ea5e9, #0284c7)'
                    : 'linear-gradient(135deg, #059669, #0d9488)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '1rem', fontWeight: 750,
                boxShadow: doc.role === 'doctor'
                    ? '0 4px 12px rgba(14,165,233,0.2)'
                    : '0 4px 12px rgba(5,150,105,0.2)',
            }}>
                {doc.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 750, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {doc.role === 'doctor' ? `Dr. ${doc.name}` : doc.name}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                        padding: '2px 7px', borderRadius: 6,
                        background: doc.role === 'doctor' ? '#e0f2fe' : '#ecfdf5',
                        color: doc.role === 'doctor' ? '#0369a1' : '#047857',
                    }}>
                        {doc.role === 'doctor' ? '🩺 Doctor' : '💚 Patient'}
                    </span>
                    {doc.specialty && (
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>• {doc.specialty}</span>
                    )}
                </div>
            </div>
        </div>
        <button
            onClick={() => onChat(doc._id)}
            style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 0', borderRadius: 10,
                background: doc.role === 'doctor' ? '#f0f9ff' : '#ecfdf5',
                border: `1.5px solid ${doc.role === 'doctor' ? '#bae6fd' : '#a7f3d0'}`,
                color: doc.role === 'doctor' ? '#0284c7' : '#059669',
                fontSize: '0.8rem', fontWeight: 650, cursor: 'pointer',
                transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
            <MessageSquare style={{ width: 14, height: 14 }} /> Message
        </button>
    </div>
);

/* ═══════════════════════════════════════════════════════════════
   ═══ MAIN DASHBOARD COMPONENT ═══
   ═══════════════════════════════════════════════════════════════ */
const Dashboard = () => {
    const userRole = localStorage.getItem('userRole') || 'patient';
    const userName = localStorage.getItem('userName') || 'User';
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    // Patient States
    const [vitals, setVitals] = useState([]);
    const [reports, setReports] = useState([]);
    const [friends, setFriends] = useState([]);

    // Doctor States
    const [sharedReports, setSharedReports] = useState([]);
    const [connectedPatients, setConnectedPatients] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const config = { headers: { Authorization: `Bearer ${token}`, 'x-auth-token': token } };
            try {
                if (userRole === 'doctor') {
                    const [sharedRes, patientsRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/reports/shared', config),
                        axios.get('http://localhost:5000/api/friends/list', config),
                    ]);
                    setSharedReports(sharedRes.data);
                    setConnectedPatients(patientsRes.data);
                } else {
                    const [vitalsRes, reportsRes, friendsRes] = await Promise.all([
                        axios.get('http://localhost:5000/api/vitals', config),
                        axios.get('http://localhost:5000/api/reports', config),
                        axios.get('http://localhost:5000/api/friends/list', config).catch(() => ({ data: [] })),
                    ]);
                    setVitals(vitalsRes.data);
                    setReports(reportsRes.data);
                    setFriends(friendsRes.data);
                }
            } catch (err) {
                console.error('Dashboard fetching error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token, userRole]);

    const getGreeting = () => {
        const h = new Date().getHours();
        if (h < 12) return { text: 'Good Morning', emoji: '🌤️' };
        if (h < 17) return { text: 'Good Afternoon', emoji: '☀️' };
        return { text: 'Good Evening', emoji: '🌙' };
    };
    const greeting = getGreeting();

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 48, height: 48, border: '4px solid #d1fae5', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#94a3b8', fontWeight: 500 }}>Loading dashboard data...</p>
        </div>
    );

    // ══════════════════════════════════════════════════════════════
    // ═══ DOCTOR VIEW ═══
    // ══════════════════════════════════════════════════════════════
    if (userRole === 'doctor') {
        return (
            <div style={{ minHeight: '100vh', background: '#f8fafc', paddingBottom: 48 }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(240,249,255,0.95) 0%, rgba(255,255,255,0.97) 40%, rgba(237,233,254,0.7) 100%)',
                    borderBottom: '1px solid #e2e8f0',
                    padding: '32px 36px 28px',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', top: -50, right: -30, width: 200, height: 200, background: 'rgba(14,165,233,0.06)', borderRadius: '50%', filter: 'blur(50px)' }} />
                    <div style={{ position: 'absolute', bottom: -30, left: 80, width: 150, height: 150, background: 'rgba(124,58,237,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />

                    <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <div className="pulse-dot" />
                                <span style={{ color: '#0284c7', fontSize: '0.82rem', fontWeight: 600 }}>
                                    {greeting.emoji} {greeting.text}, Dr. {userName}
                                </span>
                            </div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 850, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4 }}>
                                Doctor Dashboard
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Welcome back. Observe shared patient reports and connection activities.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <Link to="/public-feed" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.875rem', background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}>
                                <Globe style={{ width: 16, height: 16 }} /> Public Cases
                            </Link>
                            <Link to="/connections" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
                                <Users style={{ width: 16, height: 16 }} /> Find Connections
                            </Link>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 28 }}>
                    {/* Summary row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                        <SummaryCard icon={Users} value={connectedPatients.length} label="Connected Patients" accent="#0284c7" delay={0} />
                        <SummaryCard icon={FileText} value={sharedReports.length} label="Reports Shared" accent="#7c3aed" delay={0.1} />
                        <SummaryCard icon={Activity} value="Active" label="System Status" accent="#059669" delay={0.2} />
                    </div>

                    {/* Shared Reports Section */}
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FileText style={{ width: 18, height: 18, color: '#7c3aed' }} /> Shared Patient Reports
                        </h2>

                        {sharedReports.length === 0 ? (
                            <div className="hm-card" style={{ padding: '48px 24px', textAlign: 'center', background: '#fff' }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: 20, background: '#f8fafc',
                                    border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 16px',
                                }}>
                                    <FileText style={{ width: 28, height: 28, color: '#cbd5e1' }} />
                                </div>
                                <p style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>No Shared Reports Yet</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 20 }}>
                                    Patients when connecting will share their health reports directly with you.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {sharedReports.map((report) => (
                                    <div key={report._id} className="hm-card" style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '16px 20px', background: '#fff', border: '1px solid #f1f5f9'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{
                                                width: 42, height: 42, borderRadius: 12, background: '#f3e8ff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <FileText style={{ width: 18, height: 18, color: '#7c3aed' }} />
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: '0.925rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: 3 }}>
                                                    {report.reportType}
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', color: '#94a3b8' }}>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Patient: {report.userId?.name || 'Anonymous'}</span>
                                                    <span>•</span>
                                                    <span>{new Date(report.uploadDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            {report.abnormalValues?.length > 0 && (
                                                <span style={{
                                                    fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: 8,
                                                    background: '#fff1f2', color: '#e11d48'
                                                }}>
                                                    {report.abnormalValues.length} Abnormal Values
                                                </span>
                                            )}
                                            <Link to={`/report/${report._id}`} className="btn-secondary" style={{
                                                padding: '8px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6
                                            }}>
                                                Examine <ArrowRight style={{ width: 14, height: 14 }} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Patient Connections list */}
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users style={{ width: 18, height: 18, color: '#0284c7' }} /> Connected Patients
                        </h2>

                        {connectedPatients.length === 0 ? (
                            <div className="hm-card" style={{ padding: '48px 24px', textAlign: 'center', background: '#fff' }}>
                                <p style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>No Connected Patients</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 18 }}>
                                    Find Patients or wait for connection requests to chat and monitor profiles.
                                </p>
                                <Link to="/connections" className="btn-primary" style={{ display: 'inline-flex', padding: '10px 20px', fontSize: '0.85rem' }}>
                                    Connect Hub
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                                {connectedPatients.map(patient => (
                                    <DoctorChip key={patient._id} doc={patient} onChat={(id) => navigate(`/chat/${id}`)} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════════════════════
    // ═══ PATIENT VIEW (PREMIUM) ═══
    // ══════════════════════════════════════════════════════════════
    const latest = vitals[0] || {};
    const totalAbnormal = reports.reduce((sum, r) => sum + (r.abnormalValues?.length || 0), 0);

    // Calculate health score
    const calcHealthScore = () => {
        let score = 50; // Base
        if (vitals.length > 0) score += 15;
        if (vitals.length >= 5) score += 10;
        if (reports.length > 0) score += 10;
        if (reports.length >= 3) score += 5;
        if (totalAbnormal === 0 && reports.length > 0) score += 10;
        if (totalAbnormal > 0) score -= Math.min(totalAbnormal * 3, 15);
        if (friends.length > 0) score += 5;
        return Math.max(0, Math.min(100, score));
    };
    const healthScore = calcHealthScore();

    const connectedDoctors = friends.filter(f => f.role === 'doctor');
    const connectedPeers = friends.filter(f => f.role === 'patient');

    const patientQuickActions = [
        { to: '/upload', icon: UploadCloud, label: 'Upload Report', desc: 'Upload medical report for AI analysis', accent: '#7c3aed' },
        { to: '/add-vitals', icon: HeartPulse, label: 'Log Vitals', desc: 'Track BP, sugar, weight, heart rate', accent: '#e11d48' },
        { to: '/connections', icon: Users, label: 'Find Doctors', desc: 'Connect with doctors & health peers', accent: '#0ea5e9' },
        { to: '/ai-agent', icon: Bot, label: 'AI Health Agent', desc: 'Ask medical questions to AI assistant', accent: '#059669' },
        { to: '/public-feed', icon: Globe, label: 'Public Cases', desc: 'Browse community health cases', accent: '#d97706' },
        { to: '/chat', icon: MessageSquare, label: 'Chat Room', desc: 'Message your connected friends', accent: '#2563eb' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: 48 }}>

            {/* ═══ PAGE HEADER ═══════════════════════════════════════ */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(236,253,245,0.95) 0%, rgba(255,255,255,0.97) 40%, rgba(224,242,254,0.7) 100%)',
                borderBottom: '1px solid #e2e8f0',
                padding: '32px 36px 28px',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Decorative blobs */}
                <div style={{ position: 'absolute', top: -50, right: -30, width: 220, height: 220, background: 'rgba(5,150,105,0.06)', borderRadius: '50%', filter: 'blur(50px)' }} />
                <div style={{ position: 'absolute', bottom: -40, left: 80, width: 180, height: 180, background: 'rgba(14,165,233,0.05)', borderRadius: '50%', filter: 'blur(40px)' }} />
                <div style={{ position: 'absolute', top: 20, left: '50%', width: 120, height: 120, background: 'rgba(124,58,237,0.04)', borderRadius: '50%', filter: 'blur(30px)' }} />

                <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div className="pulse-dot" />
                            <span style={{ color: '#059669', fontSize: '0.82rem', fontWeight: 600 }}>
                                {greeting.emoji} {greeting.text}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '1.85rem', fontWeight: 850, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>
                            {userName}'s Health Dashboard
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Apni sehat ki poori tasveer ek jagah — track, upload & connect 💚
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Link to="/upload" id="dash-upload-btn" className="btn-primary" style={{ padding: '11px 22px', fontSize: '0.875rem' }}>
                            <UploadCloud style={{ width: 16, height: 16 }} /> Upload Report
                        </Link>
                        <Link to="/add-vitals" id="dash-vitals-btn" className="btn-secondary" style={{ padding: '11px 22px', fontSize: '0.875rem' }}>
                            <Plus style={{ width: 16, height: 16 }} /> Add Vitals
                        </Link>
                    </div>
                </div>
            </div>

            <div style={{ padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: 28 }}>

                {/* ═══ TOP ROW: Health Score + Summary Stats ═══════════ */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="profile-two-col">
                    {/* Health Score */}
                    <div className="hm-card" style={{
                        padding: 28, display: 'flex', alignItems: 'center',
                        background: 'linear-gradient(135deg, rgba(236,253,245,0.4) 0%, #fff 50%, rgba(237,233,254,0.2) 100%)',
                    }}>
                        <HealthScoreRing score={healthScore} />
                    </div>

                    {/* Summary Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <SummaryCard icon={FileText} value={reports.length} label="Total Reports" accent="#7c3aed" delay={0} />
                        <SummaryCard icon={HeartPulse} value={vitals.length} label="Vitals Logged" accent="#e11d48" delay={0.08} />
                        <SummaryCard icon={AlertTriangle} value={totalAbnormal} label="Abnormal Flags" accent="#d97706" delay={0.16} />
                        <SummaryCard icon={Users} value={friends.length} label="Connections" accent="#0ea5e9" delay={0.24} />
                    </div>
                </div>

                {/* ═══ LATEST VITALS ═════════════════════════════════ */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TrendingUp style={{ width: 18, height: 18, color: '#059669' }} />
                            Latest Vitals
                        </h2>
                        <Link to="/add-vitals" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                            Add New <ArrowRight style={{ width: 13, height: 13 }} />
                        </Link>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14 }}>
                        <VitalCard icon={HeartPulse} label="Blood Pressure" value={latest.bp} unit="mmHg" accent="#e11d48" trend={latest.bp ? 'normal' : null} delay={0} />
                        <VitalCard icon={Droplets} label="Blood Sugar" value={latest.sugar} unit="mg/dL" accent="#d97706" trend={latest.sugar ? (latest.sugar > 140 ? 'watch' : 'normal') : null} delay={0.06} />
                        <VitalCard icon={Weight} label="Weight" value={latest.weight} unit="kg" accent="#0ea5e9" trend={latest.weight ? 'normal' : null} delay={0.12} />
                        <VitalCard icon={Activity} label="Heart Rate" value={latest.heartRate} unit="bpm" accent="#7c3aed" trend={latest.heartRate ? (latest.heartRate > 100 ? 'watch' : 'normal') : null} delay={0.18} />
                        <VitalCard icon={Thermometer} label="Temperature" value={latest.temperature} unit="°F" accent="#ea580c" trend={latest.temperature ? (latest.temperature > 99.5 ? 'watch' : 'normal') : null} delay={0.24} />
                    </div>
                </div>

                {/* ═══ TWO COLUMN: Reports + Sidebar ═════════════════ */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'start' }} className="profile-two-col">

                    {/* LEFT: Recent Reports */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FileText style={{ width: 18, height: 18, color: '#7c3aed' }} />
                                Recent Reports
                            </h2>
                            <Link to="/timeline" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                                View All <ArrowRight style={{ width: 13, height: 13 }} />
                            </Link>
                        </div>

                        {reports.length === 0 ? (
                            <div className="hm-card" style={{ padding: '52px 24px', textAlign: 'center' }}>
                                <div style={{
                                    width: 68, height: 68, borderRadius: 22, background: '#f8fafc',
                                    border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 16px',
                                }}>
                                    <UploadCloud style={{ width: 30, height: 30, color: '#cbd5e1' }} />
                                </div>
                                <p style={{ fontWeight: 750, color: 'var(--text-secondary)', marginBottom: 6, fontSize: '0.95rem' }}>Abhi tak koi report nahi</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.6 }}>
                                    Apni pehli medical report upload karein aur AI analysis paayein
                                </p>
                                <Link to="/upload" className="btn-primary" style={{ display: 'inline-flex', padding: '11px 24px', fontSize: '0.875rem' }}>
                                    <UploadCloud style={{ width: 15, height: 15 }} /> Upload First Report
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {reports.slice(0, 5).map((report, i) => (
                                    <Link
                                        to={`/report/${report._id}`}
                                        key={report._id}
                                        id={`report-${report._id}`}
                                        className="hm-card hm-card-lift fade-in"
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '16px 20px', textDecoration: 'none',
                                            animationDelay: `${i * 0.07}s`,
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{
                                                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                                                background: 'linear-gradient(135deg, #ede9fe, #f3e8ff)',
                                                border: '1px solid #ddd6fe',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <FileText style={{ width: 18, height: 18, color: '#7c3aed' }} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{report.reportType}</p>
                                                <p style={{ color: '#94a3b8', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                                                    <Clock style={{ width: 11, height: 11 }} />
                                                    {new Date(report.uploadDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {report.abnormalValues?.length > 0 && (
                                                <span style={{
                                                    fontSize: '0.73rem', fontWeight: 600, padding: '4px 10px',
                                                    borderRadius: 99, background: '#fffbeb', color: '#b45309',
                                                    border: '1px solid #fde68a',
                                                }}>
                                                    ⚠ {report.abnormalValues.length} Abnormal
                                                </span>
                                            )}
                                            <ArrowRight style={{ width: 15, height: 15, color: '#cbd5e1' }} />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Quick Actions + Connected Doctors */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                        {/* Quick Actions */}
                        <div>
                            <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Zap style={{ width: 18, height: 18, color: '#d97706' }} /> Quick Actions
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {patientQuickActions.map((qa, i) => (
                                    <QuickAction key={qa.to} {...qa} delay={i * 0.06} />
                                ))}
                            </div>
                        </div>

                        {/* Connected Doctors */}
                        {connectedDoctors.length > 0 && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                    <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Star style={{ width: 18, height: 18, color: '#0ea5e9' }} /> My Doctors
                                        <span style={{
                                            fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px',
                                            borderRadius: 99, background: '#e0f2fe', color: '#0369a1',
                                        }}>
                                            {connectedDoctors.length}
                                        </span>
                                    </h2>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {connectedDoctors.slice(0, 3).map(doc => (
                                        <DoctorChip key={doc._id} doc={doc} onChat={(id) => navigate(`/chat/${id}`)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Connected Peers */}
                        {connectedPeers.length > 0 && (
                            <div>
                                <h2 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Users style={{ width: 18, height: 18, color: '#059669' }} /> Health Peers
                                    <span style={{
                                        fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px',
                                        borderRadius: 99, background: '#ecfdf5', color: '#047857',
                                    }}>
                                        {connectedPeers.length}
                                    </span>
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {connectedPeers.slice(0, 3).map(peer => (
                                        <DoctorChip key={peer._id} doc={peer} onChat={(id) => navigate(`/chat/${id}`)} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ AI DISCLAIMER ════════════════════════════════ */}
                <div style={{
                    background: 'linear-gradient(135deg, #fffbeb 0%, #fff7ed 50%, #fef3c7 100%)',
                    border: '1px solid #fde68a', borderRadius: 18,
                    padding: '18px 22px', display: 'flex', gap: 16, alignItems: 'flex-start',
                }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12, background: '#fef3c7',
                        border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <Sparkles style={{ width: 18, height: 18, color: '#d97706' }} />
                    </div>
                    <div>
                        <p style={{ fontWeight: 750, color: '#92400e', marginBottom: 4, fontSize: '0.875rem' }}>⚕️ Zaroori Disclaimer</p>
                        <p style={{ color: '#78350f', fontSize: '0.82rem', lineHeight: 1.6 }}>
                            HealthMate ki AI analysis sirf samajhne aur awareness ke liye hai. Yeh kisi doctor ki advice ki jagah nahi le sakti.
                            Kisi bhi sehti maslay ke liye <strong>apne qualified doctor se raabta karein</strong>. Koi bhi dawai ya diet change doctor ki salah ke baghair na karein.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
