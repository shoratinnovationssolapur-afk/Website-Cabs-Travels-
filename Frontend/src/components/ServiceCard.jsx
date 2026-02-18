function ServiceCard({
  title,
  icon,
  price,
  description,
  popular,
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className="relative backdrop-blur-lg bg-white/60 border border-white/40 rounded-2xl p-8 text-center shadow-xl cursor-pointer transition-all duration-300 hover:-translate-y-4 hover:shadow-2xl hover:rotate-1"
    >

      {/* Popular Badge */}
      {popular && (
        <span className="absolute top-3 right-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
          Popular
        </span>
      )}

      {/* Icon */}
      <div className="text-5xl mb-4">{icon}</div>

      <h3 className="text-xl font-semibold mb-2">{title}</h3>

      <p className="text-blue-700 font-bold mb-2">{price}</p>

      <p className="text-gray-600 mb-4">{description}</p>

      <div className="opacity-0 hover:opacity-100 transition font-semibold text-indigo-700">
        View Details →
      </div>
    </div>
  );
}
export default ServiceCard;
