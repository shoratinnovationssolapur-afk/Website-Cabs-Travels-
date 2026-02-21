import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; // Adjust path
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Tours = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "trips"));
        const tripsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrips(tripsData);
      } catch (error) {
        console.error("Error fetching trips:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleBookNow = (trip) => {
    // Navigate to your booking form, passing the trip details
    navigate('/book', { state: { trip } });
  };

  if (loading) return <div className="loader">Loading Adventures...</div>;

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <header style={styles.hero}>
        <h1 style={styles.heroTitle}>Explore the World With Us</h1>
        <p style={styles.heroSubtitle}>Handpicked tour packages for your next escape.</p>
      </header>

      {/* Tours Grid */}
      <div style={styles.grid}>
        {trips.map((trip) => (
          <div key={trip.id} style={styles.card}>
            <img src={trip.image || 'https://via.placeholder.com/300x200'} alt={trip.title} style={styles.cardImage} />
            <div style={styles.cardContent}>
              <h3 style={styles.tripTitle}>{trip.title}</h3>
              <p style={styles.tripDuration}>🕒 {trip.duration || '3 Days / 2 Nights'}</p>
              <p style={styles.tripDesc}>{trip.description?.substring(0, 100)}...</p>
              <div style={styles.cardFooter}>
                <span style={styles.price}>₹{trip.price}</span>
                <button 
                  onClick={() => handleBookNow(trip)} 
                  style={styles.bookBtn}
                >
                  Book Request
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Quick Inline Styles (Or move to CSS file)
const styles = {
  container: { padding: '20px', backgroundColor: '#f9f9f9', minHeight: '100vh' },
  hero: { 
    textAlign: 'center', 
    padding: '60px 20px', 
    background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1469854523086-cc02fe5d8800") center/cover',
    color: 'white',
    borderRadius: '12px',
    marginBottom: '40px'
  },
  heroTitle: { fontSize: '3rem', margin: '0' },
  heroSubtitle: { fontSize: '1.2rem', opacity: '0.9' },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
    gap: '25px', 
    maxWidth: '1200px', 
    margin: '0 auto' 
  },
  card: { 
    backgroundColor: 'white', 
    borderRadius: '10px', 
    overflow: 'hidden', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s'
  },
  cardImage: { width: '100%', height: '200px', objectFit: 'cover' },
  cardContent: { padding: '20px' },
  tripTitle: { margin: '0 0 10px 0', color: '#333' },
  tripDuration: { fontSize: '0.9rem', color: '#666', marginBottom: '10px' },
  tripDesc: { fontSize: '0.95rem', color: '#777', lineHeight: '1.5' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' },
  price: { fontSize: '1.25rem', fontWeight: 'bold', color: '#e67e22' },
  bookBtn: { 
    backgroundColor: '#3498db', 
    color: 'white', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '5px', 
    cursor: 'pointer',
    fontWeight: 'bold'
  }
};

export default Tours;