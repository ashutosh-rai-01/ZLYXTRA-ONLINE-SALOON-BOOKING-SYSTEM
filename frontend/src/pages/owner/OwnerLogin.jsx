import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Store, ArrowLeft } from 'lucide-react';

function OwnerLogin() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login, register, logout } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            let res;
            if (isRegister) {
                res = await register(name, phone, password, 'owner');
            } else {
                res = await login(phone, password);
            }
            
            if (res.user.role !== 'owner') {
                logout();
                setError('This login is strictly for Salon Partners. Customers must use the Customer Portal.');
                return;
            }
            navigate('/owner/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
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
                        type="tel"
                        placeholder="Phone Number"
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
                    
                    <button type="submit" style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '16px' }} disabled={loading}>
                        {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Log In')}
                    </button>
                </form>

                <div style={{ marginTop: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    {isRegister ? 'Already a partner? ' : 'New to ZLYXTRA? '}
                    <span onClick={() => setIsRegister(!isRegister)} style={{ color: '#8b5cf6', fontWeight: 'bold', cursor: 'pointer' }}>
                        {isRegister ? 'Log In' : 'Sign Up'}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default OwnerLogin;
