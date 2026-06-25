import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { HeartPulse, Droplets, Weight, Activity, Thermometer, Save, ArrowLeft, StickyNote, AlertTriangle, Info } from 'lucide-react';

const fields = [
    { id: 'v-bp',   field: 'bp',          icon: HeartPulse,  label: 'Blood Pressure',  placeholder: 'e.g. 120/80', unit: 'mmHg',  accent: '#e11d48',  note: 'Normal: 90/60 – 120/80' },
    { id: 'v-sug',  field: 'sugar',       icon: Droplets,    label: 'Blood Sugar',     placeholder: 'e.g. 95',     unit: 'mg/dL', accent: '#d97706',  note: 'Fasting: 70–100' },
    { id: 'v-wt',   field: 'weight',      icon: Weight,      label: 'Weight',          placeholder: 'e.g. 70',     unit: 'kg',    accent: '#0ea5e9',  note: 'Track weekly' },
    { id: 'v-hr',   field: 'heartRate',   icon: Activity,    label: 'Heart Rate',      placeholder: 'e.g. 72',     unit: 'bpm',   accent: '#7c3aed',  note: 'Normal: 60–100' },
    { id: 'v-temp', field: 'temperature', icon: Thermometer, label: 'Temperature',     placeholder: 'e.g. 98.6',   unit: '°F',    accent: '#ea580c',  note: 'Normal: 97–99°F' },
];

const AddVitals = () => {
    const [form, setForm] = useState({ bp: '', sugar: '', weight: '', heartRate: '', temperature: '', notes: '', date: new Date().toISOString().slice(0, 10) });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const setField = (f) => (val) => setForm(prev => ({ ...prev, [f]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.bp && !form.sugar && !form.weight && !form.heartRate && !form.temperature)
            return toast.error('Kam se kam ek vital zaroor enter karein.');
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/vitals', {
                bp: form.bp || undefined,
                sugar: form.sugar ? Number(form.sugar) : undefined,
                weight: form.weight ? Number(form.weight) : undefined,
                heartRate: form.heartRate ? Number(form.heartRate) : undefined,
                temperature: form.temperature ? Number(form.temperature) : undefined,
                notes: form.notes || undefined,
                date: form.date,
            }, { headers: { 'x-auth-token': token } });
            toast.success('Vitals save ho gaye! 💪');
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Error saving vitals.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: 48 }}>
            <Toaster position="top-right" toastOptions={{ style: { borderRadius: 12, fontFamily: 'Inter, sans-serif' } }} />

            {/* Header */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '22px 36px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <button onClick={() => navigate(-1)} style={{
                        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                        color: '#94a3b8', cursor: 'pointer', fontSize: '0.83rem', fontWeight: 600, marginBottom: 14,
                        padding: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#475569'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                        <ArrowLeft style={{ width: 15, height: 15 }} /> Back
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                            border: '1px solid #fecaca',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <HeartPulse style={{ width: 24, height: 24, color: '#e11d48' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Log Your Vitals</h1>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 2 }}>Apni daily health readings record karein</p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 24px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Date */}
                    <div className="hm-card" style={{ padding: 20 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>📅 Date</label>
                        <input id="vitals-date" type="date" value={form.date}
                            onChange={e => setField('date')(e.target.value)}
                            className="hm-input" />
                    </div>

                    {/* Vitals Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                        {fields.map(({ id, field, icon: Icon, label, placeholder, unit, accent, note }) => (
                            <div key={id} className="hm-card fade-in" style={{ padding: 20, borderLeft: `3px solid ${accent}30` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                    <div style={{
                                        width: 34, height: 34, borderRadius: 10,
                                        background: accent + '15', border: `1px solid ${accent}20`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Icon style={{ width: 16, height: 16, color: accent }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block' }}>{label}</label>
                                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{note}</span>
                                    </div>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: accent, background: accent + '12', border: `1px solid ${accent}20`, padding: '2px 8px', borderRadius: 6 }}>{unit}</span>
                                </div>
                                <input id={id} type="text" value={form[field]} onChange={e => setField(field)(e.target.value)}
                                    placeholder={placeholder} className="hm-input"
                                    style={{ '--focus-color': accent }} />
                            </div>
                        ))}
                    </div>

                    {/* Notes */}
                    <div className="hm-card" style={{ padding: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <StickyNote style={{ width: 16, height: 16, color: '#059669' }} />
                            </div>
                            <label htmlFor="v-notes" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notes (Optional)</label>
                        </div>
                        <textarea id="v-notes" value={form.notes} onChange={e => setField('notes')(e.target.value)}
                            placeholder="Koi khas baat? e.g. Aaj thakan zyada thi, dawai li ya nahi..." rows={3}
                            className="hm-input" style={{ resize: 'none', paddingTop: 12, paddingBottom: 12 }} />
                    </div>

                    {/* Disclaimer */}
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <AlertTriangle style={{ width: 15, height: 15, color: '#d97706', flexShrink: 0, marginTop: 2 }} />
                        <p style={{ color: '#78350f', fontSize: '0.8rem', lineHeight: 1.6 }}>
                            Yeh readings sirf personal tracking ke liye hain. Kisi bhi ghair-mamool value par apne doctor se raabta karein.
                        </p>
                    </div>

                    {/* Submit */}
                    <button id="save-vitals-btn" type="submit" disabled={loading} className="btn-primary"
                        style={{ width: '100%', padding: '15px', fontSize: '1rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? <div className="spinner" /> : <><Save style={{ width: 18, height: 18 }} /> Save Vitals</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddVitals;
