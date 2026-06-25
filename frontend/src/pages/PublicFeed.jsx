import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileText, Eye, AlertTriangle, Calendar, User, Search } from 'lucide-react';

const PublicFeed = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const axiosConfig = {
        headers: { Authorization: `Bearer ${token}` }
    };

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/reports/public/feed', axiosConfig);
                setReports(res.data);
            } catch (err) {
                console.error('Error fetching public reports feed:', err);
                toast.error('Failed to load public cases.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeed();
    }, []);

    const filteredReports = reports.filter(report => {
        const patientName = report.userId?.name?.toLowerCase() || '';
        const reportType = report.reportType?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return patientName.includes(term) || reportType.includes(term);
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                border: '1px solid #bae6fd',
                borderRadius: 24,
                padding: '36px',
                marginBottom: 32,
            }} className="fade-in">
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>
                    Public Cases Feed
                </h1>
                <p style={{ color: '#0369a1', fontSize: '1rem', fontWeight: 500 }}>
                    Patients ke publicly shared reports examine karein, details read karein aur zaroorat ke mutabiq unse connect karein.
                </p>
            </div>

            {/* Search filter */}
            <div style={{ position: 'relative', marginBottom: 28, maxWidth: 460 }}>
                <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#94a3b8' }} />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search by Patient Name or Report Type..."
                    className="hm-input"
                    style={{ paddingLeft: 46, height: 48, borderRadius: 14 }}
                />
            </div>

            {/* List */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                    <div className="spinner" style={{ width: 40, height: 40, border: '3px solid #0ea5e9', borderTopColor: 'transparent' }} />
                </div>
            ) : filteredReports.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 24px',
                    background: '#fff', border: '1px dashed #e2e8f0', borderRadius: 20,
                    color: '#64748b'
                }}>
                    <FileText style={{ width: 44, height: 44, color: '#94a3b8', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>No Case Reports Found</h3>
                    <p style={{ fontSize: '0.9rem' }}>Is feed mein abhi koi public report available nahi hai.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
                    {filteredReports.map(report => (
                        <div key={report._id} className="hm-card" style={{
                            background: '#fff', border: '1px solid #f1f5f9', borderRadius: 20,
                            padding: 24, boxShadow: '0 4px 20px rgba(0,0,0,0.01)',
                            display: 'flex', flexDirection: 'column', position: 'relative'
                        }}>
                            {/* Card Top */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                                    padding: '4px 10px', borderRadius: 8,
                                    background: '#e0f2fe', color: '#0369a1'
                                }}>
                                    {report.reportType}
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: '0.75rem' }}>
                                    <Calendar style={{ width: 14, height: 14 }} /> {formatDate(report.uploadDate)}
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: '#f1f5f9', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    color: '#64748b', fontSize: '0.85rem', fontWeight: 700
                                }}>
                                    <User style={{ width: 15, height: 15 }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                        {report.userId?.name || 'Anonymous Patient'}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                        {report.userId?.email || 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Abnormal Values */}
                            {report.abnormalValues && report.abnormalValues.length > 0 ? (
                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#e11d48', fontWeight: 700, marginBottom: 8 }}>
                                        <AlertTriangle style={{ width: 14, height: 14 }} /> Abnormal findings:
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {report.abnormalValues.map((val, idx) => (
                                            <span key={idx} style={{
                                                fontSize: '0.72rem', padding: '3px 8px', borderRadius: 6,
                                                background: '#fff1f2', color: '#e11d48', border: '1px solid #ffe4e6',
                                                fontWeight: 500
                                            }}>
                                                {val.split(':')[0]}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    marginBottom: 16, fontSize: '0.78rem', color: '#059669',
                                    background: '#f0fdf4', padding: '8px 12px', borderRadius: 10,
                                    fontWeight: 600, display: 'inline-block', width: 'fit-content'
                                }}>
                                    All values inside normal range
                                </div>
                            )}

                            {/* Brief summary extract */}
                            <p style={{
                                fontSize: '0.825rem', color: '#64748b', lineHeight: 1.45,
                                marginBottom: 20, flex: 1, overflow: 'hidden',
                                textOverflow: 'ellipsis', display: '-webkit-box',
                                WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
                            }}>
                                {report.aiSummaryEnglish || 'Report summary unavailable.'}
                            </p>

                            {/* Button */}
                            <button
                                onClick={() => navigate(`/report/${report._id}`)}
                                className="btn-secondary"
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: 8, padding: '12px',
                                    fontSize: '0.85rem', color: '#0284c7', background: '#f0f9ff',
                                    border: '1.5px solid #bae6fd'
                                }}
                            >
                                <Eye style={{ width: 16, height: 16 }} /> View Full Analysis
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicFeed;
