import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Zap, Heart } from 'lucide-react';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [role, setRole] = useState('patient');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { ...form, role });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userId', res.data.user.id);
            localStorage.setItem('userName', res.data.user.name);
            localStorage.setItem('userRole', res.data.user.role);
            localStorage.setItem('userGender', res.data.user.gender || 'male');
            localStorage.setItem('userAvatar', res.data.user.avatar || '');
            toast.success(`Welcome back, ${res.data.user.name}! 👋`);
            setTimeout(() => navigate('/dashboard'), 1000);
        } catch (err) {
            const msg = err.response?.data?.msg || 'Login failed. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #f0f4f8 40%, #eff6ff 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', position: 'relative', overflow: 'hidden',
        }}>
            <Toaster position="top-center" toastOptions={{
                style: { borderRadius: 12, fontFamily: 'Inter, sans-serif', fontWeight: 500 }
            }} />

            {/* Background Blobs */}
            <div className="bg-blob" style={{ width: 400, height: 400, background: 'rgba(5,150,105,0.08)', top: '-100px', left: '-100px', animationDelay: '0s' }} />
            <div className="bg-blob" style={{ width: 300, height: 300, background: 'rgba(14,165,233,0.08)', bottom: '-80px', right: '-80px', animationDelay: '3s' }} />
            <div className="bg-blob" style={{ width: 200, height: 200, background: 'rgba(124,58,237,0.06)', top: '30%', right: '15%', animationDelay: '1.5s' }} />

            <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }} className="fade-in">

                {/* Logo Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: 20,
                        background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 25px rgba(5,150,105,0.35)',
                    }}>
                        <Activity style={{ width: 36, height: 36, color: '#fff' }} />
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>
                        HealthMate
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Sehat ka Smart Dost — Login karein</p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    borderRadius: 24, padding: '36px 36px 32px',
                    boxShadow: '0 10px 50px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.6) inset',
                }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
                        Welcome Back! 👋
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {/* Role Selector Toggle */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 7 }}>Login As</label>
                            <div style={{
                                display: 'flex',
                                background: '#f1f5f9',
                                padding: 4,
                                borderRadius: 12,
                                border: '1px solid #e2e8f0',
                            }}>
                                <button
                                    type="button"
                                    onClick={() => setRole('patient')}
                                    style={{
                                        flex: 1,
                                        padding: '10px 0',
                                        borderRadius: 8,
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                        background: role === 'patient' ? '#fff' : 'transparent',
                                        color: role === 'patient' ? '#059669' : '#64748b',
                                        boxShadow: role === 'patient' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                                    }}
                                >
                                    Patient
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('doctor')}
                                    style={{
                                        flex: 1,
                                        padding: '10px 0',
                                        borderRadius: 8,
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s',
                                        background: role === 'doctor' ? '#fff' : 'transparent',
                                        color: role === 'doctor' ? '#059669' : '#64748b',
                                        boxShadow: role === 'doctor' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                                    }}
                                >
                                    Doctor
                                </button>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
                                <input
                                    id="login-email"
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="aapka@email.com"
                                    required
                                    className="hm-input"
                                    style={{ paddingLeft: 42 }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94a3b8' }} />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    required
                                    className="hm-input"
                                    style={{ paddingLeft: 42, paddingRight: 44 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
                                >
                                    {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            id="login-btn"
                            type="submit"
                            disabled={loading}
                            className="btn-primary"
                            style={{ width: '100%', padding: '14px', fontSize: '0.95rem', marginTop: 6, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                        >
                            {loading ? <div className="spinner" /> : <><span>Login</span> <ArrowRight style={{ width: 17, height: 17 }} /></>}
                        </button>
                    </form>

                    <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                            Account nahi hai?{' '}
                            <Link to="/register" style={{ color: '#059669', fontWeight: 700, textDecoration: 'none' }}>
                                Register karein →
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Trust Badges */}
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 24 }}>
                    {[
                        { icon: Shield, text: 'Secure & Private' },
                        { icon: Zap, text: 'AI Powered' },
                        { icon: Heart, text: 'Health First' },
                    ].map(({ icon: Icon, text }) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: '0.78rem', fontWeight: 500 }}>
                            <Icon style={{ width: 14, height: 14, color: '#10b981' }} />
                            {text}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Login;
