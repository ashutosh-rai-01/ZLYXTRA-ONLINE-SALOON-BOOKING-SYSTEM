import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/bookings');
            setBookings(res.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(b => {
        const q = search.toLowerCase();
        return (
            b._id?.toLowerCase().includes(q) ||
            b.salonId?.name?.toLowerCase().includes(q) ||
            b.userId?.name?.toLowerCase().includes(q) ||
            b.status?.toLowerCase().includes(q)
        );
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Global Bookings Ledger</h2>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '4px 0 0 0' }}>Monitor all platform transactions.</p>
                </div>
                <button 
                    onClick={fetchBookings}
                    className="btn-outline"
                >
                    <RefreshCw size={15} /> Refresh List
                </button>
            </div>

            {/* Filter and Search controls */}
            <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '520px', position: 'relative' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                        type="text" 
                        placeholder="Search by ID, salon, customer, status..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '46px', width: '100%', backgroundColor: 'white', border: '1px solid #cbd5e1' }}
                    />
                </div>
            </div>

            {/* Table Container in Glass Card */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto', animation: 'spin 1.5s linear infinite' }} />
                        <span>Loading bookings...</span>
                    </div>
                ) : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Salon</th>
                                <th>Customer</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map(b => (
                                <tr key={b._id}>
                                    <td style={{ fontWeight: '700', color: '#475569', fontSize: '0.85rem' }}>{b._id}</td>
                                    <td style={{ fontWeight: '600' }}>{b.salonId?.name || 'Unknown Salon'}</td>
                                    <td style={{ fontWeight: '600' }}>{b.userId?.name || 'Unknown Customer'}</td>
                                    <td>
                                        <span className={`status-badge status-${b.status}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No bookings found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            
            {/* Embedded styles for spinning animation */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default AdminBookings;
