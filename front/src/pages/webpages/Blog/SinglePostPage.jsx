import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getImageUrl } from "../../../utils/format";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaGlobe,
  FaGithub,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import RelatedArticles from "../../../components/Blog/RelatedArticles";
import { CommentSection } from "../../../components/Comment";
import { getAllBlogs, getBlogById } from "../../../api/blogService";
import UserAvatar from "../../../components/UserAvatar";
import { useAuth } from "../../../hooks/useAuth";
import PremiumLoader from "../../../components/ui/PremiumLoader";

function SinglePostPage() {
  const { title } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [authorPosts, setAuthorPosts] = useState([]);


  // Helper: create slug
  const toSlug = (str) => str?.toLowerCase().replace(/\s+/g, "-") ?? "";

  // Helper: format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 1️⃣ Load all blogs
  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        const response = await getAllBlogs();
        // Handle response structure { blogs: [], count: ... } or just array (legacy)
        const rawBlogs = response.blogs || response || [];

        // Filter only active blogs
        const activeBlogs = Array.isArray(rawBlogs)
          ? rawBlogs.filter(b => b.status === "active")
          : [];

        // Format data to match frontend expectations
        const formattedData = activeBlogs.map(blog => ({
          ...blog,
          id: blog._id,
          authorId: blog.author?._id,
          // Ensure author details are populated for the page content
          authorName: blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : "Samafale Team",
          authorImage: blog.author?.image || "",
          verified: true
        }));

        setArticles(formattedData);

        // Find article by slug
        const selected = formattedData.find((b) => toSlug(b.title) === title);

        if (selected) {
          setArticle(selected);
        } else {
          console.log("Article not found for slug:", title);
          setArticle(null);
        }

      } catch (err) {
        console.error("Error loading article:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, [title]);

  // 2️⃣ Set author info once article is found (author is already populated)
  useEffect(() => {
    if (!article) return;

    setAuthorLoading(true);

    if (article.author) {
      setAuthor({
        id: article.author._id,
        username: article.author.username || (article.author.firstName + article.author.lastName).toLowerCase().replace(/\s/g, ''),
        name: `${article.author.firstName} ${article.author.lastName}`,
        avatar: article.author.image,
        bio: article.author.bio || "No bio available yet.",
        verified: !!article.author.verified,
        social: article.author.social || {}
      });
    } else {
      setAuthor(null);
    }

    setAuthorLoading(false);
  }, [article]);

  // 3️⃣ Calculate number of posts by this author
  useEffect(() => {
    if (!author || !articles.length) return;
    const posts = articles.filter(
      (p) => p.author && p.author._id === author.id
    );
    setAuthorPosts(posts);
  }, [author, articles]);


  // 4️⃣ Related posts (same category)
  const relatedPosts = article
    ? articles.filter(
      (p) => p.category === article.category && p.id !== article.id
    )
    : [];

  // Loading & not found states
  if (loading) {
    return <PremiumLoader />;
  }

  if (!article) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Article not found.
      </div>
    );
  }

  const social = author?.social || {};

  return (
    <div className="min-h-screen bg-[#f3f8f9] dark:bg-slate-900 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-16">
        {/* Thumbnail + Meta */}
        <div className="relative mb-8">
          <img
            src={getImageUrl(article.thumbnail)}
            alt={article.title}
            className="w-full h-80 object-cover rounded-xl"
            onError={(e) => (e.target.src = "/images/placeholder.jpg")}
          />
          <div className="absolute top-4 right-4 px-4 py-1 bg-white/10 border border-gray-300 dark:bg-slate-900/90 text-sm rounded-full text-gray-700 dark:text-gray-300 shadow-md backdrop-blur-sm">
            <FaCalendarAlt className="inline text-emerald-500 mr-1" />
            {formatDate(article.date)}
          </div>
          <div className="absolute top-4 left-2 px-4 py-1 bg-white/10 border border-gray-300 dark:bg-slate-900/90 text-emerald-900 dark:text-emerald-400 text-sm font-semibold rounded-full shadow-md backdrop-blur-sm">
            {article.category}
          </div>
        </div>

        {/* Title + Author Info */}
        <div className="max-w-4xl px-2">
          <h1 className="w-full lg:text-3xl  md:text-3xl text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
            {article.title}
          </h1>

          <div className="flex items-center space-x-3">
            <UserAvatar
              image={getImageUrl(author?.avatar || article.authorImage)}
              name={author?.name || article.authorName || "Author"}
              size="w-10 h-10"
            />
            <div className="flex flex-col mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-gray-200 flex items-center gap-1">
                <Link
                  to={`/u/${author?.username ||
                    article.authorName?.toLowerCase().replace(/\s+/g, "")
                    }`}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  {author?.name || article.authorName || "Unknown Author"}
                </Link>
                {author?.verified && (
                  <FaCheckCircle
                    className="text-[18px] text-emerald-600 dark:text-emerald-400 ml-1"
                    title="Verified Author"
                  />
                )}
              </span>
              <p className="flex items-center mt-1 text-[12px] font-semibold gap-2">
                <FaCalendarAlt className="inline" />
                {formatDate(article.date)}
              </p>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div
          className="prose lg:prose-xl prose-emerald dark:prose-invert text-gray-700 dark:text-gray-300 mt-8 max-w-4xl mx-auto [&_img]:max-w-full [&_img]:h-auto [&_iframe]:max-w-full break-words overflow-hidden"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Author Profile Section */}
        <div className="mt-10  max-w-4xl mx-auto ">
          {authorLoading ? (
            <div className="text-gray-500">Loading author...</div>
          ) : author ? (
            <div className="flex flex-col md:flex-row  items-center md:items-start   rounded-xl shadow-md">
              {/* Author Avatar */}
              <UserAvatar
                image={getImageUrl(author.avatar)}
                name={author.name}
                size="w-56 h-56"
                className="rounded-xl"
              />

              {/* Author Info */}
              <div className="flex-1  md:ml-6 mt-4 md:mt-0 px-20 lg:px-0 md:px-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    {author.name}
                    {author.verified && (
                      <FaCheckCircle
                        className="text-emerald-600 dark:text-emerald-400 text-lg "
                        title="Verified Author"
                      />
                    )}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-1">@{author.username}</p>
                <p className="text-gray-700 dark:text-gray-300 mt-4 max-w-xl italic">
                  "{author.bio || "No bio available yet."}"
                </p>

                {/* Social Links */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {social.github && (
                    <a
                      href={social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                      <FaGithub className="text-gray-800 dark:text-gray-200 text-lg" />
                      <span>GitHub</span>
                    </a>
                  )}
                  {social.linkedin && (
                    <a
                      href={social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                      <FaLinkedin className="text-blue-700 dark:text-blue-400 text-lg" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {social.twitter && (
                    <a
                      href={social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                      <FaTwitter className="text-blue-400 dark:text-blue-300 text-lg" />
                      <span>Twitter</span>
                    </a>
                  )}
                  {social.website && (
                    <a
                      href={social.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    >
                      <FaGlobe className="text-gray-500 dark:text-gray-400 text-lg" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              </div>

              {/* ✅ Dynamic Post Count */}
              <div className="mt-6 mr-2 mb-2 md:mt-0 md:ml-6 text-gray-900 dark:text-gray-200 text-sm font-semibold border border-gray-300 dark:border-emerald-500/30 rounded-full px-4 py-2 bg-white/10 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-300">
                Posts{" "}
                <span className="ml-1  text-emerald-600 dark:text-emerald-400">
                  ({authorPosts.length})
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">
              Author details not found for this post.
            </div>
          )}
        </div>

        {/* Related Posts */}
        <RelatedArticles
          relatedPosts={relatedPosts}
          currentPostCategory={article.category}
        />

        {/* Comment Section */}
        <div className="mt-12 max-w-4xl mx-auto">
          <CommentSection article={article} />
        </div>

      </div>
    </div>
  );
}

export default SinglePostPage;
