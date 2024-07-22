import React, { useState, useEffect } from 'react';
import axios from '../axios';

const TransferBuyertoRetailer = () => {
  const [plastics, setPlastics] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [selectedPlastic, setSelectedPlastic] = useState('');
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [message, setMessage] = useState('');
  const [buyerId, setBuyerId] = useState(null);

  useEffect(() => {
    const fetchBuyerId = async () => {
      try {
        const response = await axios.get('/api/get_buyer_id');
        setBuyerId(response.data.buyer_id);
      } catch (error) {
        console.error('Error fetching buyer ID:', error);
      }
    };

    const fetchPlastics = async () => {
      try {
        if (!buyerId) return;
        const response = await axios.get(`/api/buyer_plastics/${buyerId}`);
        setPlastics(response.data);
      } catch (error) {
        console.error('Error fetching plastics:', error);
      }
    };

    const fetchRetailers = async () => {
      try {
        const response = await axios.get('/api/retailers');
        setRetailers(response.data);
      } catch (error) {
        console.error('Error fetching retailers:', error);
      }
    };

    fetchBuyerId();
    fetchRetailers();

    if (buyerId) {
      fetchPlastics();
    }
  }, [buyerId]);

  const handleTransferPlastic = async () => {
    try {
      if (!selectedPlastic || !selectedRetailer) {
        setMessage('Please select both a plastic and a retailer.');
        return;
      }

      const response = await axios.post('/api/transfer_buyer_to_retailer', {
        plastic_id: selectedPlastic,
        retailer_id: selectedRetailer,
      });

      setMessage(response.data.message);
      setSelectedPlastic('');
      setSelectedRetailer('');
    } catch (error) {
      setMessage('Error transferring plastic.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Transfer Plastic to Retailer</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Select Plastic</h2>
        <select
          value={selectedPlastic}
          onChange={(e) => setSelectedPlastic(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          <option value="">Select Plastic</option>
          {plastics.map(plastic => (
            <option key={plastic.id} value={plastic.id}>
              {plastic.id} - {new Date(plastic.manufactured_date).toLocaleDateString()}
            </option>
          ))}
        </select>

        <h2 className="text-xl font-semibold mb-4">Select Retailer</h2>
        <select
          value={selectedRetailer}
          onChange={(e) => setSelectedRetailer(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          <option value="">Select Retailer</option>
          {retailers.map(retailer => (
            <option key={retailer.id} value={retailer.id}>
              {retailer.business_name} - {retailer.business_contact} - {retailer.business_address}
            </option>
          ))}
        </select>

        <button
          onClick={handleTransferPlastic}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          Transfer Plastic
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

export default TransferBuyertoRetailer;
