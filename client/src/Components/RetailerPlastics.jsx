import React, { useEffect, useState } from 'react';
import axios from '../axios'; // Adjust this if using a custom axios instance
import { useParams } from 'react-router-dom';

const RetailerPlastics = () => {
    const { retailerId } = useParams(); // Extract retailerId from route parameters
    const [plastics, setPlastics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handleBuy = async (plasticId) => {
        try {
            const response = await axios.post('/api/buy_plastic', { plastic_id: plasticId, retailer_id: retailerId });
            alert(response.data.message);
        } catch (error) {
            console.error('Error buying plastic:', error);
            alert('An error occurred while buying the plastic.');
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div>
            <h2>Available Plastics</h2>
            {error && <p className="text-red-500">{error}</p>}
            {plastics.length === 0 ? (
                <p>No plastics available.</p>
            ) : (
                <ul>
                    {plastics.map(plastic => (
                        <li key={plastic.id}>
                            <span>Plastic ID: {plastic.id}</span>
                            <button onClick={() => handleBuy(plastic.id)}>Buy</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RetailerPlastics;
