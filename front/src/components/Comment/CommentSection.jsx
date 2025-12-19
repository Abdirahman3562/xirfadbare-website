import { useState, useEffect } from "react";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import { getCommentsByBlog } from "../../api/commentService";
import { useAuth } from "../../hooks/useAuth";

const CommentSection = ({ article }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load comments when component mounts or article changes
  useEffect(() => {
    const loadComments = async () => {
      if (!article?.id) return;

      try {
        setLoading(true);
        setError(null);
        const articleComments = await getCommentsByBlog(article.id);
        setComments(articleComments);
      } catch (error) {
        console.error("Error loading comments:", error);
        setError("Failed to load comments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [article?.id]);

  // Handler for when a new comment is posted
  const handleCommentPosted = (newComment) => {
    setComments(prevComments => [newComment, ...prevComments]);
  };

  // Handler for when a comment is updated
  const handleCommentUpdated = (updatedComment) => {
    const updateCommentInList = (commentList) => {
      return commentList.map(comment => {
        if (comment._id === updatedComment._id) {
          return { ...comment, ...updatedComment };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentInList(comment.replies)
          };
        }
        return comment;
      });
    };

    setComments(prevComments => updateCommentInList(prevComments));
  };

  // Handler for when a comment is deleted
  const handleCommentDeleted = (commentId) => {
    const removeCommentFromList = (commentList) => {
      return commentList
        .filter(comment => comment._id !== commentId)
        .map(comment => ({
          ...comment,
          replies: comment.replies ? removeCommentFromList(comment.replies) : []
        }));
    };

    setComments(prevComments => removeCommentFromList(prevComments));
  };

  // Handler for when a reply is added
  const handleReplyAdded = (parentCommentId, newReply) => {
    const addReplyToComment = (commentList) => {
      return commentList.map(comment => {
        if (comment._id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReplyToComment(comment.replies)
          };
        }
        return comment;
      });
    };

    setComments(prevComments => addReplyToComment(prevComments));
  };

  if (!article) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Comments ({comments.length})
        </h2>
      </div>


      <div className="mb-14">
         {/* Comments List - Show after form when loaded */}
      {!loading && !error && (
        <div className="mt-8">
          <CommentList
            comments={comments}
            user={user}
            article={article}
            onCommentUpdated={handleCommentUpdated}
            onCommentDeleted={handleCommentDeleted}
            onReplyAdded={handleReplyAdded}
          />
        </div>
      )}
      </div>

      {/* Comment Form - Show first for logged-in users */}
      <CommentForm
        user={user}
        article={article}
        onCommentPosted={handleCommentPosted}
      />

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading comments...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <div className="text-red-500">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

     
    </div>
  );
};

export default CommentSection;
