import React, { useState } from "react";
import { FaUserGraduate, FaBook } from "react-icons/fa";
import InstructorCourses from "./InstructorCourses";
import { useParams } from "react-router-dom";
import Reviews from "./Reviews";

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
      <div className="flex flex-wrap  border-b border-gray-300 justify-center gap-6 py-4 text-gray-600 font-medium text-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-1 transition-all cursor-pointer ${
              activeTab === tab.id
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
          <>
            {instructor.education && (
              <div>
                <h2 className="text-base font-semibold text-gray-800 mb-2">
                  Education
                </h2>
                <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1 ml-2">
                  {instructor.education.map((edu, i) => (
                    <li key={i} className="hover:text-emerald-600 transition">
                      {edu}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {instructor.experience && (
              <div>
                <h2 className="text-base font-semibold text-gray-800 mb-2">
                  Experiences
                </h2>
                <ul className="list-disc list-inside text-gray-600 leading-relaxed space-y-1 ml-2">
                  {instructor.experience.map((exp, i) => (
                    <li key={i} className="hover:text-emerald-600 transition">
                      {exp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {instructor.about && (
              <div>
                <h2 className="text-base font-semibold text-gray-800 mb-2">
                  About
                </h2>
                <p className="text-gray-600 leading-relaxed max-w-3xl">
                  {instructor.about}
                </p>
              </div>
            )}

            {instructor.skills && (
              <div>
                <h2 className="text-base font-semibold text-gray-800 mb-3">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {instructor.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 text-sm rounded-full border border-gray-200 transition"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ✅ Courses Tab */}
        {activeTab === "courses" && (
      <InstructorCourses instructorSlug={slug} />
        )}

        {/* ✅ Articles Tab */}
        {activeTab === "articles" && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Articles
            </h2>
            <p className="text-gray-600">
              No articles available for this instructor yet.
            </p>
          </div>
        )}

        {/* ✅ Forum Tab */}
        {activeTab === "reviews" && (
          <Reviews/>
        )}

     

      </div>
    </div>
  );
}
