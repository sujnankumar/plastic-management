import SignUp from "./Components/SignUp";
import SignIn from "./Components/SignIn";
import Home from "./Components/Home"; 
import ChooseRole from "./Components/ChooseRole";
import ValidateRoles from "./Components/ValidateRoles";
import Profile from "./Components/Profile"; 
import AdminDashboard from "./Components/AdminDashboard";  

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
    return (
        <div className="min-h-screen flex justify-center items-center bg-[#9fdfc5] bg-cover">
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<SignIn axiosInstance={axiosInstance} />} />
                <Route path="/signin" element={<SignIn axiosInstance={axiosInstance} />} />
                <Route path="/signup" element={<SignUp axiosInstance={axiosInstance} />} />

                {/* Routes requiring authentication */}
                <Route path="/home" element={<ProtectedRoute Component={Home} />} />
                <Route path="/profile" element={<ProtectedRoute Component={Profile} axiosInstance={axiosInstance} />} />
                <Route path="/choose_role" element={<ProtectedRoute Component={ChooseRole} axiosInstance={axiosInstance} />} />

                {/* Admin-only route */}
                <Route path="/admin" element={<AdminRoute element={<AdminDashboard />} />} />
                <Route path="/validate_roles" element={<AdminRoute Component={ValidateRoles} axiosInstance={axiosInstance} />} />
            </Routes>
        </div>
    );
}

export default App;
