import React, { useState } from "react";
import { FaUserGraduate, FaBook } from "react-icons/fa";
import InstructorCourses from "./InstructorCourses";
import { useParams } from "react-router-dom";
import Reviews from "./Reviews";
import InstructorArticles from "./InstructorArticles";

export default function InstructorTabs({ instructor }) {
  const [activeTab, setActiveTab] = useState("about");
  const { slug } = useParams();

  const tabs = [
    { id: "about", label: "About" },
    { id: "courses", label: "Courses" },
    { id: "articles", label: "Articles" },
    { id: "reviews", label: "Reviews" },

  ];

  return (
    <div className="border-t border-gray-100">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-300 overflow-x-auto scrollbar-hide snap-x px-4 gap-6 py-4 text-gray-600 font-medium text-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-1 transition-all cursor-pointer whitespace-nowrap snap-start flex-shrink-0 ${activeTab === tab.id
              ? "text-emerald-600 border-b-2 border-emerald-500"
              : "hover:text-emerald-600"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="p-8 space-y-10 text-gray-700">
        {/* ✅ About Tab */}
        {activeTab === "about" && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-2">
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed max-w-3xl">
              {instructor.description || instructor.about || "No description available."}
            </p>
          </div>
        )}

        {/* ✅ Courses Tab */}
        {activeTab === "courses" && (
          <InstructorCourses instructorSlug={slug} />
        )}

        {/* ✅ Articles Tab */}
        {activeTab === "articles" && (
          <InstructorArticles instructorName={instructor.name} />
        )}

        {/* ✅ Forum Tab */}
        {activeTab === "reviews" && (
          <Reviews />
        )}



      </div>
    </div>
  );
}
