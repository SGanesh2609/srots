
import React, { useState } from 'react';

/**
 * Component Name: PostContent
 * Directory: components/colleges/shared/posts/PostContent.tsx
 * 
 * Functionality:
 * - Renders the text content of a post.
 * - Handles text truncation if content exceeds MAX_CHARS (200).
 * - Provides "See more" / "Show less" toggle.
 * 
 * Used In: PostCard
 */

interface PostContentProps {
    content: string;
}

export const PostContent: React.FC<PostContentProps> = ({ content }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const MAX_CHARS = 200;
    const text = content || '';

    if (text.length <= MAX_CHARS) {
        return <p className="text-gray-800 whitespace-pre-wrap mb-4 text-sm leading-relaxed">{text}</p>;
    }

    return (
        <p className="text-gray-800 whitespace-pre-wrap mb-4 text-sm leading-relaxed">
            {isExpanded ? text : `${text.slice(0, MAX_CHARS)}...`}
            <button 
                onClick={() => setIsExpanded(!isExpanded)} 
                className="text-gray-500 font-medium hover:text-blue-600 hover:underline ml-1 text-xs"
            >
                {isExpanded ? 'Show less' : 'See more'}
            </button>
        </p>
    );
};
