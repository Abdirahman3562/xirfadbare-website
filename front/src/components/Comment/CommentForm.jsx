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
      <div className="mb-8 text-center">
        <p className="text-gray-600 mb-4">Please log in to leave a comment.</p>
        <Link
          to="/auth/login"
          className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <FaUser className="mr-2" />
          Login to Comment
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-start space-x-4">
        <UserAvatar
          image={user.image}
          name={`${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"}
          size="w-10 h-10"
        />
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows="4"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handlePostComment}
              disabled={!newComment.trim() || commentLoading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {commentLoading ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentForm;