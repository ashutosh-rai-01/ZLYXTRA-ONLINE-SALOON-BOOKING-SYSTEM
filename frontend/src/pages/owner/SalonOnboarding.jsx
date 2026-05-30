import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

function SalonOnboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        openTime: '09:00',
        closeTime: '21:00',
        services: [{ name: '', price: '', duration: '' }]
    });

    const handleAddService = () => {
        setFormData({ ...formData, services: [...formData.services, { name: '', price: '', duration: '' }] });
    };

    const handleRemoveService = (index) => {
        if (formData.services.length === 1) {
            alert('Your salon must have at least one service!');
            return;
        }
        const newServices = formData.services.filter((_, idx) => idx !== index);
        setFormData({ ...formData, services: newServices });
    };

    const handleQuickAddService = (name, price, duration) => {
        // If the first service is empty, overwrite it. Otherwise append.
        if (formData.services.length === 1 && !formData.services[0].name && !formData.services[0].price) {
            setFormData({
                ...formData,
                services: [{ name, price, duration }]
            });
        } else {
            setFormData({
                ...formData,
                services: [...formData.services, { name, price, duration }]
            });
        }
    };

    const handleServiceChange = (index, field, value) => {
        const newServices = [...formData.services];
        newServices[index][field] = value;
        setFormData({ ...formData, services: newServices });
    };

    const handleSubmit = async () => {
        // Validate services
        const invalid = formData.services.some(s => !s.name || s.price === '' || s.duration === '' || Number(s.price) < 0 || Number(s.duration) <= 0);
        if (invalid) {
            alert('Please fill out all services with valid names, positive prices, and non-zero durations.');
            return;
        }

        setLoading(true);
        try {
            // Reformat for API
            const payload = {
                name: formData.name,
                address: formData.address,
                lat: 26.7450 + (Math.random() * 0.005), // Randomize slightly around Kunraghat
                lng: 83.3980 + (Math.random() * 0.005),
                workingHours: { open: formData.openTime, close: formData.closeTime, daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
                services: formData.services.map(s => ({
                    name: s.name,
                    price: Number(s.price),
                    duration: Number(s.duration)
                }))
            };
            await api.post('/salon', payload);
            navigate('/owner/dashboard'); // Or an 'Awaiting Approval' screen
        } catch (error) {
            alert('Failed to register salon. ' + (error.response?.data?.message || ''));
        } finally {
            setLoading(false);
        }
    };

    const serviceTemplates = [
        { name: 'Men\'s Haircut', price: 150, duration: 30 },
        { name: 'Beard Trim & Styling', price: 100, duration: 20 },
        { name: 'Classic Shave', price: 80, duration: 15 },
        { name: 'Deep Clean Facial', price: 400, duration: 45 },
        { name: 'Premium Hair Color', price: 600, duration: 60 },
        { name: 'Hair Wash & Conditioning', price: 120, duration: 25 }
    ];

    return (
        <div className="app-screen" style={{ padding: '24px', backgroundColor: '#111827', overflowY: 'auto' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '10px' }}>Setup your Salon</h1>
            <div style={{ height: '4px', backgroundColor: 'var(--surface-light)', borderRadius: '2px', marginBottom: '30px', display: 'flex' }}>
                <div style={{ width: step === 1 ? '50%' : '100%', backgroundColor: 'var(--primary)', borderRadius: '2px', transition: 'width 0.3s' }}></div>
            </div>

            {step === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)' }}>Salon Name</label>
                        <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Luxe Beauty Studio" />
                    </div>
                    <div className="form-group">
                        <label style={{ color: 'var(--text-muted)' }}>Complete Address</label>
                        <textarea className="form-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows="3" placeholder="123 Main Street..." />
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label style={{ color: 'var(--text-muted)' }}>Opens At</label>
                            <input type="time" className="form-input" value={formData.openTime} onChange={e => setFormData({...formData, openTime: e.target.value})} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label style={{ color: 'var(--text-muted)' }}>Closes At</label>
                            <input type="time" className="form-input" value={formData.closeTime} onChange={e => setFormData({...formData, closeTime: e.target.value})} />
                        </div>
                    </div>
                    <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => setStep(2)} disabled={!formData.name || !formData.address}>Next: Add Services</button>
                </div>
            )}

            {step === 2 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Services Menu</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Add the services you offer. The duration is used to calculate booking slots for users.</p>
                    </div>

                    {/* Quick Add Templates */}
                    <div style={{ backgroundColor: 'var(--surface-light)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>⚡ Quick-Add Popular Services:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {serviceTemplates.map((tpl, i) => (
                                <button key={i} onClick={() => handleQuickAddService(tpl.name, tpl.price, tpl.duration)} style={{ 
                                    background: 'rgba(139, 92, 246, 0.1)', border: '1px dashed var(--primary)', 
                                    color: 'var(--text-main)', fontSize: '0.75rem', padding: '6px 10px', 
                                    borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' 
                                }}>
                                    + {tpl.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {formData.services.map((svc, idx) => (
                        <div key={idx} style={{ backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Service #{idx + 1}</span>
                                {formData.services.length > 1 && (
                                    <button onClick={() => handleRemoveService(idx)} style={{ background: 'none', border: 'none', color: 'var(--error)', fontSize: '0.8rem', cursor: 'pointer' }}>Remove</button>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Service Name</label>
                                <input type="text" className="form-input" value={svc.name} onChange={e => handleServiceChange(idx, 'name', e.target.value)} placeholder="e.g. Classic Men's Haircut, Premium Blowdry" />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price (₹)</label>
                                    <input type="number" className="form-input" value={svc.price} onChange={e => handleServiceChange(idx, 'price', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 150" />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration (Mins)</label>
                                    <input type="number" className="form-input" value={svc.duration} onChange={e => handleServiceChange(idx, 'duration', e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 30" />
                                </div>
                            </div>
                        </div>
                    ))}

                    <button className="btn-outline" onClick={handleAddService}>+ Add Custom Service</button>
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button className="btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
                        <button className="btn-primary" style={{ flex: 2, margin: 0 }} onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Complete Setup'}</button>
                    </div>
                </div>
            )}
        </div>
    );
}


export default SalonOnboarding;
