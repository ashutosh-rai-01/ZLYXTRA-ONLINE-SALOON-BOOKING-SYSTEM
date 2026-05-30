import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Calendar } from 'lucide-react';

function Success() {
    const navigate = useNavigate();
    const location = useLocation();

    const details = location.state || {};
    const bookingId = details.bookingId || ("BK" + Math.floor(10000 + Math.random() * 90000));
    const salonName = details.salonName || "Glam Studio";
    const serviceName = details.serviceName || "Haircut";
    const date = details.date || "31 May 2024";
    const timeSlot = details.timeSlot || "01:00 PM";

    // Format date nicely
    const getFormattedDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div className="app-screen" style={{ 
            padding: '40px 20px', 
            backgroundColor: 'var(--bg-color)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: '100vh',
            gap: '24px'
        }}>
            
            {/* High-Contrast Green Circular Emblem */}
            <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)'
            }}>
                <Check size={32} color="white" strokeWidth={3} />
            </div>

            {/* Confirmed Greeting */}
            <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Booking Confirmed! 🎉</h1>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '6px', fontWeight: '500' }}>Your booking has been confirmed</p>
            </div>

            {/* Premium Confirmed Ticket Details Card */}
            <div className="glass-card" style={{ 
                width: '100%', 
                maxWidth: '380px', 
                padding: '24px', 
                backgroundColor: 'var(--surface)', 
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                textAlign: 'left'
            }}>
                {/* Booking ID row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>Booking ID</span>
                    <span style={{ color: '#0f172a', fontSize: '0.9rem', fontWeight: '800' }}>#{bookingId}</span>
                </div>

                <div style={{ height: '1px', backgroundColor: '#f1f5f9' }}></div>

                {/* Salon details block */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{salonName}</h3>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600', marginTop: '4px', lineHeight: 1.4 }}>
                        {serviceName} • {getFormattedDate(date)} • {timeSlot}
                    </div>
                </div>
            </div>

            {/* Buttons list */}
            <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {/* Add to Calendar outline button */}
                <button 
                    onClick={() => alert("Added to calendar successfully!")}
                    className="btn-outline"
                    style={{ 
                        height: '48px', 
                        borderRadius: '14px', 
                        backgroundColor: 'var(--surface)', 
                        border: '1px solid #cbd5e1',
                        color: '#475569',
                        fontSize: '0.9rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <Calendar size={18} /> Add to Calendar
                </button>

                {/* Done solid button */}
                <button 
                    onClick={() => navigate('/home')}
                    className="btn-primary"
                    style={{ 
                        height: '48px', 
                        fontSize: '0.95rem', 
                        fontWeight: '700', 
                        borderRadius: '14px' 
                    }}
                >
                    Done
                </button>
            </div>
            
        </div>
    );
}

export default Success;
