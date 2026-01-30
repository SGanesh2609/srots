
import React, { useState, useEffect } from 'react';
import { PostService } from '../../../../services/postService';
import { Post, User, Role } from '../../../../types';
import { Plus, PenTool, Sparkles, MessageCircle } from 'lucide-react';
import { DeleteConfirmationModal } from '../../../../components/common/DeleteConfirmationModal';

// Sub-components
import { PostCard } from './PostCard';
import { PostsFilter } from './PostsFilter';
import { PostFormModal } from './PostFormModal';

interface PostsSectionProps {
  user: User;
}

export const PostsSection: React.FC<PostsSectionProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [viewTab, setViewTab] = useState<'all' | 'my'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const canCreate = PostService.canModeratePost(user, { collegeId: user.collegeId });

  useEffect(() => {
      refreshPosts();
  }, [user.collegeId, searchQuery, viewTab]);

  const refreshPosts = async () => {
      setIsLoading(true);
      try {
          const authorIdFilter = viewTab === 'my' ? user.id : undefined;
          const results = await PostService.searchPosts(user.collegeId || '', searchQuery, authorIdFilter);
          setPosts([...results]);
      } finally {
          setIsLoading(false);
      }
  };

  const handleCreatePost = async (content: string, images: string[], docs: {name: string, url: string}[]) => {
      await PostService.createPost(content, images, docs, user);
      refreshPosts();
      setShowCreateModal(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestDelete = (postId: string) => {
      setDeletePostId(postId);
  };

  const confirmDeletePost = async () => {
      if (deletePostId) {
          await PostService.deletePost(deletePostId);
          refreshPosts();
          setDeletePostId(null);
      }
  };

  return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
              <div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                      Campus Social <MessageCircle className="text-blue-600" size={24} />
                  </h2>
                  <p className="text-sm text-gray-500 font-medium">Internal feed for institutional updates and discussions.</p>
              </div>
              
              {canCreate && (
                  <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95 text-sm">
                      <Plus size={20} /> Publish Announcement
                  </button>
              )}
          </div>

          <PostsFilter 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewTab={viewTab}
              setViewTab={setViewTab}
              isAuthority={canCreate}
          />

          <div className={`space-y-6 transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {posts.map(post => (
                  <PostCard 
                      key={post.id} 
                      post={post} 
                      currentUser={user} 
                      onRefresh={refreshPosts}
                      onRequestDelete={handleRequestDelete}
                  />
              ))}
              
              {posts.length === 0 && !isLoading && (
                  <div className="text-center py-24 bg-white border-2 border-dashed border-gray-100 rounded-3xl shadow-sm">
                      <div className="relative inline-block mb-6">
                         <PenTool size={64} className="text-gray-200" />
                         <Sparkles size={24} className="text-blue-400 absolute -top-2 -right-2 animate-pulse" />
                      </div>
                      <p className="text-xl font-bold text-gray-300">No social activity found.</p>
                      {canCreate && (
                          <button onClick={() => setShowCreateModal(true)} className="mt-4 text-blue-600 font-bold hover:underline">Start the conversation</button>
                      )}
                  </div>
              )}
          </div>

          <PostFormModal 
              isOpen={showCreateModal}
              onClose={() => setShowCreateModal(false)}
              onSave={handleCreatePost}
          />

          <DeleteConfirmationModal
              isOpen={!!deletePostId}
              onClose={() => setDeletePostId(null)}
              onConfirm={confirmDeletePost}
              title="Permanently Delete Post?"
              message="This will erase the content and all associated comments. This action cannot be reversed."
          />
      </div>
  );
};
