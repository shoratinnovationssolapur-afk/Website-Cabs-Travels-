import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "inquiries"), {
        ...formData,
        timestamp: serverTimestamp(),
        status: "new",
      });
      alert("Message sent! We will get back to you shortly.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      alert("Error sending message: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="text-blue-600" />,
      title: "Call Us",
      details: "+91 9130067841",
      subText: "Mon-Sun, 24/7 Support",
    },
    {
      icon: <Mail className="text-blue-600" />,
      title: "Email Us",
      details: "rathodexpressofficial@gmail.com",
      subText: "Online support 24/7",
    },
    {
      icon: <MapPin className="text-blue-600" />,
      title: "Visit Us",
      details: "Wagholi,Pune",
      subText: "Maharashtra, 413001",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-slate-900 py-20 px-6 text-center text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-outfit">Contact Us</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Have questions about our fleet or need a custom quote for your journey? 
          Our team is here to help you 24/7.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Details Cards */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl">
                  {info.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{info.title}</h3>
                  <p className="text-slate-800 font-medium">{info.details}</p>
                  <p className="text-slate-500 text-sm">{info.subText}</p>
                </div>
              </div>
            ))}

            {/* Business Hours */}
            <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Clock size={24} />
                <h3 className="text-xl font-bold">Business Hours</h3>
              </div>
              <div className="space-y-2 opacity-90">
                <div className="flex justify-between text-sm">
                  <span>Monday - Saturday</span>
                  <span>24 Hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sunday</span>
                  <span>24 Hours</span>
                </div>
              </div>
              <button 
                onClick={() => window.open('https://wa.me/919130067841?text=Hi%20there', '_blank')}
                className="w-full mt-6 bg-white text-blue-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition"
              >
                <MessageCircle size={18} /> Chat on WhatsApp
              </button>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Your Name</label>
                    <input 
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <input 
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                  <input 
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Booking Inquiry"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                  <textarea 
                    rows="5"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Tell us how we can help you..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : <><Send size={18} /> Send Message</>}
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Map Section */}
        <div className="mt-16 rounded-3xl overflow-hidden shadow-sm border border-slate-200 h-[400px]">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30256.02842251116!2d73.95876813418015!3d18.573878562532773!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c3819fdef877%3A0xd4193e985f354be0!2sWagholi%2C%20Pune%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1772781866158!5m2!1sen!2sin"
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;