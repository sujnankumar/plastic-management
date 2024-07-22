import React, { useState, useEffect } from 'react';
import axios from '../axios';

const TransferRetailertoRecycler = () => {
  const [plastics, setPlastics] = useState([]);
  const [recyclers, setRecyclers] = useState([]);
  const [selectedPlastic, setSelectedPlastic] = useState('');
  const [selectedRecycler, setSelectedRecycler] = useState('');
  const [message, setMessage] = useState('');
  const [retailerId, setRetailerId] = useState(null);

  useEffect(() => {
    const fetchRetailerId = async () => {
      try {
        const response = await axios.get('/api/get_retailer_id');
        setRetailerId(response.data.retailer_id);
      } catch (error) {
        console.error('Error fetching retailer ID:', error);
      }
    };

    const fetchPlastics = async () => {
      try {
        if (!retailerId) return;
        const response = await axios.get(`/api/retailer_plastics/${retailerId}`);
        setPlastics(response.data);
      } catch (error) {
        console.error('Error fetching plastics:', error);
      }
    };

    const fetchRecyclers = async () => {
      try {
        const response = await axios.get('/api/recyclers');
        setRecyclers(response.data);
      } catch (error) {
        console.error('Error fetching recyclers:', error);
      }
    };

    fetchRetailerId();
    fetchRecyclers();

    if (retailerId) {
      fetchPlastics();
    }
  }, [retailerId]);

  const handleTransferPlastic = async () => {
    try {
      if (!selectedPlastic || !selectedRecycler) {
        setMessage('Please select both a plastic and a recycler.');
        return;
      }

      const response = await axios.post('/api/transfer_retailer_to_recycler', {
        plastic_id: selectedPlastic,
        recycler_id: selectedRecycler,
      });

      setMessage(response.data.message);
      setSelectedPlastic('');
      setSelectedRecycler('');
    } catch (error) {
      setMessage('Error transferring plastic.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Transfer Plastic to Recycler</h1>

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

        <h2 className="text-xl font-semibold mb-4">Select Recycler</h2>
        <select
          value={selectedRecycler}
          onChange={(e) => setSelectedRecycler(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          <option value="">Select Recycler</option>
          {recyclers.map(recycler => (
            <option key={recycler.id} value={recycler.id}>
              {recycler.business_name} - {recycler.business_contact} - {recycler.business_address}
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

export default TransferRetailertoRecycler;
