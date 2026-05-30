import React, { useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function VerifyOTP() {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyOtp } = useContext(AuthContext);
    
    const phone = location.state?.phone;

    useEffect(() => {
        if (!phone) navigate('/login-otp');
    }, [phone, navigate]);

    useEffect(() => {
        if (otp.length === 4) {
            handleVerify();
        }
    }, [otp]);

    const handleVerify = async () => {
        if (otp.length !== 4) return;
        setLoading(true);
        setError('');
        try {
            await verifyOtp(phone, otp);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-screen">
            <div style={{ marginTop: '40px', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Verify OTP</h1>
                <p style={{ color: 'var(--text-muted)' }}>Code sent to +91 {phone}</p>
                <p style={{ color: 'var(--primary)', fontSize: '0.85rem', marginTop: '5px' }}>(Hint: use 1234)</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '40px' }}>
                {[0, 1, 2, 3].map((idx) => (
                    <input 
                        key={idx}
                        type="text" 
                        maxLength={1}
                        className="form-input" 
                        style={{ 
                            width: '60px', height: '60px', textAlign: 'center', 
                            fontSize: '1.5rem', fontWeight: 'bold', borderRadius: '12px',
                            borderColor: error ? 'var(--error)' : 'var(--border)'
                        }}
                        value={otp[idx] || ''}
                        onChange={(e) => {
                            const newOtp = otp.split('');
                            newOtp[idx] = e.target.value.replace(/\D/g, '');
                            setOtp(newOtp.join(''));
                        }}
                    />
                ))}
            </div>

            <button 
                className="btn-primary" 
                style={{ padding: '16px', fontSize: '1.1rem', opacity: loading ? 0.7 : 1 }}
                onClick={handleVerify}
                disabled={otp.length < 4 || loading}
            >
                {loading ? 'Verifying...' : 'Verify'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)' }}>
                Didn't receive the code? <span style={{ color: 'var(--secondary)', cursor: 'pointer' }}>Resend</span>
            </div>
        </div>
    );
}

export default VerifyOTP;
