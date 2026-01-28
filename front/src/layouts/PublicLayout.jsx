import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import Footer from './Footer';

const PublicLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Nav />
            <main className="flex-grow pt-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
