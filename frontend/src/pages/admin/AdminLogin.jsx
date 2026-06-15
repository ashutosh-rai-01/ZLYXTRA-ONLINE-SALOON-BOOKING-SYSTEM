import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

function AdminLogin() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [popup, setPopup] = useState({ isOpen: false, status: 'loading', title: '', message: '' });
    
    const navigate = useNavigate();
    const { login, logout } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setPopup({
            isOpen: true,
            status: 'loading',
            title: 'Verifying Admin Authority',
            message: 'Initializing control center session...'
        });
        try {
            const res = await login(phone, password);
            
            if (res.user.role !== 'admin') {
                logout();
                setPopup({
                    isOpen: true,
                    status: 'error',
                    title: 'Access Denied',
                    message: 'Unauthorized access. Admin portal is strictly restricted.'
                });
                setTimeout(() => setPopup(p => ({ ...p, isOpen: false })), 3000);
                return;
            }
            
            setPopup({
                isOpen: true,
                status: 'success',
                title: 'System Access Granted',
                message: 'Admin authorization successful. Loading control panel...'
            });
            
            setTimeout(() => {
                setPopup(p => ({ ...p, isOpen: false }));
                navigate('/admin/dashboard');
            }, 1200);
            
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Invalid Admin Credentials';
            setPopup({
                isOpen: true,
                status: 'error',
                title: 'System Rejection',
                message: errMsg
            });
            setTimeout(() => setPopup(p => ({ ...p, isOpen: false })), 2500);
        }
    };

    return (
        <div className="app-screen" style={{ backgroundColor: '#0f172a', color: 'white' }}> 
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                <ArrowLeft size={24} onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck color="white" size={24} />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Control Center</h1>
                </div>

                <p style={{ color: '#94a3b8', marginBottom: '32px' }}>Authorized Personnel Only</p>

                {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Admin ID (Phone or Email)"
                        style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '1.1rem' }}
                        required
                    />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Admin Passcode"
                        style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '1.1rem' }}
                        required
                    />
                    
                    <button type="submit" data-no-loader="true" style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '16px' }} disabled={popup.isOpen && popup.status === 'loading'}>
                        {popup.isOpen && popup.status === 'loading' ? 'Authenticating...' : 'Enter System'}
                    </button>
                </form>
            </div>

            {/* Status Modal Overlay */}
            {popup.isOpen && (
                <div className="status-popup-overlay">
                    <div className="status-popup-card">
                        {popup.status === 'loading' && (
                            <div className="spinner-ring">
                                <div></div><div></div><div></div><div></div>
                            </div>
                        )}
                        {popup.status === 'success' && (
                            <div className="icon-circle icon-success">
                                <CheckCircle2 size={32} />
                            </div>
                        )}
                        {popup.status === 'error' && (
                            <div className="icon-circle icon-error">
                                <XCircle size={32} />
                            </div>
                        )}
                        <h3 className="status-popup-text">{popup.title}</h3>
                        <p className="status-popup-subtext">{popup.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminLogin;
