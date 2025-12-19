import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check both possible localStorage keys for consistency across the app
    const savedUser = JSON.parse(localStorage.getItem("loggedInUser")) ||
                      JSON.parse(localStorage.getItem("user"));
    if (savedUser) setUser(savedUser);
  }, []);

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    // Update localStorage to persist the changes
    localStorage.setItem("user", JSON.stringify(updatedUserData));
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUserData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("loggedInUser");
  };

  return { user, setUser, updateUser, logout };
}
