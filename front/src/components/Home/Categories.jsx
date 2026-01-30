// src/components/Categories.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Categories({
  title = "Browse by Category",
  to = (cat) => `/courses?category=${encodeURIComponent(cat)}`, // route generator
  onSelect, // optional callback instead of Link
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        const data = await response.json();
        // Extract category names from the response
        setCategories(data.map(cat => cat.name));
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to default categories if fetch fails
        setCategories([
          "Frontend",
          "Backend",
          "Full-Stack",
          "Database",
          "DevOps",
          "Mobile",
          "AI/ML",
          "Data",
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-16 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6">
          <Header title={title} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-2xl bg-gray-100 dark:bg-slate-800 animate-pulse px-5 py-4 h-20" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">

      <div className="max-w-7xl mx-auto px-6">
        <Header title={title} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Card = (
              <div className="rounded-2xl bg-[#edf4f5] dark:bg-slate-900 border border-gray-200 dark:border-gray-800 hover:border-emerald-400 dark:hover:border-emerald-500 px-5 py-4 text-left shadow hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <p className="text-lg font-semibold text-slate-800 dark:text-white">{cat}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">See courses →</p>
              </div>
            );

            // Haddii la siiyay onSelect, isticmaal button; haddii kale Link
            return onSelect ? (
              <button
                key={cat}
                onClick={() => onSelect(cat)}
                className="text-left"
              >
                {Card}
              </button>
            ) : (
              <Link key={cat} to={to(cat)}>
                {Card}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* Header helper gudaha component-ka si u noqoto self-contained */
function Header({ title }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 text-center sm:text-left">
      <div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#5ace8f] dark:text-emerald-400">
          {title}
        </h2>
        <div className="mt-2 h-1 w-24 bg-[#00cc8f] dark:bg-emerald-500 rounded-full mx-auto sm:mx-0" />
      </div>
    </div>
  );
}
