import React, { useState, useEffect } from 'react';
import axiosInstance from '../axios';

const PlasticsPage = () => {
    const [plastics, setPlastics] = useState([]);
    const [manufacturerId, setManufacturerId] = useState(null);
    const [manufacturer, setManufacturer] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get("/api/user");
                setManufacturerId(response.data.id);
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
                    const manufacturerResponse = await axiosInstance.get(`/api/get_manufacturer/${manufacturerId}`);
                    setManufacturer(manufacturerResponse.data);

                    // Fetch plastics associated with the manufacturer
                    const plasticsResponse = await axiosInstance.get(`/api/manufacturer_plastics/${manufacturerId}`);
                    setPlastics(plasticsResponse.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };

        fetchManufacturerAndPlastics();
    }, [manufacturerId]);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Plastics Created by Manufacturer</h1>
            {manufacturer ? (
                <div className="mb-4">
                    <h2 className="text-xl font-bold">Manufacturer Details</h2>
                    <p>ID: {manufacturer.id}</p>
                    <p>Business Name: {manufacturer.business_name}</p>
                    <p>Contact: {manufacturer.business_contact}</p>
                    <p>Address: {manufacturer.business_address}</p>
                </div>
            ) : (
                <p>Loading manufacturer details...</p>
            )}
            <div>
                {plastics.length > 0 ? (
                    plastics.map(plastic => (
                        <div key={plastic.id} className="border p-4 mb-4">
                            <p>ID: {plastic.id}</p>
                            <p>Manufactured Date: {new Date(plastic.manufactured_date).toLocaleString()}</p>
                        </div>
                    ))
                ) : (
                    <p>No plastics available or loading...</p>
                )}
            </div>
        </div>
    );
};

export default PlasticsPage;