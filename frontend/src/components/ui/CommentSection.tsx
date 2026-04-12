import { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { recordsService } from '@/services/records.service';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/utils/cn';
import { Avatar } from './Avatar';
import type { Comment } from '@/models/models';

interface CommentSectionProps {
  recordId: number;
}

export function CommentSection({ recordId }: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', recordId],
    queryFn: () => recordsService.getComments(recordId),
  });

  const commentMutation = useMutation({
    mutationFn: (data: { text: string; parentId?: number }) => 
      recordsService.addComment(recordId, data.text, data.parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', recordId] });
      queryClient.invalidateQueries({ queryKey: ['public-records'] });
      setContent('');
      setReplyTo(null);
    },
  });

  const editMutation = useMutation({
    mutationFn: (data: { id: number; text: string }) => 
      recordsService.updateComment(data.id, data.text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', recordId] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => recordsService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', recordId] });
    },
  });

  const reactionMutation = useMutation({
    mutationFn: (data: { id: number; type: number }) => 
      recordsService.toggleReaction('comment', data.id, data.type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', recordId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      commentMutation.mutate({ text: content, parentId: replyTo?.id });
    }
  };

  const saveEdit = (id: number) => {
    if (editContent.trim()) {
      editMutation.mutate({ id, text: editContent });
    }
  };

  const handleReplyBtn = (id: number, name: string) => {
    setReplyTo({ id, name });
    setContent(`@${name} `);
    // Focus and scroll to input
    const input = document.getElementById(`comment-input-${recordId}`);
    input?.focus();
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment, depth?: number }) => {
    const isOwner = user?.id === comment.user_id;
    const [showReplies, setShowReplies] = useState(true);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn("flex flex-col gap-2", depth > 0 && "mt-4")}
      >
        <div className="flex gap-3">
          {/* Avatar with Thread Line */}
          <Link to={`/profile/${comment.user_id}`} className="flex flex-col items-center flex-shrink-0 group">
            <Avatar 
              src={comment.user_avatar} 
              name={comment.user_name} 
              size="sm" 
              className="border border-white shadow-sm z-10 group-hover:scale-110 transition-transform" 
            />
            {hasReplies && showReplies && (
              <div className="w-0.5 flex-1 bg-gradient-to-b from-orange-100 to-transparent mt-2 rounded-full" />
            )}
          </Link>

          <div className="flex-1 min-w-0">
            <div className="bg-neutral-50 p-4 rounded-2xl rounded-tl-none group relative shadow-sm border border-neutral-100/50">
              <div className="flex justify-between items-center mb-1.5">
                <Link to={`/profile/${comment.user_id}`} className="text-xs font-black text-neutral-900 hover:text-orange-600 transition-colors">
                  {comment.user_name}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-neutral-400 font-bold">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                  {isOwner && comment.user_id !== 0 && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }} className="text-neutral-400 hover:text-orange-500">
                        <Icon icon="solar:pen-bold" className="text-xs" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(comment.id)} className="text-neutral-400 hover:text-red-500">
                        <Icon icon="solar:trash-bin-trash-bold" className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editingId === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 text-sm bg-white border border-orange-200 rounded-lg outline-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingId(null)} className="text-[10px] font-bold text-neutral-400">Отмена</button>
                    <button onClick={() => saveEdit(comment.id)} className="text-[10px] font-bold text-orange-500">Сохранить</button>
                  </div>
                </div>
              ) : (
                <p className={cn("text-sm text-neutral-600 leading-relaxed break-words", comment.user_id === 0 && "italic text-neutral-400")}>
                  {comment.content}
                </p>
              )}
            </div>

            {/* Comment Interactions */}
            <div className="flex items-center gap-4 mt-2 px-1">
              <button 
                onClick={() => reactionMutation.mutate({ id: comment.id, type: 1 })}
                className={cn("flex items-center gap-1 text-[10px] font-black transition-all active:scale-125", comment.user_reaction === 1 ? "text-red-500" : "text-neutral-400 hover:text-red-500")}
              >
                <Icon icon={comment.user_reaction === 1 ? "solar:heart-bold" : "solar:heart-linear"} className="text-sm" />
                {comment.hearts_count}
              </button>
              
              <button 
                onClick={() => reactionMutation.mutate({ id: comment.id, type: -1 })}
                className={cn("flex items-center gap-1 text-[10px] font-black transition-all active:scale-125", comment.user_reaction === -1 ? "text-neutral-600" : "text-neutral-400 hover:text-neutral-900")}
              >
                <Icon icon={comment.user_reaction === -1 ? "solar:heart-broken-bold" : "solar:heart-broken-linear"} className="text-sm" />
                {comment.broken_hearts_count}
              </button>

              <button 
                onClick={() => handleReplyBtn(comment.id, comment.user_name || 'User')}
                className="text-[10px] font-black text-neutral-400 hover:text-orange-500 uppercase tracking-wider ml-2"
              >
                Ответить
              </button>
            </div>

            {/* View Replies Toggle */}
            {hasReplies && (
              <button 
                onClick={() => setShowReplies(!showReplies)}
                className={cn(
                  "flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest transition-all px-2 py-1 rounded-lg hover:bg-orange-50",
                  showReplies ? "text-orange-500" : "text-neutral-400 hover:text-orange-500"
                )}
              >
                <div className={cn("w-6 h-px bg-current opacity-20 transition-all", showReplies && "w-10")} />
                <Icon 
                  icon="solar:alt-arrow-down-bold" 
                  className={cn("text-xs transition-transform duration-300", showReplies && "rotate-180")} 
                />
                {showReplies ? 'Скрыть обсуждение' : `Посмотреть ответы (${comment.replies?.length || 0})`}
              </button>
            )}

            {/* Render Replies */}
            <AnimatePresence>
              {hasReplies && showReplies && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  {comment.replies && comment.replies.map((reply: Comment) => (
                    <div key={reply.id} className="pl-4 border-l-2 border-orange-50 mt-6 ml-4 hover:border-orange-100 transition-colors">
                      <CommentItem comment={reply} depth={depth + 1} />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="mt-8 pt-8 border-t border-neutral-50">
      <h4 className="text-[10px] font-black text-neutral-300 uppercase tracking-[0.3em] mb-6 pl-1">
        Обсуждение
      </h4>

      {/* Reply indicator */}
      <AnimatePresence>
        {replyTo && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-between bg-orange-50 px-4 py-2.5 rounded-xl mb-4 text-[10px] font-bold text-orange-600 border border-orange-100"
          >
            <div className="flex items-center gap-2">
              <Icon icon="solar:reply-bold" className="text-sm" />
              <span>Ответ пользователю @{replyTo.name}</span>
            </div>
            <button onClick={() => { setReplyTo(null); setContent(''); }} className="hover:text-orange-800 transition-colors">
              <Icon icon="solar:close-circle-bold" className="text-lg" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-10 sticky bottom-4 z-20">
        <input
          id={`comment-input-${recordId}`}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Ваши мысли..."
          className="flex-1 px-5 py-3.5 rounded-2xl bg-white border border-neutral-100 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all shadow-xl shadow-neutral-900/5"
        />
        <button
          type="submit"
          disabled={!content.trim() || commentMutation.isPending}
          className="w-12 h-12 rounded-2xl cta-btn text-white flex items-center justify-center disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20 active:scale-90"
        >
          <Icon icon="solar:send-bold" className="text-xl" />
        </button>
      </form>

      <div className="space-y-10 pb-4">
        {isLoading ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-5 h-5 border-2 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : comments && comments.length > 0 ? (
          <AnimatePresence initial={false}>
            {comments.map((comment: Comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center opacity-40 grayscale">
            <Icon icon="solar:dialog-bold" className="text-4xl mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">Будьте первым в беседе</p>
          </div>
        )}
      </div>
    </div>
  );
}
