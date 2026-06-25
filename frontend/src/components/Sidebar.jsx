import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import maleAvatar from '../assets/avatar_male.png';
import femaleAvatar from '../assets/avatar_female.png';
import {
    Activity, LogOut, LayoutDashboard, Calendar,
    UploadCloud, HeartPulse, User, Users, MessageSquare, Bot, FileText,
    ChevronRight
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userName = localStorage.getItem('userName') || 'User';
    const userRole = localStorage.getItem('userRole') || 'patient';
    const userGender = localStorage.getItem('userGender') || 'male';
    const userAvatar = localStorage.getItem('userAvatar') || '';
    const [collapsed, setCollapsed] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get('http://localhost:5000/api/messages/unread-count', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnreadCount(res.data.count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        window.addEventListener('storage', fetchUnreadCount);
        const interval = setInterval(fetchUnreadCount, 10000);
        return () => {
            window.removeEventListener('storage', fetchUnreadCount);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/chat') {
            return location.pathname.startsWith('/chat');
        }
        return location.pathname === path;
    };

    const navItems = userRole === 'doctor' ? [
        { path: '/dashboard',   icon: LayoutDashboard, label: 'Doctor Dashboard', color: '#059669' },
        { path: '/public-feed', icon: FileText,        label: 'Public Cases',     color: '#0ea5e9' },
        { path: '/connections', icon: Users,           label: 'Connections',      color: '#7c3aed' },
        { path: '/chat',        icon: MessageSquare,   label: 'Chat Room',        color: '#d97706' },
        { path: '/ai-agent',    icon: Bot,             label: 'AI Assistant',     color: '#2563eb' },
    ] : [
        { path: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',        color: '#059669' },
        { path: '/timeline',    icon: Calendar,        label: 'Timeline',         color: '#0ea5e9' },
        { path: '/upload',      icon: UploadCloud,     label: 'Upload Report',    color: '#7c3aed' },
        { path: '/add-vitals',  icon: HeartPulse,      label: 'Add Vitals',       color: '#e11d48' },
        { path: '/connections', icon: Users,           label: 'Find Friends',     color: '#d97706' },
        { path: '/chat',        icon: MessageSquare,   label: 'Chat Room',        color: '#2563eb' },
        { path: '/ai-agent',    icon: Bot,             label: 'AI Assistant',     color: '#8b5cf6' },
    ];

    const w = collapsed ? 72 : 240;
    const roleLabel = userRole.charAt(0).toUpperCase() + userRole.slice(1);

    return (
        <aside 
            onMouseEnter={() => setCollapsed(false)}
            onMouseLeave={() => setCollapsed(true)}
            style={{
                width: w, minWidth: w, height: '100vh',
                position: 'sticky', top: 0,
                background: 'var(--bg-surface)',
                borderRight: '1.5px solid var(--border)',
                display: 'flex', flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
                transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden', zIndex: 40,
            }}
        >
            {/* Logo */}
            <div style={{
                padding: collapsed ? '20px 16px' : '20px 20px',
                display: 'flex', alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderBottom: '1.5px solid var(--border-subtle)',
                minHeight: 70,
            }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-glow)',
                        flexShrink: 0,
                    }}>
                        <Activity style={{ width: 18, height: 18, color: '#fff' }} />
                    </div>
                    {!collapsed && (
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                                HealthMate
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>Health Dashboard</div>
                        </div>
                    )}
                </Link>
            </div>

            {/* Nav Items */}
            <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
                {navItems.map(({ path, icon: Icon, label, color }) => {
                    const active = isActive(path);
                    return (
                        <Link
                            key={path}
                            to={path}
                            title={collapsed ? label : ''}
                            style={{
                                display: 'flex', alignItems: 'center',
                                gap: collapsed ? 0 : 12,
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                padding: collapsed ? '12px' : '11px 14px',
                                borderRadius: 12,
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                                background: active
                                    ? `linear-gradient(135deg, ${color}18 0%, ${color}10 100%)`
                                    : 'transparent',
                                border: `1.5px solid ${active ? color + '30' : 'transparent'}`,
                                color: active ? color : '#64748b',
                                fontWeight: active ? 700 : 500,
                                fontSize: '0.875rem',
                                position: 'relative',
                            }}
                            onMouseEnter={e => {
                                if (!active) {
                                    e.currentTarget.style.background = '#f8fafc';
                                    e.currentTarget.style.color = '#0f172a';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!active) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#64748b';
                                }
                            }}
                        >
                            {/* Active indicator bar */}
                            {active && (
                                <div style={{
                                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                                    width: 3, borderRadius: '0 3px 3px 0',
                                    background: color,
                                }} />
                            )}
                            <div style={{
                                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: active ? color + '18' : '#f8fafc',
                                border: `1px solid ${active ? color + '25' : '#f1f5f9'}`,
                                transition: 'all 0.2s',
                            }}>
                                <Icon style={{ width: 16, height: 16, color: active ? color : '#94a3b8' }} />
                            </div>
                            {!collapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', flex: 1 }}>{label}</span>}
                            {path === '/chat' && unreadCount > 0 && (
                                <span style={{
                                    background: '#ef4444',
                                    color: '#fff',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: '99px',
                                    minWidth: 16,
                                    textAlign: 'center',
                                    marginLeft: collapsed ? 0 : 8,
                                    position: collapsed ? 'absolute' : 'static',
                                    top: collapsed ? 4 : 'auto',
                                    right: collapsed ? 4 : 'auto',
                                    boxShadow: '0 2px 6px rgba(239,68,68,0.4)',
                                    zIndex: 10,
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Section at Bottom */}
            <div style={{ padding: '10px', borderTop: '1px solid #f1f5f9' }}>
                {/* Clickable User profile avatar block */}
                <Link
                    to="/profile"
                    title={collapsed ? 'My Profile' : ''}
                    style={{
                        textDecoration: 'none',
                        display: 'block',
                        marginBottom: 8,
                    }}
                >
                    {!collapsed ? (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 12,
                            background: location.pathname === '/profile' 
                                ? 'linear-gradient(135deg, rgba(219,39,119,0.1) 0%, rgba(219,39,119,0.04) 100%)' 
                                : '#f8fafc',
                            border: `1.5px solid ${location.pathname === '/profile' ? '#db277730' : '#f1f5f9'}`,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            if (location.pathname !== '/profile') {
                                e.currentTarget.style.background = '#f1f5f9';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }
                        }}
                        onMouseLeave={e => {
                            if (location.pathname !== '/profile') {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#f1f5f9';
                            }
                        }}
                        >
                            <div style={{
                                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                overflow: 'hidden',
                                border: '1.5px solid #fff',
                                boxShadow: '0 2px 8px rgba(219,39,119,0.2)',
                            }}>
                                <img 
                                    src={userAvatar || (userGender === 'female' ? femaleAvatar : maleAvatar)} 
                                    alt={userName} 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                            </div>
                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                <div style={{ 
                                    fontSize: '0.85rem', 
                                    fontWeight: 700, 
                                    color: location.pathname === '/profile' ? '#db2777' : '#0f172a', 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis' 
                                }}>
                                    {userName}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{roleLabel}</div>
                            </div>
                            <ChevronRight style={{ width: 14, height: 14, color: location.pathname === '/profile' ? '#db2777' : '#cbd5e1' }} />
                        </div>
                    ) : (
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 8px',
                            transition: 'all 0.2s',
                            boxShadow: location.pathname === '/profile' ? '0 2px 8px rgba(219,39,119,0.3)' : 'none',
                            border: location.pathname === '/profile' ? '2px solid #db2777' : 'none',
                            overflow: 'hidden',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <img 
                                src={userAvatar || (userGender === 'female' ? femaleAvatar : maleAvatar)} 
                                alt={userName} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                        </div>
                    )}
                </Link>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    title={collapsed ? 'Logout' : ''}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center',
                        gap: collapsed ? 0 : 10, justifyContent: collapsed ? 'center' : 'flex-start',
                        padding: collapsed ? '10px' : '10px 14px',
                        borderRadius: 10, border: '1.5px solid #fecaca',
                        background: '#fff5f5', color: '#ef4444',
                        cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff5f5'; }}
                >
                    <LogOut style={{ width: 16, height: 16, flexShrink: 0 }} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
