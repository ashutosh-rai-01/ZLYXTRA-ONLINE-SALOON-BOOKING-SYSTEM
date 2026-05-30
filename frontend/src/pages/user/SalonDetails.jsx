import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Heart, Check } from 'lucide-react';
import api from '../../api/axios';
import { BookingContext } from '../../context/BookingContext';

function SalonDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateBooking } = useContext(BookingContext);
    
    const [salon, setSalon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);
    const [activeTab, setActiveTab] = useState('Services');
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchSalonDetails = async () => {
            try {
                const res = await api.get(`/salon/${id}`);
                setSalon(res.data.data);
                // Pre-select first service if available
                if (res.data.data?.services && res.data.data.services.length > 0) {
                    setSelectedService(res.data.data.services[0]);
                }
            } catch (error) {
                console.error("Failed to fetch salon details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSalonDetails();
    }, [id]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading salon details...</div>;
    if (!salon) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Salon not found</div>;

    const handleBookNow = () => {
        if (!selectedService) return;
        updateBooking('salon', salon);
        updateBooking('service', selectedService);
        updateBooking('price', selectedService.price);
        navigate('/slot-selection');
    };

    return (
        <div className="app-screen" style={{ 
            padding: '0 0 100px 0', 
            backgroundColor: '#f8fafc', 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            position: 'relative'
        }}>
            
            {/* Header Image Cover */}
            <div style={{ position: 'relative', height: '240px', width: '100%' }}>
                <img src={salon.image} alt={salon.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                
                {/* Floating Top Nav over Image */}
                <div style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    left: '20px', 
                    right: '20px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    zIndex: 10
                }}>
                    <div 
                        onClick={() => navigate(-1)}
                        style={{ 
                            width: '40px', 
                            height: '40px', 
                            backgroundColor: 'white', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        <ArrowLeft size={20} color="#0f172a" />
                    </div>
                    
                    <h2 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)', margin: 0 }}>Salon Details</h2>

                    <div 
                        onClick={() => setIsFavorite(!isFavorite)}
                        style={{ 
                            width: '40px', 
                            height: '40px', 
                            backgroundColor: 'white', 
                            borderRadius: '50%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Heart size={20} color={isFavorite ? '#3b82f6' : '#0f172a'} fill={isFavorite ? '#3b82f6' : 'none'} />
                    </div>
                </div>
                
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(248, 250, 252, 0.95))', height: '60px' }}></div>
            </div>

            {/* Salon Info Content */}
            <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{salon.name}</h1>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px', 
                            backgroundColor: '#fffbeb', 
                            padding: '4px 8px', 
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            color: '#d97706',
                            border: '1px solid #fde68a'
                        }}>
                            <Star size={14} color="#d97706" fill="#d97706" />
                            <span>{salon.rating || 4.8}</span>
                            <span style={{ color: '#fbbf24', fontWeight: 'normal' }}>(230)</span>
                        </div>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '6px', fontWeight: '500' }}>
                        📍 {salon.address}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px', fontWeight: '500' }}>
                        🚗 0.5 km • Open today until {salon.workingHours?.close || '9:00 PM'}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div style={{ 
                    display: 'flex', 
                    borderBottom: '1px solid #e2e8f0', 
                    gap: '24px',
                    fontSize: '0.9rem',
                    fontWeight: '700'
                }}>
                    {['Services', 'About', 'Reviews'].map(tab => {
                        const isActive = activeTab === tab;
                        return (
                            <div 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{ 
                                    paddingBottom: '12px', 
                                    color: isActive ? '#3b82f6' : '#64748b',
                                    borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab}
                            </div>
                        );
                    })}
                </div>

                {/* Services Tab Content */}
                {activeTab === 'Services' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {salon.services && salon.services.length > 0 ? (
                            salon.services.map((service, index) => {
                                const isSelected = selectedService?.id === service.id || selectedService?._id === service._id || (selectedService?.name === service.name && !selectedService?.id);
                                return (
                                    <div 
                                        key={service.id || service._id || index} 
                                        onClick={() => setSelectedService(service)}
                                        style={{ 
                                            backgroundColor: 'white', 
                                            padding: '16px', 
                                            borderRadius: '16px', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                            cursor: 'pointer',
                                            boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.08)' : '0 2px 4px rgba(0,0,0,0.01)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{service.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} color="#94a3b8" />
                                                    <span>{service.duration} mins</span>
                                                </div>
                                                <span>•</span>
                                                <span style={{ color: '#3b82f6', fontWeight: '700' }}>₹{service.price}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Selection radio visual */}
                                        <div style={{ 
                                            width: '20px', 
                                            height: '20px', 
                                            borderRadius: '50%', 
                                            border: isSelected ? '2px solid #3b82f6' : '2px solid #cbd5e1',
                                            backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.15s'
                                        }}>
                                            {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No services available.</div>
                        )}
                    </div>
                )}

                {activeTab === 'About' && (
                    <div style={{ color: '#475569', fontSize: '0.85rem', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <p>{salon.description || "Welcome to Glam Studio, your premier destination for exceptional hair styling and grooming services. Our highly skilled professional team is dedicated to providing personalized service to make you look and feel your absolute best."}</p>
                        <div>
                            <h4 style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>Working Hours</h4>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Monday - Sunday: {salon.workingHours?.open || '9:00 AM'} - {salon.workingHours?.close || '9:00 PM'}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'Reviews' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {[
                            { name: "Suresh P.", rating: 5, date: "2 days ago", text: "Amazing haircut! Highly professional staff and very hygienic salon." },
                            { name: "Meera J.", rating: 4, date: "1 week ago", text: "Very friendly environment, great hair spa experience. Recommend!" }
                        ].map((rev, i) => (
                            <div key={i} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700' }}>
                                    <span>{rev.name}</span>
                                    <span style={{ color: '#f59e0b' }}>⭐ {rev.rating}.0</span>
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '2px' }}>{rev.date}</div>
                                <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '6px', margin: 0, lineHeight: '1.4' }}>{rev.text}</p>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            {/* Sticky Bottom Book Now button */}
            <div style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                backgroundColor: 'white', 
                padding: '16px 20px 24px 20px', 
                borderTop: '1px solid #e2e8f0',
                zIndex: 100
            }}>
                <button 
                    onClick={handleBookNow}
                    disabled={!selectedService}
                    className="btn-primary"
                    style={{ 
                        height: '48px', 
                        fontSize: '0.95rem', 
                        fontWeight: '700', 
                        borderRadius: '14px',
                        opacity: selectedService ? 1 : 0.6,
                        cursor: selectedService ? 'pointer' : 'not-allowed'
                    }}
                >
                    Book Now
                </button>
            </div>
            
        </div>
    );
}

export default SalonDetails;
