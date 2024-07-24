import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import axios from "../axios"; // Adjust the import path as needed
import { Bar } from "react-chartjs-2";
import { FaLeaf, FaCoins, FaGift } from "react-icons/fa";
import { Chart as ChartJS } from "chart.js/auto";

const data = {
    labels: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ],
    datasets: [
        {
            label: "Points gained",
            data: [100, 30, 65, 55, 30, 60, 75, 120],
            backgroundColor: ["#009e00"],
        },
    ],
};

const items = [
    {
        src: "https://5.imimg.com/data5/ON/VU/MY-3526621/plastic-bag.jpg",
        category: "Kitchen",
        name: "Everyday Plastic cover",
        points: 10,
    },
    {
        src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzLhGRZQTEjQ-NJ7klT1HgXFrsg49GopcGNQ&s",
        category: "Food",
        name: "Plastic Straws",
        points: 5,
    },
    {
        src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcZ7geJ5doQGf79nX7DL9Ih0aKs5zgoOJ8Vg&s",
        category: "Bathroom",
        name: "Plastic buckets",
        points: 35,
    },
    {
        src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuyz0KbYtxFZwdAICYemLp2-SL3ajYeJeuBw&s",
        category: "Bathroom",
        name: "Plastic mug",
        points: 20,
    },
    {
        src: "https://tiimg.tistatic.com/fp/1/007/916/pack-of-100-peace-for-party-events-white-colour-disposable-plastic-spoons--715.jpg",
        category: "Kitchen",
        name: "Plastic spoons",
        points: 15,
    },
    {
        src: "https://dummyimage.com/420x260",
        category: "Plastic",
        name: "Small Size Plastic",
        points: 25,
    },
    {
        src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJRgVqgbvCeyG1kjhrJ4eMMp6tD5IReusUkQ&s",
        category: "Plastic",
        name: "Plastic Water Bottles",
        points: 20,
    },
    {
        src: "https://dummyimage.com/420x260",
        category: "Plastic",
        name: "Small Size Plastic",
        points: 25,
    },
];

const BuyerDashboard = () => {
    const [plastics, setPlastics] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [html5QrCode, setHtml5QrCode] = useState(null);
    const [scannedRetailerId, setScannedRetailerId] = useState(null); // Track scanned retailer ID
    const [plasticToSell, setPlasticToSell] = useState(null); // Track which plastic to sell
    const [userData, setUserData] = useState(null);
    const [actionType, setActionType] = useState(null); // Track action type (buy or sell)
    const [successScannedRetail, setsuccessScannedRetail] = useState(null); // Track action type (buy or sell)
    const qrCodeRef = useRef(null); // Ref for QR code scanning container

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('/api/user');
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const fetchPlastics = async () => {
            try {
                const response = await axios.get('/api/get_user_plastics');
                setPlastics(response.data);
            } catch (error) {
                console.error('Error fetching plastics:', error);
            }
        };

        fetchPlastics();
    }, []);

    useEffect(() => {
        if (isScanning) {
            const html5Qr = new Html5Qrcode('qr-code-scanner');
            setHtml5QrCode(html5Qr);
    
            const config = { fps: 10, qrbox: 250 };
            html5Qr
                .start(
                    { facingMode: 'environment' },
                    config,
                    (decodedText, decodedResult) => {
                        console.log('QR Scan Data:', decodedText);
                        try {
                            const retailerId = parseRetailerIdFromQR(decodedText);
                            console.log('Retailer', retailerId);
                            if (retailerId) {
                                setScannedRetailerId(retailerId);
                                stopScanning(); // Stop scanning after successful scan
    
                                if (actionType === 'buy') {
                                    navigate(`/retailer/${retailerId}/plastics`);
                                } else if (actionType === 'sell') {
                                    // Ensure actionType is 'sell' before proceeding
                                    console.log('Selling plastic...');
                                    setActionType(null); 
                                    setsuccessScannedRetail(true); // Clear action type
                                    // Display confirmation modal
                                }
                            }
                        } catch (error) {
                            console.error('Error parsing QR data:', error);
                        }
                    },
                    (error) => {
                        console.error('QR scan error:', error);
                    }
                )
                .catch((error) => {
                    console.error('Error starting QR code scanner:', error);
                });
    
            return () => {
                if (html5Qr) {
                    html5Qr.stop().catch((error) => {
                        console.error('Error stopping QR code scanner:', error);
                    });
                }
            };
        }
    }, [isScanning, actionType]);
    
    const parseRetailerIdFromQR = (data) => {
        console.log('Raw QR data:', data);

        try {
            if (typeof data === 'string') {
                const parts = data.split(':');
                if (parts.length === 2 && !isNaN(parseInt(parts[1], 10))) {
                    return parseInt(parts[1], 10);
                }
            }
        } catch (error) {
            console.error('Error parsing data:', error);
        }
        return null;
    };

    const stopScanning = async () => {
        try {
            if (html5QrCode) {
                await html5QrCode.stop();
                setHtml5QrCode(null); // Clear reference to avoid issues
            }
        } catch (error) {
            console.error('Error stopping QR code scanner:', error);
        } finally {
            setIsScanning(false); // Update state to indicate scanning has stopped
        }
    };

    const handleSell = async () => {
        console.log("PID", plasticToSell,"RID",scannedRetailerId);
        if (plasticToSell && scannedRetailerId) {
            try {
                const response = await axios.post('/api/sell_plastic', {
                    plastic_id: plasticToSell,
                    retailer_id: scannedRetailerId,
                });
                
                // Refresh the plastics list after selling
                const updatedResponse = await axios.get('/api/get_user_plastics');
                setPlastics(updatedResponse.data);
                setsuccessScannedRetail(null);
                setScannedRetailerId(null); // Clear retailer ID after sale
                setPlasticToSell(null); // Clear plastic selection
            } catch (error) {
                console.error('Error selling plastic:', error);
                alert('An error occurred while selling the plastic.');
            }
        } else {
            alert('Please select a plastic and scan a retailer QR code.');
        }
    };

    return (
        <div>
            <div className="relative min-h-screen bg-gray-100 px-10 py-8">
                {/* QR Code Scanner and Plastics Display */}
                <header className="rounded-md mb-4 flex items-center px-8 pt-6">
                    <span className="text-3xl text-gray-800">Hello</span>
                    <h1 className="text-4xl font-bold ml-2 text-gray-800">
                        {userData && (
                            <>
                                <span>{userData.firstname} </span>
                                <span>{userData.lastname}</span>
                            </>
                        )},
                    </h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 px-8">
                    <div className="bg-white shadow-md rounded-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Buy Plastics</h2>
                        <button
                            onClick={() => {
                                setActionType('buy'); // Set action type to buy
                                setIsScanning(true); // Start scanning
                            }}
                            className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
                        >
                            Scan Retailer QR
                        </button>

                        {isScanning && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                                <div className="relative p-4 bg-white rounded-lg shadow-lg">
                                    <button
                                        onClick={stopScanning}
                                        className="absolute top-2 right-2 text-black"
                                        aria-label="Close QR Scanner"
                                    >
                                        X
                                    </button>
                                    <h2 className="text-xl font-bold mb-4">Scan Retailer QR Code</h2>
                                    <div
                                        id="qr-code-scanner"
                                        style={{ width: '300px', height: '300px' }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white shadow-md rounded-md p-6 flex items-center">
                        <FaCoins className="text-green-500 text-3xl mr-4" />
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">Available Points</h2>
                            <p className="text-gray-600 mb-4">
                                {userData && (
                                    <>
                                        <span>{userData.points} Points</span>
                                    </>
                                )}
                            </p>
                            <button className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600">
                                Redeem Points
                            </button>
                        </div>
                    </div>
                </div>

                <div className="px-3">
                    <header className="rounded-md">
                        <div className="p-4">
                            <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white shadow-md rounded-md p-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Sell Plastics</h2>
                                    {plastics.length === 0 ? (
                                        <p className="text-gray-600">You don't have any plastics. Buy now!</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {plastics.map((plastic) => (
                                                <div
                                                    key={plastic.id}
                                                    className={`p-4 bg-green-300 rounded-md shadow-md ${plasticToSell === plastic.id ? 'border-2 border-green-500' : ''}`}
                                                    onClick={() => setPlasticToSell(plastic.id)}
                                                >
                                                    <h2 className="text-lg font-bold mb-2">{plastic.name}</h2>
                                                    <p className="text-gray-700">Type: {plastic.type}</p>
                                                    <p className="text-gray-700">Plastic ID: {plastic.id}</p>
                                                    {plasticToSell === plastic.id && (
                                                        <button
                                                            onClick={() => {
                                                                setActionType('sell'); // Set action type to sell
                                                                setIsScanning(true); // Start scanning
                                                            }}
                                                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600"
                                                        >
                                                            Sell
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="bg-white shadow-md rounded-md p-6">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Points Gained Over the Week</h2>
                                    <Bar data={data} />
                                </div>
                            </main>

                            <section className="mt-8">
                                <div className="flex items-center mb-4">
                                    <h2 className="text-2xl font-bold text-gray-800 flex-grow">Rewards for you</h2>
                                    <FaGift className="text-green-500 text-2xl" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {items.map((item, index) => (
                                        <div key={index} className="p-4 bg-white shadow-md rounded-md">
                                            <a className="block relative h-48 rounded overflow-hidden">
                                                <img
                                                    alt="ecommerce"
                                                    className="object-cover object-center w-full h-full block"
                                                    src={item.src}
                                                />
                                            </a>
                                            <div className="mt-4">
                                                <h3 className="text-gray-500 text-sm tracking-widest title-font mb-1">{item.category}</h3>
                                                <h2 className="text-gray-900 title-font text-xl font-medium">{item.name}</h2>
                                                <p className="mt-5 p-1 cursor-default text-md text-white font-bold text-center bg-green-600 rounded-lg">
                                                    + {item.points}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </header>
                </div>

                {/* Confirmation Modal */}
                {successScannedRetail && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
                        <div className="relative p-4 bg-white rounded-lg shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Confirm Sale</h2>
                            <p>Are you sure you want to sell plastic ID {plasticToSell} to retailer ID {scannedRetailerId}?</p>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleSell}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => {
                                        setScannedRetailerId(null); // Clear retailer ID
                                        setPlasticToSell(null); // Clear plastic selection
                                        setActionType(null); // Clear action type
                                    }}
                                    className="ml-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuyerDashboard;
