import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddVitals from './pages/AddVitals';
import UploadReport from './pages/UploadReport';
import ViewReport from './pages/ViewReport';
import Timeline from './pages/Timeline';
import Connections from './pages/Connections';
import PublicFeed from './pages/PublicFeed';
import Chat from './pages/Chat';
import AIAgent from './pages/AIAgent';
import Profile from './pages/Profile';

// Sidebar layout — left sidebar + right content
const SidebarLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
            <Sidebar />
            <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
                <Outlet />
            </main>
        </div>
    );
};

function App() {
    useEffect(() => {
        const applyTheme = () => {
            const savedTheme = localStorage.getItem('appTheme') || 'mint';
            document.documentElement.className = ''; // Reset
            if (savedTheme !== 'mint') {
                document.documentElement.classList.add(`theme-${savedTheme}`);
            }
        };
        applyTheme();
        window.addEventListener('storage', applyTheme);
        return () => window.removeEventListener('storage', applyTheme);
    }, []);

    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#ffffff',
                        color: '#0f172a',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                    },
                    success: { iconTheme: { primary: '#059669', secondary: '#ecfdf5' } },
                    error:   { iconTheme: { primary: '#ef4444', secondary: '#fff5f5'  } },
                }}
            />

            <Routes>
                {/* Auth routes — no sidebar */}
                <Route path="/login"    element={<Login />}    />
                <Route path="/register" element={<Register />} />

                {/* App routes — with sidebar layout */}
                <Route element={<SidebarLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/timeline"   element={<PrivateRoute><Timeline /></PrivateRoute>} />
                    <Route path="/upload"     element={<PrivateRoute><UploadReport /></PrivateRoute>} />
                    <Route path="/add-vitals" element={<PrivateRoute><AddVitals /></PrivateRoute>} />
                    <Route path="/report/:id" element={<PrivateRoute><ViewReport /></PrivateRoute>} />
                    <Route path="/connections" element={<PrivateRoute><Connections /></PrivateRoute>} />
                    <Route path="/public-feed" element={<PrivateRoute><PublicFeed /></PrivateRoute>} />
                    <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
                    <Route path="/chat/:userId" element={<PrivateRoute><Chat /></PrivateRoute>} />
                    <Route path="/ai-agent" element={<PrivateRoute><AIAgent /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
