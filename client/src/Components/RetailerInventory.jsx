import React, { useState, useEffect } from 'react';
import axios from '../axios';

const RetailerInventory = () => {
  const [inventory, setInventory] = useState([]);
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

    const fetchInventory = async () => {
      try {
        if (!retailerId) return;
        const response = await axios.get(`/api/retailer_inventory/${retailerId}`);
        setInventory(response.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    fetchRetailerId();

    if (retailerId) {
      fetchInventory();
    }
  }, [retailerId]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Retailer Inventory</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Inventory</h2>
        
        {inventory.length === 0 ? (
          <p className="text-gray-600">No plastics in inventory.</p>
        ) : (
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b border-gray-300">ID</th>
                <th className="py-2 px-4 border-b border-gray-300">Plastic ID</th>
                <th className="py-2 px-4 border-b border-gray-300">Manufactured Date</th>
                <th className="py-2 px-4 border-b border-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item.id}>
                  <td className="py-2 px-4 border-b border-gray-300">{item.id}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{item.plastic_id}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{new Date(item.manufactured_date).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b border-gray-300">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {message && (
          <div className="mt-4 text-center text-green-600">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default RetailerInventory;
