import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Nav from './Nav';
import Footer from './Footer';
import SupportWidget from '../components/SupportWidget';

const PublicLayout = () => {
    const location = useLocation();
    const isAuthPage = ['/auth/login', '/auth/signup'].includes(location.pathname);

    return (
        <div className="flex flex-col min-h-screen">
            {!isAuthPage && <Nav />}
            <main className={`flex-grow ${!isAuthPage ? 'pt-16' : ''}`}>
                <Outlet />
            </main>
            {!isAuthPage && <Footer />}
            {!isAuthPage && <SupportWidget />}
        </div>
    );
};

export default PublicLayout;
