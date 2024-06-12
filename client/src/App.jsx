import SignUp from "./Components/SignUp";
import SignIn from "./Components/SignIn";
import Home from "./Components/Home"; 
import Profile from "./Components/Profile"; 

import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import axiosInstance from './axios'; // Import the axiosInstance from axios.js

function App() {
    let [isSignedIn, setIsSignedIn] = useState(false);

    return (
        <div className="min-h-screen flex justify-center items-center bg-[#9fdfc5] bg-cover">
            <Routes>
                <Route path="/" element={<SignIn axiosInstance={axiosInstance} />} />
                <Route path="/signin" element={<SignIn axiosInstance={axiosInstance} />} />
                <Route path="/home" element={<SignIn axiosInstance={axiosInstance} />} />
                <Route path="/profile" element={<Profile axiosInstance={axiosInstance}/>} />
                <Route path="/signup" element={<SignUp axiosInstance={axiosInstance} />} />
            </Routes>
        </div>
    );
}

export default App;

