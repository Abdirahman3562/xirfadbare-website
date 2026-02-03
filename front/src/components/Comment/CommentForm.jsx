import { useState } from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import UserAvatar from "../UserAvatar";
import { createComment } from "../../api/commentService";

const CommentForm = ({ user, article, onCommentPosted }) => {
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const handlePostComment = async () => {
    if (!newComment.trim() || !article) return;

    try {
      setCommentLoading(true);
      const comment = await createComment(newComment.trim(), article.id);
      onCommentPosted(comment);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setCommentLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="mb-12 p-8 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-700 text-center transition-all duration-300">
        <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-slate-600 shadow-sm">
          <FaUser className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium mb-6 italic">Join the conversation by logging into your account.</p>
        <Link
          to="/auth/login"
          className="inline-flex items-center px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          Login to Comment
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-12 bg-white/5 dark:bg-slate-900/40 p-6 rounded-2xl border border-gray-100/10 dark:border-slate-800 backdrop-blur-sm shadow-sm transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <UserAvatar
            image={user.image}
            name={`${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"}
            size="w-12 h-12"
            className="ring-2 ring-emerald-500/10 dark:ring-emerald-500/5"
          />
        </div>
        <div className="flex-1">
          <div className="group relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="What are your thoughts? Write a comment..."
              className="w-full p-4 bg-white/10  dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-500/5 focus:border-emerald-500 dark:focus:border-emerald-600 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none transition-all duration-300 text-[15px] leading-relaxed"
              rows="4"
            />
            <div className="absolute right-3 bottom-3 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium px-2 py-1 bg-gray-50 dark:bg-slate-700 rounded-md border border-gray-100 dark:border-slate-600 uppercase tracking-wider">markdown supported</span>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handlePostComment}
              disabled={!newComment.trim() || commentLoading}
              className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 group"
            >
              {commentLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;