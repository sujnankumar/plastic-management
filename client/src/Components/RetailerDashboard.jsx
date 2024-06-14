import React, { useState, useRef, useEffect } from 'react';
import { MdAddCircle, MdAttachMoney, MdReply } from 'react-icons/md';
import axios from '../axios';  // Adjust the import path as per your project structure

const RetailerDashboard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [plasticId, setPlasticId] = useState('');
  const [userId, setUserId] = useState('');
  const [retailerId, setRetailerId] = useState(null);
  const [plasticInventory, setPlasticInventory] = useState([]);
  const symbolRef = useRef(null);

  useEffect(() => {
    const fetchRetailerId = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/get_retailer_id');
        console.log('Retailer ID:', response.data.retailer_id);
        setRetailerId(response.data.retailer_id);

        fetchPlasticInventory(response.data.retailer_id);
      } catch (error) {
        console.error('Error fetching retailer_id:', error);
      }
    };

    fetchRetailerId();
  }, []);

  const fetchPlasticInventory = async (retailerId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/get_plastic_inventory`);
      console.log('Plastic Inventory:', response.data);
      setPlasticInventory(response.data);
    } catch (error) {
      console.error('Error fetching plastic inventory:', error);
    }
  };

  const handleAddToInventory = async () => {
    try {
      if (!plasticId) {
        alert('Please enter a Plastic ID.');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/add_plastic_to_inventory', {
        plastic_id: plasticId,
        retailer_id: retailerId
      });

      console.log(response.data.message);
      setPlasticId('');
      fetchPlasticInventory(retailerId);
    } catch (error) {
      console.error('Error adding to inventory:', error);
    }
  };

  const handleSell = async () => {
    try {
      if (!plasticId || !userId) {
        alert('Please enter Plastic ID and User ID.');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/sell_plastic', {
        plastic_id: plasticId,
        user_id: userId
      });

      console.log(response.data.message);
      setPlasticId('');
      setUserId('');
      fetchPlasticInventory(retailerId); // Refresh inventory after selling
    } catch (error) {
      console.error('Error selling plastic:', error);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(prevExpanded => !prevExpanded);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 w-full">
      <h1 className="text-2xl font-bold mb-8">Retailer Dashboard</h1>
      <div className="relative">
        <div
          ref={symbolRef}
          className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full cursor-pointer transition duration-300 transform hover:scale-110"
          onClick={toggleExpand}
        >
          <MdAddCircle size={28} />
        </div>
        {isExpanded && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center space-x-4 p-4 rounded-lg shadow-lg">
            <input
              type="text"
              placeholder="Enter Plastic ID"
              className="px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:border-blue-500"
              value={plasticId}
              onChange={(e) => setPlasticId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter User ID"
              className="px-3 py-2 border rounded-md border-gray-300 focus:outline-none focus:border-blue-500"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <button
              className="flex items-center justify-center w-40 h-20 bg-green-500 text-white rounded-lg hover:bg-green-700 transition duration-300"
              onClick={handleAddToInventory}
            >
              <MdAddCircle size={24} className="mr-2" />
              Add to Inventory
            </button>
            <button
              className="flex items-center justify-center w-40 h-20 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition duration-300"
              onClick={handleSell}
            >
              <MdAttachMoney size={24} className="mr-2" />
              Sell
            </button>
            <button className="flex items-center justify-center w-40 h-20 bg-red-500 text-white rounded-lg hover:bg-red-700 transition duration-300">
              <MdReply size={24} className="mr-2" />
              Take Back from User
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Plastic Inventory</h2>
        <ul className="space-y-2">
          {plasticInventory.map(item => (
            <li key={item.id} className="bg-white rounded-md shadow-md p-3 flex justify-between items-center">
              <span>Plastic ID: {item.plastic_id}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RetailerDashboard;
