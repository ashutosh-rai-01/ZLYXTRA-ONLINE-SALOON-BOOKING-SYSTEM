import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, LogOut, Moon, Sun, Edit2, Save, X, Mail, Calendar, UserCheck, Phone, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

function Profile() {
    const navigate = useNavigate();
    const { user, setUser, logout } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Profile form states
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        gender: '',
        birthDate: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                gender: user.gender || '',
                birthDate: user.birthDate || ''
            });
        }
    }, [user, isEditing]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const [isDarkMode, setIsDarkMode] = useState(
        document.documentElement.getAttribute('data-theme') !== 'light'
    );

    const toggleTheme = () => {
        const newTheme = isDarkMode ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        setIsDarkMode(!isDarkMode);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const res = await api.put('/auth/profile', formData);
            setUser(res.data.data); // Update AuthContext state
            setIsEditing(false);
            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error("Failed to update profile", err);
            setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-screen" style={{ padding: '24px', backgroundColor: 'var(--surface)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <ArrowLeft size={24} cursor="pointer" onClick={() => isEditing ? setIsEditing(false) : navigate(-1)} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{isEditing ? 'Edit Profile' : 'Profile'}</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div onClick={toggleTheme} style={{ cursor: 'pointer', padding: '8px', backgroundColor: 'var(--surface-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isDarkMode ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} color="var(--primary)" />}
                    </div>
                </div>
            </div>

            {/* Notification Banner */}
            {successMsg && (
                <div style={{ 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', 
                    color: '#10b981', padding: '12px', borderRadius: '12px', marginBottom: '16px',
                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' 
                }}>
                    <CheckCircle size={18} />
                    {successMsg}
                </div>
            )}

            {errorMsg && (
                <div className="error-message" style={{ padding: '12px', fontSize: '0.85rem', marginBottom: '16px' }}>
                    {errorMsg}
                </div>
            )}

            {/* Profile Avatar / Hero Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(139, 92, 246, 0.1)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', position: 'relative' }}>
                    <User size={50} color="var(--primary)" />
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            style={{ 
                                position: 'absolute', bottom: '0', right: '0', 
                                backgroundColor: 'var(--primary)', border: 'none', 
                                borderRadius: '50%', width: '32px', height: '32px', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' 
                            }}
                        >
                            <Edit2 size={14} color="white" />
                        </button>
                    )}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0 0 4px' }}>{user?.name || 'Guest User'}</h2>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>+91 {user?.phone || '99999 99999'}</p>
            </div>

            {/* Main Content Area */}
            {!isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* View Info Box */}
                    <div style={{ padding: '20px', backgroundColor: 'var(--surface-light)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Personal Details</h3>
                            <button 
                                onClick={() => setIsEditing(true)} 
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                <Edit2 size={14} /> Edit
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Full Name</span>
                                <span style={{ fontWeight: '600' }}>{user?.name || 'Not provided'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Phone Number</span>
                                <span style={{ fontWeight: '600' }}>+91 {user?.phone}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Email Address</span>
                                <span style={{ fontWeight: '600', color: user?.email ? 'inherit' : 'var(--text-muted)' }}>{user?.email || 'Add email'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gender</span>
                                <span style={{ fontWeight: '600', textTransform: 'capitalize', color: user?.gender ? 'inherit' : 'var(--text-muted)' }}>{user?.gender || 'Not specified'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Birth Date</span>
                                <span style={{ fontWeight: '600', color: user?.birthDate ? 'inherit' : 'var(--text-muted)' }}>{user?.birthDate ? new Date(user.birthDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Add birth date'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Role</span>
                                <span style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px' }}>{user?.role || 'User'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bookings shortcut */}
                    <div 
                        onClick={() => navigate('/my-bookings')}
                        style={{ padding: '20px', backgroundColor: 'var(--surface-light)', borderRadius: '16px', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 4px' }}>Booking History</h3>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>View, track or cancel your salon appointments.</div>
                        </div>
                        <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.5rem' }}>&rarr;</div>
                    </div>
                    
                </div>
            ) : (
                
                /* Profile Edit Form */
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--surface-light)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <User size={14} /> Full Name
                            </label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={formData.name} 
                                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                placeholder="Enter your full name" 
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <Phone size={14} /> Phone Number
                            </label>
                            <input 
                                type="tel" 
                                className="form-input" 
                                value={formData.phone} 
                                onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                                placeholder="Enter phone number" 
                                required
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <Mail size={14} /> Email Address (Optional)
                            </label>
                            <input 
                                type="email" 
                                className="form-input" 
                                value={formData.email} 
                                onChange={e => setFormData({ ...formData, email: e.target.value })} 
                                placeholder="yourname@example.com" 
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <UserCheck size={14} /> Gender
                            </label>
                            <select 
                                className="form-input"
                                value={formData.gender} 
                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                style={{ color: 'white', backgroundColor: '#1e293b', border: '1px solid var(--border)', cursor: 'pointer' }}
                            >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer_not_to_say">Prefer not to say</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <Calendar size={14} /> Birth Date
                            </label>
                            <input 
                                type="date" 
                                className="form-input" 
                                value={formData.birthDate} 
                                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                style={{ color: 'white' }}
                            />
                        </div>
                        
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button 
                            type="button" 
                            className="btn-outline" 
                            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} 
                            onClick={() => setIsEditing(false)}
                            disabled={loading}
                        >
                            <X size={16} /> Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-primary" 
                            style={{ flex: 2, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            )}

            {/* Logout Section */}
            {!isEditing && (
                <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                    <button 
                        onClick={handleLogout}
                        style={{ 
                            width: '100%', padding: '16px', borderRadius: '12px', 
                            backgroundColor: 'rgba(239, 68, 68, 0.08)', color: 'var(--error)', 
                            border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', 
                            justifyContent: 'center', alignItems: 'center', gap: '10px',
                            fontSize: '1.05rem', fontWeight: 'bold', cursor: 'pointer'
                        }}
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            )}
        </div>
    );
}

export default Profile;
