const RoleMismatchModal = ({ message, close }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl p-8 w-[380px] text-center">

        <h2 className="text-xl font-bold text-red-600 mb-4">
          Access Denied
        </h2>

        <p className="text-gray-700 mb-6">{message}</p>

        <button
          onClick={close}
          className="bg-red-500 text-white px-6 py-2 rounded font-semibold"
        >
          OK
        </button>

      </div>
    </div>
  );
};

export default RoleMismatchModal;