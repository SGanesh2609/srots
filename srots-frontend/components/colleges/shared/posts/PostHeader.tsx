
import React from 'react';
import { Post, Role } from '../../../../types';
import { Lock, Unlock, Trash2 } from 'lucide-react';

/**
 * Component Name: PostHeader
 * Directory: components/colleges/shared/posts/PostHeader.tsx
 * 
 * Functionality:
 * - Displays Author Avatar, Name, and Role.
 * - Shows relative timestamp of the post.
 * - Provides controls for Deleting the post or Toggling comments (Lock/Unlock) based on permissions.
 * 
 * Used In: PostCard
 */

interface PostHeaderProps {
    post: Post;
    onToggleComments: () => void;
    onDelete: (e: React.MouseEvent) => void;
    canToggleComments: boolean;
    canDeletePost: boolean;
}

export const PostHeader: React.FC<PostHeaderProps> = ({ 
    post, onToggleComments, onDelete, canToggleComments, canDeletePost 
}) => {
    return (
        <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${post.authorRole === Role.CPH ? 'bg-purple-600' : 'bg-blue-600'}`}>
                    {post.authorName[0]}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900">{post.authorName}</h4>
                        {post.authorRole === Role.CPH && (
                            <span className="text-[8px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter border border-purple-200">Head</span>
                        )}
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight">{post.createdAt}</p>
                </div>
            </div>
            <div className="flex gap-1.5">
                {canToggleComments && (
                    <button onClick={onToggleComments} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100" title={post.commentsDisabled ? "Enable Comments" : "Disable Comments"}>
                        {post.commentsDisabled ? <Lock size={16}/> : <Unlock size={16}/>}
                    </button>
                )}
                {canDeletePost && (
                    <button type="button" onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Delete Post">
                        <Trash2 size={16} className="pointer-events-none"/>
                    </button>
                )}
            </div>
        </div>
    );
};
