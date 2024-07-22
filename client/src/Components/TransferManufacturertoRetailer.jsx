import React, { useState, useEffect } from 'react';
import axios from '../axios';

const TransferManufacturertoRetailer = () => {
  const [plastics, setPlastics] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [selectedPlastics, setSelectedPlastics] = useState([]);
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [message, setMessage] = useState('');
  const [manufacturerId, setManufacturerId] = useState(null);

  useEffect(() => {
    const fetchManufacturerId = async () => {
      try {
        const response = await axios.get('/api/get_manufacturer_id');
        setManufacturerId(response.data.manufacturer_id);
      } catch (error) {
        console.error('Error fetching manufacturer ID:', error);
      }
    };

    const fetchPlastics = async () => {
      try {
        if (!manufacturerId) return;
        const response = await axios.get(`/api/manufacturer_plastics/${manufacturerId}`);
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

    fetchManufacturerId();
    fetchRetailers();

    if (manufacturerId) {
      fetchPlastics();
    }
  }, [manufacturerId]);

  const handleTransferPlastic = async (event) => {
    event.preventDefault();
  
    try {
      if (selectedPlastics.length === 0 || !selectedRetailer) {
        setMessage('Please select both plastics and a retailer.');
        return;
      }
  
      const response = await axios.post('/api/transfer_plastic/to_retailer', {
        plastic_ids: selectedPlastics,
        retailer_id: selectedRetailer,
      });
  
      setMessage(response.data.message);
      setSelectedPlastics([]);
      setSelectedRetailer('');
  
      // Reload the page after successful submission
      window.location.reload();
    } catch (error) {
      setMessage('Error transferring plastics. Please try again.');
    }
  };
  
  const handleCheckboxChange = (id) => {
    setSelectedPlastics((prev) =>
      prev.includes(id) ? prev.filter((plasticId) => plasticId !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Transfer Plastics to Retailer</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Select Plastics</h2>
        {plastics.length === 0 ? (
          <p>No plastics available for transfer.</p>
        ) : (
          <div className="mb-4">
            {plastics.map(plastic => (
              <div key={plastic.id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id={`plastic-${plastic.id}`}
                  checked={selectedPlastics.includes(plastic.id)}
                  onChange={() => handleCheckboxChange(plastic.id)}
                  className="mr-2"
                />
                <label htmlFor={`plastic-${plastic.id}`}>
                  {plastic.id} - {new Date(plastic.manufactured_date).toLocaleDateString()}
                </label>
              </div>
            ))}
          </div>
        )}

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
          Transfer Plastics
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

export default TransferManufacturertoRetailer;