import Comment from "./Comment";
import { MessageSquare } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-12 px-6 bg-white/5 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 transition-all duration-300">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-emerald-100 dark:bg-emerald-500/10 rounded-full blur-xl opacity-50 animate-pulse"></div>
          <div className="relative bg-emerald-50 dark:bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
            <MessageSquare className="text-emerald-500 dark:text-emerald-400 w-8 h-8" />
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
          No comments yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center max-w-[250px] leading-relaxed">
          Be the first to share your thoughts and start the conversation!
        </p>
      </div>
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