import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  collection, addDoc, serverTimestamp, getDocs, getDoc, doc, onSnapshot,
  query,
  where
} from "firebase/firestore";
import { FaWhatsapp } from "react-icons/fa6";




import outstationcar from "../assets/OutstationCab.webp";

import LocationInputs from "../components/pickupanddrop";
import ServiceCard from "../components/ServiceCard";
import ServiceModal from "../components/ServiceModal";
import RouteFare from "../components/RouteFare";







const HomePage = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [carType, setCarType] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [totalFare, setTotalFare] = useState(0);
  const RouteFareRef = React.useRef(); // Add this near your other useState hooks

  // For LocationInputs integration (important)
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [tripType, setTripType] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [heroPickup, setHeroPickup] = useState("");
  const [heroDrop, setHeroDrop] = useState("");
  const [vehicles, setVehicles] = useState([]); // Existing
  const [bookedVehicleIds, setBookedVehicleIds] = useState([]);
  const [tours, setTours] = useState([]);       // Add this
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  const [calculatedFare, setCalculatedFare] = useState(0);
  const [distance, setDistance] = useState(0);
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);

  // 3. ADD THIS HANDLER to receive data from RouteFare component
  const handleFareUpdate = ({ fare, distance }) => {
    setCalculatedFare(fare); // Updates the fare state


    setDistance(distance);   // Updates the distance state
  };

  const navigate = useNavigate();











  // useEffect(() => {
  //   const fetchVehicles = async () => {
  //     try {
  //       const snapshot = await getDocs(collection(db, "vehicles"));

  //       const vehicleList = snapshot.docs.map(doc => ({
  //         id: doc.id,
  //         ...doc.data()
  //       }));

  //       setVehicles(vehicleList);

  //     } catch (error) {
  //       console.error("Error fetching vehicles:", error);
  //     }
  //   };

  //   fetchVehicles();
  // }, []);

  useEffect(() => {
    if (pickup === drop) {
      setTotalFare(0);
    }
  }, [pickup, drop]);

  useEffect(() => {
    // 1. Vehicle Listener (Existing)
    const qVehicles = query(collection(db, "vehicles"), where("available", "==", true));
    const unsubVehicles = onSnapshot(qVehicles, (snapshot) => {
      const vehicleList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVehicles(vehicleList);
    });

    // 2. Tours Listener (New)
    const qTours = query(collection(db, "tours")); // Adjust query if you have an 'available' field here too
    const unsubTours = onSnapshot(qTours, (snapshot) => {
      const tourList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTours(tourList);
    }, (error) => {
      console.error("Error listening to tours:", error);
    });

    const unsubBookings = onSnapshot(collection(db, "bookings"), (snapshot) => {
      const activeStatuses = ["pending", "assigned", "approved", "on_the_way"];
      const bookedIds = snapshot.docs
        .map((doc) => doc.data())
        .filter((booking) =>
          booking?.vehicleId &&
          booking.vehicleId !== "quick_choice" &&
          booking.vehicleId !== "city_ride" &&
          activeStatuses.includes(String(booking?.status || "").toLowerCase())
        )
        .map((booking) => booking.vehicleId);

      setBookedVehicleIds(bookedIds);
    });

    // 3. Clean up listeners
    return () => {
      unsubVehicles();
      unsubTours();
      unsubBookings();
    };
  }, []);

  const isVehicleVisible = (vehicle) => {
    const statusFields = [
      vehicle?.status,
      vehicle?.bookingStatus,
      vehicle?.availabilityStatus
    ];

    return !statusFields.some((value) => {
      const normalizedValue = String(value || "").trim().toLowerCase();
      return normalizedValue === "busy" || normalizedValue === "booked";
    });
  };

  const visibleVehicles = vehicles.filter(
    (vehicle) => isVehicleVisible(vehicle) && !bookedVehicleIds.includes(vehicle.id)
  );

  // Fallback auto-refresh in case realtime listeners miss updates on slow networks.
  useEffect(() => {
    let isMounted = true;

    // 1. Define the real-time subscriptions
    const qVehicles = query(collection(db, "vehicles"), where("available", "==", true));
    const qTours = query(collection(db, "tours"));
    const qBookings = collection(db, "bookings");

    const unsubVehicles = onSnapshot(qVehicles, (snapshot) => {
      if (!isMounted) return;
      const vehicleList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicles(vehicleList);
    }, (err) => console.error("Vehicle Sync Error:", err));

    const unsubTours = onSnapshot(qTours, (snapshot) => {
      if (!isMounted) return;
      const tourList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTours(tourList);
    }, (err) => console.error("Tours Sync Error:", err));

    const unsubBookings = onSnapshot(qBookings, (snapshot) => {
      if (!isMounted) return;
      const activeStatuses = ["pending", "assigned", "approved", "on_the_way"];
      const bookedIds = snapshot.docs
        .map((doc) => doc.data())
        .filter((booking) =>
          booking?.vehicleId &&
          booking.vehicleId !== "quick_choice" &&
          booking.vehicleId !== "city_ride" &&
          activeStatuses.includes(String(booking?.status || "").toLowerCase())
        )
        .map((booking) => booking.vehicleId);

      setBookedVehicleIds(bookedIds);
    }, (err) => console.error("Bookings Sync Error:", err));

    // 2. Network Recovery Logic (The "Smart" Auto-Refresh)
    // Instead of a blind timer, we listen for the browser coming back online
    const handleOnline = () => {
      console.log("Network back online. Firebase will auto-sync.");
      // Firebase onSnapshot actually handles reconnection automatically, 
      // but this is a great place to trigger any additional API calls if needed.
    };

    window.addEventListener('online', handleOnline);

    // 3. Cleanup: Stop all listeners when user leaves the page
    return () => {
      isMounted = false;
      unsubVehicles();
      unsubTours();
      unsubBookings();
      window.removeEventListener('online', handleOnline);
    };
  }, []);



  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("vehicle_id");

    if (id) setSelectedVehicleId(id);
  }, []);



  const seedVehicles = async () => {
    const vehicles = [

      {
        name: "Toyota Innova",
        type: "SUV",
        desc: "Spacious & Comfortable",
        imageUrl:
          innova
      },
      {
        name: "Mahindra XUV700",
        type: "SUV",
        desc: "Luxury & Power",
        imageUrl:
          MahindraXUV700
      },

      {
        name: "Hyundai Creta",
        type: "SUV",
        desc: "Premium Travel Experience",
        imageUrl:
          HyundaiCreta
      },
      {
        name: "Suzuki Brezza",
        type: "SUV",
        desc: "Smooth Ride",
        imageUrl: Brezza

      },
      {
        name: "Grand Vitara",
        type: "SUV",
        desc: "Versatile & Stylish",
        imageUrl: GrandVitara

      },

      { name: "Hyundai Aura", type: "Sedan", desc: "Elegant & Comfortable", imageUrl: HyundaiAura },
      { name: "Suzuki Dzire", type: "Sedan", desc: "Stylish & Smooth Ride", imageUrl: SuzukiDzire },
      { name: "Hyndai Verna", type: "Sedan", desc: "Spacious & Fuel Efficient", imageUrl: HyundaiVerna },
      { name: "Honda Amaze", type: "Sedan", desc: "Premium & Comfortable", imageUrl: HondaAmaze },
      { name: "Tata Tigor", type: "Sedan", desc: "Stylish & Reliable", imageUrl: TataTigor },

      { name: "Mercedes-Benz S-Class", desc: "Luxury & Performance", imageUrl: MercedesBenzSClass },
      { name: "Range Rover", desc: "Elegant & Powerful", imageUrl: RangeRover },
      { name: "BMW", desc: "Sophisticated & Comfortable", imageUrl: BMW },
      { name: "Audi", desc: "Luxury & Reliability", imageUrl: Audi },
      { name: " Volvo XC90", desc: "Stylish & Dynamic", imageUrl: VolvoXC90 },


    ];



    for (const vehicle of vehicles) {
      await addDoc(collection(db, "vehicles"), vehicle);
    }

    alert("Vehicles added successfully");
  };


  const handleRouteClick = (from, to) => {
    // 1. Set the pickup and drop states
    setPickup(from);
    setDrop(to);

    // 2. Set Trip Type to Outstation since these are outstation routes
    setTripType("Outstation");

    // 3. Scroll to the booking section
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth" });
    }
  };


  const submitBooking = async () => {
    // 1. Basic Field Validation
    if (!name.trim() || !phone.trim() || !pickup.trim() || !drop.trim() || !dateTime) {
      alert("Please fill all booking details (Name, Phone, Locations, and Date/Time).");
      return;
    }

    // 2. Route Calculation Warning/Check
    // If calculatedFare is 0 or null, it means they haven't clicked calculate yet.
    if (!calculatedFare || calculatedFare === 0) {
      console.log("Fare not calculated. Triggering calculation...");

      // Call the function we exposed via forwardRef
      const result = await RouteFareRef.current.triggerCalculation();

      if (result) {
        // Show the warning so user sees the route/price before confirming
        alert("⚠️ Route and Fare calculated! Please review the price on the map and click 'Submit Booking Request' again to confirm.");

        // We return here to give the user a chance to see the Map/Fare 
        // before actually sending data to Firebase.
        return;
      } else {
        // If geocoding failed or something went wrong in RouteFare
        alert("Could not calculate route. Please check your pickup and drop locations.");
        return;
      }
    }

    // 3. Firebase Submission (only runs if fare is > 0)
    const user = auth.currentUser;
    if (!user) return alert("Please login to book a ride.");

    try {
      const bookingData = {
        userId: user.uid,
        userEmail: user.email,
        vehicleId: selectedVehicleId || "quick_choice",
        name,
        phone,
        pickup,
        drop,
        carType,
        tripType,
        dateTime,
        distance: Number(distance),
        totalFare: Number(calculatedFare),
        status: "pending",
        createdAt: serverTimestamp(),
        bookingMethod: "quick_booking",
        driverId: null,
        driverName: null,
        passengers: []
      };

      await addDoc(collection(db, "bookings"), bookingData);
      alert("✅ Booking request submitted! Our team will assign a driver shortly.");

      // Clear form
      setName("");
      setPhone("");
      setPickup("");
      setDrop("");
      setDateTime("");
      setCalculatedFare(0); // Reset for next booking

    } catch (error) {
      console.error("Booking Error:", error);
      alert("Booking failed: " + error.message);
    }
  };



  const handleHeroFare = () => {
    if (!heroPickup.trim() || !heroDrop.trim()) {
      alert("Please enter pickup and drop locations");
      return;
    }

    // ✅ Fill booking form fields
    setPickup(heroPickup);
    setDrop(heroDrop);

    // ✅ Scroll to booking section
    document
      .getElementById("booking")
      .scrollIntoView({ behavior: "smooth" });
  };

  const submitFeedback = async (e) => {
    e.preventDefault();

    if (!feedbackName.trim() || !feedbackMessage.trim()) {
      alert("Please enter your name and feedback message.");
      return;
    }

    try {
      await addDoc(collection(db, "feedbacks"), {
        name: feedbackName.trim(),
        comment: feedbackMessage.trim(),
        rating: Number(feedbackRating),
        createdAt: serverTimestamp(),
      });

      setFeedbackName("");
      setFeedbackMessage("");
      setFeedbackRating(5);
      alert("Thank you for your feedback! It is now visible on the About Us page.");
    } catch (error) {
      console.error("Feedback Error:", error);
      alert("Failed to submit feedback. Please try again.");
    }
  };




  return (


    <div className="w-full min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="absolute top-6 right-6 z-50">
      </div>


      {/* ================= HERO SECTION ================= */}



      {/* Hero Content */}

      <section className="relative min-h-[88vh] md:h-screen flex items-center justify-center text-white overflow-hidden">


        {/* Background Image */}
        <div
          className="absolute  inset-0 bg-cover bg-center animate-[zoom_20s_linear_infinite]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70')",
          }}
        ></div>



        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>


        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl">




          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-5 md:mb-6 animate-fadeInUp">
            <span className="block">Rathod on Road,</span>
            <span className="block text-yellow-400">Comfort on Board</span>
          </h1>

          <p className="text-base md:text-xl mb-6 md:mb-8">
            Premium SUV & Cab Services Across Solapur, Pune, Mumbai & Goa.
          </p>

          <div className="flex justify-center gap-3 md:gap-6 flex-wrap">
            <a
              href="https://wa.me/9130067841" target="_blank" rel="noreferrer"
              className="text-green-500 font-bold px-5 md:px-8 py-3 rounded-full font-semibold hover:scale-105 transition flex gap-2 border"
            >
              Whatsapp us <FaWhatsapp className="text-2xl" />
            </a>

            <button
              onClick={() => navigate("/bookride")}
              className="border border-white px-5 md:px-8 py-3 rounded-full hover:bg-white hover:text-black transition cursor-pointer"
            >
              Book Ride
            </button>
          </div>
          <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mt-10 md:mt-16 flex-wrap">

            {["Sedan", "SUV", "Luxury", "Others"].map((type) => (
              <button
                key={type}
                onClick={() => {
                  const id = type.toUpperCase(); // sedan, suv, luxury

                  document
                    .getElementById(id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-white/20 px-4 sm:px-6 py-2 rounded-full hover:bg-yellow-400 hover:text-black transition cursor-pointer font-semibold backdrop-blur-sm text-sm sm:text-base"
              >
                {type === "Sedan"
                  ? "🚗"
                  : type === "SUV"
                    ? "🚙"
                    : "👑"}{" "}
                {type}
              </button>
            ))}

          </div>
          <div className="text-white inline-block relative top-8 md:top-10 font-semibold text-sm sm:text-base animate-pulse">
            ⭐ #1 Trusted Cab Service in Solapur
          </div>



        </div>

      </section>


      {/*SEDAN SHOWCASE*/}
      <section id="SEDAN" className="py-14 md:py-16 px-4 md:px-6 bg-white">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12 text-black">
          Our Premium Sedan Fleet
        </h2>
        {/* Scroll Container */}
        <div className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-4">
          {visibleVehicles
            .filter(v => v.type === "Sedan")
            .map(vehicle => (
              <div key={vehicle.id}
                onClick={() =>
                  navigate(`/booking?vehicle_id=${vehicle.id}`)
                }

                className="min-w-[240px] sm:min-w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 group">
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                  <p className="text-gray-600 text-sm">{vehicle.desc}</p>
                </div>
              </div>
            ))}

        </div>
      </section>
      {/* ================= SUV SHOWCASE ================= */}

      <section id="SUV" className="py-14 md:py-16 px-4 md:px-6 bg-white ">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12 text-black">
          Our Premium SUV Fleet
        </h2>

        {/* Scroll Container */}
        <div className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-4">
          {visibleVehicles
            .filter(v => v.type === "SUV")
            .map(vehicle => (
              <div
                key={vehicle.id}
                onClick={() =>
                  navigate(`/booking?vehicle_id=${vehicle.id}`)

                }

                className="min-w-[240px] sm:min-w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 group"

              >
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                  <p className="text-gray-600 text-sm">{vehicle.desc}</p>
                </div>
              </div>
            ))}


        </div>
      </section>

      {/*Luxury SHOWCASE*/}
      <section id="LUXURY" className="py-14 md:py-16 px-4 md:px-6 bg-white">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12 text-black">
          Our Premium Luxury Car Fleet
        </h2>
        {/* Scroll Container */}
        <div className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-4">
          {visibleVehicles
            .filter(v => v.type === "Luxury")
            .map(vehicle => (
              <div key={vehicle.id}
                onClick={() =>
                  navigate(`/booking?vehicle_id=${vehicle.id}`)
                }

                className="min-w-[240px] sm:min-w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 group">
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                  <p className="text-gray-600 text-sm">{vehicle.desc}</p>
                </div>
              </div>
            ))}

        </div>

      </section>




      {/*Others SHOWCASE*/}
      {/* ================= OTHERS SHOWCASE ================= */}
      <section id="OTHERS" className="py-14 md:py-16 px-4 md:px-6 bg-white">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12 text-black">
          Cabs on Per day basis
        </h2>
        <div className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-4">
          {visibleVehicles
            .filter(v => v.type === "Others")
            .map(vehicle => (
              <div
                key={vehicle.id}
                onClick={() => navigate(`/booking?vehicle_id=${vehicle.id}`)}
                className="min-w-[240px] sm:min-w-[280px] bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0 group cursor-pointer"
              >
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                  <p className="text-gray-600 text-sm">{vehicle.desc || "Comfortable ride for your journey"}</p>
                </div>
              </div>
            ))}
        </div>
        {/* Show message if no "Other" cars are available */}
        {visibleVehicles.filter(v => v.type === "Others").length === 0 && (
          <p className="text-center text-gray-400 italic">More vehicles coming soon!</p>
        )}
      </section>



      {/* ================= BUSES & TRAVELS SHOWCASE ================= */}
      <section id="TRAVELS" className="py-14 md:py-16 px-4 md:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-black font-outfit">
              Buses & Large Travels
            </h2>
            <p className="text-gray-500 mt-2">Perfect for group tours, weddings, and corporate events</p>
          </div>

          {/* Scroll Container */}
          <div className="flex gap-6 overflow-x-auto scroll-smooth px-2 pb-6 no-scrollbar">
            {visibleVehicles
              .filter(v => v.type === "Travels" || v.type === "Bus")
              .map(vehicle => (
                <div
                  key={vehicle.id}
                  onClick={() => navigate(`/booking?vehicle_id=${vehicle.id}`)}
                  className="min-w-[260px] sm:min-w-[300px] md:min-w-[380px] bg-white rounded-3xl shadow-md overflow-hidden flex-shrink-0 group cursor-pointer border border-gray-100 hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image Container with Capacity Badge */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={vehicle.imageUrl}
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                      {vehicle.capacity || "17-50"} Seater
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-xl text-gray-900">{vehicle.name}</h3>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {vehicle.acType || "A/C"}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {vehicle.desc || "Ideal for long-distance group travel with premium push-back seats."}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-gray-400 text-xs uppercase font-bold tracking-tighter">Base Rate</span>
                        <p className="text-lg font-black text-slate-800">
                          {vehicle.pricePerKm ? `₹${vehicle.pricePerKm}/km` : "Contact for Quote"}
                        </p>
                      </div>
                      <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold group-hover:bg-blue-700 transition-colors">
                        Book Travels
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Empty State */}
          {visibleVehicles.filter(v => v.type === "Travels" || v.type === "Bus").length === 0 && (
            <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 italic">No large buses available currently. Contact us for offline booking.</p>
            </div>
          )}
        </div>
      </section>


      {/* ================= TRAVELS / TOURS SHOWCASE ================= */}
      <section id="TRAVELS" className="py-14 md:py-16 px-4 md:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-black">Popular Tour Packages</h2>
              <p className="text-gray-500 mt-2">Explore the best destinations with our curated travel plans</p>
            </div>
            <button
              onClick={() => navigate('user/tours')}
              className="hidden md:block text-blue-600 font-semibold hover:underline"
            >
              View All Packages →
            </button>
          </div>

          {/* Scroll Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-2 pb-6 lg:flex lg:gap-6 lg:overflow-x-auto lg:scroll-smooth no-scrollbar">
            {/* If you have a 'tours' array from Firestore, use it here. 
         Otherwise, you can filter your vehicles if they are marked as 'Tour'
      */}
            {tours && tours.length > 0 ? (
              tours.map((tour) => (
                <div
                  key={tour.id}
                  onClick={() => navigate(`/user/tour/${tour.id}`)}
                  className="w-full bg-white rounded-3xl shadow-md overflow-hidden group cursor-pointer border border-gray-100 hover:shadow-xl transition-all duration-300 lg:min-w-[350px] lg:max-w-[350px] lg:flex-shrink-0"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={tour.imageUrl}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm">
                      {tour.duration || "3 Days / 2 Nights"}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-600 transition-colors">
                        {tour.title}
                      </h3>
                      <div className="flex items-center text-orange-500 font-bold">
                        ★ <span className="text-gray-700 ml-1 text-sm">{tour.rating || "4.9"}</span>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                      {tour.description || "Discover the hidden gems and local culture of this beautiful destination."}
                    </p>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-black">Starting from</p>
                        <p className="text-lg font-extrabold text-blue-700">₹{tour.price || "4,999"}</p>
                      </div>
                      <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold group-hover:bg-blue-600 transition-colors">
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center py-10 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400">Loading amazing tour packages...</p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('user/tours')}
            className="md:hidden mt-2 text-blue-600 font-semibold hover:underline"
          >
            View All Packages →
          </button>
        </div>
      </section>


      {/* ================= QUICK BOOKING ================= */}
      {/* QUICK BOOKING SECTION (Compact Styles) */}
      <section id="booking" className="py-14 md:py-16 px-4 md:px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-10">Quick Booking</h2>
        <div className="bg-white p-5 sm:p-6 md:p-8 rounded-3xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            <input className="border border-gray-300 p-2 rounded-lg w-full h-11 bg-white outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="border border-gray-300 p-2 rounded-lg w-full h-11 bg-white outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Mobile" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <LocationInputs pickup={pickup} setPickup={setPickup} drop={drop} setDrop={setDrop} />
            <select className="border border-gray-300 p-2 rounded-lg w-full h-11 bg-white" value={tripType} onChange={(e) => setTripType(e.target.value)}><option value="">Trip Type</option><option>One Day</option><option>Outstation</option></select>
            <select className="border border-gray-300 p-2 rounded-lg w-full h-11 bg-white" value={carType} onChange={(e) => setCarType(e.target.value)}><option value="">Car Type</option><option>Sedan</option><option>SUV</option><option>Luxury</option></select>
            <input type="datetime-local" className="border border-gray-300 p-2 rounded-lg w-full h-11" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
          </div>
          <div className="w-full mb-8 rounded-2xl overflow-hidden border bg-gray-50 min-h-[350px]">
            <RouteFare ref={RouteFareRef} pickup={pickup} drop={drop} dateTime={dateTime} onFareCalculated={handleFareUpdate} />
          </div>
          <button className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold hover:bg-black hover:text-yellow-400 transition" onClick={submitBooking}>Submit Booking Request</button>
        </div>
      </section>
      {/* ================= SERVICES ================= */}
      <section className="py-14 md:py-24 px-4 md:px-6 bg-gradient-to-br from-indigo-100 via-white to-blue-100">

        <h2 className="text-4xl md:text-6xl lg:text-5xl font-bold text-center mb-10 md:mb-16">
          Our Services
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">

          {/* ===== OUTSTATION ===== */}
          <ServiceCard
            title="Outstation Cab"
            icon="🚗"
            price="From ₹14/km"
            popular
            description="Travel comfortably to nearby cities and tourist destinations."
            onClick={() => {
              setTripType("Outstation");
              setSelectedService("Outstation Cab");

            }}
          />

          {/* ===== CORPORATE ===== */}
          <ServiceCard
            title="Corporate Travel"
            icon="💼"
            price="Custom Pricing"
            description="Professional rides for meetings and business trips."
            onClick={() => {
              setTripType("Corporate");
              setSelectedService("Corporate Travel");


            }}
          />

          {/* ===== AIRPORT ===== */}
          <ServiceCard
            title="Airport Transfers"
            icon="✈️"
            price="Flat ₹799+"
            description="On-time pickup and drop for airport journeys."
            onClick={() => {
              setTripType("Airport");
              setSelectedService("Airport Transfers");
            }}
          />

        </div>

        {/* ===== MODAL ===== */}
        {selectedService && (
          <ServiceModal
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}

      </section>
      {/* ================= FEEDBACK FORM ================= */}
      <section className="py-14 md:py-16 px-4 md:px-6 bg-white border-t">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-3 text-gray-900">Share Your Feedback</h2>
          <p className="text-center text-gray-600 mb-8">
            Your review helps us improve and will be shown on our About Us page.
          </p>

          <form onSubmit={submitFeedback} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8 space-y-4">
            <input
              type="text"
              value={feedbackName}
              onChange={(e) => setFeedbackName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <select
              value={feedbackRating}
              onChange={(e) => setFeedbackRating(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 bg-white outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very Good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
            <textarea
              rows={4}
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Write your feedback..."
              className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-yellow-400"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="w-full sm:w-auto bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold hover:bg-black hover:text-yellow-400 transition"
              >
                Submit Feedback
              </button>
              <button
                type="button"
                onClick={() => navigate("/about-us")}
                className="w-full sm:w-auto border border-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
              >
                View on About Us
              </button>
            </div>
          </form>
        </div>
      </section>
      {/* ================= ABOUT US ================= */}
      <section className="py-14 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          {/* LEFT CONTENT */}
          <div id="aboutus" className="animate-[zoom_20s_linear_infinite]">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              About Rathod Express
            </h2>

            <p className="text-gray-700 mb-4 leading-relaxed">
              Rathod Express is a trusted cab service provider offering
              comfortable, safe, and reliable transportation across Solapur,
              Pune, Mumbai, Goa, and nearby destinations. We specialize in
              outstation travel, airport transfers, and corporate rides with
              well-maintained vehicles and professional drivers.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Our mission is to provide a stress-free travel experience with
              punctual service, transparent pricing, and customer-first support.
              Whether it’s a business trip or a family vacation, we ensure every
              journey is smooth and memorable.
            </p>
          </div>

          {/* RIGHT IMAGE */}
          <div className="animate-[zoom_20s_linear_infinite]">
            <img
              src={outstationcar}
              alt="Cab Service"
              className="rounded-2xl shadow-lg"
            />
          </div>

        </div>
      </section>
      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-14 md:py-20 px-4 md:px-6 bg-gray-100">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-3xl md:text-5xl font-bold mb-10 md:mb-12">
            Why Choose Us
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {/* SAFE & RELIABLE */}
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">
                Safe & Reliable
              </h3>
              <p className="text-gray-600">
                Experienced drivers and well-maintained vehicles ensure a
                secure and comfortable journey every time.
              </p>
            </div>

            {/* ON-TIME SERVICE */}
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-semibold mb-2">
                Always On Time
              </h3>
              <p className="text-gray-600">
                We value your time and guarantee punctual pickups and
                timely drop-offs for every trip.
                timely drop-offs for every tritep.
              </p>
            </div>

            {/* AFFORDABLE PRICING */}
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">
                Transparent Pricing
              </h3>
              <p className="text-gray-600">
                No hidden charges — get fair and competitive pricing for
                all types of journeys.
              </p>
            </div>

            {/* 24x7 SUPPORT */}
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-xl font-semibold mb-2">
                24×7 Customer Support
              </h3>
              <p className="text-gray-600">
                Our support team is available round-the-clock to assist
                you anytime, anywhere.
              </p>
            </div>

            {/* CLEAN VEHICLES */}
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-semibold mb-2">
                Clean & Comfortable
              </h3>
              <p className="text-gray-600">
                Enjoy a pleasant ride in sanitized, spacious, and
                comfortable vehicles.
              </p>
            </div>

            {/* WIDE COVERAGE */}
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2">
                Wide Service Area
              </h3>
              <p className="text-gray-600">
                Serving Solapur, Pune, Mumbai, Goa, and many nearby
                destinations for your convenience.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ⭐ NEW CITY ROUTES SECTION (Hyperlinks added here) */}
      {/* Popular Outstation Routes Section */}
      <section className="py-14 md:py-16 px-4 md:px-6 bg-white border-t">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12">Popular Outstation Routes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Example for Solapur - Repeat for others */}
            <div>
              <h3 className="font-black text-lg mb-4 text-blue-600 border-b-2 border-yellow-400 inline-block">Solapur Routes</h3>
              <ul className="space-y-2 text-sm text-gray-600 font-bold">
                {["Solapur to Pune", "Solapur to Mumbai", "Solapur to Goa", "Solapur to Tuljapur"].map(r => {
                  const [from, to] = r.split(" to ");
                  return (
                    <li
                      key={r}
                      onClick={() => handleRouteClick(from, to)}
                      className="cursor-pointer hover:text-yellow-600 transition-colors duration-200"
                    >
                      • {r} taxi
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h3 className="font-black text-lg mb-4 text-blue-600 border-b-2 border-yellow-400 inline-block">Pune Routes</h3>
              <ul className="space-y-2 text-sm text-gray-600 font-bold">
                {["Pune to Mahabaleshwar", "Pune to Shirdi", "Pune to Mumbai Airport", "Pune to Lonavala"].map(r => {
                  const [from, to] = r.split(" to ");
                  return (
                    <li
                      key={r}
                      onClick={() => handleRouteClick(from, to)}
                      className="cursor-pointer hover:text-yellow-600 transition-colors duration-200"
                    >
                      • {r} taxi
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h3 className="font-black text-lg mb-4 text-blue-600 border-b-2 border-yellow-400 inline-block">Mumbai Routes</h3>
              <ul className="space-y-2 text-sm text-gray-600 font-bold">
                {["Mumbai to Solapur", "Mumbai to Pune", "Mumbai to Goa", "Mumbai to Nashik"].map(r => {
                  const [from, to] = r.split(" to ");
                  return (
                    <li
                      key={r}
                      onClick={() => handleRouteClick(from, to)}
                      className="cursor-pointer hover:text-yellow-600 transition-colors duration-200"
                    >
                      • {r} taxi
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h3 className="font-black text-lg mb-4 text-blue-600 border-b-2 border-yellow-400 inline-block">Goa Routes</h3>
              <ul className="space-y-2 text-sm text-gray-600 font-bold">
                {["Goa to Solapur", "Goa to Pune", "Goa to Mumbai", "Goa Airport to Calangute"].map(r => {
                  const [from, to] = r.split(" to ");
                  return (
                    <li
                      key={r}
                      onClick={() => handleRouteClick(from, to)}
                      className="cursor-pointer hover:text-yellow-600 transition-colors duration-200"
                    >
                      • {r} taxi
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>



      {/* ================= FOOTER ================= */}
      <footer className="bg-yellow-500 text-white font-bold py-8 px-6 text-center">
        <p className="font-bold">
          Rathod Express
        </p>
        <p>Solapur | Pune | Mumbai | Goa</p>
        <p>Phone: +91 9130067841</p>
        <p>Email: rathodexpressofficial@gmail.com</p>
      </footer>

    </div>
  );
};

export default HomePage;
