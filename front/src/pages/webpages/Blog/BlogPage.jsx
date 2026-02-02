import { useState, useEffect, useMemo } from "react";
import { FaCalendarAlt, FaCheckCircle } from "react-icons/fa";
import { getImageUrl } from "../../../utils/format";
import { FiBook, FiSearch } from "react-icons/fi";
import { Link } from "react-router-dom";
import { getAllBlogs } from "../../../api/blogService";
import PremiumLoader from "../../../components/ui/PremiumLoader";

function BlogPage() {
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination state
  const PAGE_SIZE = 9;
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Format date: "September 12, 2025"
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 🧠 Fetch blogs with author details from backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/blogs");
        const data = await response.json();

        // Filter only active blogs
        const activeBlogs = (data.blogs || []).filter(blog => blog.status === 'active');

        const formattedBlogs = activeBlogs.map((blog) => ({
          ...blog,
          id: blog._id,
          authorName: blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : "Samafale Team",
          authorImage: blog.author?.image || "",
          verified: true, // System admins/authors are verified by default
        }));
        setArticles(formattedBlogs);
      } catch (error) {
        console.error("Error loading blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // filter by search
  const filteredArticles = useMemo(() => {
    const res = articles.filter((a) =>
      a.title.toLowerCase().includes(search.toLowerCase())
    );
    return res;
  }, [articles, search]);

  // reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // compute current page slice
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageArticles = filteredArticles.slice(start, end);

  const goToPage = (p) => {
    const target = Math.min(Math.max(1, p), totalPages);
    setCurrentPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return <PremiumLoader />;
  }

  return (
    <div className="min-h-screen bg-[#f3f8f9] dark:bg-slate-900 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center rounded-full">
              <FiBook className="text-2xl" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">Our Blog</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our latest insights, tutorials, and updates about education
            technology and online learning.
          </p>

          {/* Search bar */}
          <div className="mt-8 relative max-w-xl mx-auto">
            <FiSearch className="absolute left-4 top-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-emerald-400 dark:border-emerald-500/30 rounded-lg py-2.5 pl-10 pr-3 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:focus:ring-emerald-500/20 transition"
            />
          </div>
        </div>

        {/* Articles Grid */}
        {pageArticles.length > 0 ? (
          <>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pageArticles.map((article) => (
                <div
                  key={article.id}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <Link
                    to={`/blog/${encodeURIComponent(
                      article.title.toLowerCase().replace(/\s+/g, "-")
                    )}`}
                    className="relative block"
                  >
                    <img
                      src={getImageUrl(article.thumbnail)}
                      alt={article.title}
                      className="w-full h-48 object-cover transition-transform duration-500 ease-in-out transform hover:scale-110"
                    />
                    <div className="absolute top-0 left-0 px-2 py-0 m-1 bg-white/90 dark:bg-slate-900/90 text-emerald-900 dark:text-emerald-400 text-sm font-semibold rounded-full backdrop-blur-sm">
                      {article.category}
                    </div>
                    <div className="absolute top-0 right-0 flex items-center gap-2 px-2 py-0 m-1 bg-white/90 dark:bg-slate-900/90 text-emerald-900 dark:text-emerald-400 text-sm rounded-full backdrop-blur-sm">
                      <FaCalendarAlt className="text-emerald-500 dark:text-emerald-400" />
                      {formatDate(article.date)}
                    </div>
                  </Link>

                  <div className="p-5">
                    <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {article.content}
                    </p>

                    {/* Author */}
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-2">
                        <img
                          src={getImageUrl(article.authorImage)}
                          alt={article.authorName}
                          className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-slate-700"
                        />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                          {article.authorName}
                          {article.verified && (
                            <FaCheckCircle className="text-emerald-600 dark:text-emerald-400 text-[16px]" />
                          )}
                        </p>
                      </div>
                      <Link
                        to={`/blog/${encodeURIComponent(
                          article.title.toLowerCase().replace(/\s+/g, "-")
                        )}`}
                        className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md border ${currentPage === 1
                    ? "text-gray-400 dark:text-gray-600 border-gray-200 dark:border-slate-800 cursor-not-allowed"
                    : "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                    }`}
                >
                  Prev
                </button>

                {/* page numbers (simple 1..N) */}
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`w-9 h-9 rounded-md border text-sm ${p === currentPage
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md border ${currentPage === totalPages
                    ? "text-gray-400 dark:text-gray-600 border-gray-200 dark:border-slate-800 cursor-not-allowed"
                    : "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                    }`}
                >
                  Next
                </button>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredArticles.length === 0 ? 0 : start + 1}
                –
                {Math.min(end, filteredArticles.length)} of{" "}
                {filteredArticles.length} posts
              </p>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 mt-10">
            No articles found matching your search.
          </p>
        )}
      </div>
    </div>
  );
}

export default BlogPage;
