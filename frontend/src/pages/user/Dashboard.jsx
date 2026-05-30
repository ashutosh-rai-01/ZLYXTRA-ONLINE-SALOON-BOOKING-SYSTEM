import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div>
            <nav className="navbar">
                <div className="nav-brand text-gradient">ZLYXTRA</div>
                <button onClick={handleLogout} className="btn-outline">Sign Out</button>
            </nav>

            <div className="dashboard">
                <div className="dashboard-header">
                    <h2>Welcome, <span className="text-gradient">{user?.name}</span></h2>
                    <p>You are logged in as a <strong>{user?.role?.toUpperCase()}</strong>.</p>
                </div>

                {user?.role === 'user' && (
                    <div className="dashboard-content">
                        <h3>Discover Nearby Salons</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                            The salon search map and listing features will appear here soon...
                        </p>
                    </div>
                )}

                {user?.role === 'owner' && (
                    <div className="dashboard-content">
                        <h3>Salon Owner Dashboard</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                            Your salon profile, services, and appointment bookings will appear here...
                        </p>
                    </div>
                )}

                {user?.role === 'admin' && (
                    <div className="dashboard-content">
                        <h3>Admin Control Center</h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                            Pending salon approvals, user management, and revenue stats will appear here...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
