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
          <h1 className="w-full lg:text-3xl  md:text-3xl text-[18px] font-extrabold text-gray-900 dark:text-white mb-6">
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
        <div className="mt-16 max-w-4xl mx-auto">
          {authorLoading ? (
            <div className="flex justify-center p-8 bg-white/10 dark:bg-slate-800/40 backdrop-blur-md rounded-3xl border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-medium">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Loading author info...
              </div>
            </div>
          ) : author ? (
            <div className="relative group bg-white/10 border dark:bg-slate-800/60 backdrop-blur-xl rounded-[2rem] p-6 md:p-10 border border-white/40 dark:border-slate-700/40 shadow-xl shadow-emerald-500/5 transition-all duration-500 hover:shadow-emerald-500/10 hover:bg-white/80 dark:hover:bg-slate-800/80 overflow-hidden">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/15 transition-colors duration-700"></div>

              <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Author Avatar with Premium Border */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  <UserAvatar
                    image={getImageUrl(author.avatar)}
                    name={author.name}
                    size="w-40 h-40 md:w-48 md:h-48"
                    className="relative rounded-3xl shadow-lg border-4 border-white dark:border-slate-700 object-cover"
                  />
                  {author.verified && (
                    <div className="absolute -bottom-3 -right-3 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-xl border border-emerald-100 dark:border-slate-700">
                      <FaCheckCircle className="text-2xl text-emerald-500" title="Verified Expert" />
                    </div>
                  )}
                </div>

                {/* Author Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                        {author.name}
                      </h2>
                      <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">@{author.username}</span>
                        <span className="w-1 h-1 bg-gray-300 dark:bg-slate-600 rounded-full"></span>
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm font-medium">
                          <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                            {authorPosts.length} Posts
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Social Icons */}
                    <div className="flex items-center justify-center gap-3">
                      {social.website && (
                        <a href={social.website} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:-translate-y-1 transition-all duration-300 shadow-sm">
                          <FaGlobe className="text-xl" />
                        </a>
                      )}
                      {social.twitter && (
                        <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white dark:bg-slate-700 rounded-xl border border-gray-100 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:text-sky-500 dark:hover:text-sky-400 hover:border-sky-200 dark:hover:border-sky-500/30 hover:-translate-y-1 transition-all duration-300 shadow-sm">
                          <FaTwitter className="text-xl" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-4 top-0 w-1 h-full bg-emerald-500/20 rounded-full"></div>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed  font-medium">
                      "{author.bio || "Crafting knowledge and inspiring future developers through quality education and hands-on experience."}"
                    </p>
                  </div>

                  {/* Feature Tags/Skills fallback or more social links */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-8">
                    {social.github && (
                      <a
                        href={social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-sm hover:scale-105 transition-all duration-300 shadow-lg shadow-gray-900/10 dark:shadow-white/10"
                      >
                        <FaGithub className="text-lg" />
                        <span>GitHub Profile</span>
                      </a>
                    )}
                    {social.linkedin && (
                      <a
                        href={social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#0077b5] text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/20"
                      >
                        <FaLinkedin className="text-lg" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700 text-gray-500 italic">
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
