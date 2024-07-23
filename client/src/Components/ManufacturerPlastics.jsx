import React, { useState, useEffect } from 'react';
import axiosInstance from '../axios';

const PlasticsPage = () => {
    const [plastics, setPlastics] = useState([]);
    const [manufacturer, setManufacturer] = useState(null);
    const [error, setError] = useState(null);
    const [manufacturerId, setManufacturerId] = useState(null);
    const [userID, setUserID] = useState(null);

    useEffect(() => {
        const fetchManufacturerId = async () => {
            try {
                // Fetch the manufacturer ID using the correct endpoint
                const response = await axiosInstance.get("/api/get_manufacturer_id");
                setManufacturerId(response.data.manufacturer_id);
            } catch (error) {
                setError("Error fetching manufacturer ID.");
                console.error("Error fetching manufacturer ID:", error);
            }
        };

        fetchManufacturerId();
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get("/api/user");
                setUserID(response.data.id);
                console.log(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);


    useEffect(() => {
        const fetchManufacturerAndPlastics = async () => {
            if (manufacturerId) {
                try {
                    // Fetch manufacturer details
                    const manufacturerResponse = await axiosInstance.get(`/api/get_manufacturer/${userID}`);
                    setManufacturer(manufacturerResponse.data);
                    
                    // Fetch plastics associated with the manufacturer
                    const plasticsResponse = await axiosInstance.get(`/api/manufacturer_plastics/${manufacturerId}`);
                    setPlastics(plasticsResponse.data);
                } catch (error) {
                    setError("Error fetching manufacturer or plastics.");
                    console.error('Error fetching data:', error);
                }
            }
        };

        fetchManufacturerAndPlastics();
    }, [manufacturerId]);


    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h2 className="text-4xl font-semibold mb-6 dark:text-gray-800">Plastics Created by Manufacturer</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {manufacturer ? (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-2xl font-semibold mb-4">Manufacturer Details</h3>
                    <p><strong>ID:</strong> {manufacturer.id}</p>
                    <p><strong>Business Name:</strong> {manufacturer.business_name}</p>
                    <p><strong>Contact:</strong> {manufacturer.business_contact}</p>
                    <p><strong>Address:</strong> {manufacturer.business_address}</p>
                </div>
            ) : (
                <p>Loading manufacturer details...</p>
            )}
            <div className="overflow-x-auto">
                <table className="min-w-full text-md bg-white rounded-lg shadow-md">
                    <thead className="bg-gray-200 dark:bg-gray-300">
                        <tr className="text-left">
                            <th className="p-3">ID #</th>
                            <th className="p-3">Manufactured Date</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plastics.length > 0 ? (
                            plastics.map((plastic) => (
                                <tr key={plastic.id} className="border-b border-opacity-20 dark:border-gray-300">
                                    <td className="p-3">{plastic.id}</td>
                                    <td className="p-3">{new Date(plastic.manufactured_date).toLocaleString()}</td>
                                    <td className="p-3">{plastic.type}</td>
                                    <td className="p-3 text-right">{plastic.cost}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-3 text-center">No plastics available or loading...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlasticsPage;
