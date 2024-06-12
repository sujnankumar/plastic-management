import { useEffect, useState } from "react";
import axios from "../axios"; // Import Axios

const AdminDashboard = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get("/api/user");
                setUserData(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <div>
            <h1>Welcome to the AdminDashboard Page</h1>
            {userData && (
                <div>
                    <p>Username: {userData.username}</p>
                    <p>Email: {userData.email}</p>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
