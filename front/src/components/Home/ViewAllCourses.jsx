import React from 'react'
import { Link } from 'react-router-dom'

function ViewAllCourses() {
  return (
    <section className="mx-auto max-w-lg block px-6 pb-10 lg:hidden md:hidden">
      <Link
        className="block bg-[#00cc8f] dark:bg-emerald-500 text-white text-center text-lg py-4 px-6 rounded-xl hover:opacity-90 transition-colors"
        to="/courses"
      >
        View All Courses
      </Link>
    </section>
  )
}

export default ViewAllCourses
