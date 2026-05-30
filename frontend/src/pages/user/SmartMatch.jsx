import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scissors, Clock, Calendar } from 'lucide-react';
import { BookingContext } from '../../context/BookingContext';

function SmartMatch() {
    const navigate = useNavigate();
    const { updateBooking } = useContext(BookingContext);
    
    const [step, setStep] = useState(1);
    const [selectedService, setSelectedService] = useState(null);
    const [mode, setMode] = useState('instant');
    const [selectedTime, setSelectedTime] = useState(null);

    const globalServices = [
        { id: 'gs1', name: 'Premium Haircut', minPrice: 150 },
        { id: 'gs2', name: 'Beard Trim & Styling', minPrice: 100 },
        { id: 'gs3', name: 'Hair Color', minPrice: 400 },
        { id: 'gs4', name: 'Hot Towel Shave', minPrice: 150 }
    ];

    const timeSlots = ['10:00 AM', '11:30 AM', '1:00 PM', '3:30 PM', '4:00 PM', '5:30 PM'];

    const handleFindSalons = () => {
        // Save the generic service and time requirement to context
        updateBooking('service', { name: selectedService.name, price: selectedService.minPrice });
        if (mode === 'instant') {
            updateBooking('date', 'Today');
            updateBooking('timeSlot', 'Next Available');
        } else {
            updateBooking('date', 'Tomorrow');
            updateBooking('timeSlot', selectedTime);
        }
        
        navigate('/smart-results');
    };

    return (
        <div className="app-screen" style={{ padding: '24px 24px 80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
                <ArrowLeft size={24} cursor="pointer" onClick={() => step === 2 ? setStep(1) : navigate(-1)} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Smart Match</h1>
            </div>

            {/* Progress indicator */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <div style={{ flex: 1, height: '4px', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></div>
                <div style={{ flex: 1, height: '4px', backgroundColor: step === 2 ? 'var(--primary)' : 'var(--border)', borderRadius: '2px' }}></div>
            </div>

            {step === 1 && (
                <div>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>What do you need?</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Select a service so we can find salons offering it.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {globalServices.map(service => (
                            <div 
                                key={service.id}
                                onClick={() => setSelectedService(service)}
                                style={{
                                    padding: '20px', borderRadius: '16px', cursor: 'pointer',
                                    backgroundColor: selectedService?.id === service.id ? 'var(--primary-glow)' : 'var(--surface-light)',
                                    border: `1px solid ${selectedService?.id === service.id ? 'var(--primary)' : 'var(--border)'}`,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Scissors size={20} color={selectedService?.id === service.id ? 'var(--primary)' : 'var(--text-muted)'} />
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{service.name}</span>
                                </div>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>~ ₹{service.minPrice}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>When do you need it?</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>We'll filter salons based on their actual availability.</p>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                        <div 
                            onClick={() => setMode('instant')}
                            style={{ 
                                flex: 1, padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                backgroundColor: mode === 'instant' ? 'var(--primary)' : 'var(--surface-light)',
                                border: `1px solid ${mode === 'instant' ? 'var(--primary)' : 'var(--border)'}`,
                                transition: 'all 0.2s'
                            }}
                        >
                            <Clock size={24} style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Instant (ASAP)</div>
                        </div>
                        <div 
                            onClick={() => setMode('schedule')}
                            style={{ 
                                flex: 1, padding: '16px', borderRadius: '12px', textAlign: 'center', cursor: 'pointer',
                                backgroundColor: mode === 'schedule' ? 'var(--primary)' : 'var(--surface-light)',
                                border: `1px solid ${mode === 'schedule' ? 'var(--primary)' : 'var(--border)'}`,
                                transition: 'all 0.2s'
                            }}
                        >
                            <Calendar size={24} style={{ margin: '0 auto 8px' }} />
                            <div style={{ fontWeight: 'bold' }}>Schedule</div>
                        </div>
                    </div>

                    {mode === 'schedule' && (
                        <div>
                            <h3 style={{ marginBottom: '16px' }}>Select Time</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                                {timeSlots.map(slot => (
                                    <div 
                                        key={slot}
                                        onClick={() => setSelectedTime(slot)}
                                        style={{
                                            padding: '12px 0', textAlign: 'center', borderRadius: '8px', cursor: 'pointer',
                                            backgroundColor: selectedTime === slot ? 'var(--primary-glow)' : 'var(--surface-light)',
                                            border: `1px solid ${selectedTime === slot ? 'var(--primary)' : 'var(--border)'}`,
                                            color: selectedTime === slot ? 'var(--primary)' : 'var(--text-main)'
                                        }}
                                    >
                                        {slot}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '24px', backgroundColor: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '480px' }}>
                    {step === 1 ? (
                        <button 
                            className="btn-primary" 
                            style={{ margin: 0 }}
                            onClick={() => setStep(2)}
                            disabled={!selectedService}
                        >
                            Continue to Time
                        </button>
                    ) : (
                        <button 
                            className="btn-primary" 
                            style={{ margin: 0 }}
                            onClick={handleFindSalons}
                            disabled={mode === 'schedule' && !selectedTime}
                        >
                            Find Available Salons
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default SmartMatch;
