import React from 'react';
import { Outlet } from 'react-router-dom';
import Nav from './Nav';
import Footer from './Footer';
import SupportWidget from '../components/SupportWidget';

const PublicLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Nav />
            <main className="flex-grow pt-16">
                <Outlet />
            </main>
            <Footer />
            <SupportWidget />
        </div>
    );
};

export default PublicLayout;
