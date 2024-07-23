import React, { useState, useEffect } from 'react';
import { MdAddCircle, MdAttachMoney, MdReply } from 'react-icons/md';
import axios from '../axios'; // Adjust the import path as per your project structure

const RetailerDashboard = () => {
  const [retailerId, setRetailerId] = useState(null);
  const [plasticInventory, setPlasticInventory] = useState([]);
  const [qrCode, setQrCode] = useState(null);

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

  const handleGenerateQrCode = async () => {
    if (!retailerId) return;

    try {
      const response = await axios.get(`http://localhost:5000/api/generate_qr/${retailerId}`, {
        responseType: 'blob', // Expect a binary response
      });

      const url = URL.createObjectURL(response.data);
      setQrCode(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 w-full">
      <h1 className="text-2xl font-bold mb-8">Retailer Dashboard</h1>
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
      <div className="mt-8">
        <button
          onClick={handleGenerateQrCode}
          className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
        >
          Generate QR Code
        </button>
        {qrCode && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Your QR Code:</h3>
            <img src={qrCode} alt="Retailer QR Code" className="mt-2 border rounded-md" />
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerDashboard;
