// src/components/Categories.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useData } from "../../contexts/DataContext";

export default function Categories({
  title = "Browse by Category",
  to = (cat) => `/courses?category=${encodeURIComponent(cat)}`, // route generator
  onSelect, // optional callback instead of Link
}) {
  const { categories: dataCategories } = useData();

  // Use preloaded categories or fallback to defaults
  const categories = dataCategories.length > 0 ? dataCategories : [
    "Frontend",
    "Backend",
    "Full-Stack",
    "Database",
    "DevOps",
    "Mobile",
    "AI/ML",
    "Data",
  ];
  return (
    <section className="py-16">
      
      <div className="max-w-7xl mx-auto px-6">
        <Header title={title} />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Card = (
              <div className="rounded-2xl bg-[#edf4f5] border border-gray-200 hover:border-emerald-400 px-5 py-4 text-left shadow hover:shadow-lg hover:-translate-y-0.5 transition">
                <p className="text-lg font-semibold text-slate-800">{cat}</p>
                <p className="text-sm text-gray-500 mt-1">See courses →</p>
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
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#5ace8f]">
          {title}
        </h2>
        <div className="mt-2 h-1 w-24 bg-[#00cc8f] rounded-full mx-auto sm:mx-0" />
      </div>
    </div>
  );
}
