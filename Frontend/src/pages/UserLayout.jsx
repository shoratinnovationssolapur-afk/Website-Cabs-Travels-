import { useState } from "react";
import ToursSection from "../utils/ToursSection";
import UserProfile from "./UserProfile";
export default function UserLayout() {

  const [active, setActive] = useState("tours");
  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-black text-white p-6">

        <h2 className="text-xl font-bold mb-8">
          User Panel
        </h2>

        <nav className="flex flex-col gap-4">
          <button className="hover:bg-white hover:text-black cursor-pointer" onClick={() => setActive("profile")}>
            Profile
          </button>

          <button className="hover:bg-white cursor-pointer hover:text-black" onClick={() => setActive("tours")}>
            Tours
          </button>
        </nav>

      </aside>


      {/* ===== CONTENT AREA ===== */}
      <main className="flex-1 p-8">

       
        {active === "profile" && <UserProfile />}
        {active === "tours" && <ToursSection />}
        

      </main>

    </div>
  );
  
}