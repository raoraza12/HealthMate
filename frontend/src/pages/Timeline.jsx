import API_BASE from '../config/api';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Calendar, FileText, HeartPulse, Filter, ArrowRight,
    AlertTriangle, Droplets, Weight, Activity, Thermometer, Clock
} from 'lucide-react';

const vitalBadge = (icon, label, val, color) => val ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
        {React.createElement(icon, { style: { width: 13, height: 13, color } })}
        <span style={{ color: '#94a3b8' }}>{label}:</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{val}{label === 'Sugar' ? ' mg/dL' : label === 'Weight' ? ' kg' : label === 'HR' ? ' bpm' : label === 'Temp' ? '°F' : ''}</span>
    </div>
) : null;

const TimelineEntry = ({ entry }) => {
    if (entry.entryType === 'report') {
        return (
            <div style={{ position: 'relative', paddingLeft: 48 }}>
                <div style={{
                    position: 'absolute', left: 0, top: 6,
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#ede9fe', border: '2px solid #ddd6fe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(124,58,237,0.15)',
                }}>
                    <FileText style={{ width: 14, height: 14, color: '#7c3aed' }} />
                </div>
                <Link to={`/report/${entry.id}`} id={`timeline-report-${entry.id}`} className="hm-card hm-card-lift"
                    style={{ display: 'block', padding: '16px 18px', textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 10px', borderRadius: 99, background: '#ede9fe', color: '#7c3aed', border: '1px solid #ddd6fe' }}>Report</span>
                                {entry.abnormalValues?.length > 0 && (
                                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 10px', borderRadius: 99, background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <AlertTriangle style={{ width: 10, height: 10 }} /> {entry.abnormalValues.length} Abnormal
                                    </span>
                                )}
                            </div>
                            <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{entry.title}</p>
                            <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {entry.aiSummaryEnglish}
                            </p>
                        </div>
                        <ArrowRight style={{ width: 16, height: 16, color: '#cbd5e1', flexShrink: 0 }} />
                    </div>
                </Link>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', paddingLeft: 48 }}>
            <div style={{
                position: 'absolute', left: 0, top: 6,
                width: 32, height: 32, borderRadius: '50%',
                background: '#ecfdf5', border: '2px solid #a7f3d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(5,150,105,0.15)',
            }}>
                <HeartPulse style={{ width: 14, height: 14, color: '#059669' }} />
            </div>
            <div id={`timeline-vital-${entry.id}`} className="hm-card" style={{ padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 10px', borderRadius: 99, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>Vitals</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
                    {vitalBadge(HeartPulse, 'BP', entry.bp, '#e11d48')}
                    {vitalBadge(Droplets, 'Sugar', entry.sugar, '#d97706')}
                    {vitalBadge(Weight, 'Weight', entry.weight, '#0ea5e9')}
                    {vitalBadge(Activity, 'HR', entry.heartRate, '#7c3aed')}
                    {vitalBadge(Thermometer, 'Temp', entry.temperature, '#ea580c')}
                </div>
                {entry.notes && (
                    <p style={{ marginTop: 10, color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                        {entry.notes}
                    </p>
                )}
            </div>
        </div>
    );
};

const Timeline = () => {
    const [entries, setEntries] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTimeline = async () => {
            try {
                const res = await axios.get(`${API_BASE}/api/timeline`, { headers: { 'x-auth-token': token } });
                setEntries(res.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchTimeline();
    }, [token]);

    const filtered = entries.filter(e => filter === 'all' || e.entryType === filter);
    const grouped = filtered.reduce((acc, entry) => {
        const k = new Date(entry.date).toLocaleDateString('en-PK', { month: 'long', year: 'numeric' });
        if (!acc[k]) acc[k] = [];
        acc[k].push(entry);
        return acc;
    }, {});

    const tabs = [
        { key: 'all',    label: `All (${entries.length})` },
        { key: 'report', label: `Reports (${entries.filter(e => e.entryType === 'report').length})` },
        { key: 'vital',  label: `Vitals (${entries.filter(e => e.entryType === 'vital').length})` },
    ];

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
            <div style={{ width: 48, height: 48, border: '4px solid #d1fae5', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#94a3b8', fontWeight: 500 }}>Timeline load ho rahi hai...</p>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: 48 }}>

            {/* Header */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '22px 36px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ maxWidth: 760, margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar style={{ width: 24, height: 24, color: '#0ea5e9' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Health Timeline</h1>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Aapki sehat ki poori kahani, tarteeb se</p>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Filter style={{ width: 15, height: 15, color: '#94a3b8' }} />
                        <div style={{ display: 'flex', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: 4, gap: 4 }}>
                            {tabs.map(tab => (
                                <button key={tab.key} id={`filter-${tab.key}`} onClick={() => setFilter(tab.key)} style={{
                                    padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                                    fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap',
                                    transition: 'all 0.2s ease',
                                    background: filter === tab.key ? 'linear-gradient(135deg,#059669,#0d9488)' : 'transparent',
                                    color: filter === tab.key ? '#fff' : '#64748b',
                                    boxShadow: filter === tab.key ? '0 2px 8px rgba(5,150,105,0.25)' : 'none',
                                }}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 24px' }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                        <div style={{ width: 72, height: 72, borderRadius: 20, background: '#f8fafc', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <Clock style={{ width: 30, height: 30, color: '#cbd5e1' }} />
                        </div>
                        <p style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>Abhi koi entry nahi</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 24 }}>Reports upload karein ya vitals add karein taake timeline bane</p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link to="/upload" className="btn-primary" style={{ padding: '10px 22px', fontSize: '0.875rem' }}>Upload Report</Link>
                            <Link to="/add-vitals" className="btn-secondary" style={{ padding: '10px 22px', fontSize: '0.875rem' }}>Add Vitals</Link>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
                        {Object.entries(grouped).map(([month, monthEntries]) => (
                            <div key={month}>
                                {/* Month Header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 99, padding: '5px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                        <Calendar style={{ width: 13, height: 13, color: '#0ea5e9' }} /> {month}
                                    </div>
                                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, #e2e8f0, transparent)' }} />
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{monthEntries.length} entries</span>
                                </div>

                                {/* Timeline entries with vertical line */}
                                <div style={{ position: 'relative' }}>
                                    <div className="timeline-line" />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                        {monthEntries.map(entry => (
                                            <div key={entry.id}>
                                                <p style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, paddingLeft: 48, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                    <Clock style={{ width: 11, height: 11 }} />
                                                    {new Date(entry.date).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'short' })}
                                                </p>
                                                <TimelineEntry entry={entry} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Timeline;
