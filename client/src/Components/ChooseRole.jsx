import { useEffect, useState } from "react";
import axios from '../axios';

const roles = [
  { name: 'Manufacturer', 
    gradient: 'bg-gradient-to-r from-blue-400 to-blue-600',
    bgimg: 'https://miro.medium.com/v2/resize:fit:771/1*St_GyNH11Hb0e4pz8Oec5A.png',
    fgimg: 'https://www.svgrepo.com/show/484043/person-button.svg'},
  { name: 'Retailer', 
    gradient: 'bg-gradient-to-r from-green-400 to-green-600',
    bgimg: 'https://vegavid.com/blog/wp-content/uploads/2023/07/How-Green-AI-is-Revolutionizing-Technology-for-a-Sustainable-Future.jpg',
    fgimg: 'https://www.svgrepo.com/show/484043/person-button.svg' },
  { name: 'Recycler', 
    gradient: 'bg-gradient-to-r from-pink-400 to-pink-600',
    bgimg: 'https://waste-management-world.com/imager/media/wasteManagementWorld/3820706/AdobeStock_571968683_428fd902f4247199467725e7eccf1673.jpeg' ,
    fgimg: 'https://www.svgrepo.com/show/484043/person-button.svg'},
];

const ChooseRole = () => {
  const [businessName, setBusinessName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  // const [userData, setUserData] = useState(null);

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/submit_business_info", {
        business_name: businessName,
        contact_number: contactNumber,
        address,
        role: selectedRole,
      });

      if (response.status === 200) {
        console.log("Message:", response.data.message);
        alert("Business information submitted successfully");
      } else {
        console.log("Message:", response.data.message);
        alert(response.data.message);
      }
    } catch (error) {
      console.error("There was an error submitting the form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
        try {
            const response = await axios.get("/api/user");
            // setUserData(response.data);
            // setUserId(response.data.id); // Assume user ID is in the response
            setCurrentRole(response.data.role);
            console.log(response.data.role);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    fetchUserData();
  }, []);

  return (
     <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6 rounded-xl text-gray-800 w-full">
      <header className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Role (Currently: {currentRole})</h1> 
        <p className="text-gray-600">Select a role and provide your business information to get started.</p>
      </header>

      <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Business Information</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="businessName">
            Business Name
          </label>
          <input
            type="text"
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="contactNumber">
            Contact Number
          </label>
          <input
            type="text"
            id="contactNumber"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
            Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        

      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {roles.map((role, index) => (
          <div
            key={index}
            onClick={() => handleRoleClick(role.name)}
            className={`p-6 flex flex-col justify-center items-center text-white text-xl font-bold rounded-lg shadow-lg cursor-pointer transition-transform duration-300 ease-in-out 
              ${role.gradient} 
              ${selectedRole === role.name ? 'transform scale-95 border-4 border-yellow-500' : 'hover:scale-105'}
            `}
            style={{
              backgroundImage: `url(${role.bgimg})`,  // Use role.svg directly inside the template literal
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              color: 'pink',
            }}
          >
            <div className="rounded-full h-16 w-16 bg-white bg-opacity-25 mb-4 flex justify-center items-center"
            style={{
              backgroundImage: `url(${role.fgimg})`,  // Use role.svg directly inside the template literal
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              
            }}      
            > </div>
                
            <div>{role.name}</div>
          </div>
        ))}
      </div>
      <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Submit
        </button>
      </form>

    </div>
  );
};

export default ChooseRole;
