import React from "react";
import { PlayCircle } from "lucide-react";

/**
 * A premium, animated loading component with a gradient spinner and pulse effects.
 * @param {string} text - The text to display below the spinner (default: "Loading Content")
 * @param {boolean} fullScreen - If true, takes up the full screen height (default: true)
 */
const PremiumLoader = ({ text = "Loading Content", fullScreen = true }) => {
    return (
        <div
            className={`${fullScreen ? "min-h-screen" : "h-full min-h-[400px]"} w-full bg-[#f8fafc] dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-500`}
        >
            <div className="relative group">
                {/* Main outer glow/pulse */}
                <div className="absolute -inset-4 bg-emerald-500/20 dark:bg-emerald-500/10 rounded-full blur-2xl animate-pulse group-hover:bg-emerald-500/30 transition-all duration-700" />

                {/* Spinner container */}
                <div className="relative flex flex-col items-center">
                    {/* High-end Gradient Spinner */}
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-4 border-emerald-100 dark:border-slate-800 rounded-full" />
                        <div className="absolute inset-0 border-4 border-t-emerald-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                        <div className="absolute inset-3 border-4 border-emerald-500/20 dark:border-emerald-500/5 rounded-full" />
                        <div className="absolute inset-3 border-4 border-b-emerald-400 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slow opacity-60" />
                    </div>

                    {/* Icon in center */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-10px]">
                        <PlayCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-500 animate-pulse" />
                    </div>

                    {/* Loading Text */}
                    {text && (
                        <div className="mt-8 text-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-6 py-2 rounded-2xl border border-white dark:border-slate-700 shadow-xl shadow-emerald-500/5">
                            <h3 className="text-gray-900 dark:text-white font-black text-xs uppercase tracking-[0.2em] mb-1">
                                {text}
                            </h3>
                            <div className="flex items-center justify-center gap-1.5">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PremiumLoader;
