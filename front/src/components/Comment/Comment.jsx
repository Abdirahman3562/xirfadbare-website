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
import {
  MessageCircle,
  MoreVertical,
  CornerDownRight,
  Minus,
  Plus,
  Trash2,
  Edit,
  Send,
  X,
  User
} from "lucide-react";
import { toast } from "react-toastify";
import UserAvatar from "../UserAvatar";
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
  // Add state for toggling replies, default to false like admin side (or true if preferred, but "View replies" implies hidden first)
  const [showReplies, setShowReplies] = useState(true);

  // Check permissions: Author OR Admin/SuperAdmin
  const isOwner = user && comment.author && comment.author._id === user._id;
  const isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');
  const canDelete = isOwner || isAdmin;

  const hasReplies = comment.replies && comment.replies.length > 0;
  // Use 'depth' to match my mental model from ManageBlogs, mapped from 'level'
  const depth = level;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
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
      toast.error("Failed to update comment.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // Custom confirm modal would be nice here too, but for now standard confirm or toast
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      setLoading(true);
      await deleteComment(comment._id);
      onCommentDeleted(comment._id);
      toast.success("Comment deleted.");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment.");
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
      setShowReplies(true); // Auto-expand to show the new reply
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${depth > 0 ? 'mt-4' : 'mb-4'}`}>
      <div className={`flex gap-3`}>
        {/* Avatar & Lines Column */}
        <div className="flex-shrink-0 relative">
          <UserAvatar
            image={comment.author?.image}
            name={`${comment.author?.firstName || ""} ${comment.author?.lastName || ""}`.trim() || "User"}
            size="w-8 h-8"
            className="rounded-full border border-gray-200"
          />

          {/* Vertical Line for Threading */}
          {hasReplies && showReplies && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 bg-gray-200 -z-10 h-[calc(100%+8px)]"></div>
          )}

          {/* Curve Connector for this child */}
          {depth > 0 && (
            <div className="absolute -left-[22px] top-4 w-5 h-0.5 bg-gray-200"></div>
          )}
          {/* Vertical Parent Line Connector */}
          {depth > 0 && (
            <div className="absolute -left-[22px] -top-8 w-0.5 h-12 bg-gray-200"></div>
          )}
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          {/* Comment Bubble */}
          <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 px-4 inline-block max-w-full relative group">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h4 className="text-sm font-bold text-gray-900">
                {comment.author?.firstName} {comment.author?.lastName}
              </h4>
              <span className="text-xs text-gray-500">
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {isEditing ? (
              <div className="min-w-[250px]">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none resize-none bg-white"
                  rows="2"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-xs px-2 py-1 text-gray-500 hover:bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    className="text-xs px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
            )}

            {/* Hover Actions (Edit/Delete) */}
            {!isEditing && (
              <div className="absolute -right-16 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white shadow-sm p-1 rounded-full border border-gray-100 hidden sm:flex">
                {/* Only show these if hovering and allowed */}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {isOwner && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Actions (Visible on small screens since hover sucks on mobile) */}
          <div className="sm:hidden flex items-center gap-3 mt-1 ml-1 text-xs text-gray-500">
            {canDelete && <button onClick={handleDelete}>Delete</button>}
            {isOwner && <button onClick={() => setIsEditing(true)}>Edit</button>}
          </div>


          {/* Meta Actions Row */}
          <div className="flex items-center gap-4 mt-1 ml-1 select-none">
            {/* Reply Button - Hide if own comment */}
            {user && !isOwner && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className={`text-xs font-bold ${isReplying ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-800'} transition-colors`}
              >
                Reply
              </button>
            )}

            {/* View/Hide Replies */}
            {hasReplies && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
              >
                {showReplies ? (
                  <>Hide {comment.replies.length} replies</>
                ) : (
                  <>View {comment.replies.length} replies</>
                )}
              </button>
            )}
          </div>

          {/* Reply Input */}
          {isReplying && (
            <div className="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex-shrink-0">
                <UserAvatar
                  image={user?.image}
                  name={user?.firstName || "U"}
                  size="w-8 h-8"
                  className="rounded-full bg-gray-100"
                />
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${comment.author?.firstName}...`}
                  className="w-full p-2 pr-10 text-sm border border-gray-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none bg-white min-h-[40px]"
                  rows="1"
                  autoFocus
                />
                <div className="absolute right-2 bottom-1.5 flex items-center gap-1">
                  <button
                    onClick={() => setIsReplying(false)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded transition-colors"
                    title="Cancel"
                  >
                    <X size={14} />
                  </button>
                  <button
                    onClick={handleReply}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                    disabled={!replyContent.trim()}
                    title="Send"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Nested Replies Rendering */}
          {hasReplies && showReplies && (
            <div className="mt-3">
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
      </div>
    </div>
  );
};

export default Comment;
