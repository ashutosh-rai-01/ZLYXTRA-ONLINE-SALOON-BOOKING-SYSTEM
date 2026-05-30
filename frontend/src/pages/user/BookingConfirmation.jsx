import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, ChevronRight, CreditCard } from 'lucide-react';
import { BookingContext } from '../../context/BookingContext';

function BookingConfirmation() {
    const navigate = useNavigate();
    const { bookingData, confirmBooking } = useContext(BookingContext);

    if (!bookingData.salon) {
        return <div style={{ padding: '24px' }}>No booking data.</div>;
    }

    const handleConfirm = async () => {
        try {
            const currentBooking = { ...bookingData };
            const res = await confirmBooking();
            const createdBooking = res?.data;
            
            navigate('/success', {
                state: {
                    bookingId: createdBooking?._id || createdBooking?.id || "BK" + Math.floor(10000 + Math.random() * 90000),
                    salonName: currentBooking.salon?.name,
                    salonOwnerPhone: currentBooking.salon?.ownerPhone || currentBooking.salon?.phone || '99999 99999',
                    serviceName: currentBooking.service?.name,
                    date: currentBooking.date,
                    timeSlot: currentBooking.timeSlot,
                    price: currentBooking.price
                }
            });
        } catch (err) {
            console.error("Booking confirmation failed", err);
        }
    };

    return (
        <div className="app-screen" style={{ 
            padding: '24px 20px 100px 20px', 
            backgroundColor: '#f8fafc', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px', 
            minHeight: '100vh',
            position: 'relative'
        }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                        }}
                    >
                        <ArrowLeft size={18} color="#0f172a" />
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Booking Summary</h1>
                </div>
                <div 
                    onClick={() => navigate('/home')}
                    style={{ cursor: 'pointer', padding: '6px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                    <X size={18} color="#0f172a" />
                </div>
            </div>

            {/* Salon Card Info */}
            <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '16px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                <img 
                    src={bookingData.salon.image} 
                    alt={bookingData.salon.name} 
                    style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{bookingData.salon.name}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '4px', fontWeight: '500', lineHeight: 1.3 }}>
                        📍 {bookingData.salon.address}
                    </p>
                </div>
            </div>

            {/* Booking Specifics */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{bookingData.service.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{bookingData.service.duration} mins</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: '#3b82f6' }}>₹{bookingData.price}</span>
                </div>
                
                <div style={{ height: '1px', backgroundColor: '#f1f5f9' }}></div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.8rem', fontWeight: '600' }}>
                    <div>
                        <div style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px', marginBottom: '4px' }}>Date</div>
                        <div style={{ color: '#0f172a', fontWeight: '700' }}>
                            {new Date(bookingData.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                    </div>
                    <div>
                        <div style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px', marginBottom: '4px' }}>Time</div>
                        <div style={{ color: '#0f172a', fontWeight: '700' }}>{bookingData.timeSlot}</div>
                    </div>
                </div>
            </div>

            {/* Total Amount & Payment Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Total amount bar */}
                <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#475569' }}>Total Amount</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>₹{bookingData.price}</span>
                </div>

                {/* Payment Method bar */}
                <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CreditCard size={18} color="#3b82f6" />
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#475569' }}>Payment Method</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                        <span>UPI</span>
                        <ChevronRight size={16} color="#64748b" />
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Confirm Button */}
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
                    onClick={handleConfirm}
                    className="btn-primary"
                    style={{ 
                        height: '48px', 
                        fontSize: '0.95rem', 
                        fontWeight: '700', 
                        borderRadius: '14px'
                    }}
                >
                    Confirm Booking
                </button>
            </div>
            
        </div>
    );
}

export default BookingConfirmation;
