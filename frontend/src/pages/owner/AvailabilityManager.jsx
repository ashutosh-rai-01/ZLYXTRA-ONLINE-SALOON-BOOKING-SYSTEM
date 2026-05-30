import React, { useState } from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';

function AvailabilityManager() {
    const [date, setDate] = useState('2023-10-25'); // Mock date
    const [blockedSlots, setBlockedSlots] = useState([{ time: '13:00', reason: 'Lunch Break' }]);
    
    // Auto-generated 30 min slots for demo
    const timeSlots = ['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'];

    const toggleSlot = (time) => {
        if (blockedSlots.find(s => s.time === time)) {
            setBlockedSlots(blockedSlots.filter(s => s.time !== time));
        } else {
            setBlockedSlots([...blockedSlots, { time, reason: 'Blocked' }]);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>Manage Slots</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Tap a slot to block or open it.</p>

            <div style={{ backgroundColor: 'var(--surface-light)', padding: '16px', borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Calendar size={20} color="var(--owner-accent)" />
                    <span style={{ fontWeight: 'bold' }}>Today</span>
                </div>
                <div style={{ color: 'var(--text-muted)' }}>{date}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {timeSlots.map(time => {
                    const isBlocked = blockedSlots.find(s => s.time === time);
                    return (
                        <div 
                            key={time}
                            onClick={() => toggleSlot(time)}
                            style={{
                                padding: '16px 0', textAlign: 'center', borderRadius: '12px', cursor: 'pointer',
                                backgroundColor: isBlocked ? 'rgba(239, 68, 68, 0.1)' : 'var(--surface-light)',
                                border: `1px solid ${isBlocked ? 'rgba(239, 68, 68, 0.3)' : 'var(--border)'}`,
                                color: isBlocked ? 'var(--error)' : 'var(--text-main)',
                                transition: 'all 0.2s',
                                opacity: isBlocked ? 0.7 : 1
                            }}
                        >
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>{time}</div>
                            <div style={{ fontSize: '0.7rem' }}>{isBlocked ? 'BLOCKED' : 'OPEN'}</div>
                        </div>
                    )
                })}
            </div>
            
            <button className="btn-outline" style={{ marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Plus size={18} /> Add Custom Break
            </button>
        </div>
    );
}

export default AvailabilityManager;
