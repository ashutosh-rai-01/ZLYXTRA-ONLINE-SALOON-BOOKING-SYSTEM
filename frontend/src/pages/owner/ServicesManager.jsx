import React, { useState, useEffect } from 'react';
import { Scissors, Trash2, Edit3, Plus, X, AlertCircle, Sparkles, Clock, CheckCircle } from 'lucide-react';
import api from '../../api/axios';

function ServicesManager() {
    const [salon, setSalon] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentService, setCurrentService] = useState({ name: '', price: '', duration: '', _id: null });
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchSalonDetails();
    }, []);

    const fetchSalonDetails = async () => {
        try {
            const res = await api.get('/salon/my');
            setSalon(res.data.data);
            setServices(res.data.data.services || []);
        } catch (err) {
            console.error("Failed to fetch salon services", err);
            setErrorMsg("Could not load your salon profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setCurrentService({ name: '', price: '', duration: '', _id: null });
        setErrorMsg('');
        setIsEditing(true);
    };

    const handleOpenEdit = (svc) => {
        setCurrentService({ 
            name: svc.name, 
            price: svc.price, 
            duration: svc.duration, 
            _id: svc._id || svc.name // fallback to name for mock store matching 
        });
        setErrorMsg('');
        setIsEditing(true);
    };

    const handleInputChange = (field, value) => {
        setCurrentService({ ...currentService, [field]: value });
    };

    const handleQuickTagClick = (name, price, duration) => {
        setCurrentService({ ...currentService, name, price, duration });
    };

    const handleDelete = async (targetSvc) => {
        if (services.length <= 1) {
            alert("Your salon must offer at least one service!");
            return;
        }

        const confirmDelete = window.confirm(`Are you sure you want to delete the service "${targetSvc.name}"?`);
        if (!confirmDelete) return;

        setLoading(true);
        try {
            const updatedServices = services.filter(s => 
                (s._id && s._id !== targetSvc._id) || (!s._id && s.name !== targetSvc.name)
            );

            const payload = {
                ...salon,
                services: updatedServices
            };

            const res = await api.put('/salon/my', payload);
            setServices(updatedServices);
            setSalon(res.data.data);
            showNotification('Service deleted successfully!');
        } catch (err) {
            console.error("Failed to delete service", err);
            setErrorMsg("Failed to delete service. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        
        const { name, price, duration, _id } = currentService;

        // Validation
        if (!name.trim()) {
            setErrorMsg("Service name cannot be empty.");
            return;
        }
        if (price === '' || Number(price) < 0) {
            setErrorMsg("Price must be a valid positive number.");
            return;
        }
        if (duration === '' || Number(duration) <= 0) {
            setErrorMsg("Duration must be a positive number greater than 0.");
            return;
        }

        setSaving(true);
        try {
            let updatedServices = [...services];

            if (_id !== null) {
                // Edit mode
                updatedServices = updatedServices.map(s => {
                    const match = s._id === _id || s.name === _id;
                    return match ? { ...s, name, price: Number(price), duration: Number(duration) } : s;
                });
            } else {
                // Add mode
                updatedServices.push({
                    name,
                    price: Number(price),
                    duration: Number(duration)
                });
            }

            const payload = {
                ...salon,
                services: updatedServices
            };

            const res = await api.put('/salon/my', payload);
            setServices(updatedServices);
            setSalon(res.data.data);
            setIsEditing(false);
            showNotification(_id !== null ? 'Service updated successfully!' : 'New service added successfully!');
        } catch (err) {
            console.error("Failed to save service", err);
            setErrorMsg(err.response?.data?.message || "Failed to update services. Please check inputs.");
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const popularTemplates = [
        { name: 'Men\'s Trim', price: 120, duration: 20 },
        { name: 'Beard Grooming', price: 150, duration: 25 },
        { name: 'Spa Facial Treatment', price: 450, duration: 40 },
        { name: 'Deep Massage', price: 800, duration: 60 },
        { name: 'Hair Conditioning', price: 180, duration: 20 }
    ];

    if (loading && !salon) {
        return <div style={{ padding: '24px', color: 'var(--text-muted)' }}>Loading services manager...</div>;
    }

    return (
        <div style={{ padding: '24px', position: 'relative', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Services Menu</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Manage the list of offerings at your salon</p>
                </div>
                {!isEditing && (
                    <button onClick={handleOpenAdd} className="btn-primary" style={{ margin: 0, padding: '8px 14px', width: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                        <Plus size={16} /> Add Service
                    </button>
                )}
            </div>

            {/* Notification Banner */}
            {successMsg && (
                <div style={{ 
                    backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', 
                    color: '#10b981', padding: '12px', borderRadius: '12px', marginBottom: '16px',
                    display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' 
                }}>
                    <CheckCircle size={18} />
                    {successMsg}
                </div>
            )}

            {/* Edit / Create Form Panel */}
            {isEditing && (
                <div style={{ 
                    backgroundColor: 'var(--surface-light)', border: '1px solid var(--border)', 
                    padding: '20px', borderRadius: '16px', marginBottom: '24px',
                    animation: 'slideDown 0.3s ease'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Sparkles size={18} color="var(--owner-accent)" />
                            {currentService._id ? 'Edit Service' : 'Add New Service'}
                        </h2>
                        <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="error-message" style={{ padding: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
                            {errorMsg}
                        </div>
                    )}

                    {/* Quick Suggestions (Only when adding) */}
                    {!currentService._id && (
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--owner-accent)', marginBottom: '8px' }}>⚡ Use Suggestion:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {popularTemplates.map((tpl, i) => (
                                    <button 
                                        key={i} 
                                        type="button"
                                        onClick={() => handleQuickTagClick(tpl.name, tpl.price, tpl.duration)} 
                                        style={{ 
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', 
                                            color: 'var(--text-muted)', fontSize: '0.7rem', padding: '4px 8px', 
                                            borderRadius: '20px', cursor: 'pointer' 
                                        }}
                                    >
                                        {tpl.name} (₹{tpl.price})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Service Name</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={currentService.name} 
                                onChange={e => handleInputChange('name', e.target.value)} 
                                placeholder="e.g. Premium Haircut & Styling" 
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label>Price (₹)</label>
                                <input 
                                    type="number" 
                                    className="form-input" 
                                    value={currentService.price} 
                                    onChange={e => handleInputChange('price', e.target.value === '' ? '' : Number(e.target.value))} 
                                    placeholder="e.g. 200" 
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                <label>Duration (Mins)</label>
                                <input 
                                    type="number" 
                                    className="form-input" 
                                    value={currentService.duration} 
                                    onChange={e => handleInputChange('duration', e.target.value === '' ? '' : Number(e.target.value))} 
                                    placeholder="e.g. 30" 
                                />
                            </div>
                        </div>

                        <div style={{ 
                            backgroundColor: 'var(--owner-accent-glow)', border: '1px solid rgba(99, 102, 241, 0.1)', 
                            padding: '10px 12px', borderRadius: '10px', display: 'flex', gap: '8px', alignItems: 'flex-start' 
                        }}>
                            <AlertCircle size={16} color="var(--owner-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                                <strong>Tip:</strong> Keep the service duration precise. Customers will be offered dynamic scheduling time-slots computed exactly on these durations.
                            </span>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
                            <button type="submit" className="btn-primary" style={{ flex: 2, margin: 0 }} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Service'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Services List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {services.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', backgroundColor: 'var(--surface-light)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <Scissors size={32} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                        <p>No services registered. Click "Add Service" to start building your menu!</p>
                    </div>
                ) : (
                    services.map((svc, i) => (
                        <div key={svc._id || i} style={{ 
                            backgroundColor: 'var(--surface-light)', 
                            border: '1px solid var(--border)', 
                            borderRadius: '16px', 
                            padding: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'border-color 0.2s ease',
                            cursor: 'default'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{ 
                                    backgroundColor: 'var(--owner-accent-glow)', 
                                    color: 'var(--owner-accent)', 
                                    padding: '12px', 
                                    borderRadius: '12px' 
                                }}>
                                    <Scissors size={20} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px' }}>{svc.name}</h3>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--owner-accent)', fontWeight: 'bold' }}>₹{svc.price}</span>
                                        <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--border)', borderRadius: '50%' }}></span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <Clock size={12} /> {svc.duration} Mins
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                    onClick={() => handleOpenEdit(svc)} 
                                    style={{ 
                                        background: 'none', border: 'none', color: 'var(--text-muted)', 
                                        padding: '8px', cursor: 'pointer', borderRadius: '8px', 
                                        transition: 'color 0.2s', display: 'flex', alignItems: 'center'
                                    }}
                                    title="Edit Service"
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--owner-accent)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    <Edit3 size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(svc)} 
                                    style={{ 
                                        background: 'none', border: 'none', color: 'var(--text-muted)', 
                                        padding: '8px', cursor: 'pointer', borderRadius: '8px', 
                                        transition: 'color 0.2s', display: 'flex', alignItems: 'center'
                                    }}
                                    title="Delete Service"
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--error)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ServicesManager;
