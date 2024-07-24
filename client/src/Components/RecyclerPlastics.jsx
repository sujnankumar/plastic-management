import React, { useState, useEffect } from 'react';
import axiosInstance from '../axios';

const PlasticsPage = () => {
    const [plasticsData, setPlasticsData] = useState([]);
    const [countData, setCountData] = useState([]);
    const [recycler, setRecycler] = useState(null);
    const [error, setError] = useState(null);
    const [recyclerId, setrecyclerId] = useState(null);
    const [userID, setUserID] = useState(null);
    const [loading, setLoading] = useState(false); // Add loading state

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axiosInstance.get(`/api/user`);
                setUserID(response.data.id);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchRecyclerAndPlastics = async () => {
            if (userID) {
                setLoading(true);
                try {
                    const recyclerResponse = await axiosInstance.get(`/api/get_recycler/${userID}`);
                    console.log(recyclerResponse.data);
                    setrecyclerId(recyclerResponse.data.recycler_id);
                    setRecycler(recyclerResponse.data);

                    const plasticsResponse = await axiosInstance.get(`/api/recycler_plastics/${recyclerId}`);
                    setCountData(plasticsResponse.data.count_data);
                    setPlasticsData(plasticsResponse.data.plastics_data);
                    setError(null);
                } catch (error) {
                    setError("Error fetching recycler or plastics.");
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchRecyclerAndPlastics();
    }, [recyclerId, userID]);

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h2 className="text-4xl font-semibold mb-6 text-green-700">Plastics Created by Recycler</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {recycler ? (
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-green-300">
                    <h3 className="text-2xl font-semibold mb-4 text-green-700">Recycler Details</h3>
                    <p><strong>ID:</strong> {recycler.id}</p>
                    <p><strong>Business Name:</strong> {recycler.business_name}</p>
                    <p><strong>Contact:</strong> {recycler.business_contact}</p>
                    <p><strong>Address:</strong> {recycler.business_address}</p>
                </div>
            ) : (
                <p>Loading recycler details...</p>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full text-md bg-white rounded-lg shadow-md mb-6 border border-green-300">
                    <thead className="bg-green-100">
                        <tr className="text-left">
                            <th className="p-2 text-green-700 text-center">Sl. No.</th>
                            <th className="p-2 text-green-700 text-center">Type</th>
                            <th className="p-2 text-green-700 text-center">Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {countData.length > 0 ? (
                            countData.map((plastic) => (
                                <tr key={plastic.id} className="border-b border-green-200">
                                    <td className="p-2 text-center">{plastic.id}</td>
                                    <td className="p-2 text-center">{plastic.name}</td>
                                    <td className="p-2 text-center">{plastic.count}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="p-2 text-center">No plastics available or loading...</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <table className="min-w-full text-md bg-white rounded-lg shadow-md border border-green-300">
                    <thead className="bg-green-100">
                        <tr className="text-left">
                            <th className="p-2 text-green-700 text-center">ID #</th>
                            <th className="p-2 text-green-700 text-center">Recycled Date</th>
                            <th className="p-2 text-green-700 text-center">Type</th>
                            <th className="p-2 text-green-700 text-center">Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {plasticsData.length > 0 ? (
                            plasticsData.map((plastic) => (
                                <tr key={plastic.id} className="border-b border-green-200">
                                    <td className="p-2 text-center">{plastic.id}</td>
                                    <td className="p-2 text-center">{new Date(plastic.recycled_date).toLocaleString()}</td>
                                    <td className="p-2 text-center">{plastic.type}</td>
                                    <td className="p-2 text-center">{plastic.cost}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="p-2 text-center">No plastics available or loading...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlasticsPage;
