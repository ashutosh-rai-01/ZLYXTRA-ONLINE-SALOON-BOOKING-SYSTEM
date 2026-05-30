import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Store, Users, CalendarDays, Scissors, 
    CreditCard, Star, FileBarChart2, Settings, LifeBuoy, LogOut 
} from 'lucide-react';

function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        const root = document.getElementById('root');
        if (root) {
            root.style.maxWidth = 'none';
            root.style.boxShadow = 'none';
            root.style.overflowX = 'visible';
            root.style.border = 'none';
        }
        return () => {
            if (root) {
                root.style.maxWidth = '480px';
                root.style.boxShadow = '0 25px 80px -20px rgba(0, 0, 0, 0.25), 0 0 50px rgba(236, 72, 153, 0.05)';
                root.style.overflowX = 'hidden';
            }
        };
    }, []);

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { path: '/admin/salons', label: 'Salons', icon: <Store size={18} /> },
        { path: '/admin/users', label: 'Users', icon: <Users size={18} /> },
        { path: '/admin/bookings', label: 'Bookings', icon: <CalendarDays size={18} /> },
        { path: '/admin/services', label: 'Services', icon: <Scissors size={18} />, disabled: true },
        { path: '/admin/payments', label: 'Payments', icon: <CreditCard size={18} />, disabled: true },
        { path: '/admin/reviews', label: 'Reviews', icon: <Star size={18} />, disabled: true },
        { path: '/admin/reports', label: 'Reports', icon: <FileBarChart2 size={18} />, disabled: true },
        { path: '/admin/settings', label: 'Settings', icon: <Settings size={18} />, disabled: true },
        { path: '/admin/support', label: 'Support', icon: <LifeBuoy size={18} />, disabled: true },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f1f5f9', color: '#0f172a', overflow: 'hidden' }}>
            
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
                    {/* Brand/Logo */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 12px 28px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            color: 'white',
                            fontSize: '1.1rem'
                        }}>S</div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', letterSpacing: '0.5px' }}>SalonPro</h1>
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
                                        background: isActive ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent',
                                        color: isActive ? 'white' : item.disabled ? '#475569' : '#94a3b8',
                                        transition: 'all 0.2s',
                                        opacity: item.disabled ? 0.6 : 1
                                    }}
                                    className={isActive ? 'sidebar-item-active' : ''}
                                >
                                    {item.icon}
                                    <span style={{ fontWeight: isActive ? '600' : '500', fontSize: '0.9rem' }}>{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar Footer Profile */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Logout Button */}
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

                    {/* Profile Card */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        padding: '14px 12px', 
                        backgroundColor: 'rgba(255,255,255,0.04)', 
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" 
                            alt="Admin Profile" 
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }}
                        />
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'white', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Admin</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>Super Admin</div>
                        </div>
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

export default AdminLayout;
