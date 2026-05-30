require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = 'mongodb://batmanx637_db_user:LMlfQoiS5Tz1n0uz@ac-ksy0frx-shard-00-02.1xxgn4r.mongodb.net:27017,ac-ksy0frx-shard-00-01.1xxgn4r.mongodb.net:27017,ac-ksy0frx-shard-00-00.1xxgn4r.mongodb.net:27017/salon_booking?ssl=true&replicaSet=atlas-pswnrv-shard-0&authSource=admin';

async function findEverything() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected successfully!");

        // 1. List collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("\n--- COLLECTIONS IN DATABASE ---");
        console.log(collections.map(c => c.name));

        // 2. Get all users
        const users = await User.find({}).select('+password');
        console.log(`\n--- ALL USERS IN DATABASE (${users.length}) ---`);
        users.forEach((u, i) => {
            console.log(`User #${i + 1}: ID=${u._id}, Name="${u.name}", Phone="${u.phone}", Role="${u.role}"`);
        });

        // 3. Get all salons (since "THE BARBER" is likely a salon name!)
        let salons = [];
        try {
            salons = await mongoose.connection.db.collection('salons').find({}).toArray();
        } catch (e) {
            try {
                salons = await mongoose.connection.db.collection('usersalons').find({}).toArray();
            } catch (err) {}
        }
        console.log(`\n--- ALL SALONS IN DATABASE (${salons.length}) ---`);
        salons.forEach((s, i) => {
            console.log(`Salon #${i + 1}: ID=${s._id}, Name="${s.name}", OwnerID="${s.ownerId}"`);
            if (s.name.toLowerCase().includes("barber") || s.ownerName) {
                console.log(`   Details:`, JSON.stringify(s, null, 2));
            }
        });

        await mongoose.disconnect();
        console.log("\nDisconnected.");
    } catch (err) {
        console.error("Error:", err);
    }
}

findEverything();
