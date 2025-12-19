import { useState } from "react";
import {
  FaEdit,
  FaTrash,
  FaReply,
  FaShare,
  FaCheck,
  FaTimes,
  FaUser
} from "react-icons/fa";
import { toast } from "react-toastify";
import { updateComment, deleteComment, createComment } from "../../api/commentService";

const Comment = ({
  comment,
  user,
  article,
  onCommentUpdated,
  onCommentDeleted,
  onReplyAdded,
  level = 0
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);

  const isOwner = user && comment.author && comment.author._id === user._id;
  const maxLevel = 3; // Maximum nesting level for replies

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Today";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      setLoading(true);
      const updatedComment = await updateComment(comment._id, editContent.trim());
      onCommentUpdated(updatedComment);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteComment(comment._id);
      onCommentDeleted(comment._id);
      toast.success("Comment deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment. Please try again.", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      setLoading(true);
      const newReply = await createComment(replyContent.trim(), article.id, comment._id);
      onReplyAdded(comment._id, newReply);
      setReplyContent("");
      setIsReplying(false);
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/blog/${article.title?.toLowerCase().replace(/\s+/g, "-")}`;
    const shareText = `Check out this comment: "${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}"`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
        fallbackShare(shareUrl, shareText);
      }
    } else {
      fallbackShare(shareUrl, shareText);
    }
  };

  const fallbackShare = (url, text) => {
    navigator.clipboard.writeText(`${text}\n\n${url}`).then(() => {
      alert("Link copied to clipboard!");
    }).catch(() => {
      alert("Share URL: " + url);
    });
  };

  const getIndentClass = () => {
    if (level === 0) return "";
    if (level === 1) return "ml-8";
    if (level === 2) return "ml-16";
    return "ml-24";
  };

  return (
    <div className={`${getIndentClass()} ${level > 0 ? 'mt-4' : ''}`}>
      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        {/* Avatar */}
        <img
          src={comment.author?.image || "/images/authors/default.jpg"}
          alt={comment.author?.firstName || "User"}
          className="w-8 h-8 rounded-full object-cover border border-gray-300 flex-shrink-0"
          onError={(e) => (e.target.src = "/images/authors/default.jpg")}
        />

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900 text-sm">
                {comment.author?.firstName} {comment.author?.lastName}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              {user && (
                <>
                  {/* Share button - available to all logged-in users */}
                  <button
                    onClick={handleShare}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                    title="Share comment"
                  >
                    <FaShare className="text-xs" />
                  </button>

                  {/* Reply button - only for other users' comments, not own comments */}
                  {!isOwner && level < maxLevel && (
                    <button
                      onClick={() => setIsReplying(!isReplying)}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                      title="Reply to comment"
                    >
                      <FaReply className="text-xs" />
                    </button>
                  )}

                  {/* Edit/Delete buttons - only for comment owner */}
                  {isOwner && (
                    <>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                        title="Edit comment"
                      >
                        <FaEdit className="text-xs" />
                      </button>

                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="text-red-500 hover:text-red-700 p-1 rounded transition-colors disabled:opacity-50"
                        title="Delete comment"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows="3"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <FaTimes className="inline mr-1" />
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={!editContent.trim() || loading}
                  className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FaCheck className="inline mr-1" />
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
          )}

          {/* Reply Form */}
          {isReplying && user && (
            <div className="mt-3 space-y-2">
              <div className="flex items-start space-x-2">
                <img
                  src={user.image || "/images/authors/default.jpg"}
                  alt={user.firstName}
                  className="w-6 h-6 rounded-full object-cover border border-gray-300 flex-shrink-0"
                />
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-transparent resize-none"
                    rows="2"
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setIsReplying(false);
                        setReplyContent("");
                      }}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={!replyContent.trim() || loading}
                      className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "Posting..." : "Reply"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              user={user}
              article={article}
              onCommentUpdated={onCommentUpdated}
              onCommentDeleted={onCommentDeleted}
              onReplyAdded={onReplyAdded}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
