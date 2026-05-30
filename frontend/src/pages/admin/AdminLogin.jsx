import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

function AdminLogin() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login, logout } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await login(phone, password);
            
            if (res.user.role !== 'admin') {
                logout();
                setError('Unauthorized access. Admin portal is strictly restricted.');
                return;
            }
            navigate('/admin/dashboard');
            
        } catch (err) {
            setError(err.response?.data?.message || "Invalid Admin Credentials");
        } finally {
            setLoading(false);
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
                        placeholder="Admin ID (Phone)"
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
                    
                    <button type="submit" style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', marginTop: '16px' }} disabled={loading}>
                        {loading ? 'Authenticating...' : 'Enter System'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
