import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import maleAvatar from '../assets/avatar_male.png';
import femaleAvatar from '../assets/avatar_female.png';
import { Activity, LogOut, LayoutDashboard, Calendar, UploadCloud, HeartPulse, User } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userGender = localStorage.getItem('userGender') || 'male';
    const userAvatar = localStorage.getItem('userAvatar') || '';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 50,
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: '0 32px',
        }}>
            <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>

                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{
                        width: 40, height: 40,
                        background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
                    }}>
                        <Activity style={{ width: 22, height: 22, color: '#fff' }} />
                    </div>
                    <span style={{
                        fontSize: '1.25rem', fontWeight: 800,
                        background: 'linear-gradient(135deg, #059669, #0d9488)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                    }}>HealthMate</span>
                </Link>

                {/* Nav Links */}
                {token && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {[
                            { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                            { path: '/timeline', icon: Calendar, label: 'Timeline' },
                            { path: '/upload', icon: UploadCloud, label: 'Upload Report' },
                            { path: '/add-vitals', icon: HeartPulse, label: 'Add Vitals' },
                        ].map(({ path, icon: Icon, label }) => (
                            <Link key={path} to={path} style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                padding: '8px 14px', borderRadius: 10,
                                fontSize: '0.875rem', fontWeight: 600,
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                background: isActive(path) ? 'linear-gradient(135deg,#ecfdf5,#d1fae5)' : 'transparent',
                                color: isActive(path) ? '#059669' : '#64748b',
                                border: `1.5px solid ${isActive(path) ? '#a7f3d0' : 'transparent'}`,
                            }}>
                                <Icon style={{ width: 15, height: 15 }} />
                                <span className="hidden md:inline">{label}</span>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Right side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {token ? (
                        <>
                            <Link to="/profile" style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                padding: '7px 14px', borderRadius: 30,
                                background: '#f8fafc', border: '1.5px solid #e2e8f0',
                                fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500,
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
                            >
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '1px solid #cbd5e1',
                                }}>
                                    <img 
                                        src={userAvatar || (userGender === 'female' ? femaleAvatar : maleAvatar)} 
                                        alt={userName} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                                <span className="hidden lg:inline">{userName || 'User'}</span>
                            </Link>
                            <button onClick={handleLogout} style={{
                                display: 'flex', alignItems: 'center', gap: 7,
                                padding: '8px 16px', borderRadius: 10, cursor: 'pointer',
                                background: '#fff5f5', color: '#ef4444',
                                border: '1.5px solid #fecaca',
                                fontSize: '0.875rem', fontWeight: 600,
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background='#fee2e2'; e.currentTarget.style.borderColor='#fca5a5'; }}
                            onMouseLeave={e => { e.currentTarget.style.background='#fff5f5'; e.currentTarget.style.borderColor='#fecaca'; }}
                            >
                                <LogOut style={{ width: 15, height: 15 }} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{
                                padding: '8px 18px', borderRadius: 10, textDecoration: 'none',
                                color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem',
                                border: '1.5px solid #e2e8f0', background: '#fff',
                                transition: 'all 0.2s',
                            }}>Login</Link>
                            <Link to="/register" className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.875rem' }}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
