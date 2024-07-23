import React, { useEffect, useState } from 'react';
import axios from '../axios'; // Adjust this if using a custom axios instance
import { useParams } from 'react-router-dom';

const BuyRetailerPlastics = () => {
    const { retailerId } = useParams(); // Extract retailerId from route parameters
    const [plastics, setPlastics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantities, setQuantities] = useState({ 1: 0, 2: 0 }); // Quantities for plastic types

    useEffect(() => {
        const fetchPlastics = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/api/plastics/for_retailer/${retailerId}`);
                setPlastics(response.data);
                setError(null); // Clear any previous errors
            } catch (error) {
                console.error('Error fetching plastics:', error);
                setError('An error occurred while fetching plastics.');
            } finally {
                setLoading(false);
            }
        };

        if (retailerId) {
            fetchPlastics();
        } else {
            setError('Invalid retailer ID.');
            setLoading(false);
        }
    }, [retailerId]);

    const handleBuy = async () => {
        try {
            const response = await axios.post('/api/buy_plastic', { 
                retailer_id: retailerId,
                quantities: quantities
            });
            alert(response.data.message);
        } catch (error) {
            console.error('Error buying plastics:', error);
            alert('An error occurred while buying the plastics.');
        }
    };

    const handleQuantityChange = (type, value) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [type]: Math.max(0, parseInt(value, 10) || 0) // Ensure quantity is non-negative
        }));
    };

    const incrementQuantity = (type) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [type]: prevQuantities[type] + 1
        }));
    };

    const decrementQuantity = (type) => {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [type]: Math.max(0, prevQuantities[type] - 1) // Ensure quantity is non-negative
        }));
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-xl font-semibold mb-4">Buy Plastics from Retailer</h2>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex justify-between space-x-4">
                <div className="flex-1 p-4 border rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold">Type 1 Plastic</h3>
                    <div className="flex items-center mt-4">
                        <button
                            onClick={() => decrementQuantity(1)}
                            className="bg-gray-300 text-gray-800 px-2 py-1 rounded-l-md"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            min="0"
                            value={quantities[1] || 0}
                            onChange={(e) => handleQuantityChange(1, e.target.value)}
                            className="border-gray-300 text-center w-full border-t border-b"
                        />
                        <button
                            onClick={() => incrementQuantity(1)}
                            className="bg-gray-300 text-gray-800 px-2 py-1 rounded-r-md"
                        >
                            +
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-4 border rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold">Type 2 Plastic</h3>
                    <div className="flex items-center mt-4">
                        <button
                            onClick={() => decrementQuantity(2)}
                            className="bg-gray-300 text-gray-800 px-2 py-1 rounded-l-md"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            min="0"
                            value={quantities[2] || 0}
                            onChange={(e) => handleQuantityChange(2, e.target.value)}
                            className="border-gray-300 text-center w-full border-t border-b"
                        />
                        <button
                            onClick={() => incrementQuantity(2)}
                            className="bg-gray-300 text-gray-800 px-2 py-1 rounded-r-md"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
            <div className="mt-4 text-center">
                <button
                    onClick={handleBuy}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                    Buy
                </button>
            </div>
        </div>
    );
};

export default BuyRetailerPlastics;
