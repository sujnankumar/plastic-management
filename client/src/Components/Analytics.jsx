import React, { useState, useEffect } from "react";
import axios from "../axios"; // Adjust the import path as needed
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const Analytics = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [buyerLeaderboard, setBuyerLeaderboard] = useState([]);
    const [manufacturerLeaderboard, setManufacturerLeaderboard] = useState([]);
    const [retailerLeaderboard, setRetailerLeaderboard] = useState([]);
    const [recyclerLeaderboard, setRecyclerLeaderboard] = useState([]);
    const [pointsUsageData, setPointsUsageData] = useState([]);
    const [pointsGainedData, setPointsGainedData] = useState([]);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get('/api/user');
                setCurrentUser(response.data);
            } catch (error) {
                console.error('Error fetching current user data:', error);
            }
        };

        const fetchLeaderboards = async () => {
            try {
                const [buyers, manufacturers, retailers, recyclers] = await Promise.all([
                    axios.get('/api/leaderboard/buyers'),
                    axios.get('/api/leaderboard/manufacturers'),
                    axios.get('/api/leaderboard/retailers'),
                    axios.get('/api/leaderboard/recyclers')
                ]);

                setBuyerLeaderboard(buyers.data);
                setManufacturerLeaderboard(manufacturers.data);
                setRetailerLeaderboard(retailers.data);
                setRecyclerLeaderboard(recyclers.data);
            } catch (error) {
                console.error('Error fetching leaderboards:', error);
            }
        };

        fetchCurrentUser();
        fetchLeaderboards();
    }, []);

    useEffect(() => {
        const fetchPointsUsageData = async () => {
            if (currentUser) {
                try {
                    const response = await axios.get(`/api/user/points_usage/${currentUser.id}`);
                    setPointsUsageData(response.data);
                } catch (error) {
                    console.error('Error fetching points usage data:', error);
                }
            }
        };

        const fetchPointsGainedData = async () => {
            if (currentUser) {
                try {
                    const response = await axios.get(`/api/user/points_gained/${currentUser.id}`);
                    setPointsGainedData(response.data);
                } catch (error) {
                    console.error('Error fetching points gained data:', error);
                }
            }
        };

        fetchPointsUsageData();
        fetchPointsGainedData();
    }, [currentUser]);

    const generateLeaderboard = (title, data) => (
        <div className="bg-white shadow-md rounded-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{title} Leaderboard</h2>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2">Username</th>
                        <th className="py-2">Points</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((user, index) => (
                        <tr key={index} className="bg-gray-100">
                            <td className="py-2 px-4">{user.username}</td>
                            <td className="py-2 px-4">{user.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const pointsUsageChartData = {
        labels: pointsUsageData.map(entry => entry.date),
        datasets: [
            {
                label: 'Points Used',
                data: pointsUsageData.map(entry => entry.points),
                borderColor: '#009e00',
                backgroundColor: 'rgba(0, 158, 0, 0.2)',
                fill: true,
            },
        ],
    };

    const pointsGainedChartData = {
        labels: pointsGainedData.map(entry => entry.date),
        datasets: [
            {
                label: 'Transactions',
                data: pointsGainedData.map(entry => entry.points),
                borderColor: '#0057e7',
                backgroundColor: 'rgba(0, 87, 231, 0.2)',
                fill: true,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-100 p-10">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Analytics</h1>
                {currentUser && (
                    <div className="text-right">
                        <h2 className="text-xl font-semibold text-gray-800">Current Points</h2>
                        <p className="text-gray-600">{currentUser.points} Points</p>
                    </div>
                )}
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generateLeaderboard('Buyer', buyerLeaderboard)}
                {generateLeaderboard('Manufacturer', manufacturerLeaderboard)}
                {generateLeaderboard('Retailer', retailerLeaderboard)}
                {generateLeaderboard('Recycler', recyclerLeaderboard)}
            </div>
            
            <div className="bg-white shadow-md rounded-md p-6 mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Transactons Over Time</h2>
                <Line data={pointsGainedChartData} />
            </div>

            <div className="bg-white shadow-md rounded-md p-6 mt-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Redeemed Points</h2>
                <Line data={pointsUsageChartData} />
            </div>
        </div>
    );
};

export default Analytics;