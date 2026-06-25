import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import maleAvatar from '../assets/avatar_male.png';
import femaleAvatar from '../assets/avatar_female.png';
import { MessageSquare, Send, Paperclip, FileText, CheckCircle2, User, AlertCircle, Sparkles } from 'lucide-react';

const Chat = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [typedMessage, setTypedMessage] = useState('');
    const [reportsModalOpen, setReportsModalOpen] = useState(false);
    const [userReports, setUserReports] = useState([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null);

    const token = localStorage.getItem('token');
    const currentUserId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole') || 'patient';

    const axiosConfig = {
        headers: { Authorization: `Bearer ${token}` }
    };

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch active conversations list
    const fetchConversations = async (silent = false) => {
        if (!silent) setLoadingConversations(true);
        try {
            const res = await axios.get('http://localhost:5000/api/messages/conversations', axiosConfig);
            setConversations(res.data);
            
            // If we have a userId in URL, verify if it exists in conversations
            if (userId) {
                const found = res.data.find(c => c.user.id === userId);
                if (found) {
                    setSelectedUser(found.user);
                } else {
                    // Not in conversations yet, fetch user details directly to start a conversation
                    const userDetails = await axios.get(`http://localhost:5000/api/friends/list`, axiosConfig);
                    const matchingUser = userDetails.data.find(u => u._id === userId);
                        if (matchingUser) {
                            setSelectedUser({
                                id: matchingUser._id,
                                name: matchingUser.name,
                                email: matchingUser.email,
                                role: matchingUser.role,
                                specialty: matchingUser.specialty,
                                gender: matchingUser.gender,
                                avatar: matchingUser.avatar
                            });
                        }
                }
            }
        } catch (err) {
            console.error('Error fetching conversations:', err);
        } finally {
            if (!silent) setLoadingConversations(false);
        }
    };

    // Fetch message history for a user
    const fetchMessages = async (targetUserId, silent = false) => {
        if (!silent) setLoadingMessages(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/messages/${targetUserId}`, axiosConfig);
            setMessages(res.data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            if (!silent) setLoadingMessages(false);
        }
    };

    // Load patient reports for sharing modal
    const fetchUserReports = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/reports', axiosConfig);
            setUserReports(res.data);
        } catch (err) {
            console.error('Error fetching reports:', err);
        }
    };

    // Initial load
    useEffect(() => {
        fetchConversations();
        if (userRole === 'patient') {
            fetchUserReports();
        }
    }, [userId]);

    // Poll message logs and conversations list every 3 seconds
    useEffect(() => {
        if (!selectedUser) return;
        
        // Fetch messages and conversations silently
        fetchMessages(selectedUser.id, true);
        
        const interval = setInterval(() => {
            fetchMessages(selectedUser.id, true);
            fetchConversations(true);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedUser?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle sending standard message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!typedMessage.trim() || !selectedUser) return;

        try {
            const res = await axios.post('http://localhost:5000/api/messages', {
                receiver: selectedUser.id,
                content: typedMessage
            }, axiosConfig);

            setMessages(prev => [...prev, res.data]);
            setTypedMessage('');
            fetchConversations(true); // Update left sidebar list
        } catch (err) {
            toast.error('Failed to send message.');
        }
    };

    // Handle sharing a report
    const handleShareReport = async (report) => {
        if (!selectedUser) return;

        try {
            const content = `I shared a report: ${report.reportType} (${new Date(report.uploadDate).toLocaleDateString()})`;
            const res = await axios.post('http://localhost:5000/api/messages', {
                receiver: selectedUser.id,
                content: content,
                reportRef: report._id
            }, axiosConfig);

            setMessages(prev => [...prev, res.data]);
            setReportsModalOpen(false);
            toast.success('Report shared successfully in chat! 📄');
            fetchConversations(true);
        } catch (err) {
            toast.error('Failed to share report.');
        }
    };

    // Format chat timestamp
    const formatTime = (timeStr) => {
        return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
            {/* LEFT CONVERSATION LIST */}
            <div style={{
                width: 320, borderRight: '1px solid #e2e8f0', background: '#fff',
                display: 'flex', flexDirection: 'column'
            }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid #f1f5f9' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MessageSquare style={{ color: '#059669', width: 22, height: 22 }} /> Chat Rooms
                    </h2>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                    {loadingConversations ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                            <div className="spinner" style={{ borderTopColor: 'transparent', border: '2.5px solid #059669', width: 26, height: 26 }} />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
                            <AlertCircle style={{ width: 32, height: 32, color: '#94a3b8', margin: '0 auto 12px' }} />
                            <p style={{ fontSize: '0.85rem', marginBottom: 12 }}>Koi active conversation nahi mili.</p>
                            <button
                                onClick={() => navigate('/connections')}
                                className="btn-secondary"
                                style={{ padding: '8px 14px', fontSize: '0.78rem', width: '100%' }}
                            >
                                Connect with Friends
                            </button>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const isSelected = selectedUser?.id === conv.user.id;
                            return (
                                <div
                                    key={conv.user.id}
                                    onClick={() => {
                                        setSelectedUser(conv.user);
                                        navigate(`/chat/${conv.user.id}`);
                                    }}
                                    style={{
                                        display: 'flex', gap: 12, padding: '12px 14px',
                                        borderRadius: 14, cursor: 'pointer', marginBottom: 6,
                                        transition: 'all 0.2s',
                                        background: isSelected ? 'linear-gradient(135deg, rgba(5,150,105,0.08) 0%, rgba(13,148,136,0.06) 100%)' : 'transparent',
                                        border: `1.5px solid ${isSelected ? '#05966930' : 'transparent'}`
                                    }}
                                    onMouseEnter={e => {
                                        if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                                    }}
                                    onMouseLeave={e => {
                                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 12,
                                        overflow: 'hidden',
                                        border: '1px solid #e2e8f0',
                                        background: '#f8fafc',
                                        flexShrink: 0
                                    }}>
                                        <img 
                                            src={conv.user.avatar || (conv.user.gender === 'female' ? femaleAvatar : maleAvatar)} 
                                            alt={conv.user.name} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                        />
                                    </div>
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                                            <h4 style={{ fontSize: '0.875rem', fontWeight: conv.unreadCount > 0 ? 850 : 750, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {conv.user.role === 'doctor' ? `Dr. ${conv.user.name}` : conv.user.name}
                                            </h4>
                                            <span style={{ fontSize: '0.68rem', color: conv.unreadCount > 0 ? '#ef4444' : '#94a3b8', fontWeight: conv.unreadCount > 0 ? 700 : 500 }}>
                                                {conv.timestamp ? formatTime(conv.timestamp) : ''}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p style={{
                                                fontSize: '0.78rem', 
                                                color: conv.unreadCount > 0 ? '#0f172a' : '#64748b', 
                                                fontWeight: conv.unreadCount > 0 ? 600 : 500,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis',
                                                flex: 1,
                                                marginRight: 8
                                            }}>
                                                {conv.lastMessage}
                                            </p>
                                            {conv.unreadCount > 0 && (
                                                <span style={{
                                                    background: '#ef4444',
                                                    color: '#fff',
                                                    fontSize: '0.68rem',
                                                    fontWeight: 800,
                                                    padding: '2px 6px',
                                                    borderRadius: 99,
                                                    minWidth: 16,
                                                    textAlign: 'center',
                                                    boxShadow: '0 2px 6px rgba(239,68,68,0.3)',
                                                    flexShrink: 0
                                                }}>
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* RIGHT CHAT WINDOW */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                {selectedUser ? (
                    <>
                        {/* Chat header */}
                        <div style={{
                            padding: '16px 24px', background: '#fff',
                            borderBottom: '1px solid #e2e8f0', display: 'flex',
                            alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    overflow: 'hidden',
                                    border: '1px solid #cbd5e1',
                                    background: '#f8fafc',
                                }}>
                                    <img 
                                        src={selectedUser.avatar || (selectedUser.gender === 'female' ? femaleAvatar : maleAvatar)} 
                                        alt={selectedUser.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 2 }}>
                                        {selectedUser.role === 'doctor' ? `Dr. ${selectedUser.name}` : selectedUser.name}
                                    </h3>
                                    <span style={{
                                        fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                                        color: selectedUser.role === 'doctor' ? '#0284c7' : '#059669'
                                    }}>
                                        {selectedUser.role === 'doctor' ? selectedUser.specialty || 'Specialist' : 'Patient Friend'}
                                    </span>
                                </div>
                            </div>

                            {userRole === 'patient' && (
                                <button
                                    onClick={() => setReportsModalOpen(true)}
                                    className="btn-secondary"
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        fontSize: '0.8rem', padding: '9px 14px', borderRadius: 10,
                                        background: '#ecfdf5', color: '#059669', border: '1.5px solid #a7f3d0'
                                    }}
                                >
                                    <Paperclip style={{ width: 14, height: 14 }} /> Share Health File
                                </button>
                            )}
                        </div>

                        {/* Message list */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                            {loadingMessages ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                                    <div className="spinner" style={{ borderTopColor: 'transparent', border: '3px solid #059669', width: 32, height: 32 }} />
                                </div>
                            ) : messages.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: '60px 24px', color: '#64748b',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center'
                                }}>
                                    <Sparkles style={{ width: 36, height: 36, color: '#10b981', marginBottom: 12 }} />
                                    <h4 style={{ fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>Boliye aur mashwara karein!</h4>
                                    <p style={{ fontSize: '0.825rem', maxWidth: 380 }}>Dono users connected hain. Pehla message send kar ke chat start karein.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {messages.map(msg => {
                                        const isMine = msg.sender === currentUserId;
                                        return (
                                            <div
                                                key={msg._id}
                                                style={{
                                                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                                                    maxWidth: '70%', display: 'flex', flexDirection: 'column',
                                                    alignItems: isMine ? 'flex-end' : 'flex-start'
                                                }}
                                            >
                                                {/* Chat bubble */}
                                                <div style={{
                                                    padding: '12px 16px',
                                                    borderRadius: 18,
                                                    background: isMine 
                                                        ? 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' 
                                                        : '#fff',
                                                    color: isMine ? '#fff' : '#1e293b',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                                                    border: isMine ? 'none' : '1px solid #e2e8f0',
                                                    fontSize: '0.875rem',
                                                    lineHeight: 1.45,
                                                }}>
                                                    {/* If message has report reference */}
                                                    {msg.reportRef ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${isMine ? 'rgba(255,255,255,0.2)' : '#e2e8f0'}`, paddingBottom: 6 }}>
                                                                <FileText style={{ width: 16, height: 16 }} />
                                                                <span style={{ fontWeight: 700 }}>{msg.reportRef.reportType || 'Health Report'}</span>
                                                            </div>
                                                            <p style={{ fontSize: '0.8rem', opacity: 0.95 }}>{msg.content}</p>
                                                            <button
                                                                onClick={() => navigate(`/report/${msg.reportRef._id}`)}
                                                                style={{
                                                                    marginTop: 4, padding: '6px 12px', borderRadius: 8,
                                                                    border: 'none', cursor: 'pointer', fontWeight: 700,
                                                                    fontSize: '0.78rem', width: '100%',
                                                                    background: isMine ? '#fff' : '#059669',
                                                                    color: isMine ? '#059669' : '#fff',
                                                                    transition: 'opacity 0.2s'
                                                                }}
                                                            >
                                                                Open Full Analysis
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        msg.content
                                                    )}
                                                </div>

                                                <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 4, padding: '0 4px' }}>
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Chat input form */}
                        <form onSubmit={handleSendMessage} style={{
                            padding: '16px 24px', background: '#fff',
                            borderTop: '1px solid #e2e8f0', display: 'flex', gap: 12
                        }}>
                            <input
                                type="text"
                                value={typedMessage}
                                onChange={e => setTypedMessage(e.target.value)}
                                placeholder={`Write a message for ${selectedUser.role === 'doctor' ? `Dr. ${selectedUser.name}` : selectedUser.name}...`}
                                className="hm-input"
                                style={{ flex: 1, borderRadius: 14, height: 46 }}
                            />
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{
                                    width: 46, height: 46, borderRadius: 14, display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', padding: 0, flexShrink: 0
                                }}
                            >
                                <Send style={{ width: 17, height: 17 }} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{
                        flex: 1, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', color: '#64748b', padding: '24px'
                    }}>
                        <MessageSquare style={{ width: 56, height: 56, color: '#cbd5e1', marginBottom: 16 }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: 6 }}>No Active Chat Selected</h3>
                        <p style={{ fontSize: '0.9rem', textAlign: 'center', maxWidth: 360 }}>Left panel se kisi friend par click karein ya naye connections dhoondein.</p>
                        <button
                            onClick={() => navigate('/connections')}
                            className="btn-primary"
                            style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            Find Connections
                        </button>
                    </div>
                )}
            </div>

            {/* SHARE REPORTS MODAL (Patient role only) */}
            {reportsModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.3)',
                    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 100
                }}>
                    <div className="fade-in" style={{
                        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 500,
                        padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        maxHeight: '80vh', display: 'flex', flexDirection: 'column'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>Select Report to Share</h3>
                            <button
                                onClick={() => setReportsModalOpen(false)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: '#64748b' }}
                            >
                                &times;
                            </button>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {userReports.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>
                                    <AlertCircle style={{ width: 28, height: 28, margin: '0 auto 8px', color: '#94a3b8' }} />
                                    <p style={{ fontSize: '0.85rem' }}>Pehle koi lab report upload karein.</p>
                                </div>
                            ) : (
                                userReports.map(report => (
                                    <div
                                        key={report._id}
                                        onClick={() => handleShareReport(report)}
                                        style={{
                                            padding: '14px 18px', border: '1px solid #e2e8f0', borderRadius: 14,
                                            cursor: 'pointer', transition: 'all 0.2s', display: 'flex',
                                            justifyContent: 'space-between', alignItems: 'center'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = '#059669';
                                            e.currentTarget.style.background = '#f0fdf4';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                            e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <div>
                                            <h4 style={{ fontSize: '0.9rem', fontWeight: 750, color: 'var(--text-secondary)', marginBottom: 2 }}>{report.reportType}</h4>
                                            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Uploaded: {new Date(report.uploadDate).toLocaleDateString()}</span>
                                        </div>
                                        <CheckCircle2 style={{ color: '#059669', width: 20, height: 20 }} />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;
