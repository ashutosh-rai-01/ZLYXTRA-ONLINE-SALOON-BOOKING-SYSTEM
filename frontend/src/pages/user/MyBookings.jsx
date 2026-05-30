import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, MapPin, Calendar, Clock } from 'lucide-react';
import api from '../../api/axios';

function MyBookings() {
    const navigate = useNavigate();
    const [tab, setTab] = useState('upcoming'); // 'upcoming' or 'completed'
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await api.get('/bookings/me');
                setMyBookings(res.data.data);
            } catch (err) {
                console.error("Failed to fetch bookings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    // Filter Logic
    const filteredBookings = myBookings.filter(b => {
        if (tab === 'upcoming') return ['pending', 'confirmed'].includes(b.status);
        return ['completed', 'cancelled', 'rejected'].includes(b.status);
    });

    return (
        <div className="app-screen" style={{ padding: '0', backgroundColor: 'var(--bg-color)' }}>
            <div style={{ padding: '24px', backgroundColor: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>My Bookings</h1>
                </div>

                <div style={{ display: 'flex', backgroundColor: 'var(--surface-light)', borderRadius: '12px', padding: '4px' }}>
                    <div 
                        onClick={() => setTab('upcoming')}
                        style={{ 
                            flex: 1, textAlign: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                            backgroundColor: tab === 'upcoming' ? 'var(--surface)' : 'transparent',
                            color: tab === 'upcoming' ? 'var(--text-main)' : 'var(--text-muted)',
                            fontWeight: tab === 'upcoming' ? 'bold' : 'normal'
                        }}
                    >
                        Upcoming
                    </div>
                    <div 
                        onClick={() => setTab('completed')}
                        style={{ 
                            flex: 1, textAlign: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                            backgroundColor: tab === 'completed' ? 'var(--surface)' : 'transparent',
                            color: tab === 'completed' ? 'var(--text-main)' : 'var(--text-muted)',
                            fontWeight: tab === 'completed' ? 'bold' : 'normal'
                        }}
                    >
                        History
                    </div>
                </div>
            </div>

            <div style={{ padding: '24px', paddingBottom: '80px' }}>
                {loading ? <div style={{textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)'}}>Loading your bookings...</div> : 
                 filteredBookings.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                        You have no {tab} bookings.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {filteredBookings.map((booking, idx) => (
                            <div key={idx} className="glass-card" style={{ padding: '20px', borderRadius: '20px', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>{booking.salon?.name || 'Salon'}</h3>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--primary-hover)', fontWeight: '600', marginTop: '2px' }}>{booking.service?.name}</div>
                                    </div>
                                    <div style={{ 
                                        backgroundColor: booking.status === 'confirmed' ? 'rgba(16, 185, 129, 0.12)' : 
                                                         booking.status === 'cancelled' || booking.status === 'rejected' ? 'rgba(244, 63, 94, 0.12)' : 'rgba(147, 51, 234, 0.12)', 
                                        color: booking.status === 'confirmed' ? 'var(--success)' : 
                                               booking.status === 'cancelled' || booking.status === 'rejected' ? 'var(--error)' : 'var(--primary-hover)', 
                                        padding: '5px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '800', textTransform: 'capitalize', letterSpacing: '0.5px' 
                                    }}>
                                        {booking.status === 'rejected' ? 'Rejected by Salon' : booking.status}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '18px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} color="var(--primary-hover)"/> {booking.date}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} color="var(--primary-hover)"/> {booking.startTime}</div>
                                </div>
                                
                                {booking.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button className="btn-outline" style={{ flex: 1, padding: '10px', fontSize: '0.85rem', borderColor: 'rgba(244, 63, 94, 0.3)', color: 'var(--error)', borderRadius: '10px' }}>Cancel Request</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

             {/* Bottom Nav */}
             <div style={{ 
                position: 'fixed', bottom: 0, width: '100%', maxWidth: '480px', 
                backgroundColor: 'var(--surface)', opacity: 0.95, backdropFilter: 'blur(10px)',
                display: 'flex', justifyContent: 'space-around', padding: '15px 0',
                borderTop: '1px solid var(--border)'
            }}>
                <div onClick={() => navigate('/home')} style={{ color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <Search size={24} /> <span style={{ fontSize: '0.7rem' }}>Explore</span>
                </div>
                <div onClick={() => navigate('/my-bookings')} style={{ color: 'var(--primary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={24} /> <span style={{ fontSize: '0.7rem' }}>Bookings</span>
                </div>
            </div>
        </div>
    );
}

export default MyBookings;
