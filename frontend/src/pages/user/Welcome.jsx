import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scissors, Store, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

function Welcome() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    return (
        <div className="app-screen" style={{ backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '22px',
                    background: 'linear-gradient(135deg, var(--primary), #1d4ed8)',
                    margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.2rem', fontWeight: '800', color: 'white',
                    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.2)'
                }}>
                    Z
                </div>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '8px', fontWeight: '800' }}>ZLYXTRA</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '280px', margin: '0 auto', fontWeight: '500' }}>
                    Select your booking or management portal
                </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '400px' }}>
                
                {/* Customer Portal */}
                <div 
                    onClick={() => {
                        if (user && user.role !== 'user') {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        } else {
                            navigate(user && user.role === 'user' ? '/home' : '/login');
                        }
                    }}
                    className="glass-card"
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '16px',
                        cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'var(--surface)', border: '1px solid var(--border)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                >
                    <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Scissors color="#3b82f6" size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Customer Portal</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '2px 0 0 0', fontWeight: '500' }}>Book premier salons instantly</p>
                    </div>
                </div>

                {/* Partner Portal (Owner) */}
                <div 
                    onClick={() => {
                        if (user && user.role !== 'owner') {
                            localStorage.removeItem('token');
                            window.location.href = '/owner/login';
                        } else {
                            navigate(user && user.role === 'owner' ? '/owner/dashboard' : '/owner/login');
                        }
                    }}
                    className="glass-card"
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '16px',
                        cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'var(--surface)', border: '1px solid var(--border)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'var(--owner-accent)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                >
                    <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Store color="#6366f1" size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Partner Portal</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '2px 0 0 0', fontWeight: '500' }}>Manage your salon business</p>
                    </div>
                </div>

                {/* Admin Portal */}
                <div 
                    onClick={() => {
                        if (user && user.role !== 'admin') {
                            localStorage.removeItem('token');
                            window.location.href = '/admin/login';
                        } else {
                            navigate(user && user.role === 'admin' ? '/admin/dashboard' : '/admin/login');
                        }
                    }}
                    className="glass-card"
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '16px',
                        cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'var(--surface)', border: '1px solid var(--border)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = '#10b981';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                >
                    <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck color="#10b981" size={24} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Admin Control</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '2px 0 0 0', fontWeight: '500' }}>System management portal</p>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Welcome;
