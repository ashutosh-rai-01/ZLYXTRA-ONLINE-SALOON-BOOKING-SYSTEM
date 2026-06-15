import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Store, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

function OwnerLogin() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [popup, setPopup] = useState({ isOpen: false, status: 'loading', title: '', message: '' });
    
    const navigate = useNavigate();
    const { login, register, logout } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPopup({
            isOpen: true,
            status: 'loading',
            title: isRegister ? 'Registering Partner' : 'Verifying Account',
            message: isRegister ? 'Creating your salon partner account...' : 'Authenticating credentials...'
        });
        try {
            let res;
            if (isRegister) {
                res = await register(name, phone, password, 'owner');
            } else {
                res = await login(phone, password);
            }
            
            if (res.user.role !== 'owner') {
                logout();
                setPopup({
                    isOpen: true,
                    status: 'error',
                    title: 'Access Restricted',
                    message: 'This portal is strictly for Salon Partners. Customers must use the Customer Portal.'
                });
                setTimeout(() => setPopup(p => ({ ...p, isOpen: false })), 3000);
                return;
            }
            
            setPopup({
                isOpen: true,
                status: 'success',
                title: isRegister ? 'Welcome to ZLYXTRA!' : 'Welcome Back!',
                message: isRegister ? 'Salon partner account created successfully. Redirecting...' : `Logged in as ${res.user.name}. Redirecting...`
            });
            
            setTimeout(() => {
                setPopup(p => ({ ...p, isOpen: false }));
                navigate('/owner/dashboard');
            }, 1200);
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Authentication failed. Please check your inputs.';
            setPopup({
                isOpen: true,
                status: 'error',
                title: 'Authentication Failed',
                message: errMsg
            });
            setTimeout(() => setPopup(p => ({ ...p, isOpen: false })), 2500);
        }
    };

    return (
        <div className="app-screen" style={{ backgroundColor: '#111827', color: 'white' }}> 
            <div style={{ padding: '20px', display: 'flex', alignItems: 'center' }}>
                <ArrowLeft size={24} onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 24px', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <div style={{ width: '48px', height: '48px', backgroundColor: '#8b5cf6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Store color="white" size={24} />
                    </div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{isRegister ? 'Become a Partner' : 'Owner Portal'}</h1>
                </div>

                <p style={{ color: '#94a3b8', marginBottom: '32px' }}>{isRegister ? 'Register your salon business on ZLYXTRA.' : 'Manage your salon, bookings, and availability.'}</p>

                {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {isRegister && (
                        <input 
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '1.1rem' }}
                            required
                        />
                    )}
                    <input 
                        type="text"
                        placeholder="Phone Number or Email"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '1.1rem' }}
                        required
                    />
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white', fontSize: '1.1rem' }}
                        required
                    />
                    
                    <button type="submit" data-no-loader="true" style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '16px' }} disabled={popup.isOpen && popup.status === 'loading'}>
                        {popup.isOpen && popup.status === 'loading' ? 'Processing...' : (isRegister ? 'Create Account' : 'Log In')}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    {isRegister ? 'Already a partner? ' : 'New to ZLYXTRA? '}
                    <span onClick={() => setIsRegister(!isRegister)} style={{ color: '#8b5cf6', fontWeight: 'bold', cursor: 'pointer' }}>
                        {isRegister ? 'Log In' : 'Sign Up'}
                    </span>
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

export default OwnerLogin;
