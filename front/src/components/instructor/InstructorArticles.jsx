import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaUserEdit } from "react-icons/fa";
import { getAllBlogs } from "../../api/blogService";

const InstructorArticles = ({ instructorName }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const allBlogs = await getAllBlogs();
                // Filter blogs where author name matches instructor name (case-insensitive)
                const filtered = allBlogs.filter((blog) => {
                    const authorName = blog.author?.name || "";
                    return authorName.toLowerCase() === instructorName.toLowerCase();
                });
                setArticles(filtered);
            } catch (err) {
                console.error("❌ Error fetching instructor articles:", err);
            } finally {
                setLoading(false);
            }
        };

        if (instructorName) {
            fetchArticles();
        }
    }, [instructorName]);

    if (loading) return <p className="text-gray-500 italic">Loading articles...</p>;

    if (articles.length === 0) {
        return (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
                <FaUserEdit className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-600">No articles available for this instructor yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            {articles.map((article) => (
                <Link
                    key={article._id}
                    to={`/blog/${article._id}`}
                    className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition group"
                >
                    <div className="w-full md:w-48 h-32 flex-shrink-0">
                        <img
                            src={article.thumbnail || "/default-blog.jpg"}
                            alt={article.title}
                            className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition duration-300"
                        />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-600 transition mb-2">
                            {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                            {article.content?.replace(/<[^>]*>?/gm, "").slice(0, 150)}...
                        </p>
                        <div className="flex items-center text-xs text-gray-400 gap-4">
                            <span className="flex items-center gap-1">
                                <FaCalendarAlt className="text-emerald-500" />
                                {article.date || "Unknown Date"}
                            </span>
                            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full uppercase font-semibold">
                                {article.category || "General"}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default InstructorArticles;
