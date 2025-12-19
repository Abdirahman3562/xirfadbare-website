import Comment from "./Comment";

const CommentList = ({
  comments,
  user,
  article,
  onCommentUpdated,
  onCommentDeleted,
  onReplyAdded
}) => {
  if (comments.length === 0) {
    return (
      <p className="text-gray-500 text-center py-8">
        No comments yet. Be the first to comment!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <Comment
          key={comment._id}
          comment={comment}
          user={user}
          article={article}
          onCommentUpdated={onCommentUpdated}
          onCommentDeleted={onCommentDeleted}
          onReplyAdded={onReplyAdded}
        />
      ))}
    </div>
  );
};

export default CommentList;