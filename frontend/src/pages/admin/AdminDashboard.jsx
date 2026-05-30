import React, { useState, useEffect } from 'react';
import { Store, Users, CalendarDays, IndianRupee, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

function AdminDashboard() {
    const [salons, setSalons] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [resSalons, resBookings, resUsers] = await Promise.all([
                api.get('/admin/salons'),
                api.get('/admin/bookings'),
                api.get('/admin/users')
            ]);
            setSalons(resSalons.data.data || []);
            setBookings(resBookings.data.data || []);
            setUsers(resUsers.data.data || []);
        } catch (error) {
            console.error("Failed to load dashboard live data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // 1. Calculate live statistics
    const totalSalons = salons.length;
    const totalUsers = users.filter(u => u.role === 'user').length;
    const totalBookings = bookings.length;
    
    // Sum revenue from confirmed or completed bookings
    const totalRevenue = bookings
        .filter(b => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum, b) => sum + (Number(b.service?.price) || 0), 0);

    const stats = [
        { label: "Total Salons", value: totalSalons, icon: <Store size={22} color="#3b82f6" />, bg: "rgba(59, 130, 246, 0.1)" },
        { label: "Total Users", value: totalUsers, icon: <Users size={22} color="#3b82f6" />, bg: "rgba(59, 130, 246, 0.1)" },
        { label: "Total Bookings", value: totalBookings, icon: <CalendarDays size={22} color="#10b981" />, bg: "rgba(16, 185, 129, 0.1)" },
        { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: <IndianRupee size={22} color="#f59e0b" />, bg: "rgba(245, 158, 11, 0.1)" }
    ];

    // 2. Calculate actual Top Salons by bookings count
    const salonBookingsMap = {};
    bookings.forEach(b => {
        const sName = b.salonId?.name || "Unknown Salon";
        const sImg = b.salonId?.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=120";
        const sRating = b.salonId?.rating || 4.8;
        if (!salonBookingsMap[sName]) {
            salonBookingsMap[sName] = { name: sName, count: 0, rating: sRating, img: sImg };
        }
        salonBookingsMap[sName].count++;
    });

    let topSalons = Object.values(salonBookingsMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
        .map(item => ({
            name: item.name,
            bookings: `${item.count} Bookings`,
            rating: item.rating,
            img: item.img
        }));

    // Fallback if no bookings exist yet
    if (topSalons.length === 0) {
        topSalons = salons.slice(0, 4).map(s => ({
            name: s.name,
            bookings: "Active Salon",
            rating: s.rating || 4.8,
            img: s.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=120"
        }));
    }

    // 3. Slice recent bookings
    const recentBookings = bookings.slice(0, 4).map(b => ({
        id: b._id ? `#${b._id.slice(-7).toUpperCase()}` : '#BK-NEW',
        user: b.userId?.name || 'Customer',
        salon: b.salonId?.name || 'Salon',
        date: b.date || '31 May 2024',
        status: b.status || 'pending'
    }));

    // 4. Calculate actual bookings by status for Donut Chart
    const totalCount = bookings.length || 1;
    const conf = bookings.filter(b => b.status === 'confirmed').length;
    const compl = bookings.filter(b => b.status === 'completed').length;
    const pend = bookings.filter(b => b.status === 'pending').length;
    const canc = bookings.filter(b => b.status === 'cancelled').length;

    const confPct = Math.round((conf / totalCount) * 100);
    const complPct = Math.round((compl / totalCount) * 100);
    const pendPct = Math.round((pend / totalCount) * 100);
    const cancPct = Math.round((canc / totalCount) * 100);

    // Donut math (radius = 40, circumference = 251.3)
    const confLen = (conf / totalCount) * 251.3;
    const complLen = (compl / totalCount) * 251.3;
    const pendLen = (pend / totalCount) * 251.3;
    const cancLen = (canc / totalCount) * 251.3;

    // 5. Generate actual bookings trend for last 7 days
    const last7Days = [];
    const weekdays = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d.toLocaleDateString('en-CA')); // YYYY-MM-DD
        weekdays.push(d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
    }

    const dailyCounts = last7Days.map(dateStr => {
        const dayBookings = bookings.filter(b => b.date === dateStr);
        const dayRevenue = dayBookings
            .filter(b => b.status === 'confirmed' || b.status === 'completed')
            .reduce((sum, b) => sum + (Number(b.service?.price) || 0), 0);
        return {
            bookingsCount: dayBookings.length,
            revenue: dayRevenue
        };
    });

    const maxBookings = Math.max(...dailyCounts.map(d => d.bookingsCount), 1);
    const maxRevenue = Math.max(...dailyCounts.map(d => d.revenue), 1);

    // Map trends to SVG coordinates
    const bookingsPoints = dailyCounts.map((d, i) => {
        const x = 40 + i * 90;
        const y = 200 - (d.bookingsCount / maxBookings) * 160;
        return `${x},${y}`;
    }).join(' ');

    const revenuePoints = dailyCounts.map((d, i) => {
        const x = 40 + i * 90;
        const y = 200 - (d.revenue / maxRevenue) * 160;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Dashboard</h2>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '4px 0 0 0' }}>Welcome back, Admin</p>
                </div>
                <button 
                    onClick={fetchAllData}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '10px 16px', backgroundColor: 'white', border: '1px solid #cbd5e1',
                        borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', color: '#475569',
                        cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    <RefreshCw size={15} /> Refresh Dashboard
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px auto', animation: 'spin 1.5s linear infinite' }} />
                    <span style={{ fontWeight: '500' }}>Fetching real-time business statistics...</span>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="stats-grid">
                        {stats.map(s => (
                            <div className="stat-card" key={s.label}>
                                <div className="stat-info">
                                    <h4>{s.label}</h4>
                                    <div className="value">{s.value}</div>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Live Database Status</span>
                                </div>
                                <div className="stat-icon-box" style={{ backgroundColor: s.bg }}>
                                    {s.icon}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts and Top Salons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                        
                        {/* Bookings & Revenue Line Chart */}
                        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Bookings Overview</h3>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', fontWeight: '600' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                                        <span style={{ color: '#475569' }}>Bookings</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#6366f1' }}></div>
                                        <span style={{ color: '#475569' }}>Revenue</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic SVG Plot */}
                            <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                                <svg viewBox="0 0 600 220" style={{ width: '100%', height: '100%' }}>
                                    {/* Grids */}
                                    <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                                    <line x1="40" y1="65" x2="580" y2="65" stroke="#f1f5f9" strokeWidth="1" />
                                    <line x1="40" y1="110" x2="580" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                                    <line x1="40" y1="155" x2="580" y2="155" stroke="#f1f5f9" strokeWidth="1" />
                                    <line x1="40" y1="200" x2="580" y2="200" stroke="#cbd5e1" strokeWidth="1" />

                                    {bookings.length > 0 ? (
                                        <>
                                            {/* Bookings Line */}
                                            <polyline fill="none" stroke="#3b82f6" strokeWidth="3" points={bookingsPoints} strokeLinecap="round" />
                                            {/* Revenue Line */}
                                            <polyline fill="none" stroke="#6366f1" strokeWidth="3" points={revenuePoints} strokeLinecap="round" />
                                        </>
                                    ) : (
                                        <text x="300" y="110" textAnchor="middle" fill="#94a3b8" style={{ fontSize: '14px', fontWeight: '500' }}>
                                            No booking logs recorded for the last 7 days.
                                        </text>
                                    )}
                                </svg>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>
                                {weekdays.map(day => <span key={day}>{day}</span>)}
                            </div>
                        </div>

                        {/* Top Salons Feed */}
                        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Top Salons</h3>
                                <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '700' }}>Live</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {topSalons.map((salon) => (
                                    <div key={salon.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                            <img 
                                                src={salon.img} 
                                                alt={salon.name} 
                                                style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }}
                                            />
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{salon.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{salon.bookings}</div>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '700' }}>⭐ {salon.rating}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Bottom Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                        
                        {/* Recent Bookings Table */}
                        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Recent Bookings</h3>
                            
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Booking ID</th>
                                        <th>User</th>
                                        <th>Salon</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentBookings.map(b => (
                                        <tr key={b.id}>
                                            <td style={{ fontWeight: '700', color: '#475569' }}>{b.id}</td>
                                            <td style={{ fontWeight: '600' }}>{b.user}</td>
                                            <td>{b.salon}</td>
                                            <td style={{ color: '#64748b' }}>{b.date}</td>
                                            <td>
                                                <span className={`status-badge status-${b.status}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentBookings.length === 0 && (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No bookings found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Booking Status Donut Chart */}
                        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Bookings by Status</h3>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '140px' }}>
                                <svg viewBox="0 0 100 100" style={{ width: '130px', height: '130px' }}>
                                    {bookings.length > 0 ? (
                                        <>
                                            {/* Confirmed */}
                                            {conf > 0 && <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray={`${confLen} 251.3`} strokeDashoffset="0" />}
                                            {/* Completed */}
                                            {compl > 0 && <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray={`${complLen} 251.3`} strokeDashoffset={`-${confLen}`} />}
                                            {/* Pending */}
                                            {pend > 0 && <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray={`${pendLen} 251.3`} strokeDashoffset={`-${confLen + complLen}`} />}
                                            {/* Cancelled */}
                                            {canc > 0 && <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="12" strokeDasharray={`${cancLen} 251.3`} strokeDashoffset={`-${confLen + complLen + pendLen}`} />}
                                        </>
                                    ) : (
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                                    )}
                                    <circle cx="50" cy="50" r="28" fill="white" />
                                    <text x="50" y="47" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '11px', fontWeight: '800', fill: '#0f172a' }}>{bookings.length}</text>
                                    <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '6px', fontWeight: '600', fill: '#94a3b8' }}>Total</text>
                                </svg>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px', fontSize: '0.8rem', fontWeight: '600' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                                    <span style={{ color: '#475569' }}>Confirmed <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{confPct}%</span></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                                    <span style={{ color: '#475569' }}>Completed <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{complPct}%</span></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                                    <span style={{ color: '#475569' }}>Pending <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{pendPct}%</span></span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                                    <span style={{ color: '#475569' }}>Cancelled <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{cancPct}%</span></span>
                                </div>
                            </div>
                        </div>

                    </div>
                </>
            )}
            
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default AdminDashboard;
