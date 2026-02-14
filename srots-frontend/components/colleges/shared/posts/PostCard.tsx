
import React, { useState } from 'react';
import { Post, User, Role } from '../../../../types';
import { PostService } from '../../../../services/postService';

// Sub-components
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostAttachments } from './PostAttachments';
import { PostActions } from './PostActions';
import { PostComments } from './PostComments';
import { PostImageViewer } from './PostImageViewer';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onRefresh: () => void;
  onRequestDelete: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onRefresh, onRequestDelete }) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const canDelete = PostService.canDeletePost(currentUser, post);
  const canModerate = PostService.canModeratePost(currentUser, post); 
  const studentCommented = PostService.hasStudentCommented(currentUser, post);

  const handleToggleComments = async () => {
      await PostService.toggleComments(post.id, currentUser.id, currentUser.role);
      onRefresh();
  };

  const handleLikePost = async () => {
      await PostService.togglePostLike(post.id, currentUser.id);
      onRefresh();
  };

  const handleAddComment = async (text: string) => {
      if(studentCommented && currentUser.role === Role.STUDENT) return; 
      await PostService.addComment(post.id, text, currentUser);
      onRefresh();
  };

  const handleDeleteComment = async (commentId: string) => {
      await PostService.deleteComment(commentId, currentUser.id, currentUser.role);
      onRefresh();
  };

  // REMOVED: handleReaction for comment likes - not supported

  const handleReply = async (commentId: string, text: string) => {
      await PostService.replyToComment(post.id, commentId, text, currentUser);
      onRefresh();
  };

  const openViewer = (index: number) => {
      setCurrentImageIndex(index);
      setIsViewerOpen(true);
      document.body.style.overflow = 'hidden'; 
  };

  const closeViewer = () => {
      setIsViewerOpen(false);
      document.body.style.overflow = 'unset';
  };

  return (
    <>
        <div className="bg-white p-6 rounded-xl border shadow-sm group hover:shadow-md transition-all">
            <PostHeader 
                post={post}
                onToggleComments={handleToggleComments}
                onDelete={(e) => { e.stopPropagation(); onRequestDelete(post.id); }}
                canToggleComments={canModerate}
                canDeletePost={canDelete}
            />

            <PostContent content={post.content} />
            
            <PostAttachments 
                images={post.images}
                documents={post.documents}
                onImageClick={openViewer}
            />

            <PostActions 
                post={post}
                currentUser={currentUser}
                onLike={handleLikePost}
            />

            {!post.commentsDisabled && (
                <PostComments 
                    post={post}
                    currentUser={currentUser}
                    hasStudentCommented={studentCommented}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                    onReply={handleReply}
                    // REMOVED: onReaction prop - comment likes not supported
                />
            )}
        </div>

        <PostImageViewer 
            isOpen={isViewerOpen}
            images={post.images || []}
            currentIndex={currentImageIndex}
            onClose={closeViewer}
            onNext={(e) => { e?.stopPropagation(); if (post.images) setCurrentImageIndex((prev) => (prev + 1) % post.images!.length); }}
            onPrev={(e) => { e?.stopPropagation(); if (post.images) setCurrentImageIndex((prev) => (prev - 1 + post.images!.length) % post.images!.length); }}
            onSelectIndex={setCurrentImageIndex}
        />
    </>
  );
};
