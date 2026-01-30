import React from 'react';
import { Search } from 'lucide-react';

/**
 * Component Name: PostsFilter
 * Directory: components/colleges/shared/posts/PostsFilter.tsx
 * 
 * Functionality:
 * - Provides search input and filter tabs for the posts feed.
 * - **Tabs**: "All Posts" vs "My Posts" (only for authorities).
 * - **Search**: Filters posts by content or author.
 * 
 * Used In: PostsSection
 */

interface PostsFilterProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    viewTab: 'all' | 'my';
    setViewTab: (tab: 'all' | 'my') => void;
    isAuthority: boolean;
}

export const PostsFilter: React.FC<PostsFilterProps> = ({ 
    searchQuery, setSearchQuery, viewTab, setViewTab, isAuthority 
}) => {
    return (
        <div className="bg-white p-2 rounded-xl border shadow-sm flex flex-col md:flex-row gap-2">
            <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
                <button 
                    onClick={() => setViewTab('all')} 
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewTab === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    All Posts
                </button>
                {isAuthority && (
                    <button 
                        onClick={() => setViewTab('my')} 
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${viewTab === 'my' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        My Posts
                    </button>
                )}
            </div>
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                    className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none bg-white text-gray-900"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
    );
};