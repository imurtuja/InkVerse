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
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="group mt-4 first:mt-2"
    >
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 shadow-lg shadow-primary-500/20">
          {comment.author?.image ? (
            <img src={comment.author.image} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            comment.author?.name?.[0]?.toUpperCase()
          )}
        </div>
        
        {/* Comment Body */}
        <div className="flex-1 min-w-0">
          <div className="bg-transparent">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-sm font-semibold text-white">{comment.author?.name}</span>
              <span className="text-xs text-white/50">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/80 whitespace-pre-wrap">{comment.content}</p>
          </div>
          
          {/* Metadata actions */}
          <div className="flex items-center gap-3 mt-1.5">
            {session && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="text-[10px] font-semibold text-white/40 hover:text-primary-500 transition-colors uppercase tracking-wider"
              >
                Reply
              </button>
            )}
            {comment.replies?.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center gap-1 text-[10px] font-semibold text-primary-500 uppercase tracking-wider"
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
                className="mt-2.5 flex gap-2 overflow-hidden"
              >
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 h-9 bg-[#030712] border border-white/10 rounded-lg px-3 text-sm text-white/80 focus:outline-none focus:border-primary-500/50 transition-all font-medium"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || submitting}
                  className="h-9 px-4 py-2 rounded-lg bg-primary-600 text-white disabled:opacity-50 hover:bg-primary-700 transition-colors text-xs font-bold"
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
                className="mt-3 pl-3 border-l-2 border-white/5 space-y-4"
              >
                {comment.replies.map((reply) => (
                  <div key={reply._id} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-teal-600/80 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                      {reply.author?.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[13px] font-semibold text-white">{reply.author?.name}</span>
                        <span className="text-[11px] text-white/40">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-white/70 whitespace-pre-wrap">{reply.content}</p>
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
    <div className="space-y-4">
      <h3 className="text-sm font-semibold leading-tight text-white/90 mb-4 flex items-center gap-2 px-1">
        <MessageCircle className="w-4 h-4 text-primary-500" />
        Comments {comments.length > 0 && <span className="text-white/40 font-medium">({comments.length})</span>}
      </h3>

      {/* New Comment */}
      {session ? (
        <form onSubmit={handleSubmit} className="flex gap-3 items-start mb-8 px-1">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {session.user?.image ? (
              <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              session.user?.name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden focus-within:border-primary-500/30 transition-all duration-300">
            <textarea
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 144)}px`;
              }}
              rows={2}
              placeholder="What are your thoughts?"
              className="w-full bg-transparent min-h-[48px] max-h-[144px] px-3 py-2.5 text-sm text-white/80 resize-none focus:outline-none placeholder:text-white/20 overflow-y-auto"
            />
            <div className="flex justify-between items-center px-3 py-2 border-t border-white/5 bg-white/[0.01]">
              <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Markdown Supported</span>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-1.5 h-7 px-3 rounded-lg bg-primary-600 text-white disabled:opacity-50 hover:bg-primary-700 transition-all text-xs font-bold"
              >
                {submitting ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                Comment
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white/[0.01] border border-white/10 rounded-xl p-5 text-center text-white/40 mb-6">
          <p className="text-xs font-medium">Please log in to leave a comment.</p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white/5" />
              <div className="flex-1 space-y-2">
                <div className="h-2 w-1/4 bg-white/5 rounded" />
                <div className="h-8 bg-white/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-white/20">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-10" />
          <p className="text-xs">No comments yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
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
