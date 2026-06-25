import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Users, UserPlus, MessageSquare, Check, Sparkles, AlertCircle } from 'lucide-react';

const Connections = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('suggestions'); // 'suggestions' or 'connected'
    const [suggestions, setSuggestions] = useState([]);
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole') || 'patient';

    const axiosConfig = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sugRes, friendsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/friends/suggestions', axiosConfig),
                axios.get('http://localhost:5000/api/friends/list', axiosConfig)
            ]);
            setSuggestions(sugRes.data);
            setFriends(friendsRes.data);
        } catch (err) {
            console.error('Error fetching connections data:', err);
            toast.error('Failed to load connections.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const handleConnect = async (friendId, name) => {
        try {
            await axios.post('http://localhost:5000/api/friends/connect', { friendId }, axiosConfig);
            toast.success(`Connected with ${name}! 🎉`);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to connect.');
        }
    };

    return (
        <div style={{ padding: '40px 24px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header banner */}
            <div style={{
                background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
                border: '1px solid #d1fae5',
                borderRadius: 24,
                padding: '36px',
                marginBottom: 32,
                position: 'relative',
                overflow: 'hidden',
            }} className="fade-in">
                <div style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: '#059669', color: '#fff',
                        width: 'fit-content', padding: '6px 12px',
                        borderRadius: 100, fontSize: '0.75rem', fontWeight: 700,
                        marginBottom: 16, boxShadow: '0 4px 12px rgba(5,150,105,0.2)'
                    }}>
                        <Sparkles style={{ width: 12, height: 12 }} /> Connections Hub
                    </div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>
                        Find Connections
                    </h1>
                    <p style={{ color: '#047857', fontSize: '1rem', fontWeight: 500, maxWidth: 600 }}>
                        HealthMate par majood sabhi qualified doctors aur registered patients ke sath connect karein, friend banayein, aur chat messaging shuru karein.
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{
                display: 'flex', gap: 12, borderBottom: '1px solid #e2e8f0',
                paddingBottom: 16, marginBottom: 28
            }}>
                <button
                    onClick={() => setActiveTab('suggestions')}
                    style={{
                        padding: '10px 20px', borderRadius: 12, border: 'none',
                        cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                        transition: 'all 0.2s',
                        background: activeTab === 'suggestions' ? '#059669' : 'transparent',
                        color: activeTab === 'suggestions' ? '#fff' : '#64748b',
                        boxShadow: activeTab === 'suggestions' ? '0 4px 12px rgba(5,150,105,0.2)' : 'none'
                    }}
                >
                    Suggestions
                </button>
                <button
                    onClick={() => setActiveTab('connected')}
                    style={{
                        padding: '10px 20px', borderRadius: 12, border: 'none',
                        cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                        transition: 'all 0.2s',
                        background: activeTab === 'connected' ? '#059669' : 'transparent',
                        color: activeTab === 'connected' ? '#fff' : '#64748b',
                        boxShadow: activeTab === 'connected' ? '0 4px 12px rgba(5,150,105,0.2)' : 'none'
                    }}
                >
                    My Connections ({friends.length})
                </button>
            </div>

            {/* Content list */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                    <div className="spinner" style={{ width: 40, height: 40, border: '3px solid #059669', borderTopColor: 'transparent' }} />
                </div>
            ) : activeTab === 'suggestions' ? (
                suggestions.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 24px',
                        background: '#fff', border: '1px dashed #e2e8f0', borderRadius: 20,
                        color: '#64748b'
                    }}>
                        <AlertCircle style={{ width: 44, height: 44, color: '#94a3b8', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>No Suggestions Available</h3>
                        <p style={{ fontSize: '0.9rem' }}>Sabhi doctors/patients ke sath aap already connected hain.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                        {suggestions.map(user => (
                            <div key={user._id} className="hm-card" style={{
                                padding: 24, display: 'flex', flexDirection: 'column',
                                background: '#fff', border: '1px solid #f1f5f9', borderRadius: 20,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative'
                            }}>
                                {/* Avatar & Details */}
                                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 16,
                                        background: user.role === 'doctor' 
                                            ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' 
                                            : 'linear-gradient(135deg, #059669, #0d9488)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '1.25rem', fontWeight: 700,
                                        flexShrink: 0
                                    }}>
                                        {user.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: 4 }}>
                                            {user.role === 'doctor' ? `Dr. ${user.name}` : user.name}
                                        </h3>
                                        <span style={{
                                            fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
                                            padding: '3px 8px', borderRadius: 6,
                                            background: user.role === 'doctor' ? '#e0f2fe' : '#ecfdf5',
                                            color: user.role === 'doctor' ? '#0369a1' : '#047857'
                                        }}>
                                            {user.role === 'doctor' ? user.specialty || 'Medical Specialist' : 'Patient'}
                                        </span>
                                    </div>
                                </div>

                                {/* Bio */}
                                <p style={{
                                    fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5,
                                    marginBottom: 20, flex: 1, overflow: 'hidden',
                                    textOverflow: 'ellipsis', display: '-webkit-box',
                                    WebkitLineClamp: 3, WebkitBoxOrient: 'vertical'
                                }}>
                                    {user.bio || 'HealthMate profile update nahi ki gai.'}
                                </p>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        onClick={() => handleConnect(user._id, user.name)}
                                        className="btn-primary"
                                        style={{
                                            flex: 1, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: 8, padding: '11px',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <UserPlus style={{ width: 15, height: 15 }} /> Connect
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                friends.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 24px',
                        background: '#fff', border: '1px dashed #e2e8f0', borderRadius: 20,
                        color: '#64748b'
                    }}>
                        <Users style={{ width: 44, height: 44, color: '#94a3b8', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>No Connections Found</h3>
                        <p style={{ fontSize: '0.9rem' }}>Aapka abhi tak koi doctor ya patient friend nahi bana.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                        {friends.map(user => (
                            <div key={user._id} className="hm-card" style={{
                                padding: 24, display: 'flex', flexDirection: 'column',
                                background: '#fff', border: '1px solid #f1f5f9', borderRadius: 20,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative'
                            }}>
                                {/* Avatar & Details */}
                                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 16,
                                        background: user.role === 'doctor' 
                                            ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' 
                                            : 'linear-gradient(135deg, #059669, #0d9488)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '1.25rem', fontWeight: 700,
                                        flexShrink: 0
                                    }}>
                                        {user.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 750, color: 'var(--text-primary)', marginBottom: 4 }}>
                                            {user.role === 'doctor' ? `Dr. ${user.name}` : user.name}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{
                                                fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                                                padding: '2px 6px', borderRadius: 6,
                                                background: user.role === 'doctor' ? '#e0f2fe' : '#ecfdf5',
                                                color: user.role === 'doctor' ? '#0369a1' : '#047857'
                                            }}>
                                                {user.role === 'doctor' ? user.specialty || 'General Practitioner' : 'Patient'}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#059669', fontSize: '0.72rem', fontWeight: 600 }}>
                                                <Check style={{ width: 12, height: 12 }} /> Connected
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bio */}
                                <p style={{
                                    fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5,
                                    marginBottom: 20, flex: 1
                                }}>
                                    {user.bio || 'Profile bio is not updated.'}
                                </p>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button
                                        onClick={() => navigate(`/chat/${user._id}`)}
                                        className="btn-secondary"
                                        style={{
                                            flex: 1, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: 8, padding: '11px',
                                            fontSize: '0.85rem', color: '#059669', background: '#ecfdf5',
                                            border: '1.5px solid #a7f3d0'
                                        }}
                                    >
                                        <MessageSquare style={{ width: 15, height: 15 }} /> Chat Message
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    );
};

export default Connections;
