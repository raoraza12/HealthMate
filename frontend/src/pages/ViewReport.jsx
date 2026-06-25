import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import {
    FileText, ArrowLeft, AlertTriangle, Stethoscope, UtensilsCrossed,
    Lightbulb, Globe, Languages, ExternalLink, Loader2, Trash2
} from 'lucide-react';

const Section = ({ icon: Icon, title, items = [], accent }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="hm-card" style={{ padding: 20, borderLeft: `3px solid ${accent}40` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: accent + '15', border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon style={{ width: 16, height: 16, color: accent }} />
                </div>
                <h3 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{title}</h3>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: accent, flexShrink: 0, marginTop: 6 }} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ViewReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lang, setLang] = useState('english');
    const [deleting, setDeleting] = useState(false);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/reports/${id}`, { headers: { 'x-auth-token': token } });
                setReport(res.data);
            } catch (err) {
                toast.error('Report nahi mili.');
                navigate('/dashboard');
            } finally { setLoading(false); }
        };
        fetchReport();
    }, [id, token, navigate]);

    const handleDelete = async () => {
        if (!window.confirm('Kya aap is report ko hamesha ke liye delete karna chahte hain?')) return;
        setDeleting(true);
        try {
            await axios.delete(`http://localhost:5000/api/reports/${id}`, { headers: { 'x-auth-token': token } });
            toast.success('Report delete ho gayi.');
            navigate('/dashboard');
        } catch (err) {
            toast.error('Delete fail hua.');
            setDeleting(false);
        }
    };

    const isPdf = report?.fileUrl?.toLowerCase().includes('.pdf') || report?.fileUrl?.toLowerCase().includes('pdf');

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
            <Loader2 style={{ width: 40, height: 40, color: '#059669', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#94a3b8', fontWeight: 500 }}>Report load ho rahi hai...</p>
        </div>
    );

    if (!report) return null;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: 48 }}>
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: 12, fontFamily: 'Inter, sans-serif' } }} />

            {/* Header */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '22px 36px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600, marginBottom: 14, padding: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                        <ArrowLeft style={{ width: 15, height: 15 }} /> Back
                    </button>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ede9fe', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText style={{ width: 24, height: 24, color: '#7c3aed' }} />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{report.reportType}</h1>
                                <p style={{ color: '#94a3b8', fontSize: '0.83rem' }}>
                                    {new Date(report.uploadDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <button id="delete-report-btn" onClick={handleDelete} disabled={deleting}
                            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, border: '1.5px solid #fecaca', background: '#fff5f5', color: '#ef4444', cursor: deleting ? 'not-allowed' : 'pointer', fontSize: '0.875rem', fontWeight: 600, opacity: deleting ? 0.6 : 1, transition: 'all 0.2s' }}
                            onMouseEnter={e => !deleting && (e.currentTarget.style.background = '#fee2e2')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#fff5f5')}
                        >
                            {deleting ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 0.8s linear infinite' }} /> : <Trash2 style={{ width: 15, height: 15 }} />}
                            Delete Report
                        </button>
                    </div>
                </div>
            </div>

            {/* Two column layout */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 36px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* LEFT — Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Globe style={{ width: 15, height: 15, color: '#94a3b8' }} /> Report Preview
                    </h2>
                    <div className="hm-card" style={{ overflow: 'hidden' }}>
                        {isPdf ? (
                            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                                <div style={{ width: 72, height: 72, borderRadius: 20, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                    <FileText style={{ width: 32, height: 32, color: '#94a3b8' }} />
                                </div>
                                <p style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>PDF Report</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.83rem', marginBottom: 18 }}>
                                    PDF directly browser mein nahi dikhta browser security ki wajah se.
                                </p>
                                <a href={report.fileUrl} target="_blank" rel="noopener noreferrer"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: '#ede9fe', color: '#7c3aed', border: '1px solid #ddd6fe', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
                                    <ExternalLink style={{ width: 15, height: 15 }} /> PDF Kholen
                                </a>
                            </div>
                        ) : (
                            <img src={report.fileUrl} alt={report.reportType} style={{ width: '100%', objectFit: 'contain', maxHeight: 480, display: 'block' }} />
                        )}
                    </div>

                    {/* Abnormal Values */}
                    {report.abnormalValues?.length > 0 && (
                        <Section icon={AlertTriangle} title="Abnormal Values" items={report.abnormalValues} accent="#d97706" />
                    )}
                </div>

                {/* RIGHT — AI Analysis */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Lang Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <Languages style={{ width: 15, height: 15, color: '#059669' }} /> AI Analysis
                        </h2>
                        <div style={{ display: 'flex', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: 3, gap: 3 }}>
                            {['english', 'urdu'].map(l => (
                                <button key={l} id={`lang-${l}`} onClick={() => setLang(l)} style={{
                                    padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
                                    fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
                                    background: lang === l ? 'linear-gradient(135deg,#059669,#0d9488)' : 'transparent',
                                    color: lang === l ? '#fff' : '#64748b',
                                }}>
                                    {l === 'english' ? 'English' : 'Roman Urdu'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #ecfdf5)', border: '1px solid #a7f3d0', borderRadius: 16, padding: '18px 20px' }}>
                        <p style={{ color: '#064e3b', fontSize: '0.875rem', lineHeight: 1.75 }}>
                            {lang === 'english' ? report.aiSummaryEnglish : report.aiSummaryUrdu}
                        </p>
                    </div>

                    {/* Doctor Questions */}
                    <Section icon={Stethoscope} title="Doctor se Poochne Wale Sawal" items={report.doctorQuestions} accent="#0ea5e9" />

                    {/* Foods to Avoid */}
                    <Section icon={UtensilsCrossed} title="Khanay mein Ihtiyat" items={report.foodsToAvoid} accent="#e11d48" />

                    {/* Disclaimer */}
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10 }}>
                        <AlertTriangle style={{ width: 15, height: 15, color: '#d97706', flexShrink: 0, marginTop: 2 }} />
                        <p style={{ color: '#78350f', fontSize: '0.8rem', lineHeight: 1.6 }}>
                            <strong>Zaroori Ihtiyat:</strong> Yeh AI analysis sirf samajhne ke liye hai. Koi bhi health decision lene se pehle apne{' '}
                            <strong>qualified doctor se zaroor raabta karein</strong>. HealthMate medical advice nahi deta.
                        </p>
                    </div>
                </div>
            </div>

            {/* Responsive override for small screens */}
            <style>{`
                @media (max-width: 768px) {
                    .report-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
};

export default ViewReport;
