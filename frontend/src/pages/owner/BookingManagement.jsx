import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';

function BookingManagement() {
    const [tab, setTab] = useState('pending'); // pending, completed
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/bookings/salon');
            setBookings(res.data.data);
        } catch (err) {
            console.error("Failed to fetch owner bookings", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status) => {
        try {
            await api.put(`/bookings/${id}/status`, { status });
            // Optimistic update
            setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const filtered = bookings.filter(b => {
        if (tab === 'pending') return b.status === 'pending';
        return ['confirmed', 'completed', 'cancelled', 'rejected'].includes(b.status);
    });

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>Bookings</h1>

            <div style={{ display: 'flex', backgroundColor: 'var(--surface-light)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
                <div onClick={() => setTab('pending')} style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer', backgroundColor: tab === 'pending' ? 'var(--surface)' : 'transparent', color: tab === 'pending' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: tab === 'pending' ? 'bold' : 'normal' }}>
                    New Requests
                </div>
                <div onClick={() => setTab('completed')} style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: '8px', cursor: 'pointer', backgroundColor: tab === 'completed' ? 'var(--surface)' : 'transparent', color: tab === 'completed' ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: tab === 'completed' ? 'bold' : 'normal' }}>
                    History
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Loading requests...</div> : 
                 filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>No {tab} bookings found.</div>
                ) : (
                    filtered.map(booking => (
                        <div key={booking._id} style={{ backgroundColor: 'var(--surface-light)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--owner-accent)', fontWeight: 'bold', marginBottom: '4px' }}>{booking.date} | {booking.startTime}</div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{booking.userId?.name || 'Customer'}</h3>
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>₹{booking.service?.price}</div>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>{booking.service?.name}</div>
                            
                            {tab === 'pending' && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleAction(booking._id, 'rejected')} className="btn-outline" style={{ flex: 1, padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', borderColor: 'var(--error)', color: 'var(--error)' }}>
                                        <XCircle size={18} /> Reject
                                    </button>
                                    <button onClick={() => handleAction(booking._id, 'confirmed')} className="btn-primary" style={{ flex: 1, margin: 0, padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', backgroundColor: '#10b981', color: 'white' }}>
                                        <CheckCircle size={18} /> Accept
                                    </button>
                                </div>
                            )}
                            {tab === 'completed' && (
                                <div style={{ color: booking.status === 'cancelled' || booking.status === 'rejected' ? 'var(--error)' : '#10b981', fontWeight: 'bold', textTransform: 'capitalize' }}>
                                    Status: {booking.status}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default BookingManagement;
