
import React, { useState } from 'react';
import { Post, User, Role } from '../../../../types';
import { ThumbsUp, CornerDownRight, X, Send, ShieldCheck, Trash2 } from 'lucide-react';
import { PostService } from '../../../../services/postService';

interface PostCommentsProps {
    post: Post;
    currentUser: User;
    hasStudentCommented: boolean;
    onAddComment: (text: string) => void;
    onDeleteComment: (commentId: string) => void;
    onReaction: (commentId: string) => void;
    onReply: (commentId: string, text: string) => void;
}

export const PostComments: React.FC<PostCommentsProps> = ({
    post, currentUser, hasStudentCommented,
    onAddComment, onDeleteComment, onReaction, onReply
}) => {
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState<{ [commentId: string]: string }>({});
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const isStudent = currentUser.role === Role.STUDENT;

    const handleAdd = () => {
        if (!commentText.trim()) return;
        onAddComment(commentText);
        setCommentText('');
    };

    const handleSendReply = (commentId: string) => {
        const text = replyText[commentId];
        if (!text?.trim()) return;
        onReply(commentId, text);
        setReplyText({ ...replyText, [commentId]: '' });
        setReplyingTo(null);
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {isStudent && hasStudentCommented ? (
                <div className="p-3 text-xs text-center text-orange-600 bg-orange-50 border border-orange-100 rounded-xl font-bold">
                    Profile restriction: Only one top-level comment allowed per post for students.
                </div>
            ) : (
                <div className="flex gap-2">
                    <input 
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="Share your thoughts..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    />
                    <button onClick={handleAdd} disabled={!commentText.trim()} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                        <Send size={16}/>
                    </button>
                </div>
            )}

            <div className="space-y-5 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                {post.comments.map(comment => {
                    const hasLikedComment = comment.likedBy?.includes(currentUser.id);
                    const canDeleteThisComment = PostService.canModeratePost(currentUser, post) || comment.userId === currentUser.id;

                    return (
                        <div key={comment.id} className="group/comment space-y-2">
                            <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm ${comment.role === Role.CPH ? 'bg-purple-600' : comment.role === Role.STAFF ? 'bg-indigo-600' : 'bg-slate-500'}`}>
                                    {comment.user[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="bg-gray-100 rounded-2xl px-4 py-2 inline-block max-w-full">
                                        <div className="flex justify-between items-center gap-4 mb-0.5">
                                            <span className="font-bold text-xs text-slate-900 truncate">{comment.user}</span>
                                            <span className="text-[9px] text-slate-400 font-medium">{comment.date}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed">{comment.text}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 mt-1 ml-2">
                                        <button 
                                            onClick={() => onReaction(comment.id)} 
                                            className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${hasLikedComment ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}
                                        >
                                            <ThumbsUp size={12}/> {comment.likes || 0}
                                        </button>
                                        
                                        <button 
                                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} 
                                            className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                                        >
                                            <CornerDownRight size={12}/> Reply
                                        </button>

                                        {canDeleteThisComment && (
                                            <button 
                                                onClick={() => onDeleteComment(comment.id)} 
                                                className="text-[10px] text-red-500 font-bold hover:underline flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={12}/> Delete
                                            </button>
                                        )}
                                    </div>

                                    {replyingTo === comment.id && (
                                        <div className="mt-3 flex gap-2 ml-2 animate-in slide-in-from-top-2">
                                            <input 
                                                className="flex-1 text-xs border rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-slate-900 shadow-sm border-slate-200"
                                                placeholder="Write a reply..."
                                                autoFocus
                                                value={replyText[comment.id] || ''}
                                                onChange={(e) => setReplyText({...replyText, [comment.id]: e.target.value})}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendReply(comment.id)}
                                            />
                                            <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600 p-1"><X size={16} /></button>
                                            <button onClick={() => handleSendReply(comment.id)} className="bg-blue-600 text-white px-3 rounded-full text-[10px] font-bold shadow-sm">Post</button>
                                        </div>
                                    )}

                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-3 space-y-3 ml-4 border-l-2 border-slate-200 pl-4">
                                            {comment.replies.map(reply => {
                                                const isOfficial = reply.role === Role.CPH || reply.role === Role.STAFF;
                                                const hasLikedReply = reply.likedBy?.includes(currentUser.id);

                                                return (
                                                    <div key={reply.id} className="relative">
                                                        <div className={`${isOfficial ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-200'} rounded-2xl px-4 py-2 border shadow-sm relative group/reply`}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {isOfficial && <ShieldCheck size={12} className="text-blue-600" />}
                                                                <span className={`text-[11px] font-black uppercase tracking-tight ${isOfficial ? 'text-blue-800' : 'text-slate-700'}`}>
                                                                    {isOfficial ? 'Official Response' : reply.user}
                                                                </span>
                                                                <span className="text-[9px] text-slate-400 ml-auto font-medium">{reply.date}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-800 leading-relaxed font-medium">{reply.text}</p>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-1 ml-2">
                                                            <button 
                                                                onClick={() => onReaction(reply.id)} 
                                                                className={`flex items-center gap-1 text-[10px] font-bold transition-colors ${hasLikedReply ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}
                                                            >
                                                                <ThumbsUp size={10}/> {reply.likes || 0}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
