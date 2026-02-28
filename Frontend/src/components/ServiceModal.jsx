import { useNavigate } from "react-router-dom";

function ServiceModal({ service, onClose }) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-[400px] text-center shadow-2xl relative">
        <h3 className="text-2xl font-bold mb-4">{service}</h3>

        <p className="mb-6 text-gray-600">
          Premium service with experienced drivers, sanitized vehicles,
          and 24×7 support.
        </p>

        <button
          onClick={() => {
            onClose(); // Close the modal

            // Check if we stay on page or navigate
            if (service === "Airport Transfers") {
              navigate("/bookride");
            } else {
              // Scroll to #booking on the same page
              setTimeout(() => {
                document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }
          }}
          className="bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Book This Service
        </button>




        <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-black text-xl font-bold">
          ✕
        </button>
      </div>
    </div>
  );
}

export default ServiceModal;