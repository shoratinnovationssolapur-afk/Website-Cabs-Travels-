function ServiceModal({ service, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl p-8 w-[400px] text-center shadow-2xl relative">

        <h3 className="text-2xl font-bold mb-4">{service}</h3>

        <p className="mb-6 text-gray-600">
          Premium service with experienced drivers, sanitized vehicles,
          and 24×7 support.
        </p>

        <button
          onClick={() => {
            document
              .getElementById("booking")
              .scrollIntoView({ behavior: "smooth" });
            onClose();
          }}
          className="bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-800"
        >
          Book This Service
        </button>

        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl font-bold"
        >
          ✕
        </button>

      </div>
    </div>
  );
}
export default ServiceModal;
