import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from "react-router-dom";
import axiosInstance from './axios';
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
import BuyPlastic from "./Components/BuyPlastic";
import TransferManufacturertoRetailer from "./Components/TransferManufacturertoRetailer";
import TransferRetailertoBuyer from "./Components/TransferRetailertoBuyer";
import TransferBuyertoRetailer from "./Components/TransferBuyertoRetailer";
import TransferRetailertoRecycler from "./Components/TransferRetailertoRecycler";
import RetailerInventory from "./Components/RetailerInventory";
import BuyRetailerPlastics from './Components/BuyRetailerPlastics'; 
import RecyclerPlastics from "./Components/RecyclerPlastics";
import Analytics from "./Components/Analytics";


const ProtectedRoute = ({ Component, ...rest }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

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

    if (isAuthenticated === null) return <div>Loading...</div>;

    return isAuthenticated ? <Component {...rest} /> : <Navigate to="/signin" />;
};

const AdminRoute = ({ Component, ...rest }) => {
    const [isAdmin, setIsAdmin] = useState(null);

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

    if (isAdmin === null) return <div>Loading...</div>;

    return isAdmin ? <Component {...rest} /> : <Navigate to="/" />;
};

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get('/api/user');
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    const getDashboardComponent = (role) => {
        switch (role) {
            case 'admin':
                return <AdminRoute Component={AdminDashboard} />;
            case 'manufacturer':
                return <ProtectedRoute Component={ManufacturerDashboard} />;
            case 'retailer':
                return <ProtectedRoute Component={RetailerDashboard} />;
            case 'recycler':
                return <ProtectedRoute Component={RecyclerDashboard} />;
            case 'user':
                return <ProtectedRoute Component={BuyerDashboard} />;
            default:
                return <Navigate to="/" />;
        }
    };

    return (
        <div className="flex h-[300] justify-center items-center bg-[#e1e1e1] bg-cover">
            <Layout user={user}>
                <Routes>
                    <Route path="/" element={<SignIn />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />

                    <Route path="/home" element={<ProtectedRoute Component={Home} />} />
                    <Route path="/profile" element={<ProtectedRoute Component={Profile} />} />
                    <Route path="/choose_role" element={<ProtectedRoute Component={ChooseRole} />} />
                    <Route path="/rewards" element={<ProtectedRoute Component={Rewards} />} />
                    <Route path="/buyplastic" element={<ProtectedRoute Component={BuyPlastic} />} />
                    <Route path="/transfer/manufacturer-to-retailer" element={<ProtectedRoute Component={TransferManufacturertoRetailer} />} />
                    <Route path="/transfer/retailer-to-buyer" element={<ProtectedRoute Component={TransferRetailertoBuyer} />} />
                    <Route path="/transfer/buyer-to-retailer" element={<ProtectedRoute Component={TransferBuyertoRetailer} />} />
                    <Route path="/transfer/retailer-to-recycler" element={<ProtectedRoute Component={TransferRetailertoRecycler} />} />
                    <Route path="/inventory" element={<ProtectedRoute Component={RetailerInventory} />} />
                    <Route path="/retailer/:retailerId/plastics" element={<ProtectedRoute Component={BuyRetailerPlastics} />} /> {/* Retailer Plastics Page */}
                    <Route path="/recycler_plastics" element={<ProtectedRoute Component={RecyclerPlastics} />} /> {/* Retailer Plastics Page */}
                    <Route path="/analytics" element={<ProtectedRoute Component={Analytics} />} /> {/* Retailer Plastics Page */}

                    {user && user.role === 'admin' && (
                        <Route path="/validate_roles" element={<AdminRoute Component={ValidateRoles} />} />
                    )}

                    {user && user.role === 'manufacturer' && (
                        <Route path="/manufacturer_plastics" element={<ProtectedRoute Component={ManufacturerPlastics} />} />
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
