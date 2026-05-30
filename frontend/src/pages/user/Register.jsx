import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Scissors, ArrowLeft } from 'lucide-react';

function Register() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await register(name, phone, password, 'user');
            if (res.user.role === 'admin') navigate('/admin/dashboard');
            else if (res.user.role === 'owner') navigate('/owner/dashboard');
            else navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
                    onClick={() => navigate('/login')}
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
                        <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Create Account</h1>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '2px 0 0 0', fontWeight: '500' }}>Join premier salon bookings today</p>
                    </div>
                </div>

                {/* Error Banner */}
                {error && <div className="error-message">{error}</div>}

                {/* Registration Form */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Full Name</label>
                        <input 
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Phone Number</label>
                        <input 
                            type="tel"
                            placeholder="Enter 10-digit number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="form-input"
                            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                            required
                        />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label>Create Password</label>
                        <input 
                            type="password"
                            placeholder="Choose a secure password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                            required
                        />
                    </div>
                    
                    <button type="submit" className="btn-primary" style={{ marginTop: '16px', height: '48px', borderRadius: '12px' }}>
                        Sign Up
                    </button>
                </form>

                {/* Login Footer Link */}
                <div style={{ marginTop: '28px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                    Already have an account? <span onClick={() => navigate('/login')} style={{ color: 'var(--primary)', fontWeight: '700', cursor: 'pointer' }}>Log In</span>
                </div>
            </div>
        </div>
    );
}

export default Register;
