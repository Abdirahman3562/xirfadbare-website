import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Nav from './Nav';
import Footer from './Footer';
import SupportWidget from '../components/SupportWidget';

const PublicLayout = () => {
    const location = useLocation();

    // Check if current path matches any auth pages
    const isAuthPage = [
        '/auth/login',
        '/auth/signup',
        '/auth/forgot-password',
    ].includes(location.pathname) || location.pathname.startsWith('/auth/verify-email') || location.pathname.startsWith('/auth/reset-password');

    return (
        <div className="flex flex-col min-h-screen">
            {!isAuthPage && <Nav />}
            <main
                className={`flex-grow ${!isAuthPage ? '' : ''}`}
                style={{ paddingTop: !isAuthPage ? 'calc(4rem + var(--top-banner-height, 0px))' : '0px' }}
            >
                <Outlet />
            </main>
            {!isAuthPage && <Footer />}
            {!isAuthPage && <SupportWidget />}
        </div>
    );
};

export default PublicLayout;
