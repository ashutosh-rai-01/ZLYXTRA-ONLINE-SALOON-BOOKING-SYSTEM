import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        if (user.role !== 'user') return false;
        
        const q = search.toLowerCase();
        return (
            user.name?.toLowerCase().includes(q) ||
            user.phone?.toLowerCase().includes(q) ||
            user.email?.toLowerCase().includes(q)
        );
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: '#0f172a' }}>Customer Management</h2>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '4px 0 0 0' }}>List of all registered customers.</p>
                </div>
                <button 
                    onClick={fetchUsers}
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
                        placeholder="Search by name, phone, or email..." 
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
                        <span>Loading customers...</span>
                    </div>
                ) : (
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone Number</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user._id}>
                                    <td style={{ fontWeight: '700' }}>{user.name || 'N/A'}</td>
                                    <td style={{ fontWeight: '600', color: '#475569' }}>{user.phone}</td>
                                    <td style={{ color: '#64748b' }}>{user.email || 'N/A'}</td>
                                    <td>
                                        <span style={{ 
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', 
                                            padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', 
                                            textTransform: 'uppercase', fontWeight: '700' 
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No customers found.</td>
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

export default AdminUsers;
