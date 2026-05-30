import React, { useState, useEffect } from 'react';
import { IndianRupee, Users, Clock, CalendarDays, Sparkles, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function OwnerDashboard() {
    const navigate = useNavigate();
    const [salon, setSalon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingsList, setBookingsList] = useState([]);
    const [stats, setStats] = useState({
        todayRevenue: 0,
        todayBookings: 0,
        totalBookings: 0,
        totalEarnings: 0,
        activeStaff: 7
    });

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch owner's salon
            const resSalon = await api.get('/salon/my');
            const salonData = resSalon.data.data;
            setSalon(salonData);

            // Fetch live bookings
            const resBookings = await api.get('/bookings/salon');
            const allBookings = resBookings.data.data || [];
            setBookingsList(allBookings);

            // YYYY-MM-DD local format
            const todayStr = new Date().toLocaleDateString('en-CA');
            const todayBookingsList = allBookings.filter(b => b.date === todayStr);

            // Calculate today's revenue (only count pending, confirmed, completed)
            const activeBookings = todayBookingsList.filter(b => b.status !== 'cancelled' && b.status !== 'rejected');
            const revenue = activeBookings.reduce((sum, b) => sum + (Number(b.service?.price) || 0), 0);

            // Calculate total earnings across all bookings
            const allActiveBookings = allBookings.filter(b => b.status !== 'cancelled' && b.status !== 'rejected');
            const totalRev = allActiveBookings.reduce((sum, b) => sum + (Number(b.service?.price) || 0), 0);

            setStats({
                todayRevenue: revenue,
                todayBookings: activeBookings.length,
                totalBookings: allActiveBookings.length,
                totalEarnings: totalRev,
                activeStaff: salonData.staffCount || 7
            });

        } catch (err) {
            if (err.response && err.response.status === 404) {
                navigate('/owner/onboarding');
            } else {
                console.error("Failed to load dashboard statistics", err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [navigate]);

    if (loading) return <div style={{ padding: '36px', color: 'var(--text-muted)' }}>Loading dashboard...</div>;
    if (!salon) return null; // Will redirect in useEffect

    // 1. Filter today's upcoming bookings (confirmed or pending)
    const todayStr = new Date().toLocaleDateString('en-CA');
    const upcomingList = bookingsList
        .filter(b => b.date === todayStr && (b.status === 'confirmed' || b.status === 'pending'))
        .slice(0, 4)
        .map(b => ({
            name: b.userId?.name || 'Customer',
            service: b.service?.name || 'Service',
            time: b.startTime || 'N/A',
            status: b.status || 'pending',
            img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
        }));

    // 2. Count actual bookings by day of current week for vertical bar chart
    const weekdayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    bookingsList.forEach(b => {
        try {
            const d = new Date(b.date);
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            if (weekdayCounts[dayName] !== undefined) {
                weekdayCounts[dayName]++;
            }
        } catch(e) {}
    });

    const maxDayCount = Math.max(...Object.values(weekdayCounts), 1);
    const barChartData = [
        { day: "Mon", height: `${(weekdayCounts.Mon / maxDayCount) * 100}%` },
        { day: "Tue", height: `${(weekdayCounts.Tue / maxDayCount) * 100}%` },
        { day: "Wed", height: `${(weekdayCounts.Wed / maxDayCount) * 100}%` },
        { day: "Thu", height: `${(weekdayCounts.Thu / maxDayCount) * 100}%` },
        { day: "Fri", height: `${(weekdayCounts.Fri / maxDayCount) * 100}%` },
        { day: "Sat", height: `${(weekdayCounts.Sat / maxDayCount) * 100}%` },
        { day: "Sun", height: `${(weekdayCounts.Sun / maxDayCount) * 100}%` }
    ];

    // 3. Generate actual earnings trend for last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d.toLocaleDateString('en-CA'));
    }
    const dailyRev = last7Days.map(dateStr => {
        return bookingsList
            .filter(b => b.date === dateStr && (b.status === 'confirmed' || b.status === 'completed'))
            .reduce((sum, b) => sum + (Number(b.service?.price) || 0), 0);
    });

    const maxRev = Math.max(...dailyRev, 1);
    const earningsPoints = dailyRev.map((rev, i) => {
        const x = 10 + i * 46; // spacing inside 300px width
        const y = 90 - (rev / maxRev) * 70; // spacing inside 100px height
        return `${x},${y}`;
    }).join(' ');

    const statsCards = [
        { label: "Today's Bookings", value: stats.todayBookings, bg: "#eff6ff", color: "#3b82f6" },
        { label: "Total Bookings", value: stats.totalBookings, bg: "#f0fdf4", color: "#10b981" },
        { label: "Total Earnings", value: `₹${stats.totalEarnings.toLocaleString('en-IN')}`, bg: "#f5f3ff", color: "#6366f1" },
        { label: "Active Staff", value: stats.activeStaff, bg: "#faf5ff", color: "#8b5cf6" }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Dashboard</h2>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '4px 0 0 0' }}>Welcome back, {salon.name}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button 
                        onClick={fetchDashboardData}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '10px 16px', backgroundColor: 'white', border: '1px solid #cbd5e1',
                            borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600', color: '#475569',
                            cursor: 'pointer'
                        }}
                    >
                        <RefreshCw size={15} /> Refresh
                    </button>
                    <button 
                        onClick={() => navigate('/owner/services')}
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '10px 18px', backgroundColor: '#6366f1', color: 'white',
                            border: 'none', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700',
                            cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                        }}
                    >
                        <Plus size={16} /> Add New
                    </button>
                </div>
            </div>

            {/* Pending Approval Banner */}
            {!salon.isApproved && (
                <div style={{ 
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))', 
                    border: '1px dashed #f59e0b', 
                    padding: '16px', 
                    borderRadius: '16px', 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        <Sparkles size={16} /> Pending Admin Approval
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, lineHeight: '1.4' }}>
                        Your salon registration is currently pending admin approval. It will not be visible to users or receive bookings until verified.
                    </p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
                {statsCards.map(s => (
                    <div className="stat-card" key={s.label}>
                        <div className="stat-info">
                            <h4>{s.label}</h4>
                            <div className="value">{s.value}</div>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Live Status</span>
                        </div>
                        <div className="stat-icon-box" style={{ backgroundColor: s.bg, color: s.color }}>
                            {s.label.includes("Earnings") ? <IndianRupee size={22} /> : s.label.includes("Staff") ? <Users size={22} /> : <CalendarDays size={22} />}
                        </div>
                    </div>
                ))}
            </div>

            {/* Middle Section: Chart & Upcoming Bookings */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                
                {/* Bookings Overview Vertical Bar Chart */}
                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Bookings Overview</h3>
                    
                    {bookingsList.length > 0 ? (
                        <div className="chart-bar-container">
                            {barChartData.map(item => (
                                <div className="chart-bar-wrapper" key={item.day}>
                                    <div style={{ height: '100%', display: 'flex', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }}>
                                        <div className="chart-bar" style={{ height: item.height, width: '22px', borderRadius: '6px' }}></div>
                                    </div>
                                    <div className="chart-label">{item.day}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                            No booking data recorded for the current week.
                        </div>
                    )}
                </div>

                {/* Upcoming Bookings Today */}
                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Upcoming Bookings</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {upcomingList.length > 0 ? (
                            upcomingList.map((b, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < upcomingList.length - 1 ? '1px solid #f1f5f9' : 'none', paddingBottom: i < upcomingList.length - 1 ? '10px' : 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img 
                                            src={b.img} 
                                            alt={b.name} 
                                            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>{b.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{b.service}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569' }}>{b.time}</div>
                                        <span style={{ 
                                            fontSize: '0.65rem', padding: '2px 8px', borderRadius: '10px', fontWeight: '700',
                                            backgroundColor: b.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            color: b.status === 'confirmed' ? '#10b981' : '#f59e0b'
                                        }}>
                                            {b.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                                No upcoming appointments scheduled for today.
                            </div>
                        )}
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
                                <th>Customer</th>
                                <th>Service</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookingsList.slice(0, 3).map((b, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: '700' }}>{b.userId?.name || 'Customer'}</td>
                                    <td style={{ fontWeight: '600', color: '#475569' }}>{b.service?.name || 'Service'}</td>
                                    <td style={{ color: '#64748b' }}>{b.date}</td>
                                    <td>
                                        <span className={`status-badge status-${b.status || 'pending'}`}>
                                            {b.status || 'pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {bookingsList.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No bookings found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Earnings Overview Line Chart */}
                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Earnings Overview</h3>
                        <span style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: '700' }}>₹{stats.totalEarnings.toLocaleString('en-IN')}</span>
                    </div>

                    {bookingsList.length > 0 ? (
                        <>
                            <div style={{ width: '100%', height: '110px' }}>
                                <svg viewBox="0 0 300 100" style={{ width: '100%', height: '100%' }}>
                                    <polyline fill="none" stroke="#6366f1" strokeWidth="3" points={earningsPoints} strokeLinecap="round" />
                                    <path 
                                        d={`M 10 90 L ${earningsPoints} L 286 100 L 10 100 Z`} 
                                        fill="url(#earnings-grad)" 
                                        opacity="0.06"
                                    />
                                    <defs>
                                        <linearGradient id="earnings-grad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '600' }}>
                                {last7Days.map(dateStr => {
                                    const d = new Date(dateStr);
                                    return <span key={dateStr}>{d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                                })}
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: '30px 0', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>
                            No earnings data to display.
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}

export default OwnerDashboard;
