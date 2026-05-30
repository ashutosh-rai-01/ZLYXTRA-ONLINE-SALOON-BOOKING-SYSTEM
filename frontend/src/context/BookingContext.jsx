import React, { createContext, useState } from 'react';
import api from '../api/axios';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
    const [bookingData, setBookingData] = useState({
        salon: null,
        service: null,
        date: null,
        timeSlot: null,
        price: 0
    });

    const [myBookings, setMyBookings] = useState([]);

    const updateBooking = (key, value) => {
        setBookingData(prev => ({ ...prev, [key]: value }));
    };

    const confirmBooking = async () => {
        try {
            const res = await api.post('/bookings', {
                salonId: bookingData.salon._id || bookingData.salon.id,
                service: bookingData.service,
                date: bookingData.date,
                startTime: bookingData.timeSlot,
                price: bookingData.price
            });
            
            // Reset current booking
            setBookingData({
                salon: null,
                service: null,
                date: null,
                timeSlot: null,
                price: 0
            });
            return res.data;
        } catch (err) {
            console.error("Booking failed:", err);
            throw err;
        }
    };

    return (
        <BookingContext.Provider value={{ bookingData, updateBooking, confirmBooking, myBookings }}>
            {children}
        </BookingContext.Provider>
    );
};
