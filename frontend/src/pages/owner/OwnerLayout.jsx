import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, User, Scissors, Users, CalendarDays, 
    Calendar, IndianRupee, Star, Settings, LogOut 
} from 'lucide-react';
import api from '../../api/axios';

function OwnerLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [salon, setSalon] = React.useState(null);

    React.useEffect(() => {
        const root = document.getElementById('root');
        if (root) {
            root.style.maxWidth = 'none';
            root.style.boxShadow = 'none';
            root.style.overflowX = 'visible';
            root.style.border = 'none';
        }
        
        // Fetch salon name/details for the sidebar
        const fetchSalon = async () => {
            try {
                const res = await api.get('/salon/my');
                setSalon(res.data.data);
            } catch (err) {
                console.error("Failed to load salon info in layout", err);
            }
        };
        fetchSalon();

        return () => {
            if (root) {
                root.style.maxWidth = '480px';
                root.style.boxShadow = '0 25px 80px -20px rgba(0, 0, 0, 0.25), 0 0 50px rgba(236, 72, 153, 0.05)';
                root.style.overflowX = 'hidden';
            }
        };
    }, []);

    const navItems = [
        { path: '/owner/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/owner/profile', label: 'My Profile', icon: <User size={18} />, disabled: true },
        { path: '/owner/services', label: 'Services', icon: <Scissors size={18} /> },
        { path: '/owner/staff', label: 'Staff', icon: <Users size={18} />, disabled: true },
        { path: '/owner/bookings', label: 'Bookings', icon: <CalendarDays size={18} /> },
        { path: '/owner/availability', label: 'Calendar', icon: <Calendar size={18} /> },
        { path: '/owner/earnings', label: 'Earnings', icon: <IndianRupee size={18} />, disabled: true },
        { path: '/owner/reviews', label: 'Reviews', icon: <Star size={18} />, disabled: true },
        { path: '/owner/settings', label: 'Settings', icon: <Settings size={18} />, disabled: true },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/owner/login');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', color: '#0f172a', overflow: 'hidden' }}>
            
            {/* Sidebar (Sleek Dark Navy) */}
            <div style={{ 
                width: '260px', 
                backgroundColor: '#090d16', 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px 16px',
                borderRight: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div>
                    {/* Salon Owner Header Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <img 
                            src={salon?.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=120"} 
                            alt="Salon Logo" 
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #6366f1' }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                            <h1 style={{ fontSize: '1rem', fontWeight: '800', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis', margin: 0 }}>
                                {salon?.name || 'Glam Studio'}
                            </h1>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Salon Owner</div>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '24px' }}>
                        {navItems.map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <div 
                                    key={item.label}
                                    onClick={() => !item.disabled && navigate(item.path)}
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px', 
                                        padding: '12px 16px', 
                                        borderRadius: '10px', 
                                        cursor: item.disabled ? 'not-allowed' : 'pointer',
                                        background: isActive ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                                        color: isActive ? 'white' : item.disabled ? '#475569' : '#94a3b8',
                                        transition: 'all 0.2s',
                                        opacity: item.disabled ? 0.6 : 1
                                    }}
                                >
                                    {item.icon}
                                    <span style={{ fontWeight: isActive ? '600' : '500', fontSize: '0.9rem' }}>{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Logout Footer Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div 
                        onClick={handleLogout}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px', 
                            padding: '12px 16px', 
                            borderRadius: '10px', 
                            cursor: 'pointer',
                            color: '#ef4444',
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogOut size={18} />
                        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Logout</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
                <Outlet />
            </div>
        </div>
    );
}

export default OwnerLayout;
