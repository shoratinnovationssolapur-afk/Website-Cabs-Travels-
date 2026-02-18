import { useNavigate } from "react-router-dom";
// import HomePage from "../pages/Homepage";

const Navbar = ({ openLogin }) => {
  const navigate = useNavigate();

  const openRentPage = () => {
    navigate("/rent-your-car");
  };
  const openHomePage = () => {
    navigate("/");
  };

  return (
    <nav className=" text-white bg-black  px-3 py-2 flex justify-between items-center">

      <h2 className="text-xl font-bold text-yellow-500">
        Rathod Cabs & Travels
      </h2>

      <div className=" flex gap-4 ">

      <button
       onClick={openHomePage}
        className="bg-white hover:bg-yellow-500 text-black px-4 py-2 rounded font-semibold "
      >
        Home
      </button>

      <button
        onClick={openRentPage}
        className="bg-white hover:bg-yellow-500 text-black px-4 py-2 rounded font-semibold "
      >
        Do you want to rent your car? Click here
      </button>

      <button
        onClick={openLogin}
        className="bg-white hover:bg-yellow-500 text-black px-4 py-2 rounded font-semibold"
      >
        Login / Create Account
      </button>
      </div>

    </nav>
  );
};

export default Navbar;
