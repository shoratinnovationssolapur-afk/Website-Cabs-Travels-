import React, { useEffect, useState } from "react";
import { ChevronDown, Star, Users, Award, ShieldCheck, Car } from "lucide-react";
import { db } from "../firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";

const AboutPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [userFeedbacks, setUserFeedbacks] = useState([]);

  const stats = [
    { icon: <Users size={24} />, value: "5000+", label: "Happy Customers" },
    { icon: <Car size={24} />, value: "50+", label: "Premium Fleet" },
    { icon: <Award size={24} />, value: "10+", label: "Years Experience" },
    { icon: <ShieldCheck size={24} />, value: "100%", label: "Safe Journeys" },
  ];

  const testimonials = [
    {
      name: "Amit Deshmukh",
      rating: 5,
      comment: "Exceptional service! The Innova was spotless and the driver was very professional. Perfect for our family trip to Pune.",
      date: "2 weeks ago"
    },
    {
      name: "Sneha Patil",
      rating: 5,
      comment: "Booked a luxury sedan for a wedding. The coordination was seamless and the car arrived 15 minutes early. Highly recommended!",
      date: "1 month ago"
    },
    {
      name: "Rahul Verma",
      rating: 4,
      comment: "Very reliable outstation service. Transparent pricing with no hidden costs. Will definitely book again.",
      date: "3 days ago"
    }
  ];

  const faqs = [
    {
      q: "How do I book a vehicle?",
      a: "You can book directly through our website by selecting your preferred vehicle, or simply call/WhatsApp us at +91 9130067841 for instant booking."
    },
    {
      q: "Are the prices inclusive of toll and taxes?",
      a: "Our base fare usually excludes toll, parking, and state taxes, which are charged as per actuals. However, we do offer 'All-Inclusive' packages for specific tour routes."
    },
    {
      q: "What is your cancellation policy?",
      a: "Cancellations made 24 hours before the scheduled pickup time are free of charge. For last-minute cancellations, a small convenience fee may apply."
    },
    {
      q: "Do you provide drivers for outstation trips?",
      a: "Yes, all our bookings come with experienced, verified, and professional drivers who are well-versed with long-distance routes."
    }
  ];

  useEffect(() => {
    const feedbackQuery = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(feedbackQuery, (snapshot) => {
      const feedbacks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserFeedbacks(feedbacks);
    }, (error) => {
      console.error("Error loading feedbacks:", error);
      setUserFeedbacks([]);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-slate-900 py-24 px-6 text-center text-white">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 font-outfit">Rathod Express</h1>
        <p className="text-slate-400 max-w-3xl mx-auto text-lg">
          We are more than just a car rental service. We are your partners in travel, 
          providing comfort, safety, and luxury since 2026.
        </p>
      </section>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center transform hover:-translate-y-2 transition duration-300">
              <div className="text-blue-600 flex justify-center mb-4">{stat.icon}</div>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
              <p className="text-slate-500 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ratings & Testimonials */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">What Our Clients Say</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-orange-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
              </div>
              <span className="font-bold text-slate-700">4.9 / 5.0 Average Rating</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 relative">
              <div className="flex text-orange-400 mb-4">
                {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-slate-700 italic mb-6">"{t.comment}"</p>
              <div>
                <h4 className="font-bold text-slate-900">{t.name}</h4>
                <p className="text-slate-400 text-xs">{t.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* User Feedback from Home Page */}
      <section className="py-20 px-6 bg-white border-t">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">Latest Customer Feedback</h2>
          <p className="text-slate-500 mb-10">Submitted directly from the Home page feedback form.</p>

          {userFeedbacks.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-slate-500">
              No feedback submitted yet. Be the first one to share your experience.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userFeedbacks.map((item) => (
                <div key={item.id} className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <div className="flex text-orange-400 mb-4">
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-700 italic mb-6">"{item.comment}"</p>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                    <p className="text-slate-400 text-xs">
                      {item.createdAt?.toDate
                        ? item.createdAt.toDate().toLocaleDateString()
                        : "Recently"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-6 text-left flex justify-between items-center text-white font-semibold"
                >
                  {faq.q}
                  <ChevronDown className={`transition-transform duration-300 ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${activeFaq === i ? "max-h-40 p-6 pt-0 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to start your journey?</h2>
        <button 
           onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
           className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition"
        >
          Book Your Ride Now
        </button>
      </section>
    </div>
  );
};

export default AboutPage;
