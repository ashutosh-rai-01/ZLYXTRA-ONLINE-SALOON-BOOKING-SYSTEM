import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function LoginOTP() {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { sendOtp } = useContext(AuthContext);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        if (phone.length >= 10) {
            setLoading(true);
            try {
                await sendOtp(phone);
                navigate('/verify-otp', { state: { phone } });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to send OTP');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="app-screen">
            <div style={{ marginTop: '40px', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Enter your <br/>mobile number</h1>
                <p style={{ color: 'var(--text-muted)' }}>We will send you a 4-digit verification code.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSendOTP} style={{ flex: 1 }}>
                <div className="form-group">
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{
                            padding: '16px', backgroundColor: 'var(--surface-light)',
                            border: '1px solid var(--border)', borderRadius: '12px',
                            display: 'flex', alignItems: 'center', fontWeight: 'bold'
                        }}>+91</div>
                        <input 
                            type="tel" 
                            className="form-input" 
                            style={{ padding: '16px', fontSize: '1.1rem', borderRadius: '12px' }}
                            placeholder="99999 99999"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0,10))}
                            autoFocus
                        />
                    </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                    <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ padding: '16px', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}
                        disabled={phone.length < 10 || loading}
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default LoginOTP;
