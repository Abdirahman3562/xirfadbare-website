import { ChevronRight, Home } from "lucide-react";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaCamera } from "react-icons/fa6";
import "react-toastify/dist/ReactToastify.css";
import { API_BASE_URL } from "../../../config";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCompressingImage, setIsCompressingImage] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  // Fetch user data on page load
  useEffect(() => {
    console.log("🔍 Profile: Starting to fetch user data...");

    const loggedUser =
      JSON.parse(localStorage.getItem("loggedInUser")) ||
      JSON.parse(localStorage.getItem("user"));

    console.log(
      "👤 Profile: Retrieved user from localStorage:",
      loggedUser ? "Found" : "Not found"
    );

    if (!loggedUser) {
      console.warn("⚠️ Profile: No logged-in user found in localStorage!");
      toast.error("Please login to access your profile.");
      return;
    }

    if (!loggedUser.token) {
      console.warn("⚠️ Profile: No token found in user data!");
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    console.log("🔑 Profile: Token found, making API request...");

    // Fetch current user profile from backend
    fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${loggedUser.token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("📡 Profile: API response status:", res.status);
        return res.json();
      })
      .then((currentUser) => {
        console.log("📋 Profile: API response data:", currentUser);

        if (currentUser && !currentUser.message) {
          console.log("✅ Profile: User data loaded successfully");
          setUser(currentUser);
          setFormData({
            firstName: currentUser.firstName || "",
            lastName: currentUser.lastName || "",
            email: currentUser.email || "",
            phone: currentUser.phone || "",
            password: "",
          });

          const storedImage = localStorage.getItem("profileImage");
          if (storedImage) {
            setImage(storedImage);
          } else if (currentUser?.image) {
            setImage(currentUser.image);
          }
        } else {
          console.error("❌ Profile: Invalid user data received:", currentUser);
          toast.error(currentUser?.message || "User profile not found!");
        }
      })
      .catch((err) => {
        console.error("❌ Profile: Error fetching user profile:", err);
        toast.error(
          "Failed to load user profile! Please check your connection."
        );
      });
  }, []);

  // Handle image change (for user profile picture)
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file.");
        return;
      }

      // Validate file size (before compression)
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error(
          "Image file is too large. Please select an image under 10MB."
        );
        return;
      }

      setIsCompressingImage(true);
      try {
        console.log("🔄 Compressing image...");
        // Compress image before converting to base64
        const compressedBase64 = await compressImage(file);
        console.log("✅ Image compressed successfully");

        setPreviewImage(compressedBase64); // Show preview immediately
        setFormData({ ...formData, image: compressedBase64 }); // Store for save
        // Don't update main image or localStorage until save is successful
      } catch (error) {
        console.error("❌ Error compressing image:", error);
        toast.error("Failed to process image. Please try again.");
      } finally {
        setIsCompressingImage(false);
      }
    }
  };

  const getInitials = (first, last) => {
    if (!first && !last) return "SU";
    return (first?.charAt(0) + last?.charAt(0)).toUpperCase();
  };

  // Compress image to reduce payload size
  const compressImage = (
    file,
    maxWidth = 300,
    maxHeight = 300,
    quality = 0.7
  ) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Calculate new dimensions
          let { width, height } = img;
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);

          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const loggedUser =
      JSON.parse(localStorage.getItem("loggedInUser")) ||
      JSON.parse(localStorage.getItem("user"));

    if (!loggedUser?.token) {
      toast.error("Authentication token missing. Please login again.");
      return;
    }

    try {
      console.log("🚀 Starting profile update request...");
      console.log("📋 Form data being sent:", formData);
      console.log("📋 User data:", user);

      // Check if there are any actual changes to save
      const hasDataChange =
        formData.firstName !== user.firstName ||
        formData.lastName !== user.lastName ||
        formData.email !== user.email ||
        formData.phone !== user.phone ||
        (formData.password && formData.password.trim() !== "");
      const hasImageChange =
        formData.image && formData.image !== (user.image || "");

      console.log("🔍 Change detection:", { hasDataChange, hasImageChange });

      if (!hasDataChange && !hasImageChange) {
        toast.success("No changes were made.");
        setIsEditing(false);
        return;
      }

      // Prepare data to send, excluding empty password
      const dataToSend = { ...formData };
      if (!dataToSend.password || dataToSend.password.trim() === "") {
        delete dataToSend.password;
      }

      // Validate image size if present
      if (dataToSend.image && dataToSend.image.length > 1024 * 1024) {
        // 1MB limit for base64
        toast.error(
          "Image is too large after compression. Please try a smaller image."
        );
        return;
      }

      console.log("📋 Data actually sent to server:", dataToSend);
      console.log("📋 Data keys:", Object.keys(dataToSend));
      console.log("📋 Has image in dataToSend:", !!dataToSend.image);
      console.log(
        "📋 Image data length:",
        dataToSend.image ? dataToSend.image.length : "no image"
      );

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loggedUser.token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      console.log("📡 Profile update response status:", res.status);

      if (res.ok) {
        const updatedUser = await res.json();

        // ✅ 1. Cusbooneysii xogta user-ka ee gudaha state
        setUser(updatedUser);

        // ✅ 2. Kaydi xogta saxda ah ee Nav uu akhriyo (including new token)
        localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

        // ✅ 3. Haddii image cusub la upload gareeyay, update main image and localStorage
        if (formData.image) {
          setImage(formData.image); // Update main image state
          setPreviewImage(null); // Clear preview
          localStorage.setItem("profileImage", formData.image);
        }

        // ✅ 4. Ogeysii Nav in user la update gareeyay
        window.dispatchEvent(new Event("userLogin"));

        // ✅ 5. Show proper success message
        if (hasImageChange && hasDataChange) {
          toast.success("Profile and photo updated successfully!");
        } else if (hasImageChange) {
          toast.success("Profile photo updated successfully!");
        } else if (hasDataChange) {
          toast.success("Profile updated successfully!");
        }

        setIsEditing(false);
      } else {
        // Try to parse error response
        let errorMessage = "Error updating profile!";
        console.log("❌ Update failed with status:", res.status);
        console.log(
          "❌ Response headers:",
          Object.fromEntries(res.headers.entries())
        );

        try {
          const responseText = await res.text();
          console.log("❌ Raw error response:", responseText);
          console.log("❌ Response length:", responseText.length);

          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
          console.log("❌ Parsed error message:", errorMessage);
        } catch (parseError) {
          console.log("❌ Failed to parse error response:", parseError.message);
          console.log("❌ Parse error details:", parseError);
          // If we can't parse JSON, check the response status
          if (res.status === 413) {
            errorMessage =
              "Image file is too large. Please try a smaller image.";
          } else if (res.status === 400) {
            errorMessage = "Invalid data provided. Please check your inputs.";
          } else if (res.status === 401) {
            errorMessage = "Session expired. Please login again.";
          } else if (res.status === 415) {
            errorMessage = "Unsupported content type. Please try again.";
          } else if (res.status >= 500) {
            errorMessage = "Server error. Please try again later.";
          } else {
            errorMessage = `Update failed with status ${res.status}. Please try again.`;
          }
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setFormData({ ...user });
    setImage(user.image || null);
    setPreviewImage(null); // Reset preview image
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-500 mb-4">Loading user data...</p>
          <p className="text-sm text-gray-400">
            If this takes too long, please try refreshing the page or logging in
            again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 mt-20">
      <Toaster position="top-right" reverseOrder={false} />

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
            {previewImage || image ? (
              <img
                src={previewImage || image}
                alt="Profile"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <span className="text-green-600 font-bold text-4xl">
                {getInitials(user.firstName, user.lastName)}
              </span>
            )}

            <div className="absolute inset-0 bg-[#0f0f0fb0] flex flex-col items-center justify-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {isCompressingImage ? (
                <div className="text-white text-sm font-semibold flex flex-col items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mb-2"></div>
                  Processing...
                </div>
              ) : (
                <label
                  htmlFor="profile-photo"
                  className="text-white text-sm font-semibold cursor-pointer flex flex-col items-center"
                >
                  <FaCamera className="text-white mb-1" />
                  Change Photo
                </label>
              )}
              <input
                type="file"
                id="profile-photo"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isCompressingImage}
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
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 focus:border-emerald-500"
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
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 focus:border-emerald-500"
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
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 focus:border-emerald-500"
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
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 focus:border-emerald-500"
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
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 focus:border-emerald-500"
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
