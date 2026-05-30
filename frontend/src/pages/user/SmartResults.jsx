import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock } from 'lucide-react';
import { mockSalons } from '../../data/mockData';
import { BookingContext } from '../../context/BookingContext';

function SmartResults() {
    const navigate = useNavigate();
    const { bookingData, updateBooking } = useContext(BookingContext);

    if (!bookingData.service) {
        return <div style={{ padding: '24px' }}>No smart match data. <button onClick={() => navigate('/home')}>Go Home</button></div>;
    }

    // Filter salons that offer a service matching the name
    // In a real app, the backend would do this based on time slots and coordinates
    const filteredSalons = mockSalons.filter(salon => 
        salon.services.some(s => s.name.includes(bookingData.service.name) || bookingData.service.name.includes('Haircut'))
    );

    const handleExpressBook = (salon) => {
        updateBooking('salon', salon);
        // We already have service and timeSlot set from the Wizard!
        // So we skip SalonDetails AND SlotSelection, straight to checkout!
        navigate('/checkout');
    };

    return (
        <div className="app-screen" style={{ padding: '0', backgroundColor: '#050505' }}>
            <div style={{ padding: '24px', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <ArrowLeft size={24} cursor="pointer" onClick={() => navigate(-1)} />
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Available Now</h1>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <div style={{ backgroundColor: 'var(--surface-light)', padding: '6px 12px', borderRadius: '12px' }}>
                        {bookingData.service.name}
                    </div>
                    <div style={{ backgroundColor: 'var(--surface-light)', padding: '6px 12px', borderRadius: '12px' }}>
                        {bookingData.timeSlot}
                    </div>
                </div>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Found {filteredSalons.length} salons matching your criteria
                </h2>

                {filteredSalons.map((salon) => (
                    <div key={salon.id} style={{ 
                        backgroundColor: 'var(--surface-light)', borderRadius: '20px', 
                        overflow: 'hidden', border: '1px solid var(--primary)', // Highlight border to show it's a smart match
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.1)'
                    }}>
                        <div style={{ display: 'flex', padding: '16px', gap: '16px' }}>
                            <img src={salon.image} alt={salon.name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '4px' }}>{salon.name}</h3>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{salon.distance} • {salon.address}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                                    <Star size={14} color="#f59e0b" fill="#f59e0b" /> <span style={{ fontWeight: 'bold' }}>{salon.rating}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)', padding: '16px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Guaranteed Slot</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12}/> {bookingData.timeSlot}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>₹{bookingData.service.price}</div>
                            </div>
                            <button 
                                className="btn-primary" 
                                style={{ margin: 0, padding: '12px' }}
                                onClick={() => handleExpressBook(salon)}
                            >
                                Express Book
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SmartResults;
