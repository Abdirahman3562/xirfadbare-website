import React, { useState } from "react";

/**
 * ✅ Reusable User Avatar Component
 * Handles image loading errors and provides a fallback with initials.
 */
const UserAvatar = ({ image, name, size = "w-10 h-10", className = "" }) => {
    const [hasError, setHasError] = useState(false);

    const initials = name
        ? name
            .trim()
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "??";

    // Helper to format image URL correctly
    const getImageUrl = (img) => {
        if (!img) return null;
        if (typeof img !== "string") return img;
        if (img.startsWith("http") || img.startsWith("data:image")) return img;
        if (img.startsWith("/")) return `http://localhost:5000${img}`;
        return img;
    };

    const imageUrl = getImageUrl(image);

    // Check if image is a valid URL or base64
    const isValidImage =
        imageUrl &&
        typeof imageUrl === "string" &&
        !imageUrl.includes("flaticon.com");

    if (isValidImage && !hasError) {
        return (
            <img
                src={imageUrl}
                alt={name}
                className={`${size} rounded-full object-cover border border-gray-200 shadow-sm ${className}`}
                onError={() => setHasError(true)}
            />
        );
    }

    return (
        <div
            className={`${size} rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold border border-emerald-200 uppercase shadow-sm ${className}`}
        >
            {initials}
        </div>
    );
};

export default UserAvatar;
