import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 1. State Management: Initialize from localStorage, default to 'system'
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "system"
    );

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = () => {
            // Clean up potential conflicting classes - though Tailwind mainly uses 'dark'
            // We prioritize removing 'dark' for light mode as requested.

            if (theme === 'dark') {
                root.classList.add('dark');
            } else if (theme === 'light') {
                root.classList.remove('dark');
            } else if (theme === 'system') {
                // Ignore localStorage, check system preference directly
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                const isSystemDark = mediaQuery.matches;

                console.log("Checking System Theme. OS Dark Mode is:", isSystemDark);

                if (isSystemDark) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        };

        applyTheme();
        localStorage.setItem("theme", theme);

        // Real-Time Listener: Only attach if theme is 'system'
        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

            const handleChange = (e) => {
                console.log("System OS Theme Changed. Dark Mode:", e.matches);
                if (e.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            };

            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }

    }, [theme]);

    const value = {
        theme,
        setTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
