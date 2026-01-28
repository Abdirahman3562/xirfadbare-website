import React from "react";
import { Link } from "react-router-dom";

function CTABanner() {
  return (
    <section className="py-12 md:py-16 px-4">
      <div className="max-w-5xl mx-auto text-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white p-8 md:p-12 shadow-lg">
        <h3 className="text-2xl md:text-3xl font-extrabold leading-snug">
          Start your learning journey today
        </h3>
        <p className="mt-3 text-sm md:text-base opacity-90">
          Join thousands of learners upgrading their tech careers with Xirfadbare Academy.
        </p>
        <Link
          to="/courses"
          className="mt-6 inline-block bg-white text-emerald-600 font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-full shadow hover:shadow-lg hover:-translate-y-0.5 transition-transform"
        >
          Explore Courses
        </Link>
      </div>
    </section>
  );
}

export default CTABanner;
