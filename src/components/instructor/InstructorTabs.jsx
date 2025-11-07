import React, { useState } from "react";
import { FaUserGraduate, FaBook } from "react-icons/fa";

export default function InstructorTabs({ instructor }) {
  const [activeTab, setActiveTab] = useState("about");

  const tabs = [
    { id: "about", label: "About" },
    { id: "courses", label: "Courses" },
    { id: "articles", label: "Articles" },
    { id: "forum", label: "Forum" },
    { id: "badges", label: "Badges" },
    { id: "meeting", label: "Reserve a meeting" },
  ];

  return (
    <div className="border-t border-gray-100">
      {/* Tabs Header */}
      <div className="flex flex-wrap justify-center gap-6 py-4 text-gray-600 font-medium text-sm">
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
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Instructor’s Courses
            </h2>
            <p className="text-gray-600">
              {instructor.name} currently teaches{" "}
              <span className="font-semibold text-emerald-600">
                {instructor.courses || 0}
              </span>{" "}
              courses. Soon this section will list all the courses created by
              this instructor.
            </p>
          </div>
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
        {activeTab === "forum" && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Forum
            </h2>
            <p className="text-gray-600">
              Community discussions by this instructor will appear here.
            </p>
          </div>
        )}

        {/* ✅ Badges Tab */}
        {activeTab === "badges" && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Badges
            </h2>
            <p className="text-gray-600">No badges earned yet.</p>
          </div>
        )}

        {/* ✅ Meeting Tab */}
        {activeTab === "meeting" && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Reserve a Meeting
            </h2>
            <p className="text-gray-600">
              You can request a meeting session with{" "}
              <span className="font-semibold">{instructor.name}</span> soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
