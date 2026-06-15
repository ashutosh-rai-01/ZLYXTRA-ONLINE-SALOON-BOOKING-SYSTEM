import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Scissors, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

function Login() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [popup, setPopup] = useState({ isOpen: false, status: 'loading', title: '', message: '' });
    const { login, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPopup({
            isOpen: true,
            status: 'loading',
            title: 'Verifying Credentials',
            message: 'Logging you in, please wait...'
        });
        try {
            const res = await login(phone, password);
            if (res.user.role !== 'user') {
                logout();
                setPopup({
                    isOpen: true,
                    status: 'error',
                    title: 'Access Denied',
                    message: 'This login is strictly for Customers. Partners must use the Partner Portal.'
                });
                setTimeout(() => setPopup(p => ({ ...p, isOpen: false })), 3000);
                return;
            }
            setPopup({
                isOpen: true,
                status: 'success',
                title: 'Welcome Back!',
                message: `Logged in as ${res.user.name || 'User'}. Redirecting...`
            });
            setTimeout(() => {
                setPopup(p => ({ ...p, isOpen: false }));
                navigate('/home');
            }, 1200);
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setPopup({
                isOpen: true,
                status: 'error',
                title: 'Login Failed',
                message: errMsg
            });
            setTimeout(() => setPopup(p => ({ ...p, isOpen: false })), 2500);
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            backgroundColor: 'var(--bg-color)',
            padding: '20px 24px'
        }}>
            {/* Top Back Action Row */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <div 
                    onClick={() => navigate('/')}
                    style={{ 
                        width: '40px', 
                        height: '40px', 
                        backgroundColor: 'var(--surface)', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid var(--border)'
                    }}
                >
                    <ArrowLeft size={18} color="#0f172a" />
                </div>
            </div>
            
            {/* Center Card Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                
                {/* Brand Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
                    <div style={{ 
                        width: '44px', 
                        height: '44px', 
                        background: 'linear-gradient(135deg, var(--primary), #1d4ed8)', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                    }}>
                        <Scissors color="white" size={20} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Welcome Back</h1>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '2px 0 0 0', fontWeight: '500' }}>Log in to access your portal</p>
                    </div>
                </div>

                {/* Error Banner */}
                {error && <div className="error-message">{error}</div>}

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Phone Number or Email</label>
                        <input 
                            type="text"
                            placeholder="Enter phone number or email"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="form-input"
                            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                            required
                        />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Password</label>
                        <input 
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                            required
                        />
                    </div>
                    
                    <button type="submit" data-no-loader="true" className="btn-primary" style={{ marginTop: '16px', height: '48px', borderRadius: '12px' }}>
                        Log In
                    </button>
                </form>

                {/* Register/Signup Footer Link */}
                <div style={{ marginTop: '28px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                    Don't have an account? <span onClick={() => navigate('/register')} style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>Sign Up</span>
                </div>
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

export default Login;
