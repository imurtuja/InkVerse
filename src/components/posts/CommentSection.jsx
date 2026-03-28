"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

function CommentItem({ comment, postId, onReplyAdded }) {
  const { data: session } = useSession();
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyText, parentComment: comment._id }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      onReplyAdded?.(comment._id, data.comment);
      setReplyText("");
      setShowReply(false);
      setShowReplies(true);
      toast.success("Reply added!");
    } catch {
      toast.error("Failed to reply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      className="group mt-6 first:mt-2"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-fuchsia-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {comment.author?.image ? (
            <img src={comment.author.image} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            comment.author?.name?.[0]?.toUpperCase()
          )}
        </div>
        
        {/* Comment Body */}
        <div className="flex-1 min-w-0">
          <div className="bg-transparent">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-bold text-gray-900 dark:text-gray-200">{comment.author?.name}</span>
              <span className="text-[12px] text-gray-500 dark:text-[#6e7681]">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-[14px] leading-relaxed text-gray-700 dark:text-[#c9d1d9] whitespace-pre-wrap">{comment.content}</p>
          </div>
          
          {/* Metadata actions */}
          <div className="flex items-center gap-4 mt-2">
            {session && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-[12px] text-gray-500 dark:text-[#6e7681] hover:text-blue-600 dark:hover:text-blue-500 font-medium transition-colors"
              >
                Reply
              </button>
            )}
            {comment.replies?.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-[12px] text-blue-600 dark:text-blue-500 font-medium"
              >
                {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {showReply && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleReply}
                className="mt-3 flex gap-2"
              >
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-white/50 dark:bg-[#0b101a] border border-gray-200 dark:border-[#1e293b] rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 dark:bg-[#1e40af] text-white dark:text-blue-100 disabled:opacity-50 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-semibold shadow-sm"
                >
                  Reply
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Replies */}
          <AnimatePresence>
            {showReplies && comment.replies?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pl-4 border-l-2 border-gray-100 dark:border-[#1e293b] space-y-5"
              >
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {reply.author?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-bold text-gray-900 dark:text-gray-200">{reply.author?.name}</span>
                        <span className="text-[11px] text-gray-400 dark:text-[#6e7681]">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-gray-600 dark:text-[#8b949e] whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommentSection({ postId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments([data.comment, ...comments]);
      setNewComment("");
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyAdded = (parentId, reply) => {
    setComments((prev) =>
      prev.map((c) =>
        c._id === parentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c
      )
    );
  };

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* New Comment */}
      {session ? (
        <form onSubmit={handleSubmit} className="flex gap-4 items-start mb-8">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {session.user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 flex flex-col bg-white/40 dark:bg-[#030712]/40 backdrop-blur-xl border border-gray-200/60 dark:border-[#1e293b]/60 rounded-xl overflow-hidden focus-within:border-blue-600/50 dark:focus-within:border-[#1e40af]/80 focus-within:bg-white/60 dark:focus-within:bg-[#030712]/60 transition-all duration-300">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment... (supports Markdown)"
              className="w-full bg-transparent min-h-[80px] px-4 py-3 text-[14px] text-gray-800 dark:text-gray-200 resize-none focus:outline-none placeholder:text-gray-400 dark:placeholder:text-[#6e7681]"
            />
            <div className="flex justify-end px-3 py-2 border-t border-gray-100 dark:border-[#1e293b]/60 bg-transparent">
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-2 px-5 py-1.5 rounded-lg bg-blue-600 dark:bg-[#1e40af] text-white dark:text-blue-100 disabled:opacity-50 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-semibold shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Comment
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="border border-gray-100 dark:border-[#1e293b] rounded-xl p-6 text-center text-gray-400 dark:text-[#6e7681]">
          <p className="text-sm">Please log in to leave a comment.</p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1e293b] animate-pulse" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-1/4 bg-gray-100 dark:bg-[#1e293b] rounded animate-pulse" />
                <div className="h-16 bg-gray-100/50 dark:bg-[#1e293b]/50 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-gray-300 dark:text-[#6e7681]">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              postId={postId}
              onReplyAdded={handleReplyAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
