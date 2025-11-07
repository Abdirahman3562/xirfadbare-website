import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaEnvelope,
  FaUserPlus,
} from "react-icons/fa";
import InstructorTabs from "../../../components/instructor/InstructorTabs"; // ✅ import tabs component

export default function InstructorDetails() {
  const { slug } = useParams();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const res = await fetch("http://localhost:4002/instructors");
        if (!res.ok) throw new Error("Failed to fetch instructors");
        const data = await res.json();

        const found = data.find(
          (i) => i.name.toLowerCase().replace(/\s+/g, "-") === slug
        );
        setInstructor(found || null);
      } catch (error) {
        console.error("❌ Error fetching instructor:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructor();
  }, [slug]);

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

  return (
   <div className="min-h-screen  relative -mt-20">
  {/* ✅ Background Hero Section */}
  <div
    className="relative h-[400px] bg-cover bg-center"
    style={{
      backgroundImage: `url(${
        instructor.coverImage ||
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=80"
      })`,
    }}
  >
    <div className="absolute inset-0 bg-black/40"></div>
  </div>

  {/* ✅ Profile Content Card */}
  <div className="relative z-10 max-w-3xl mx-auto mb-10 bg-[#edf4f5] rounded-2xl shadow-lg overflow-hidden border border-gray-100  -mt-24 p-6">
    {/* Header Section */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      {/* Profile Info */}
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

          {/* Rating */}
          <div className="flex items-center gap-2 mt-1 text-yellow-500">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.974a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.286 3.974c.3.921-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.176 0l-3.385 2.46c-.784.57-1.838-.197-1.539-1.118l1.286-3.974a1 1 0 00-.364-1.118L2.045 9.4c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.288-3.973z" />
              </svg>
            ))}
            <span className="text-gray-600 text-sm ml-1 font-medium">
              4.8 ({instructor.followers || 65} Followers)
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-6 md:mt-0 ">
        <button className="bg-emerald-600 cursor-pointer text-white px-5 py-2 rounded-full flex items-center text-sm font-medium shadow hover:opacity-90 transition">
          <FaUserPlus className="inline mr-2" />
          Follow
        </button>
        <button className="border border-gray-300 cursor-pointer flex items-center text-gray-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition">
          <FaEnvelope className="inline mr-2" />
          Send Message
        </button>
      </div>
    </div>

    {/* Stats Section */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 ">
      {[
        {
          icon: "🎓",
          label: "Students",
          value: instructor.students || 0,
          color: "text-orange-500",
        },
        {
          icon: "📘",
          label: "Courses",
          value: instructor.courses || 0,
          color: "text-blue-500",
        },
        {
          icon: "⭐",
          label: "Reviews",
          value: instructor.reviews || 0,
          color: "text-green-500",
        },
        {
          icon: "📅",
          label: "Meetings",
          value: instructor.meetings || 0,
          color: "text-purple-500",
        },
      ].map((stat, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center border border-gray-200 hover:border-emerald-400 rounded-xl py-2 hover:shadow-md transition"
        >
          <div className={`text-2xl ${stat.color}`}>{stat.icon}</div>
          <p className="font-bold text-gray-800">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>

    {/* ✅ Tabs Section */}
    <InstructorTabs instructor={instructor} />
  </div>
</div>
  );
}
