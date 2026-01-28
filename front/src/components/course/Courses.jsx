import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "./CourseCard";
import { useData } from "../../contexts/DataContext";
import { Search, Filter, BookOpen, Layers, DollarSign, X, SlidersHorizontal } from "lucide-react";

function Courses({ IsHome }) {
  const { courses, loading } = useData();
  const [searchParams] = useSearchParams();
  const [dbCategories, setDbCategories] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedPrice, setSelectedPrice] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/categories");
        const data = await response.json();
        setDbCategories(data.map(cat => cat.name));
      } catch (error) {
        console.error("Error fetching categories:", error);
        setDbCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Auto-select category from URL parameter
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl));
    }
  }, [searchParams]);

  // Filter Logic
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || course.type === selectedCategory;
      const matchesLevel =
        selectedLevel === "All" || course.level === selectedLevel;

      const isFree = !course.price || Number(course.price) === 0;
      const matchesPrice =
        selectedPrice === "All" ||
        (selectedPrice === "Free" && isFree) ||
        (selectedPrice === "Paid" && !isFree);

      return matchesSearch && matchesCategory && matchesLevel && matchesPrice;
    });
  }, [courses, searchQuery, selectedCategory, selectedLevel, selectedPrice]);

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
            {courses.slice(0, 3).map((course) => (
              <CourseCard course={course} key={course._id || course.id} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f8fafb] pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-2xl font-black text-gray-900 mb-2">All Courses</h1>
          <div className="h-1.5 w-20 bg-emerald-500 rounded-full"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Courses Main Area */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-sm font-bold text-gray-500">
                Waxaa jira <span className="text-emerald-600">{filteredCourses.length}</span> koorso oo la helay
              </p>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 text-emerald-600 font-bold text-sm"
              >
                <Filter size={18} /> Shaandhey
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <CourseCard course={course} key={course._id || course.id} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Koorso looma helin</h3>
                  <p className="text-sm text-gray-400">Fadlan isku day inaad raadis kale sameyso.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Filter */}
          <aside className={`
            order-1 lg:order-2
            fixed lg:static inset-y-0 right-0 w-[300px] lg:w-80 bg-white lg:bg-transparent z-[1000] lg:z-auto
            p-6 lg:p-0 transition-transform duration-300 transform
            ${isSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
            lg:block
          `}>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl lg:shadow-sm p-6 space-y-8 lg:sticky lg:top-28">
              <div className="flex lg:hidden justify-between items-center mb-4">
                <h3 className="font-black text-gray-900">Shaandhaynta</h3>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-gray-50 rounded-lg text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest mb-2">
                <SlidersHorizontal size={14} /> Filtering Options
              </div>

              {/* Search */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Search Title</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Raadi magaca..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-transparent rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500/20 transition-all"
                  />
                  <Search className="absolute right-3 top-3 text-gray-300" size={18} />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categories</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500/20 transition-all appearance-none cursor-pointer"
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
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100"
                        : "bg-white border-gray-100 text-gray-400 hover:border-emerald-200"
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
                        ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100"
                        : "bg-white border-gray-100 text-gray-400 hover:border-emerald-200"
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
                  className="w-full py-3 text-xs font-black text-red-500 hover:underline border-t border-gray-50 mt-4"
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
    <div className={`flex items-end justify-between mb-10`}>
      <div className={center ? "w-full text-center" : ""}>
        <h2 className={`text-4xl font-black text-gray-900 tracking-tighter`}>{title}</h2>
        <div className={`h-1.5 w-20 bg-emerald-500 rounded-full mt-2 ${center ? "mx-auto" : ""}`} />
      </div>

      {cta && (
        <a
          href={cta.href}
          className="hidden sm:flex items-center gap-2 bg-[#00cc8f] text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
        >
          {cta.label}
        </a>
      )}
    </div>
  );
}

export default Courses;
