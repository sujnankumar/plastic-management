import React, { useState, useEffect } from 'react';
import axiosInstance from '../axios';

const ManufacturerDashboard = () => {
    const [createdPlastic, setCreatedPlastic] = useState(null);
    const [manufacturer, setManufacturer] = useState(null);
    const [user, setUser] = useState(null);
    const [showMessage, setShowMessage] = useState(false);
    const [plastics, setPlastics] = useState([]);
    const [showPlastics, setShowPlastics] = useState(false);

    // New state variables
    const [plasticType, setPlasticType] = useState(1);
    const [plasticCost, setPlasticCost] = useState('');
    const [plasticQuantity, setPlasticQuantity] = useState(1);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get("/api/user");
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (user) {
            const fetchManufacturer = async () => {
                try {
                    const response = await axiosInstance.get(`/api/get_manufacturer/${user.id}`);
                    setManufacturer(response.data);
                } catch (error) {
                    console.error('Error fetching manufacturer:', error);
                }
            };

            fetchManufacturer();
        }
    }, [user]);

    const createPlastic = async () => {
        if (!manufacturer) return;

        try {
            // Create multiple plastics
            for (let i = 0; i < plasticQuantity; i++) {
                await axiosInstance.post('/api/create_plastic', {
                    manufacturerId: manufacturer.id,
                    type: plasticType,
                    cost: plasticCost
                });
            }
            setCreatedPlastic({
                type: plasticType,
                cost: plasticCost,
                quantity: plasticQuantity
            });
            setShowMessage(true);

            // Hide message after 5 seconds
            setTimeout(() => {
                setShowMessage(false);
            }, 5000);
        } catch (error) {
            console.error('Error creating plastics:', error);
        }
    };

    const fetchPlastics = async () => {
        if (!manufacturer) return;

        try {
            const response = await axiosInstance.get(`/api/get_plastics/${manufacturer.id}`);
            setPlastics(response.data);
            setShowPlastics(true);
        } catch (error) {
            console.error('Error fetching plastics:', error);
        }
    };

    return (
        <div className="container mx-10 p-4">
            <h1 className="text-2xl font-bold mb-4">Manufacturer Dashboard</h1>
            {manufacturer && (
                <div className="mb-4">
                    <h2 className="text-xl font-bold">Manufacturer Details</h2>
                    <p>ID: {manufacturer.id}</p>
                    <p>Business Name: {manufacturer.business_name}</p>
                    <p>Contact: {manufacturer.business_contact}</p>
                    <p>Address: {manufacturer.business_address}</p>
                </div>
            )}
            <div className="mb-4">
                <label className="block mb-2">
                    Plastic Type:
                    <select
                        value={plasticType}
                        onChange={(e) => setPlasticType(parseInt(e.target.value))}
                        className="block w-full mt-1 border-gray-300 rounded-md"
                    >
                        <option value={1}>Type 1</option>
                        <option value={2}>Type 2</option>
                    </select>
                </label>
                <label className="block mb-2">
                    Cost:
                    <input
                        type="number"
                        value={plasticCost}
                        onChange={(e) => setPlasticCost(e.target.value)}
                        className="block w-full mt-1 border-gray-300 rounded-md"
                    />
                </label>
                <label className="block mb-2">
                    Quantity:
                    <input
                        type="number"
                        value={plasticQuantity}
                        onChange={(e) => setPlasticQuantity(parseInt(e.target.value))}
                        min="1"
                        className="block w-full mt-1 border-gray-300 rounded-md"
                    />
                </label>
                <button
                    onClick={createPlastic}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                >
                    Add Plastics
                </button>
            </div>
            <a
                href='/manufacturer_plastics'
                className="bg-green-500 mx-10 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
            >
                View all Plastics
            </a>
            {createdPlastic && showMessage && (
                <div className="mt-4 transition-opacity duration-500 ease-in-out opacity-100">
                    <h2 className="text-xl font-bold">Plastics Created</h2>
                    <p>Type: {createdPlastic.type}</p>
                    <p>Cost: {createdPlastic.cost}</p>
                    <p>Quantity: {createdPlastic.quantity}</p>
                </div>
            )}
            {showPlastics && (
                <div className="mt-4">
                    <h2 className="text-xl font-bold">Plastics Created</h2>
                    <ul>
                        {plastics.map(plastic => (
                            <li key={plastic.id} className="mb-2">
                                <p>ID: {plastic.id}</p>
                                <p>Manufactured Date: {new Date(plastic.manufactured_date).toLocaleString()}</p>
                                <p>Type: {plastic.type}</p>
                                <p>Cost: {plastic.cost}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ManufacturerDashboard;
