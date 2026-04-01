import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar"

const Layout = () => {
    return (
        <>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 mt-5 sm:px-6 lg:px-8 container">
                <Outlet />
            </main>
        </>
    );
};

export default Layout;