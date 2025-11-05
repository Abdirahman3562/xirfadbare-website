import { ChevronRight, Home } from "lucide-react";
import { useState, useEffect } from "react";
import { FaCamera } from "react-icons/fa6";
import { toast } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 

export default function Profile() {
  const [user, setUser] = useState(null);  
  const [image, setImage] = useState(null); 
  const [isEditing, setIsEditing] = useState(false);  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  // Fetch user data on page load
  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then((res) => res.json())
      .then((data) => {
        const currentUser = data[0]; 
        setUser(currentUser);
        setFormData({ ...currentUser }); 

        // Check if the image is saved in localStorage
        const storedImage = localStorage.getItem("profileImage");
        if (storedImage) {
          setImage(storedImage);  // Set image from localStorage
        } else if (currentUser?.image) {
          setImage(currentUser.image);  // Use default image from backend if available
        }
      })
      .catch((err) => console.error("Error fetching user:", err));
  }, []);

  // Handle image change (for user profile picture)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);  
      setImage(imgUrl);  
      setFormData({ ...formData, image: imgUrl });  

      // Store the image URL in localStorage
      localStorage.setItem("profileImage", imgUrl);  // Store image in localStorage
    }
  };

  const getInitials = (first, last) => {
    if (!first && !last) return "SU";
    return (first?.charAt(0) + last?.charAt(0)).toUpperCase();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();  

    try {
      const res = await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");  
        setUser(formData);  
        setImage(formData.image || image);  
        setIsEditing(false);  
      } else {
        toast.error("❌ Error updating profile!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({ ...user });  
    setImage(user.image || null);  
    setIsEditing(false);  
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 mt-20">
      <div className="flex gap-1 items-center">
        <Home className="w-5 h-5 text-emerald-600" />
        <ChevronRight className="w-5 h-5 text-emerald-600" />
        <span className="text-lg font-semibold text-gray-700">Profile</span>
      </div>

      <h1 className="text-2xl font-bold mb-2">Profile Settings</h1>
      <p className="text-gray-500 text-[14px] mb-6">
        Manage your account settings and preferences.
      </p>

      <div className="flex mt-20 flex-col lg:flex-row md:flex-row gap-10  lg:gap-0 md:gap-0  ">
        <div className="w-1/4 flex flex-col  ml-32 lg:ml-0 md:ml-0  items-center space-y-3">
          <div className="lg:w-36 lg:h-36 md:w-36 md:h-36 w-44 h-44 cursor-pointer rounded-xl bg-green-100 flex items-center justify-center shadow-lg relative group overflow-hidden">
            {image ? (
              <img
                src={image}
                alt="Profile"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-green-600 font-bold text-4xl">
                {getInitials(user.firstName, user.lastName)}
              </span>
            )}

            <div className="absolute inset-0 bg-[#0f0f0fb0] flex flex-col items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <label
                htmlFor="profile-photo"
                className="text-white text-sm font-semibold cursor-pointer flex flex-col items-center"
              >
                <FaCamera className="text-white mb-1" />
                Change Photo
              </label>
              <input
                type="file"
                id="profile-photo"
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          <div className="text-center">
            <p className="font-semibold text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="flex-1 space-y-6 m-10 lg:m-0 md:m-0">
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="flex gap-6">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700"
              />
            </div>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full bg-emerald-500 text-white py-3 rounded-md hover:bg-emerald-600 transition"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-md hover:bg-emerald-600 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-md hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
