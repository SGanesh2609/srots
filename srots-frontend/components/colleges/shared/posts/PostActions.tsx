
// import React from 'react';
// import { ThumbsUp, MessageSquare, Lock } from 'lucide-react';
// import { Post, User } from '../../../../types';

// /**
//  * Component Name: PostActions
//  * Directory: components/colleges/shared/posts/PostActions.tsx
//  * 
//  * Functionality:
//  * - Displays Like and Comment counts.
//  * - Handles Like button click.
//  * - Shows "Comments Off" indicator if disabled.
//  * 
//  * Used In: PostCard
//  */

// interface PostActionsProps {
//     post: Post;
//     currentUser: User;
//     onLike: () => void;
// }

// export const PostActions: React.FC<PostActionsProps> = ({ post, currentUser, onLike }) => {
//     const hasLikedPost = post.likedBy.includes(currentUser.id);

//     return (
//         <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-gray-500 text-sm font-medium">
//             <div className="flex gap-6">
//                 <button 
//                     onClick={onLike} 
//                     className={`flex items-center gap-2 transition-colors group/like ${hasLikedPost ? 'text-blue-600' : 'hover:text-blue-600'}`}
//                 >
//                     <ThumbsUp size={18} className={`group-active/like:scale-75 transition-transform ${hasLikedPost ? 'fill-blue-100' : ''}`}/> {post.likes} Likes
//                 </button>
//                 <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
//                     <MessageSquare size={18}/> {post.comments.length} Comments
//                 </button>
//             </div>
//             {post.commentsDisabled && <span className="text-xs text-red-500 font-bold flex items-center gap-1"><Lock size={12}/> Comments Off</span>}
//         </div>
//     );
// };


import React from 'react';
import { ThumbsUp, MessageSquare, Lock } from 'lucide-react';
import { Post, User } from '../../../../types';

/**
 * Component Name: PostActions
 * Directory: components/colleges/shared/posts/PostActions.tsx
 * 
 * Functionality:
 * - Displays Like and Comment counts.
 * - Handles Like button click.
 * - Shows "Comments Off" indicator if disabled.
 * 
 * Used In: PostCard
 */

interface PostActionsProps {
    post: Post;
    currentUser: User;
    onLike: () => void;
}

export const PostActions: React.FC<PostActionsProps> = ({ post, currentUser, onLike }) => {
    const hasLikedPost = post.likedBy.includes(currentUser.id);

    return (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-gray-500 text-sm font-medium">
            <div className="flex gap-6">
                <button 
                    onClick={onLike} 
                    className={`flex items-center gap-2 transition-colors group/like ${hasLikedPost ? 'text-blue-600' : 'hover:text-blue-600'}`}
                >
                    <ThumbsUp size={18} className={`group-active/like:scale-75 transition-transform ${hasLikedPost ? 'fill-blue-100' : ''}`}/> {post.likes} Likes
                </button>
                <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    {/* FIXED: Use commentsCount from backend instead of comments.length */}
                    <MessageSquare size={18}/> {post.commentsCount || 0} Comments
                </button>
            </div>
            {post.commentsDisabled && <span className="text-xs text-red-500 font-bold flex items-center gap-1"><Lock size={12}/> Comments Off</span>}
        </div>
    );
};
