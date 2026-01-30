import React, { useState, useEffect, useRef } from "react";
import { X, Clock, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const TopBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    // Hide on Dashboard/Admin/Instructor pages
    const isDashboard = location.pathname.startsWith("/admin") ||
        location.pathname.startsWith("/instructor") ||
        location.pathname.startsWith("/auth") ||
        location.pathname.startsWith("/watch");

    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    // Calculate target date & max discount
    const [targetDate, setTargetDate] = useState(null);
    const [maxDiscount, setMaxDiscount] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const fetchExpiry = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/courses");
                const data = await res.json();

                // Find all courses with future discount expiry AND active discount > 0
                const activeDiscounts = data.filter(c =>
                    c.discountExpiry &&
                    new Date(c.discountExpiry) > new Date() &&
                    c.discountPercentage > 0
                );

                if (activeDiscounts.length > 0) {
                    // Find the one with the highest discount percentage
                    const bestDeal = activeDiscounts.reduce((prev, current) =>
                        (prev.discountPercentage > current.discountPercentage) ? prev : current
                    );

                    setTargetDate(new Date(bestDeal.discountExpiry));
                    setMaxDiscount(bestDeal.discountPercentage);
                    setIsVisible(true);
                } else {
                    setTargetDate(null);
                    setMaxDiscount(0);
                    setIsVisible(false); // Hide if no active discount
                }
            } catch (error) {
                console.error("Error fetching banner expiry:", error);
            }
        };
        fetchExpiry();
    }, []);

    useEffect(() => {
        if (!isVisible || !targetDate) return;

        const calculateTimeLeft = () => {
            const difference = +targetDate - +new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                // Timer expired - Trigger closing animation
                if (!isClosing) {
                    setIsClosing(true);
                    document.documentElement.style.setProperty("--top-banner-height", "0px"); // Slide Navbar up
                    setTimeout(() => setIsVisible(false), 500); // Unmount after animation
                }
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // Initial call

        return () => clearInterval(timer);
    }, [targetDate, isVisible, isClosing]);

    const bannerRef = useRef(null);

    useEffect(() => {
        const updateHeight = () => {
            if (bannerRef.current && isVisible && !isClosing) {
                const height = bannerRef.current.offsetHeight;
                document.documentElement.style.setProperty("--top-banner-height", `${height}px`);
            } else if (!isVisible || isClosing) {
                document.documentElement.style.setProperty("--top-banner-height", "0px");
            }
        };

        // Run initially and on resize
        updateHeight();
        window.addEventListener("resize", updateHeight);

        return () => {
            window.removeEventListener("resize", updateHeight);
            if (!isVisible) {
                document.documentElement.style.setProperty("--top-banner-height", "0px");
            }
        };
    }, [isVisible, isClosing]);

    if (!isVisible || isDashboard) return null;

    return (
        <div
            ref={bannerRef}
            className={`fixed top-0 left-0 w-full bg-gradient-to-r from-emerald-600 to-emerald-900 dark:from-emerald-950 dark:via-gray-900 dark:to-black text-white px-4 py-2 sm:py-3 z-[100] overflow-hidden shadow-lg border-b border-white/10 transition-transform duration-500 ease-in-out ${isClosing ? '-translate-y-full' : 'translate-y-0'}`}
        >
            {/* Background Animated Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[200%] bg-emerald-500/10 blur-[100px] animate-pulse-slow"></div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 relative z-10">

                {/* Left Side: Message */}
                <div className="flex items-center gap-3 text-center sm:text-left">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider animate-pulse">
                        <Zap size={14} className="fill-emerald-400" />
                        New Discount Offer
                    </span>
                    <p className="text-sm font-medium text-gray-200">
                        <span className="text-white font-bold">Get {maxDiscount}% OFF</span> Invest in your future today.
                    </p>
                </div>

                {/* Right Side: Timer & Action */}
                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-center sm:justify-end">

                    {/* Countdown Timer */}
                    <div className="flex items-center gap-3 text-xs sm:text-sm font-mono font-bold tracking-widest text-emerald-400 bg-emerald-950/30 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <Clock size={16} className="text-emerald-500" />
                        <div className="flex gap-2">
                            <div className="text-white">
                                {String(timeLeft.days).padStart(2, '0')}
                                <span className="text-emerald-600 mx-0.5">:</span>
                            </div>
                            <div className="text-white">
                                {String(timeLeft.hours).padStart(2, '0')}
                                <span className="text-emerald-600 mx-0.5">:</span>
                            </div>
                            <div className="text-white">
                                {String(timeLeft.minutes).padStart(2, '0')}
                                <span className="text-emerald-600 mx-0.5">:</span>
                            </div>
                            <div className="text-white w-5 text-center">
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                        to="/courses"
                        className="whitespace-nowrap px-4 py-1.5 bg-white text-emerald-950 text-xs sm:text-sm font-bold rounded-full hover:bg-emerald-50 transition-colors shadow-lg shadow-white/10 active:scale-95 flex items-center gap-1"
                    >
                        Claim Now
                    </Link>

                    {/* Dismiss Button */}
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                        aria-label="Close banner"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopBanner;
