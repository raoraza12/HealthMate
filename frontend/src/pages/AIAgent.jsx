import API_BASE from '../config/api';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bot, Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

const AIAgent = () => {
    const [messages, setMessages] = useState([
        {
            role: 'model',
            content: 'Assalam-o-Alaikum! Main **HealthMate AI** medical assistant hoon. Main medical reports, bimariyon ki precautions, aur aam sehat ke sawalat ke jawab de sakta hoon.\n\nMujh se Urdu, English, ya Roman Urdu mein sawal poochein! Main aapko guide karoon ga.'
        }
    ]);
    const [typedMessage, setTypedMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const token = localStorage.getItem('token');
    const axiosConfig = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSendMessage = async (e, customMsg = null) => {
        if (e) e.preventDefault();
        const msgToSend = customMsg || typedMessage;
        if (!msgToSend.trim() || loading) return;

        // User message
        const userMsg = { role: 'user', content: msgToSend };
        setMessages(prev => [...prev, userMsg]);
        setTypedMessage('');
        setLoading(true);

        try {
            // Send user message and chat history to backend
            const res = await axios.post(`${API_BASE}/api/ai-agent/chat`, {
                message: msgToSend,
                history: messages
            }, axiosConfig);

            setMessages(prev => [...prev, { role: 'model', content: res.data.reply }]);
        } catch (err) {
            console.error('AI chat error:', err);
            toast.error(err.response?.data?.msg || 'Failed to connect to AI Agent.');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickQuery = (queryText) => {
        handleSendMessage(null, queryText);
    };

    const resetChat = () => {
        setMessages([
            {
                role: 'model',
                content: 'Assalam-o-Alaikum! Main **HealthMate AI** medical assistant hoon. Main medical reports, bimariyon ki precautions, aur aam sehat ke sawalat ke jawab de sakta hoon.\n\nMujh se Urdu, English, ya Roman Urdu mein sawal poochein! Main aapko guide karoon ga.'
            }
        ]);
    };

    const quickPrompts = [
        "Bukhar (Fever) ki surah mein kya precautions lein?",
        "High Blood Pressure ko naturally kaise control karein?",
        "Sugar level test karne ki normal ranges kya hain?",
        "Common cold aur flu ke liye kya gharelu totkay hain?"
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: 840, margin: '0 auto', background: '#fff', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', position: 'relative' }}>
                
                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid #f1f5f9',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#fff', zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 14,
                            background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(5,150,105,0.25)'
                        }}>
                            <Bot style={{ width: 22, height: 22, color: '#fff' }} />
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>HealthMate Medical Agent</h3>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    background: '#ecfdf5', color: '#047857',
                                    fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: 100
                                }}>
                                    <Sparkles style={{ width: 10, height: 10 }} /> SMART AI
                                </div>
                            </div>
                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>Bilingual Health Assistant & Advisor</span>
                        </div>
                    </div>

                    <button
                        onClick={resetChat}
                        title="Reset Conversation"
                        style={{
                            background: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: 10, width: 36, height: 36, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            color: '#64748b', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                    >
                        <RefreshCw style={{ width: 15, height: 15 }} />
                    </button>
                </div>

                {/* Messages Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {messages.map((msg, index) => {
                        const isUser = msg.role === 'user';
                        return (
                            <div
                                key={index}
                                style={{
                                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                                    maxWidth: '80%', display: 'flex', gap: 12,
                                    flexDirection: isUser ? 'row-reverse' : 'row'
                                }}
                            >
                                {/* Avatar */}
                                <div style={{
                                    width: 32, height: 32, borderRadius: 10,
                                    background: isUser ? 'linear-gradient(135deg, #0d9488, #059669)' : '#f1f5f9',
                                    color: isUser ? '#fff' : '#0d9488',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                                    border: isUser ? 'none' : '1px solid #e2e8f0'
                                }}>
                                    {isUser ? 'U' : <Bot style={{ width: 15, height: 15 }} />}
                                </div>

                                {/* Content */}
                                <div>
                                    <div style={{
                                        padding: '12px 18px',
                                        borderRadius: 18,
                                        background: isUser ? '#059669' : '#f8fafc',
                                        color: isUser ? '#fff' : '#1e293b',
                                        border: isUser ? 'none' : '1px solid #e2e8f0',
                                        fontSize: '0.875rem',
                                        lineHeight: 1.55,
                                        whiteSpace: 'pre-wrap',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Quick Queries (visible only at the start of conversation) */}
                    {messages.length === 1 && (
                        <div style={{ marginTop: 12 }} className="fade-in">
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 12 }}>Suggested Questions:</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {quickPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickQuery(prompt)}
                                        style={{
                                            padding: '10px 14px', borderRadius: 12,
                                            border: '1.5px solid #05966930', background: '#ecfdf550',
                                            color: '#059669', fontSize: '0.8rem', fontWeight: 600,
                                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                            maxWidth: '100%'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = '#ecfdf5';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = '#ecfdf550';
                                            e.currentTarget.style.transform = 'none';
                                        }}
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {loading && (
                        <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 12 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 10, background: '#f1f5f9',
                                color: '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: '1px solid #e2e8f0'
                            }}>
                                <Bot style={{ width: 15, height: 15 }} />
                            </div>
                            <div style={{
                                padding: '12px 18px', borderRadius: 18, background: '#f8fafc',
                                border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 6
                            }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Thinking</span>
                                <div style={{ display: 'flex', gap: 3 }}>
                                    <span className="pulse-dot" style={{ width: 6, height: 6, background: '#059669', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite alternate' }} />
                                    <span className="pulse-dot" style={{ width: 6, height: 6, background: '#059669', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite alternate', animationDelay: '0.2s' }} />
                                    <span className="pulse-dot" style={{ width: 6, height: 6, background: '#059669', borderRadius: '50%', display: 'inline-block', animation: 'pulse 1s infinite alternate', animationDelay: '0.4s' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Footer */}
                <form onSubmit={handleSendMessage} style={{
                    padding: '20px 24px', borderTop: '1px solid #f1f5f9',
                    display: 'flex', gap: 12, background: '#fff', zIndex: 10
                }}>
                    <input
                        type="text"
                        value={typedMessage}
                        onChange={e => setTypedMessage(e.target.value)}
                        placeholder="AI medical agent se sawal poochein..."
                        disabled={loading}
                        className="hm-input"
                        style={{ flex: 1, borderRadius: 14, height: 46 }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !typedMessage.trim()}
                        className="btn-primary"
                        style={{
                            width: 46, height: 46, borderRadius: 14, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', padding: 0,
                            flexShrink: 0, opacity: loading ? 0.7 : 1
                        }}
                    >
                        <Send style={{ width: 17, height: 17 }} />
                    </button>
                </form>

                {/* Safety Warning */}
                <div style={{
                    padding: '8px 24px', background: '#fffbeb', borderTop: '1px solid #fef3c7',
                    display: 'flex', alignItems: 'center', gap: 8, color: '#b45309', fontSize: '0.72rem'
                }}>
                    <AlertCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
                    <span>AI mashwara maloomat ke liye hai. Urgent halat mein foran qareebi doctor ya hospital se rabta karein.</span>
                </div>
            </div>
        </div>
    );
};

export default AIAgent;
