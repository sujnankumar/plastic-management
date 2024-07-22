import React, { useState, useEffect } from 'react';
import axios from '../axios';  // Import Axios instance configured with base URL

const BuyPlastic = () => {
  const [plastics, setPlastics] = useState([]);
  const [selectedPlastic, setSelectedPlastic] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch available plastics
    const fetchPlastics = async () => {
      try {
        const response = await axios.get('/api/get_available_plastics');
        setPlastics(response.data);
      } catch (error) {
        console.error('Error fetching plastics:', error);
      }
    };

    fetchPlastics();
  }, []);

  const handleBuyPlastic = async () => {
    try {
      if (!selectedPlastic || !quantity) {
        setMessage('Please select a plastic and enter quantity.');
        return;
      }

      const response = await axios.post('/api/buy_plastic', {
        plastic_id: selectedPlastic,
        quantity: quantity,
      });

      setMessage(response.data.message);
      setQuantity('');  // Clear quantity input after successful purchase
    } catch (error) {
      console.error('Error buying plastic:', error);
      setMessage('Error purchasing plastic.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Buy Plastic</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Available Plastics</h2>
        <div className="mb-4">
          <label htmlFor="plastic" className="block text-gray-700 mb-2">Select Plastic</label>
          <select
            id="plastic"
            value={selectedPlastic}
            onChange={(e) => setSelectedPlastic(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select a plastic</option>
            {plastics.map(plastic => (
              <option key={plastic.id} value={plastic.id}>
                {plastic.plastic_id} - {plastic.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="quantity" className="block text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            min="1"
          />
        </div>

        <button
          onClick={handleBuyPlastic}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Buy
        </button>

        {message && (
          <div className="mt-4 text-center text-green-600">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyPlastic;
