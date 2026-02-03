import { ArrowRight } from "lucide-react";
import { FaCalendarAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/format";

export default function RelatedArticles({
  relatedPosts = [],
  currentPostCategory,
  currentPostId,
}) {
  // Filter related posts by same category but exclude current post
  const filteredPosts = relatedPosts.filter(
    (post) => post.category === currentPostCategory && post.id !== currentPostId
  );

  // Helper: slugify title
  const toSlug = (str) => str?.toLowerCase().trim().replace(/\s+/g, "-") ?? "";

  return (
    <div className="mt-12 rounded-xl bg-white/10 dark:bg-slate-800 p-6 border border-gray-200 dark:border-slate-700 max-w-4xl mx-auto shadow-sm transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
        Related Articles
      </h2>

      {filteredPosts.length > 0 ? (
        <ul className="space-y-6">
          {filteredPosts.map((post) => (
            <li
              key={post.id}
              className="flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-300 rounded-lg p-2"
            >
              {/* Thumbnail */}
              <Link
                to={`/blog/${toSlug(post.title)}`}
                className="flex-shrink-0"
              >
                <img
                  src={
                    getImageUrl(post.thumbnail) || "/images/placeholders/article-thumb.jpg"
                  }
                  alt={post.title}
                  className="w-20 h-14 object-cover rounded-md border border-gray-200"
                  onError={(e) =>
                    (e.target.src = "/images/placeholders/article-thumb.jpg")
                  }
                />
              </Link>

              {/* Title + Date */}
              <div className="flex-1 min-w-0">
                <Link
                  to={`/blog/${toSlug(post.title)}`}
                  className="text-gray-900 dark:text-gray-200 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 block truncate"
                  title={post.title}
                >
                  {post.title}
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <FaCalendarAlt className="inline" />
                  {new Date(post.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Arrow Button */}
              <Link
                to={`/blog/${toSlug(post.title)}`}
                className="text-emerald-500 hover:text-emerald-600 transition"
                aria-label={`Read more about ${post.title}`}
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 mt-6">
          No related articles found in this category.
        </p>
      )}

      {/* View All Button */}
      <div className="mt-8">
        <Link
          to="/blog"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold"
        >
          View all articles
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
}
