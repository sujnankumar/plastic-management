import Navbar from "./Components/Navbar"; 
import Layout from "./Components/Layout";   
import SignUp from "./Components/SignUp";
import SignIn from "./Components/SignIn";
import Home from "./Components/Home"; 
import ChooseRole from "./Components/ChooseRole";
import ValidateRoles from "./Components/ValidateRoles";
import Profile from "./Components/Profile"; 
import AdminDashboard from "./Components/AdminDashboard";  
import ManufacturerDashboard from "./Components/ManufacturerDashboard";  
import ManufacturerPlastics from "./Components/ManufacturerPlastics";  
import RetailerDashboard from "./Components/RetailerDashboard";  
import RecyclerDashboard from "./Components/RecyclerDashboard";  
import BuyerDashboard from "./Components/BuyerDashboard";  
import Rewards from "./Components/Rewards";  


import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import axiosInstance from './axios';

const ProtectedRoute = ({ Component, ...rest }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Change initial state to null

    useEffect(() => {
        const checkAuthentication = async () => {
            try {
                const response = await axiosInstance.get("/api/check_authentication");
                if (response.status === 200) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
                console.error("Error checking authentication:", error);
            }
        };

        checkAuthentication();
    }, []);

    if (isAuthenticated === null) return <div>Loading...</div>; // Display loading state

    return isAuthenticated ? <Component {...rest} /> : <Navigate to="/signin" />;
};

const AdminRoute = ({ Component, ...rest }) => {
    const [isAdmin, setIsAdmin] = useState(null); // Change initial state to null

    useEffect(() => {
        const checkAdminAuthorization = async () => {
            try {
                const response = await axiosInstance.get("/api/check_admin");
                if (response.status === 200) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                setIsAdmin(false);
                console.error("Error checking admin authorization:", error);
            }
        };

        checkAdminAuthorization();
    }, []);

    if (isAdmin === null) return <div>Loading...</div>; // Display loading state

    return isAdmin ? <Component {...rest} /> : <Navigate to="/" />;
};

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get('/api/user');
                setUser(response.data); // Assuming the user data is returned in the response
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    const getDashboardComponent = (role) => {
        switch (role) {
            case 'admin':
                return <AdminRoute Component={AdminDashboard} axiosInstance={axiosInstance}/>;
            case 'manufacturer':
                return <ProtectedRoute Component={ManufacturerDashboard} axiosInstance={axiosInstance} />;
            case 'retailer':
                return <ProtectedRoute Component={RetailerDashboard} axiosInstance={axiosInstance} />;
            case 'recycler':
                return <ProtectedRoute Component={RecyclerDashboard} axiosInstance={axiosInstance} />;
            case 'user':
                return <ProtectedRoute Component={BuyerDashboard} axiosInstance={axiosInstance} />;
    
            // Add cases for other roles if needed
            default:
                return <Navigate to="/" />;
        }
    };
    

    return (
        <div className="min-h-screen flex justify-center items-center bg-[#9fdfc5] bg-cover">
            <Layout user={user}>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<SignIn axiosInstance={axiosInstance} />} />
                    <Route path="/signin" element={<SignIn axiosInstance={axiosInstance} />} />
                    <Route path="/signup" element={<SignUp axiosInstance={axiosInstance} />} />

                    {/* Routes requiring authentication */}
                    <Route path="/home" element={<ProtectedRoute Component={Home} />} />
                    <Route path="/profile" element={<ProtectedRoute Component={Profile} axiosInstance={axiosInstance} />} />
                    <Route path="/choose_role" element={<ProtectedRoute Component={ChooseRole} axiosInstance={axiosInstance} />} />
                    <Route path="/rewards" element={<ProtectedRoute Component={Rewards} axiosInstance={axiosInstance} />} />

                    {/* Admin-only route */}
                    {user && user.role === 'admin' && (
                        <>
                            <Route path="/validate_roles" element={<AdminRoute Component={ValidateRoles} axiosInstance={axiosInstance} />} />
                        </>
                    )}

                    {user && user.role === 'manufacturer' && (
                        <>
                            <Route path="/manufacturer_plastics" element={<ProtectedRoute Component={ManufacturerPlastics} axiosInstance={axiosInstance} />} />
                        </>
                    )}

                    {user && user.role && (
                        <Route path="/dashboard" element={getDashboardComponent(user.role)} />
                    )}


                </Routes>
            </Layout>
        </div>
    );
}

export default App;
