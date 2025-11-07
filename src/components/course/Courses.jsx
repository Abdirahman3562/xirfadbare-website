import React, { useState, useEffect } from "react";
import CourseCard from "./CourseCard";
import { getFullCourseDetails } from "../../api/courseService"; // ✅ import sax ah

function Courses({ IsHome }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // ✅ Hel koorsooyinka asalka ah
        const res = await fetch(
          IsHome
            ? "http://localhost:3000/courses?_limit=3"
            : "http://localhost:3000/courses"
        );

        if (!res.ok) throw new Error("❌ Failed to fetch base courses");
        const baseCourses = await res.json();

        // ✅ Koorsada walba ku dar xogta buuxda
        const fullCourses = await Promise.all(
          baseCourses.map(async (c) => {
            const details = await getFullCourseDetails(c.id);
            return details ? details : c; // fallback haddii error yimaado
          })
        );

        setCourses(fullCourses);
      } catch (error) {
        console.error("❌ Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [IsHome]);

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-500">
        Koorsooyinka waa la rarayaa...
      </p>
    );
  }

  return (
    <section className="px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <Header
          title={IsHome ? "Featured Courses" : "All Courses"}
          cta={IsHome ? { href: "/courses", label: "View All" } : null}
          center={!IsHome}
        />

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard course={course} key={course.id} />
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              No courses available.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function Header({ title, cta, center, IsHome }) {
  const titleClasses = IsHome
    ? "text-3xl md:text-3xl lg:text-3xl font-extrabold text-[#00cc8f] drop-shadow-sm"
    : "md:text-3xl lg:text-3xl text-3xl font-bold text-[#00cc8f]";

  return (
    <div
      className={`flex ${
        center
          ? "flex-col items-center text-center mt-10"
          : "items-end justify-between"
      }`}
    >
      <div>
        <h2 className={`${titleClasses} ${center ? "mb-3" : ""}`}>{title}</h2>
        <div
          className={`h-1 w-24 bg-[#00cc8f] rounded-full ${
            center ? "mx-auto" : ""
          }`}
        />
      </div>

      {!center && cta && (
        <a
          href={cta.href}
          className="hidden sm:inline-block bg-[#00cc8f] px-10 py-1 text-white rounded-md font-semibold transition hover:bg-[#00b57f]"
        >
          {cta.label} →
        </a>
      )}
    </div>
  );
}

export default Courses;
