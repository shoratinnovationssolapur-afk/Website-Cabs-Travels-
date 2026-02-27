import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';
import ToursSection from '../utils/ToursSection'; 

const Tours = () => {
  const [tours, setTours] = useState([]); // Renamed from trips for clarity
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔄 Real-time listener for "tours" collection
  useEffect(() => {
    // Pointing to "tours" instead of "trips"
    const q = collection(db, "tours"); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const toursData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTours(toursData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tours:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBookNow = (tour) => {
    // Navigate using the tour ID to match your TourDetails route
    navigate(`/tour/${tour.id}`);
  };

  if (loading) return <div className="loader text-center py-20 font-bold">Loading Adventures...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.hero}>
        <h1 style={styles.heroTitle}>Explore the Cities With Us</h1>
        <p style={styles.heroSubtitle}>Handpicked tour packages for your next escape.</p>
      </header>

      <section style={{ marginBottom: '60px' }}>
        <ToursSection />
      </section>

      <hr style={{ border: '0', borderTop: '1px solid #ddd', marginBottom: '60px' }} />

      <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '40px', fontWeight: 'bold' }}>
        All Adventure Packages
      </h2>
      
      <div style={styles.grid}>
        {tours.map((tour) => (
          <div key={tour.id} style={styles.card} className="hover:scale-105 transition-transform">
            {/* Updated to use imageUrl field */}
            <img src={tour.imageUrl || 'https://via.placeholder.com/300x200'} alt={tour.title} style={styles.cardImage} />
            <div style={styles.cardContent}>
              <h3 style={styles.tripTitle}>{tour.title}</h3>
              <p style={styles.tripDuration}>🕒 {tour.duration || 'Flexible Duration'}</p>
              <p style={styles.tripDesc}>{tour.description?.substring(0, 100)}...</p>
              <div style={styles.cardFooter}>
                <span style={styles.price}>₹{tour.price}</span>
                <button 
                  onClick={() => handleBookNow(tour)} 
                  style={styles.bookBtn}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Styles remain the same
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