require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');

// Define Express app for testing
const app = express();
app.use(express.json());
app.use(cors());

// Mount routers
const auth = require('./routes/auth');
const salonRoutes = require('./routes/salonRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', auth);
app.use('/api/salon', salonRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/admin', adminRoutes);

const PORT = 5055;
const server = http.createServer(app);

// Simple Helper to make HTTP requests
const request = (method, path, body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
        const opt = {
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(opt, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', (err) => reject(err));
        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

server.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);
    try {
        console.log("\n--- STARTING SYSTEM INTEGRATION TESTS ---");

        // 1. Register a test user
        console.log("\n1. Registering test user...");
        const registerRes = await request('POST', '/api/auth/register', {
            name: 'Test Customer',
            phone: '99' + Math.floor(10000000 + Math.random() * 90000000),
            password: 'password123',
            role: 'user'
        });
        
        if (registerRes.status !== 201) {
            console.error("FAIL: Registration failed", registerRes.body);
            process.exit(1);
        }
        console.log("SUCCESS: User registered!");
        const token = registerRes.body.token;
        const authHeader = { 'Authorization': `Bearer ${token}` };

        // 2. Fetch all salons
        console.log("\n2. Fetching salons...");
        const salonsRes = await request('GET', '/api/salon');
        if (salonsRes.status !== 200 || !salonsRes.body.data.length) {
            console.error("FAIL: Could not fetch salons", salonsRes.body);
            process.exit(1);
        }
        const salon = salonsRes.body.data[0];
        console.log(`SUCCESS: Found salon "${salon.name}" with ID: ${salon._id || salon.id}`);
        const salonId = salon._id || salon.id;

        // 3. Fetch availability slots (expecting all to be available)
        const testDate = '2026-05-20';
        console.log(`\n3. Fetching slots for date ${testDate} before booking...`);
        const slotsBefore = await request('GET', `/api/availability/slots?salonId=${salonId}&date=${testDate}`);
        if (slotsBefore.status !== 200) {
            console.error("FAIL: Failed to fetch slots", slotsBefore.body);
            process.exit(1);
        }
        
        const targetSlot = '1:00 PM';
        const targetSlotData = slotsBefore.body.data.find(s => s.time === targetSlot);
        console.log(`Slot ${targetSlot} status before:`, targetSlotData);
        if (!targetSlotData || targetSlotData.available !== true) {
            console.error("FAIL: Target slot is not available initially!");
            process.exit(1);
        }
        console.log("SUCCESS: Target slot is open!");

        // 4. Book the target slot
        console.log(`\n4. Booking slot ${targetSlot} for date ${testDate}...`);
        const bookRes = await request('POST', '/api/bookings', {
            salonId,
            service: { name: 'Premium Haircut', price: 200, duration: 30 },
            date: testDate,
            startTime: targetSlot
        }, authHeader);

        if (bookRes.status !== 201) {
            console.error("FAIL: Slot booking failed", bookRes.body);
            process.exit(1);
        }
        console.log("SUCCESS: Booking created!", bookRes.body.data);

        // 5. Query availability slots again (target slot should now be unavailable!)
        console.log(`\n5. Re-fetching slots for date ${testDate} to verify availability update...`);
        const slotsAfter = await request('GET', `/api/availability/slots?salonId=${salonId}&date=${testDate}`);
        const targetSlotDataAfter = slotsAfter.body.data.find(s => s.time === targetSlot);
        console.log(`Slot ${targetSlot} status after:`, targetSlotDataAfter);
        if (!targetSlotDataAfter || targetSlotDataAfter.available !== false || targetSlotDataAfter.reason !== 'Booked') {
            console.error("FAIL: Slot is still available or reason is not Booked!");
            process.exit(1);
        }
        console.log("SUCCESS: Slot is now correctly booked and blocked for other users!");

        // 6. Double-booking prevention check
        console.log("\n6. Attempting double-booking on the same slot...");
        const doubleBookRes = await request('POST', '/api/bookings', {
            salonId,
            service: { name: 'Hair Color', price: 500, duration: 60 },
            date: testDate,
            startTime: targetSlot
        }, authHeader);

        console.log("Double booking response code:", doubleBookRes.status);
        console.log("Double booking response body:", doubleBookRes.body);
        
        if (doubleBookRes.status === 400 && doubleBookRes.body.success === false) {
            console.log("SUCCESS: Double-booking rejected by server as expected!");
        } else {
            console.error("FAIL: Server allowed a double-booking or returned incorrect status!");
            process.exit(1);
        }

        console.log("\n--- ALL SYSTEM INTEGRATION TESTS PASSED ---");
        process.exit(0);

    } catch (err) {
        console.error("Integration Test Error:", err);
        process.exit(1);
    }
});
