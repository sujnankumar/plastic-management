import { useEffect, useState, useRef } from "react";
import axios from "../axios"; // Import Axios

const AdminDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const rectangleRef = useRef(null);
  const [userTypeData, setUserTypeData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/user");
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();

    const handleClickOutside = (event) => {
      if (rectangleRef.current && !rectangleRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const getUserTypeData = async (userType) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/${userType.toLowerCase()}`);
      setUserTypeData(response.data);
    } catch (error) {
      console.error(`Error fetching ${userType} data:`, error);
    } finally {
      setLoading(false);
      setIsExpanded(false); // Close the toggle
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 w-full">
      <h1 className="text-2xl font-bold mb-8">Welcome to the AdminDashboard Page</h1>
      <div className="relative" ref={rectangleRef}>
        <div className="flex items-center">
        <div
        className="h-12 flex-shrink-0 flex items-center justify-center rounded-full cursor-pointer bg-gray-200 px-4 mr-4"
        onClick={toggleExpand}
        >
        Display Users
        </div>
        <div
        className="w-12 h-12 bg-blue-500 text-white flex items-center justify-center rounded-full cursor-pointer"
        onClick={toggleExpand}
        >
        &#8644;
        </div>
    </div>

        {isExpanded && (
            <div className="absolute top-16 left-0 w-full mt-4 flex justify-center items-center space-x-4 z-10">
                <button
                    className="w-32 h-16 flex items-center justify-center bg-gradient-to-r from-red-400 to-red-600 text-white font-bold border-2 border-gray-800 rounded-lg cursor-pointer hover:scale-105 transition duration-300 px-4"
                    onClick={() => getUserTypeData("Retailers")}
                >
                    Retailer
                </button>
                <button
                    className="w-32 h-16 flex items-center justify-center bg-gradient-to-r from-green-400 to-green-600 text-white font-bold border-2 border-gray-800 rounded-lg cursor-pointer hover:scale-105 transition duration-300 px-4"
                    onClick={() => getUserTypeData("Buyers")}
                >
                    Buyer
                </button>
                <button
                    className="w-32 h-16 flex items-center justify-center bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold border-2 border-gray-800 rounded-lg cursor-pointer hover:scale-105 transition duration-300 px-4"
                    onClick={() => getUserTypeData("Recyclers")}
                >
                    Recycler
                </button>
                <button
                    className="w-32 h-16 flex items-center justify-center bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold border-2 border-gray-800 rounded-lg cursor-pointer hover:scale-105 transition duration-300 px-4"
                    onClick={() => getUserTypeData("Manufacturers")}
                >
                    Manufacturer
                </button>
            </div>
        )}
      </div>
      <div className="mt-8">
        {loading && <p>Loading...</p>}
        {!loading && userTypeData.length === 0 && <p>No users found.</p>}
        {!loading && userTypeData.length > 0 && (
          <table className="border-collapse border border-gray-800">
            <thead>
              <tr>
                <th className="border border-gray-800 px-4 py-2">ID</th>
                <th className="border border-gray-800 px-4 py-2">Business Name</th>
                <th className="border border-gray-800 px-4 py-2">Business Contact</th>
                <th className="border border-gray-800 px-4 py-2">Business Address</th>
              </tr>
            </thead>
            <tbody>
              {userTypeData.map((user) => (
                <tr key={user.id}>
                  <td className="border border-gray-800 px-4 py-2">{user.id}</td>
                  <td className="border border-gray-800 px-4 py-2">{user.business_name}</td>
                  <td className="border border-gray-800 px-4 py-2">{user.business_contact}</td>
                  <td className="border border-gray-800 px-4 py-2">{user.business_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
