import React from 'react';
import Navbar from './Navbar'; // Assuming you have a Navbar component

const Layout = ({ children, user }) => {
    return (
        <div className="w-full h-screen flex flex-col">
            <Navbar isAdmin={user && user.role === 'admin'} />
            <div className="flex flex-grow mt-16">
                <aside className="w-64 bg-gray-200 p-4"> {/* Adjust width as needed */}
                    {/* Aside content goes here */}
                </aside>
                <div className="flex-grow flex items-center justify-center">
                    <div className="container mx-auto px-2">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
