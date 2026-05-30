import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, User, Heart, CalendarDays, Sparkles } from 'lucide-react';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        0.5 - Math.cos(dLat)/2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        (1 - Math.cos(dLon))/2;
    return R * 2 * Math.asin(Math.sqrt(a));
};

function HomeDashboard() {
    const { user } = useContext(AuthContext);
    const [search, setSearch] = useState('');
    const [salons, setSalons] = useState([]);
    const [sortedSalons, setSortedSalons] = useState([]);
    const [loadingSalons, setLoadingSalons] = useState(true);
    const [userLocation, setUserLocation] = useState([26.7454, 83.3980]); // Default to Gorakhpur
    const navigate = useNavigate();

    // Fetch live salons
    useEffect(() => {
        const fetchSalons = async () => {
            try {
                const res = await api.get('/salon');
                setSalons(res.data.data || []);
                setSortedSalons(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch salons:", err);
            } finally {
                setLoadingSalons(false);
            }
        };
        fetchSalons();
    }, []);

    // Get current geolocation dynamically
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setUserLocation([lat, lng]);

                    if (salons.length > 0) {
                        const calculated = salons.map(s => {
                            let sLat = s.lat;
                            let sLng = s.lng;
                            if (!sLat && s.location && s.location.coordinates && s.location.coordinates.length === 2) {
                                sLng = s.location.coordinates[0];
                                sLat = s.location.coordinates[1];
                            }
                            if (sLat && sLng) {
                                const dist = calculateDistance(lat, lng, sLat, sLng);
                                return { 
                                    ...s, 
                                    calculatedDistance: dist, 
                                    distanceText: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km` 
                                };
                            }
                            return { ...s, calculatedDistance: 9999, distanceText: 'N/A' };
                        });
                        // Sort by nearest
                        calculated.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
                        setSortedSalons(calculated);
                    }
                },
                (err) => {
                    console.log("Location access denied, falling back to default coordinates.", err);
                }
            );
        }
    }, [salons]);

    const filteredSalons = sortedSalons.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.address.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="app-screen" style={{ 
            padding: '24px 20px 80px 20px', 
            backgroundColor: 'var(--bg-color)', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px', 
            minHeight: '100vh',
            position: 'relative'
        }}>
            {/* Header Greeting Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        Hello, {user?.name || 'Guest'} ✨
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '2px 0 0 0', fontWeight: '500' }}>Book your perfect service</p>
                </div>
                <div 
                    onClick={() => navigate('/profile')}
                    style={{ 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '50%', 
                        overflow: 'hidden', 
                        cursor: 'pointer',
                        border: '2px solid #3b82f6',
                        boxShadow: '0 4px 10px rgba(59, 130, 246, 0.15)'
                    }}
                >
                    <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" 
                        alt="Profile Avatar" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </div>

            {/* Custom Premium Search Input */}
            <div style={{ position: 'relative', width: '100%' }}>
                <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                    type="text" 
                    placeholder="Search for salons, services..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="form-input"
                    style={{ 
                        paddingLeft: '48px', 
                        borderRadius: '16px', 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        fontSize: '0.9rem',
                        height: '48px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                />
            </div>

            {/* AI Assistant Banner / Smart Match Shortcut */}
            <div 
                onClick={() => navigate('/smart-match')}
                style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    borderRadius: '20px',
                    padding: '16px 20px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 10px 20px rgba(59, 130, 246, 0.15)',
                    transition: 'all 0.2s'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Sparkles size={22} color="white" />
                    <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>Smart Match AI</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Let us choose the best available salon for you</div>
                    </div>
                </div>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700' }}>Match Now</div>
            </div>

            {/* Nearby Salons List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Nearby Salons</h2>
                    <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '700', cursor: 'pointer' }}>View all</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {loadingSalons ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.9rem' }}>Loading nearby salons...</div>
                    ) : filteredSalons.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '0.9rem' }}>No salons found.</div>
                    ) : (
                        filteredSalons.map((salon) => (
                            <div 
                                key={salon._id || salon.id}
                                style={{
                                    backgroundColor: 'white',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}
                            >
                                {/* Cover Image with Floating Badge */}
                                <div style={{ height: '140px', position: 'relative', width: '100%' }}>
                                    <img 
                                        src={salon.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400"} 
                                        alt={salon.name} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        backgroundColor: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}>
                                        <Star size={12} color="#f59e0b" fill="#f59e0b" />
                                        <span>{salon.rating || 5.0}</span>
                                        <span style={{ color: '#94a3b8', fontWeight: '500' }}>({salon.totalReviews || 0})</span>
                                    </div>
                                </div>

                                {/* Text Details */}
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, paddingRight: '12px' }}>
                                            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>{salon.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#64748b', fontSize: '0.75rem', fontWeight: '500' }}>
                                                <MapPin size={12} color="#94a3b8" />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                                                    {salon.address}
                                                </span>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700', whiteSpace: 'nowrap' }}>
                                            {salon.distanceText || 'N/A'}
                                        </span>
                                    </div>

                                    {/* Book Now button */}
                                    <button 
                                        onClick={() => navigate(`/salon/${salon._id || salon.id}`)}
                                        className="btn-primary"
                                        style={{ marginTop: '8px', padding: '10px', height: '40px', fontSize: '0.85rem', fontWeight: '700', borderRadius: '12px' }}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom Nav Bar (Customer App View) */}
            <div style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0,
                right: 0,
                backgroundColor: 'white', 
                display: 'flex', 
                justifyContent: 'space-around', 
                padding: '12px 0 16px 0',
                borderTop: '1px solid #e2e8f0', 
                zIndex: 100,
                boxShadow: '0 -4px 10px rgba(0,0,0,0.03)'
            }}>
                <div onClick={() => navigate('/home')} style={{ color: '#3b82f6', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <Search size={20} /> <span style={{ fontSize: '0.7rem', fontWeight: '700' }}>Home</span>
                </div>
                <div onClick={() => navigate('/my-bookings')} style={{ color: '#94a3b8', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <CalendarDays size={20} /> <span style={{ fontSize: '0.7rem', fontWeight: '500' }}>Bookings</span>
                </div>
                <div style={{ color: '#94a3b8', cursor: 'not-allowed', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', opacity: 0.6 }}>
                    <Heart size={20} /> <span style={{ fontSize: '0.7rem', fontWeight: '500' }}>Favorites</span>
                </div>
                <div onClick={() => navigate('/profile')} style={{ color: '#94a3b8', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <User size={20} /> <span style={{ fontSize: '0.7rem', fontWeight: '500' }}>Profile</span>
                </div>
            </div>
            
        </div>
    );
}

export default HomeDashboard;
