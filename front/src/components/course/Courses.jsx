import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "./CourseCard";
import { useData } from "../../contexts/DataContext";
import { Search, Filter, BookOpen, Layers, DollarSign, X, SlidersHorizontal } from "lucide-react";
import { API_BASE_URL } from "../../config";

function Courses({ IsHome }) {
  const { courses, bundles, categories: dbCategories, loading } = useData();
  const [searchParams] = useSearchParams();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-select category from URL parameter
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl));
    }
  }, [searchParams]);

  // Filter Logic
  const filteredItems = useMemo(() => {
    const allItems = [
      ...courses.map(c => ({ ...c, isBundle: false })),
      ...bundles.map(b => ({ ...b, isBundle: true, type: 'Bundle' }))
    ];

    return allItems.filter((item) => {
      const matchesSearch = item.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      // If bundle, we might skip category/level matching or map them
      const matchesCategory =
        selectedCategory === "All" || item.type === selectedCategory;
      const matchesLevel =
        selectedLevel === "All" || item.level === selectedLevel || (item.isBundle && selectedLevel === "All");

      const isFree = !item.price || Number(item.price) === 0;
      const matchesPrice =
        selectedPrice === "All" ||
        (selectedPrice === "Free" && isFree) ||
        (selectedPrice === "Paid" && !isFree);

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });
  }, [courses, bundles, searchQuery, selectedCategory, selectedLevel, selectedPrice]);

  if (IsHome) {
    return (
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <Header
            title="Featured Courses"
            cta={{ href: "/courses", label: "View All" }}
            center={false}
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...courses, ...bundles].slice(0, 3).map((item) => (
              <CourseCard course={item} isBundle={item.courses !== undefined} key={item._id || item.id} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8fafb] dark:bg-slate-900 pt-28 pb-20 px-4 md:px-8 transition-colors duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-2">All Courses</h1>
          <div className="h-1.5 w-20 bg-emerald-500 rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Courses Main Area */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="flex justify-between items-center mb-6 bg-white/10 dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                Found <span className="text-emerald-600 dark:text-emerald-400">{filteredItems.length}</span> courses/bundles
              </p>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm"
              >
                <Filter size={18} /> Filter
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <CourseCard course={item} isBundle={item.isBundle} key={item._id || item.id} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-gray-400 dark:text-gray-600 mb-4 transition-colors">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white transition-colors">No courses found</h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 transition-colors">Please try another search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Filter */}
          <aside className={`
            order-1 lg:order-2
            fixed lg:static inset-y-0 right-0 w-[300px] lg:w-80 bg-white/10 dark:bg-slate-900 lg:bg-transparent z-[1000] lg:z-auto
            p-6 lg:p-0 transition-transform duration-300 transform
            ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
            lg:block
          `}>
            <div className="bg-white/10 dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl lg:shadow-sm p-6 space-y-8 lg:sticky lg:top-28 transition-colors">
              <div className="flex lg:hidden justify-between items-center mb-4">
                <h3 className="font-black text-gray-900 dark:text-white">Filters</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest mb-2">
                <SlidersHorizontal size={14} /> Filtering Options
              </div>

              {/* Search */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Search Title</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-slate-900 border border-transparent dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500/20 transition-all placeholder:text-gray-400"
                  />
                  <Search className="absolute right-3 top-3 text-gray-300 dark:text-gray-600" size={18} />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Categories</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {dbCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Levels */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Difficulty Level</label>
                <div className="grid grid-cols-2 gap-2">
                  {["All", "Beginner", "Intermediate", "Advanced"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${selectedLevel === lvl
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md dark:shadow-none"
                        : "bg-white dark:bg-slate-900 border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:border-emerald-200"
                        }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</label>
                <div className="flex gap-2">
                  {["All", "Free", "Paid"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPrice(p)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${selectedPrice === p
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md dark:shadow-none"
                        : "bg-white dark:bg-slate-900 border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 hover:border-emerald-200"
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {(searchQuery || selectedCategory !== "All" || selectedLevel !== "All" || selectedPrice !== "All") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedLevel("All");
                    setSelectedPrice("All");
                  }}
                  className="w-full py-3 text-xs font-black text-red-500 hover:underline border-t border-gray-50 dark:border-gray-800 mt-4 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </section>
  );
}

function Header({ title, cta, center }) {
  return (
    <div className={`flex items-end justify-between mb-10 transition-colors`}>
      <div className={center ? "w-full text-center" : ""}>
        <h2 className={`text-4xl font-black text-emerald-600  tracking-tighter`}>{title}</h2>
        <div className={`h-1.5 w-20 bg-emerald-500 rounded-full mt-2 ${center ? "mx-auto" : ""}`} />
      </div>

      {cta && (
        <a
          href={cta.href}
          className="hidden dark:bg-slate-900 sm:flex items-center gap-2 bg-[#00cc8f] text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg dark:shadow-none border dark:border-slate-800 shadow-emerald-100"
        >
          {cta.label}
        </a>
      )}
    </div>
  );
}

export default Courses;
