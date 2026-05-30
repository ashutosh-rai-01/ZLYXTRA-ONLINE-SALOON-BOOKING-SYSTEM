// Shared memory store for testing while MongoDB is offline due to SRV issue
const mockSalons = [
    {
        _id: '1',
        ownerId: 'owner_1',
        name: 'G Mac Family Unisex Salon',
        rating: 4.8,
        distance: '0.5 km',
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800',
        availableIn: '15 mins',
        address: 'Kunraghat, Gorakhpur, Uttar Pradesh',
        lat: 26.7454,
        lng: 83.3980,
        isApproved: true,
        services: [{ _id: 's1', name: 'Premium Haircut', price: 200, duration: 30 }, { _id: 's3', name: 'Hair Color', price: 500, duration: 60 }]
    },
    {
        _id: '2',
        ownerId: 'owner_2',
        name: 'The Grand Aura Unisex Salon',
        rating: 4.9,
        distance: '1.2 km',
        image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800',
        availableIn: '30 mins',
        address: 'Near AIIMS Road, Kunraghat, Gorakhpur',
        lat: 26.7460,
        lng: 83.3970,
        isApproved: true,
        services: [{ _id: 's4', name: 'Classic Fade', price: 180, duration: 30 }]
    },
    {
        _id: '3',
        ownerId: 'owner_3',
        name: 'Sawali Salon Makeup Studio',
        rating: 4.6,
        distance: '1.5 km',
        image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800',
        availableIn: '5 mins',
        address: 'Main Road, Kunraghat, Gorakhpur',
        lat: 26.7445,
        lng: 83.3995,
        isApproved: true,
        services: [{ _id: 's6', name: 'Women\'s Haircut', price: 300, duration: 45 }]
    },
    {
        _id: '4',
        ownerId: 'owner_4',
        name: 'Blue Peak Women\'s Salon',
        rating: 4.7,
        distance: '2.1 km',
        image: 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80&w=800',
        availableIn: '20 mins',
        address: 'Kunraghat Chauraha, Gorakhpur',
        lat: 26.7430,
        lng: 83.4010,
        isApproved: true,
        services: [{ _id: 's10', name: 'Hair Rebonding', price: 2500, duration: 120 }]
    }
];

const mockBookings = [];
const mockUsers = [];

module.exports = {
    mockSalons,
    mockBookings,
    mockUsers
};
