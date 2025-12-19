import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  FaEnvelope,
  FaUserPlus,
  FaUserGraduate,
  FaBookOpen,
  FaStar,
  FaRegStar,
  FaCalendarAlt,
} from "react-icons/fa";
import InstructorTabs from "../../../components/instructor/InstructorTabs";
import { Toaster, toast } from "react-hot-toast";
import { getInstructorBySlug, updateInstructor } from "../../../api/instructorService";
import { getAllCourses } from "../../../api/courseService";

export default function InstructorDetails() {
  const { slug } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchInstructorDetails = async () => {
      try {
        const found = await getInstructorBySlug(slug);

        if (!found) {
          setInstructor(null);
          return;
        }

        // ✅ Calculate average rating
        if (found.reviews && found.reviews.length > 0) {
          const total = found.reviews.reduce((sum, r) => sum + r.rating, 0);
          const avg = total / found.reviews.length;
          setAverageRating(avg.toFixed(1));
          setTotalReviews(found.reviews.length);
        }

        // ✅ Fetch courses count
        let courseCount = 0;
        try {
          const coursesData = await getAllCourses();
          const instructorCourses = coursesData.filter(
            (c) => c.instructor && String(c.instructor) === String(found._id)
          );
          courseCount = instructorCourses.length;
        } catch {
          console.warn("⚠️ Could not fetch courses. Using fallback value.");
          courseCount = found.courses || 0;
        }
        setTotalCourses(courseCount);

        // ✅ Check follow status
        if (currentUser && found.followersList?.includes(currentUser.id)) {
          setIsFollowing(true);
        }

        // Format instructor data to match frontend expectations
        setInstructor({
          ...found,
          id: found._id
        });
      } catch (err) {
        console.error("❌ Error loading instructor:", err);
        toast.error("Failed to load instructor data!");
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorDetails();
  }, [slug, currentUser]);

  // ✅ Follow / Unfollow Logic (preserves old followers)
  const handleFollow = async () => {
    if (!currentUser) {
      toast.error("Please login to follow this instructor!", {
        position: "top-right",
      });
      return;
    }

    try {
      const currentFollowers = Array.isArray(instructor.followersList)
        ? [...instructor.followersList]
        : [];

      let newFollowersList = [...currentFollowers];

      if (currentFollowers.includes(currentUser.id)) {
        // ❌ Unfollow
        newFollowersList = currentFollowers.filter(
          (id) => id !== currentUser.id
        );
        setIsFollowing(false);
        toast("You unfollowed this instructor 👋", { position: "top-right" });
      } else {
        // ✅ Follow
        newFollowersList = [...new Set([...currentFollowers, currentUser.id])];
        setIsFollowing(true);
        toast.success("You are now following this instructor ✅", {
          position: "top-right",
        });
      }

      const updatedInstructor = {
        ...instructor,
        followersList: newFollowersList,
        followers:
          (instructor.followers || 0) +
          (newFollowersList.length - currentFollowers.length),
      };

      const result = await updateInstructor(instructor._id, updatedInstructor);

      if (!result) throw new Error("Failed to update instructor");

      setInstructor({
        ...result,
        id: result._id
      });
    } catch (err) {
      console.error("❌ Follow action failed:", err);
      toast.error("Something went wrong. Try again later.", {
        position: "top-right",
      });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-emerald-600 font-semibold">
        Loading instructor details...
      </div>
    );

  if (!instructor)
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        Instructor not found 😕
      </div>
    );

  const dynamicStats = [
    {
      key: "students",
      icon: <FaUserGraduate className="text-emerald-500 text-2xl" />,
      label: "Students",
      value: instructor.students || 0,
    },
    {
      key: "courses",
      icon: <FaBookOpen className="text-emerald-500 text-2xl" />,
      label: "Courses",
      value: totalCourses,
    },
    {
      key: "reviews",
      icon: <FaStar className="text-emerald-500 text-2xl" />,
      label: "Reviews",
      value: totalReviews,
    },
  ];

  return (
    <div className="min-h-screen relative -mt-20">
      <Toaster position="top-right" reverseOrder={false} />

      {/* ✅ Hero Section */}
      <div
        className="relative h-[400px] bg-cover bg-center z-10"
        style={{
          backgroundImage: `url(${
            instructor.coverImage ||
            "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=80"
          })`,
        }}
      >
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      </div>

      {/* ✅ Card Section */}
      <div className="relative z-20 max-w-3xl mx-auto mb-10 bg-[#edf4f5] rounded-2xl shadow-lg border border-gray-100 -mt-24 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <img
              src={instructor.image}
              alt={instructor.name}
              className="w-28 h-28 object-cover rounded-full border-4 border-white shadow-md"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {instructor.name}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {instructor.instructorTitle}
              </p>

                <p className="text-black bg-emerald-200 rounded-md w-[80px] pl-2">{instructor.title || "Instructor"}</p>


              {/* ✅ Rating & Followers */}
              <div className="flex flex-col md:flex-row lg:flex-row lg:items-center">
                <div className="flex mt-2 mb-1">
                  {[...Array(5)].map((_, i) =>
                    i < Math.round(averageRating) ? (
                      <FaStar key={i} className="text-emerald-500 w-4 h-4" />
                    ) : (
                      <FaRegStar key={i} className="text-emerald-200 w-4 h-4" />
                    )
                  )}
                  <span className="text-gray-800 text-sm ml-1 font-medium">
                    {averageRating} / 5
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 text-sm ml-2">
                    ({instructor.followers || 0} Followers)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Follow / Unfollow Buttons */}
          {/* ✅ Follow / Unfollow Buttons with Dropdown */}
          <div className="flex gap-3 mt-6 md:mt-0 relative" ref={dropdownRef}>
            {!isFollowing ? (
              <button
                onClick={handleFollow}
                className="bg-emerald-600 text-white px-5 py-2 rounded-full flex items-center text-sm cursor-pointer font-medium shadow hover:scale-105 transition-transform duration-200"
              >
                <FaUserPlus className="inline mr-2" />
                Follow
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-gray-300 text-gray-700 px-5 py-2 rounded-full flex items-center text-sm cursor-pointer font-medium shadow hover:scale-105 transition-transform duration-200"
                >
                  <FaUserPlus className="inline mr-2" />
                  Following
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-12 w-40 bg-white border border-gray-200 rounded-xl shadow-lg animate-fadeIn">
                    <button
                      onClick={async () => {
                        await handleFollow(); // samee unfollow API logic
                        setIsFollowing(false); // 💥 isla markiiba beddel UI-ga
                        setShowDropdown(false); // 💥 xiro dropdown
                      }}
                      className="block w-full cursor-pointer text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-t-xl"
                    >
                      Unfollow
                    </button>
                    <button
                      onClick={() => setShowDropdown(false)}
                      className="block w-full cursor-pointer text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-xl"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}

            <a href={`https://wa.me/${instructor.contactPhone}`} target="_blank"
             className="border border-emerald-500 cursor-pointer text-emerald-700 flex items-center px-5 py-2 rounded-full text-sm font-medium hover:bg-emerald-50 transition">
              <FaEnvelope className="inline mr-2 text-emerald-500" />
        
                Send Message
          
            </a>
          </div>
        </div>

        {/* ✅ Stats Section */}
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-4 mt-8">
          {dynamicStats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center border border-emerald-200 hover:border-emerald-400 rounded-xl py-3 hover:shadow-md transition"
            >
              {stat.icon}
              <p className="font-bold text-gray-800 mt-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <InstructorTabs instructor={instructor} />
      </div>
    </div>
  );
}
