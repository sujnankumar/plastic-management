import { useEffect, useState } from "react";
import axios from "../axios";

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [userId, setUserId] = useState(null); // Add this if user ID is not already available

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get("/api/user");
                setUserData(response.data);
                setUserId(response.data.id); // Assume user ID is in the response
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (userId) {
            const fetchTransactions = async () => {
                try {
                    const response = await axios.get(`/api/transactions`);
                    setTransactions(response.data);
                } catch (error) {
                    console.error("Error fetching transactions:", error);
                }
            };

            fetchTransactions();
        }
    }, [userId]);

    return (
        <div className="bg-gray-100 overflow-hidden h-screen w-screen p-5 px-8">
            <div className="container min-h-screen">
                <div className="md:flex no-wrap md:-mx-2">
                    <div className="w-full md:w-3/12 md:mx-2">
                        {/* Profile Section */}
                        <div className="bg-white p-3 border-t-4 border-green-400">
                            <div className="image overflow-hidden">
                                <img
                                    className="h-auto w-full mx-auto"
                                    src="https://lavinephotography.com.au/wp-content/uploads/2017/01/PROFILE-Photography-112.jpg"
                                    alt=""
                                />
                            </div>
                            <h1 className="text-gray-900 font-bold text-xl leading-8 my-1">
                               {userData && (
                                    <>
                                        <span>{userData.firstname} </span>
                                        <span>{userData.lastname}</span>
                                    </>
                                )}
                            </h1>
                            <h3 className="text-gray-600 font-lg text-semibold leading-6">
                                {userData && (
                                        <span>{userData.username}</span>
                                )}
                            </h3>
                            <ul className="bg-gray-100 text-gray-600 hover:text-gray-700 hover:shadow py-2 px-3 mt-3 divide-y rounded shadow-sm">
                                <li className="flex items-center py-3">
                                    <span>Points</span>
                                    <span className="ml-auto">
                                        <span className="bg-green-500 py-1 px-2 rounded text-white text-sm">
                                            {userData && (
                                                <>
                                                    <span>{userData.points} </span>
                                                </>
                                            )}
                                        </span>
                                    </span>
                                </li>
                                <li className="flex items-center py-3">
                                    <span>Member since</span>
                                    <span className="ml-auto">
                                        {userData && (
                                            <span>{userData.date_joined}</span>
                                        )}
                                    </span>
                                </li>
                            </ul>
                            <button className="block w-full text-blue-800 text-sm font-semibold rounded-lg hover:bg-gray-100 focus:outline-none focus:shadow-outline focus:bg-gray-100 hover:shadow-xs p-3 my-4">
                                Go to rewards
                            </button>
                        </div>
                        <div className="my-4"></div>
                    </div>
                    <div className="w-full md:w-9/12 mx-2">
                        <div className="bg-white p-3 shadow-sm rounded-sm">
                            {/* About Section */}
                            <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8">
                                <span className="text-green-500">
                                    <svg
                                        className="h-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </span>
                                <span className="tracking-wide">About</span>
                            </div>
                            <div className="text-gray-700">
                                <div className="grid md:grid-cols-2 text-sm">
                                    {/* Display User Information */}
                                    <div className="grid grid-cols-2">
                                        <div className="px-4 py-2 font-semibold">First Name</div>
                                        <div className="px-4 py-2">
                                            {userData && <span>{userData.firstname}</span>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <div className="px-4 py-2 font-semibold">Last Name</div>
                                        <div className="px-4 py-2">
                                            {userData && <span>{userData.lastname}</span>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <div className="px-4 py-2 font-semibold">Username</div>
                                        <div className="px-4 py-2">
                                            {userData && <span>{userData.username}</span>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <div className="px-4 py-2 font-semibold">Gender</div>
                                        <div className="px-4 py-2">
                                            {userData && <span>{userData.gender}</span>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <div className="px-4 py-2 font-semibold">Phone Number</div>
                                        <div className="px-4 py-2">
                                            {userData && <span>{userData.contact}</span>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <div className="px-4 py-2 font-semibold">Address</div>
                                        <div className="px-4 py-2">
                                            {userData && <span>{userData.address}</span>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <div className="px-4 py-2 font-semibold">Email</div>
                                        <div className="px-4 py-2">
                                            <a
                                                className="text-blue-800"
                                                href={`mailto:${userData ? userData.email : ''}`}
                                            >
                                                {userData && <span>{userData.email}</span>}
                                            </a>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2">
                                        <div className="px-4 py-2 font-semibold">Birthday</div>
                                        <div className="px-4 py-2">
                                            {userData && <span>{userData.dob}</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="my-4"></div>

                        {/* Transactions Section */}
                        <div className="bg-white p-3 shadow-sm rounded-sm h-[calc(100vh-24rem)] overflow-auto">
                            <div className="flex items-center space-x-2 font-semibold text-gray-900 leading-8">
                                <span className="text-blue-500">
                                    <svg
                                        className="h-5"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 15l5 5L20 4"
                                        />
                                    </svg>
                                </span>
                                <span className="tracking-wide">Transactions</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4 mt-2">
                                {transactions.length > 0 ? (
                                    transactions.map((transaction, index) => (
                                        <div key={index} className="bg-gray-100 p-2 rounded-lg shadow-md">
                                            <p className="text-gray-700">{transaction.log}</p>
                                            <p className="text-gray-600">Points: {transaction.points}</p>
                                            <p className="text-gray-500 text-sm">Date: {transaction.date}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p>No transactions found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
