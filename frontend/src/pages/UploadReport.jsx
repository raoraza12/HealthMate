import API_BASE from '../config/api';
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { UploadCloud, FileText, Image, CheckCircle2, ArrowLeft, Sparkles, AlertTriangle, X, FileUp } from 'lucide-react';

const UploadReport = () => {
    const [file, setFile] = useState(null);
    const [isPublic, setIsPublic] = useState(true);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [stage, setStage] = useState('idle');
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleFile = (selectedFile) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowed.includes(selectedFile.type)) return toast.error('Sirf JPEG, PNG, ya PDF files allowed hain.');
        if (selectedFile.size > 10 * 1024 * 1024) return toast.error('File size 10MB se zyada nahi honi chahiye.');
        setFile(selectedFile);
    };

    const onDrop = useCallback((e) => {
        e.preventDefault(); setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) handleFile(dropped);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return toast.error('Pehle ek file select karein.');
        setLoading(true); setStage('uploading');
        const formData = new FormData();
        formData.append('report', file);
        formData.append('isPublic', isPublic);
        try {
            setStage('analyzing');
            const res = await axios.post(`${API_BASE}/api/reports/upload`, formData, {
                headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' },
            });
            setStage('done');
            toast.success('Report upload aur analysis complete! 🎉');
            setTimeout(() => navigate(`/report/${res.data._id}`), 1200);
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Upload fail ho gaya. Dobara koshish karein.');
            setStage('idle');
        } finally { setLoading(false); }
    };

    const stageInfo = {
        uploading: { msg: 'File upload ho rahi hai...', color: '#0ea5e9' },
        analyzing: { msg: 'AI report analyze kar rahi hai... (10-20 seconds)', color: '#7c3aed' },
        done:      { msg: 'Ho gaya! Redirect ho raha hai...', color: '#059669' },
    };

    const features = [
        { emoji: '📋', text: 'Plain language mein report explain' },
        { emoji: '🇵🇰', text: 'Roman Urdu mein bhi samjhata hai' },
        { emoji: '⚠️', text: 'Abnormal values highlight karta hai' },
        { emoji: '🍽️', text: 'Khanay peeney ki salah deta hai' },
        { emoji: '🩺', text: 'Doctor ke saath poochne wale sawal' },
        { emoji: '💡', text: 'Ghar pe follow karne wale health tips' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: 48 }}>
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: 12, fontFamily: 'Inter, sans-serif' } }} />

            {/* Header */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '22px 36px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ maxWidth: 680, margin: '0 auto' }}>
                    <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600, marginBottom: 14, padding: 0 }}
                        onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                        <ArrowLeft style={{ width: 15, height: 15 }} /> Back
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UploadCloud style={{ width: 24, height: 24, color: '#7c3aed' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Upload Report</h1>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Lab report, prescription ya X-Ray — AI analyze karega</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Drop Zone */}
                <div
                    onDrop={onDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => !file && document.getElementById('file-input').click()}
                    style={{
                        border: `2px dashed ${dragOver ? '#7c3aed' : file ? '#059669' : '#cbd5e1'}`,
                        borderRadius: 20, padding: '48px 24px', textAlign: 'center',
                        cursor: file ? 'default' : 'pointer',
                        background: dragOver ? '#faf5ff' : file ? '#f0fdf4' : '#fff',
                        transition: 'all 0.25s ease',
                        transform: dragOver ? 'scale(1.01)' : 'scale(1)',
                        boxShadow: dragOver ? '0 8px 30px rgba(124,58,237,0.1)' : '0 1px 3px rgba(0,0,0,0.05)',
                    }}
                >
                    <input id="file-input" type="file" accept=".jpg,.jpeg,.png,.pdf"
                        onChange={e => e.target.files[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />

                    {file ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 64, height: 64, borderRadius: 18, background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {file.type.includes('pdf')
                                    ? <FileText style={{ width: 30, height: 30, color: '#059669' }} />
                                    : <Image style={{ width: 30, height: 30, color: '#059669' }} />
                                }
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: '#059669' }}>{file.name}</p>
                                <p style={{ color: '#94a3b8', fontSize: '0.83rem' }}>{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#ef4444', background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>
                                <X style={{ width: 13, height: 13 }} /> Remove
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: 20,
                                background: dragOver ? '#ede9fe' : '#f8fafc',
                                border: `2px dashed ${dragOver ? '#a78bfa' : '#e2e8f0'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}>
                                <FileUp style={{ width: 32, height: 32, color: dragOver ? '#7c3aed' : '#94a3b8' }} />
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 5 }}>
                                    {dragOver ? '🎯 Chhod dein!' : 'File yahan drag karein ya click karein'}
                                </p>
                                <p style={{ color: '#94a3b8', fontSize: '0.83rem' }}>JPEG, PNG, PDF • Max 10MB</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* What AI does */}
                <div className="hm-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Sparkles style={{ width: 16, height: 16, color: '#7c3aed' }} />
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>AI kya karta hai aapki report ke saath?</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                        {features.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                                <span style={{ fontSize: '1.1rem' }}>{item.emoji}</span>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Loading Stage */}
                {loading && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 6 }}>
                            <div style={{ width: 22, height: 22, border: `3px solid ${stageInfo[stage]?.color}30`, borderTopColor: stageInfo[stage]?.color, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            <p style={{ color: stageInfo[stage]?.color, fontWeight: 700 }}>{stageInfo[stage]?.msg}</p>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Baraaye meharbani is page ko band mat karein</p>
                    </div>
                )}

                {/* Public / Private toggle */}
                <div style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 14,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                    <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: 2 }}>Public to Doctors</h4>
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>If enabled, any registered doctor can view this report in the public feed.</p>
                    </div>
                    <input 
                        type="checkbox" 
                        checked={isPublic} 
                        onChange={e => setIsPublic(e.target.checked)} 
                        style={{
                            width: 18, height: 18, accentColor: '#059669', cursor: 'pointer'
                        }}
                    />
                </div>

                {/* Disclaimer */}
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10 }}>
                    <AlertTriangle style={{ width: 15, height: 15, color: '#d97706', flexShrink: 0, marginTop: 2 }} />
                    <p style={{ color: '#78350f', fontSize: '0.8rem', lineHeight: 1.6 }}>
                        <strong>Zaroori:</strong> Aapki report sirf AI analysis ke liye use hogi. Yeh tool medical advice nahi deta.
                        Kisi bhi sehti maslay ke liye apne doctor se zaroor milin.
                    </p>
                </div>

                {/* Submit */}
                <button id="upload-submit-btn" onClick={handleSubmit} disabled={!file || loading} className="btn-primary"
                    style={{ width: '100%', padding: '15px', fontSize: '1rem', opacity: (!file || loading) ? 0.5 : 1, cursor: (!file || loading) ? 'not-allowed' : 'pointer' }}>
                    {loading
                        ? <><div className="spinner" /> Processing...</>
                        : <><Sparkles style={{ width: 18, height: 18 }} /> Upload &amp; Analyze with AI</>
                    }
                </button>
            </div>
        </div>
    );
};

export default UploadReport;
