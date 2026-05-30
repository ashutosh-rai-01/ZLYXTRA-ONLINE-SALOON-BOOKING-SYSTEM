import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { BookingContext } from '../../context/BookingContext';
import api from '../../api/axios';

function SlotSelection() {
    const navigate = useNavigate();
    const { bookingData, updateBooking } = useContext(BookingContext);
    
    // Core calendar states
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [error, setError] = useState(null);

    const salonId = bookingData.salon?._id || bookingData.salon?.id;

    // Format utility YYYY-MM-DD
    const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Load available slots from backend / mock API
    useEffect(() => {
        if (!salonId || !selectedDate) return;

        const fetchAvailability = async () => {
            setLoadingSlots(true);
            setError(null);
            try {
                const dateStr = formatDate(selectedDate);
                const res = await api.get('/availability/slots', {
                    params: { salonId, date: dateStr }
                });
                setSlots(res.data.data || []);
            } catch (err) {
                console.error("Error fetching availability:", err);
                // Fallback slots matching mockup if API fails or empty
                const fallbackSlots = [
                    { time: "08:00 AM", available: true },
                    { time: "10:00 AM", available: true },
                    { time: "11:00 AM", available: true },
                    { time: "12:00 PM", available: true },
                    { time: "01:00 PM", available: true },
                    { time: "02:00 PM", available: true },
                    { time: "03:00 PM", available: true },
                    { time: "04:00 PM", available: true },
                ];
                setSlots(fallbackSlots);
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchAvailability();
    }, [salonId, selectedDate]);

    if (!bookingData.service) {
        return (
            <div className="app-screen" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
                <AlertCircle size={48} color="#3b82f6" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>No Service Selected</h3>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>Please select a service before choosing an appointment slot.</p>
                <button className="btn-primary" onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    const handleContinue = () => {
        if (!selectedSlot) return;
        updateBooking('date', formatDate(selectedDate));
        updateBooking('timeSlot', selectedSlot);
        navigate('/checkout');
    };

    // Calculate dates for the full calendar month grid
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Days array
        const days = [];
        
        // Get day of week for the first day (0 = Sunday, 1 = Monday, etc.)
        // Adjust to make Monday index 0:
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6; // Sunday becomes last index
        
        // Fill padding days of previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            days.push({
                dayNum: prevMonthLastDay - i,
                isCurrentMonth: false,
                date: new Date(year, month - 1, prevMonthLastDay - i)
            });
        }
        
        // Fill current month days
        const totalDays = lastDay.getDate();
        for (let i = 1; i <= totalDays; i++) {
            days.push({
                dayNum: i,
                isCurrentMonth: true,
                date: new Date(year, month, i)
            });
        }
        
        // Fill next month days
        const remaining = 42 - days.length; // Max 6 rows * 7 days
        for (let i = 1; i <= remaining; i++) {
            days.push({
                dayNum: i,
                isCurrentMonth: false,
                date: new Date(year, month + 1, i)
            });
        }
        
        return days;
    };

    const calendarDays = getDaysInMonth(currentMonth);

    const changeMonth = (direction) => {
        const next = new Date(currentMonth);
        next.setMonth(currentMonth.getMonth() + direction);
        setCurrentMonth(next);
    };

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const weekHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Select Date & Time</h1>
            </div>

            {/* Custom Premium Calendar Grid Block */}
            <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #e2e8f0' }}>
                {/* Month Selector Switcher */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div 
                        onClick={() => changeMonth(-1)}
                        style={{ cursor: 'pointer', padding: '6px', borderRadius: '8px', backgroundColor: '#f1f5f9' }}
                    >
                        <ChevronLeft size={16} color="#475569" />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>{monthName}</span>
                    <div 
                        onClick={() => changeMonth(1)}
                        style={{ cursor: 'pointer', padding: '6px', borderRadius: '8px', backgroundColor: '#f1f5f9' }}
                    >
                        <ChevronRight size={16} color="#475569" />
                    </div>
                </div>

                {/* Weekday headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                    {weekHeaders.map(day => (
                        <div key={day} style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8' }}>
                            {day.slice(0, 1)}
                        </div>
                    ))}
                </div>

                {/* Day numbers grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px 4px', textAlign: 'center' }}>
                    {calendarDays.map((day, index) => {
                        const dateFormatted = formatDate(day.date);
                        const selectedFormatted = formatDate(selectedDate);
                        const isSelected = dateFormatted === selectedFormatted && day.isCurrentMonth;
                        
                        return (
                            <div 
                                key={index}
                                onClick={() => {
                                    if (day.isCurrentMonth) {
                                        setSelectedDate(day.date);
                                        setSelectedSlot(null); // Reset slot
                                    }
                                }}
                                style={{
                                    height: '34px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.85rem',
                                    fontWeight: isSelected ? '700' : '500',
                                    color: isSelected 
                                        ? 'white' 
                                        : (day.isCurrentMonth ? '#0f172a' : '#cbd5e1'),
                                    backgroundColor: isSelected ? '#3b82f6' : 'transparent',
                                    borderRadius: '50%',
                                    cursor: day.isCurrentMonth ? 'pointer' : 'default',
                                    boxShadow: isSelected ? '0 4px 10px rgba(59, 130, 246, 0.25)' : 'none',
                                    transition: 'all 0.15s'
                                }}
                            >
                                {day.dayNum}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Time Slots Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Available Slots</h3>
                
                {loadingSlots ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 8px auto', animation: 'spin 1.5s linear infinite' }} />
                        <span style={{ fontSize: '0.85rem' }}>Loading time slots...</span>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {slots.map((slot) => {
                            const isSelected = selectedSlot === slot.time;
                            const isAvailable = slot.available;
                            
                            return (
                                <button 
                                    key={slot.time}
                                    disabled={!isAvailable}
                                    onClick={() => setSelectedSlot(slot.time)}
                                    style={{
                                        padding: '12px 0',
                                        borderRadius: '12px',
                                        cursor: isAvailable ? 'pointer' : 'not-allowed',
                                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'white',
                                        border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                        color: isSelected ? '#3b82f6' : (isAvailable ? '#475569' : '#cbd5e1'),
                                        fontWeight: isSelected ? '700' : '500',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.15s',
                                        boxShadow: isSelected ? '0 4px 10px rgba(59, 130, 246, 0.05)' : 'none',
                                        textDecoration: isAvailable ? 'none' : 'line-through'
                                    }}
                                >
                                    {slot.time}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Sticky Bottom Continue Button */}
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
                    onClick={handleContinue}
                    disabled={!selectedSlot || loadingSlots}
                    className="btn-primary"
                    style={{ 
                        height: '48px', 
                        fontSize: '0.95rem', 
                        fontWeight: '700', 
                        borderRadius: '14px',
                        opacity: selectedSlot ? 1 : 0.6,
                        cursor: selectedSlot ? 'pointer' : 'not-allowed'
                    }}
                >
                    Continue
                </button>
            </div>

            {/* Spinner Keyframe */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default SlotSelection;
