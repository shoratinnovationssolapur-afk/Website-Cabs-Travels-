import React from 'react';

import { 
  FaCarSide, FaRoute, FaShieldAlt, FaClock, 
  FaWhatsapp, FaFacebook, FaInstagram, FaTelegramPlane 
} from 'react-icons/fa'; // Using react-icons as per your package.json


const AboutUs = () => {
  const features = [
    { title: "Wide Fleet", desc: "From hatchbacks to luxury sedans.", icon: <FaCarSide className="text-blue-400 w-8 h-8" /> },
    { title: "Safe Travels", desc: "Verified drivers and real-time tracking.", icon: <FaShieldAlt className="text-emerald-400 w-8 h-8" /> },
    { title: "Punctual", desc: "We value your time with 99% on-time arrivals.", icon: <FaClock className="text-yellow-400 w-8 h-8" /> },
    { title: "Best Routes", desc: "AI-optimized paths for faster travel.", icon: <FaRoute className="text-purple-400 w-8 h-8" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Hero Section */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent animate-fade-in">
            Reliable Rides for Your Every Journey.
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We are more than just a cab service. We are your partner in travel, 
            combining modern technology with traditional hospitality to get you where you need to be.
          </p>
        </div>
        
        {/* Subtle Background Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-900/50 border-y border-slate-800">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[["Active Cabs", "50+"], ["Daily Trips", "200+"], ["Happy Clients", "5k+"], ["Cities", "12+"]].map(([label, val]) => (
            <div key={label} className="text-center group cursor-default">
              <div className="text-3xl font-bold text-white group-hover:text-blue-400 transition-colors">{val}</div>
              <div className="text-slate-500 text-sm uppercase tracking-widest mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Grid */}
      <section className="py-24 px-6 container mx-auto">
        <h2 className="text-3xl font-bold mb-16 text-center">Why Ride With Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => (
            <div key={idx} className="p-8 bg-slate-900 rounded-3xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/50 transition-all duration-300">
              <div className="mb-6">{item.icon}</div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
<footer className="py-16 text-center border-t border-slate-900">
        <h3 className="text-xl font-semibold mb-6 text-slate-300">Connect With Us for Bookings</h3>
        <div className="flex justify-center gap-8 mb-10">
          {/* WhatsApp - Priority for Cab Bookings */}
          <a href="https://wa.me/9130067841" target="_blank" rel="noreferrer" 
             className="text-slate-500 hover:text-green-500 transition-all transform hover:scale-110">
            <FaWhatsapp size={28} />
          </a>
          
          {/* Facebook */}
          <a href="https://facebook.com/yourpage" target="_blank" rel="noreferrer" 
             className="text-slate-500 hover:text-blue-500 transition-all transform hover:scale-110">
            <FaFacebook size={28} />
          </a>
          
          {/* Instagram */}
          <a href="https://instagram.com/yourhandle" target="_blank" rel="noreferrer" 
             className="text-slate-500 hover:text-pink-500 transition-all transform hover:scale-110">
            <FaInstagram size={28} />
          </a>
          
          {/* Telegram */}
          <a href="https://t.me/yourusername" target="_blank" rel="noreferrer" 
             className="text-slate-500 hover:text-sky-400 transition-all transform hover:scale-110">
            <FaTelegramPlane size={28} />
          </a>
        </div>
        <p className="text-slate-600 text-sm italic tracking-wide">
          Safe Reliable Fast — Your journey starts here.
        </p>
        <p className="text-slate-700 text-xs mt-4 uppercase tracking-tighter">
          © 2026 Cab & Travels. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AboutUs;