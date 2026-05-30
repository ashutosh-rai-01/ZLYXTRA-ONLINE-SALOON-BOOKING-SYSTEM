import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

function AdminSalons() {
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchSalons();
    }, []);

    const fetchSalons = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/salons');
            setSalons(res.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/salon/${id}/approve`);
            fetchSalons(); // Refresh list
        } catch (error) {
            alert("Failed to approve");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this saloon?")) return;
        try {
            await api.delete(`/admin/salon/${id}`);
            fetchSalons();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const getOwnerInfo = (salon) => {
        if (salon.ownerId && typeof salon.ownerId === 'object') {
            return {
                name: salon.ownerId.name || 'Unknown Owner',
                phone: salon.ownerId.phone || 'N/A'
            };
        }
        const mockOwners = {
            'owner_1': { name: 'Vikram Singh', phone: '+91 98765 43210' },
            'owner_2': { name: 'Amit Sharma', phone: '+91 87654 32109' },
            'owner_3': { name: 'Pooja Patel', phone: '+91 76543 21098' },
            'owner_4': { name: 'Neha Gupta', phone: '+91 65432 10987' },
        };
        return mockOwners[salon.ownerId] || { name: 'New Business Partner', phone: 'N/A' };
    };

    const filteredSalons = salons.filter(salon => {
        const owner = getOwnerInfo(salon);
        const q = search.toLowerCase();
        return (
            salon.name?.toLowerCase().includes(q) ||
            salon.address?.toLowerCase().includes(q) ||
            owner.name?.toLowerCase().includes(q) ||
            owner.phone?.toLowerCase().includes(q)
        );
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Salons</h2>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '4px 0 0 0' }}>Review and manage salon onboarding requests.</p>
                </div>
                <button 
                    onClick={fetchSalons}
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
                        placeholder="Search by salon, address, or owner..." 
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
                        <span>Loading salon requests...</span>
                    </div>
                ) : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Salon Name</th>
                                <th>Owner Details</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSalons.map(salon => {
                                const owner = getOwnerInfo(salon);
                                return (
                                    <tr key={salon._id}>
                                        <td style={{ fontWeight: '700', fontSize: '0.95rem' }}>{salon.name}</td>
                                        <td>
                                            <div style={{ fontWeight: '600' }}>{owner.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{owner.phone}</div>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{salon.address}</td>
                                        <td>
                                            <span style={{ 
                                                display: 'inline-flex', padding: '4px 10px', borderRadius: '9999px',
                                                fontSize: '0.75rem', fontWeight: '700', textTransform: 'capitalize',
                                                backgroundColor: salon.isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                color: salon.isApproved ? '#10b981' : '#f59e0b'
                                            }}>
                                                {salon.isApproved ? "Live" : "Pending Approval"}
                                            </span>
                                        </td>
                                        <td style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                                            {!salon.isApproved && (
                                                <button 
                                                    onClick={() => handleApprove(salon._id)} 
                                                    style={{ 
                                                        padding: '8px 14px', backgroundColor: '#10b981', color: 'white', 
                                                        border: 'none', borderRadius: '8px', cursor: 'pointer', 
                                                        display: 'flex', alignItems: 'center', gap: '6px', 
                                                        fontSize: '0.8rem', fontWeight: '700', transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => handleReject(salon._id)} 
                                                style={{ 
                                                    padding: '8px 14px', backgroundColor: 'transparent', color: '#ef4444', 
                                                    border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', 
                                                    display: 'flex', alignItems: 'center', gap: '6px', 
                                                    fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s' 
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredSalons.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No salons found.</td>
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

export default AdminSalons;
