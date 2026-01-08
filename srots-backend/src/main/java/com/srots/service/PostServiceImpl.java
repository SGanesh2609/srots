package com.srots.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.srots.dto.CommentRequest;
import com.srots.dto.CommentResponse;
import com.srots.dto.PostRequest;
import com.srots.dto.PostResponse;
import com.srots.model.Post;
import com.srots.model.PostComment;
import com.srots.model.PostLike;
import com.srots.model.PostLikeId;
import com.srots.model.User;
import com.srots.repository.CollegeRepository;
import com.srots.repository.PostCommentRepository;
import com.srots.repository.PostLikeRepository;
import com.srots.repository.PostRepository;
import com.srots.repository.UserRepository;

@Service
public class PostServiceImpl implements PostService {

    @Autowired private PostRepository postRepo;
    @Autowired private PostCommentRepository commentRepo;
    @Autowired private PostLikeRepository likeRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private CollegeRepository collegeRepo;
    @Autowired private ObjectMapper mapper;
    @Autowired private FileService fileService;

    // --- SECURITY HELPERS ---

    private boolean isAuthorized(Post post, String requestUserId, String role) {
        boolean isGlobalAdmin = List.of("ADMIN", "SROTS_DEV").contains(role);
        // College Admin (CPH) can only manage posts within their own college
        boolean isCollegeAdmin = "CPH".equals(role) && post.getCollege().getId().equals(getUserCollegeId(requestUserId));
        boolean isOwner = post.getAuthor().getId().equals(requestUserId);
        
        return isGlobalAdmin || isCollegeAdmin || isOwner;
    }

    private String getUserCollegeId(String userId) {
        return userRepo.findById(userId)
                .map(u -> u.getCollege().getId())
                .orElseThrow(() -> new RuntimeException("User or College context not found"));
    }

    // --- POST READ METHODS ---

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getPosts(String collegeId, String query, String authorId, String currentUserId) {
        List<Post> posts = postRepo.findByCollegeIdOrderByCreatedAtDesc(collegeId);
        return posts.stream()
                .filter(p -> query == null || p.getContent().toLowerCase().contains(query.toLowerCase()))
                .filter(p -> authorId == null || p.getAuthor().getId().equals(authorId))
                .map(p -> convertToResponse(p, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByUsername(String username, String collegeId, String currentUserId) {
        return postRepo.findByAuthor_UsernameAndCollegeIdOrderByCreatedAtDesc(username, collegeId)
                .stream().map(p -> convertToResponse(p, currentUserId)).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostResponse> getPostsByFullName(String fullName, String collegeId, String currentUserId) {
        return postRepo.findByAuthor_FullNameContainingIgnoreCaseAndCollegeIdOrderByCreatedAtDesc(fullName, collegeId)
                .stream().map(p -> convertToResponse(p, currentUserId)).collect(Collectors.toList());
    }

    // --- POST WRITE METHODS ---

    @Override
    @Transactional
    public PostResponse createPost(PostRequest dto) {
        if (dto.getImages() != null && dto.getImages().size() > 5) {
            throw new RuntimeException("Validation Error: Maximum 5 images allowed.");
        }

        Post post = new Post();
        post.setContent(dto.getContent());
        post.setCollege(collegeRepo.findById(dto.getCollegeId()).orElseThrow(() -> new RuntimeException("College not found")));
        post.setAuthor(userRepo.findById(dto.getAuthorId()).orElseThrow(() -> new RuntimeException("Author not found")));
        post.setCreatedAt(LocalDateTime.now());
        post.setCommentsDisabled(false);
        post.setLikesCount(0);

        try {
            post.setImageUrls(mapper.writeValueAsString(dto.getImages() != null ? dto.getImages() : new ArrayList<>()));
            post.setDocumentUrls(mapper.writeValueAsString(dto.getDocuments() != null ? dto.getDocuments() : new ArrayList<>()));
        } catch (Exception e) {
            post.setImageUrls("[]");
            post.setDocumentUrls("[]");
        }
        
        return convertToResponse(postRepo.save(post), dto.getAuthorId());
    }

    @Override
    @Transactional
    public void deletePost(String postId, String userId, String role) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        if (isAuthorized(post, userId, role)) {
            cleanupPostFiles(post);
            postRepo.delete(post);
        } else {
            throw new RuntimeException("Unauthorized: You cannot delete this post.");
        }
    }

    // --- LIKE & COMMENT METHODS ---

    @Override
    @Transactional
    public void toggleLike(String postId, String userId) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        if (!post.getCollege().getId().equals(user.getCollege().getId())) {
            throw new RuntimeException("Restriction: You can only like posts within your college.");
        }

        PostLikeId likeId = new PostLikeId(postId, userId);
        if (likeRepo.existsById(likeId)) {
            likeRepo.deleteById(likeId);
        } else {
            likeRepo.save(new PostLike(likeId, post, user));
        }
        post.setLikesCount((int) likeRepo.countByPostId(postId));
        postRepo.save(post);
    }

    @Override
    @Transactional
    public void addComment(String postId, CommentRequest dto) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepo.findById(dto.getUser().getId()).orElseThrow(() -> new RuntimeException("User not found"));

        // RULE: Students only get 1 top-level comment
        if (User.Role.STUDENT.equals(user.getRole())) {
            if (commentRepo.existsByPostIdAndUserIdAndParentCommentIsNull(postId, user.getId())) {
                throw new RuntimeException("You already have a thread. Please reply to your existing comment.");
            }
        }

        PostComment comment = new PostComment();
        comment.setPost(post);
        comment.setText(dto.getText());
        comment.setUser(user);
        comment.setCreatedAt(LocalDateTime.now());
        commentRepo.save(comment);

        // Update Post Table Count (+1)
        post.setCommentsCount((post.getCommentsCount() == null ? 0 : post.getCommentsCount()) + 1);
        postRepo.save(post);
    }

    @Override
    @Transactional
    public void replyToComment(String postId, String commentId, CommentRequest dto) {
        PostComment parent = commentRepo.findById(commentId).orElseThrow(() -> new RuntimeException("Target comment not found"));
        User user = userRepo.findById(dto.getUser().getId()).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Find the ROOT (The very first comment of this thread)
        PostComment root = parent;
        while (root.getParentComment() != null) { root = root.getParentComment(); }
        
        String rootOwnerId = root.getUser().getId();
        boolean isStaffOrAdmin = List.of(User.Role.ADMIN, User.Role.SROTS_DEV, User.Role.CPH).contains(user.getRole());
        boolean isRootOwner = rootOwnerId.equals(user.getId());

        // RULE: Only Staff or the person who started the thread can participate
        if (!isStaffOrAdmin && !isRootOwner) {
            throw new RuntimeException("Unauthorized: This is a private conversation between the author and staff.");
        }

        PostComment reply = new PostComment();
        reply.setPost(parent.getPost());
        reply.setParentComment(parent);
        reply.setText(dto.getText());
        reply.setUser(user);
        reply.setCreatedAt(LocalDateTime.now());
        commentRepo.save(reply);
    }

    @Override
    @Transactional
    public void deleteComment(String commentId, String userId, String role) {
        PostComment comment = commentRepo.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        Post post = comment.getPost();

        boolean isGlobalAdmin = List.of("ADMIN", "SROTS_DEV").contains(role);
        boolean isCPH = "CPH".equals(role) && post.getCollege().getId().equals(getUserCollegeId(userId));
        boolean isOwner = comment.getUser().getId().equals(userId);
        boolean isPostAuthor = post.getAuthor().getId().equals(userId);

        if (isGlobalAdmin || isCPH || isOwner || isPostAuthor) {
            boolean wasTopLevel = (comment.getParentComment() == null);
            commentRepo.delete(comment);

            // Decrement Count (-1) only if the Main Comment was deleted
            if (wasTopLevel) {
                post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
                postRepo.save(post);
            }
        } else {
            throw new RuntimeException("Unauthorized to delete.");
        }
    }

    @Override
    @Transactional
    public void toggleComments(String postId, String userId, String role) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        if (!isAuthorized(post, userId, role)) throw new RuntimeException("Access denied.");
        post.setCommentsDisabled(!post.getCommentsDisabled());
        postRepo.save(post);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByPost(String postId) {
        return commentRepo.findByPostIdAndParentCommentIsNullOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::convertComment)
                .collect(Collectors.toList());
    }

    private CommentResponse convertComment(PostComment c) {
        CommentResponse res = new CommentResponse();
        res.setId(c.getId());
        res.setUserId(c.getUser().getId());
        res.setUser(c.getUser().getFullName());
        res.setRole(c.getUser().getRole().name());
        res.setText(c.getText());
        res.setDate(c.getCreatedAt().toString());
        res.setParentId(c.getParentComment() != null ? c.getParentComment().getId() : null);
        
        // Recursive mapping for child replies
        if (c.getReplies() != null) {
            res.setReplies(c.getReplies().stream()
                .map(this::convertComment)
                .collect(Collectors.toList()));
        }
        return res;
    }

    // --- MAPPERS & UTILS ---

    private void cleanupPostFiles(Post post) {
        try {
            if (post.getImageUrls() != null && !post.getImageUrls().equals("[]")) {
                List<String> images = mapper.readValue(post.getImageUrls(), new TypeReference<List<String>>(){});
                images.forEach(fileService::deleteFile);
            }
            if (post.getDocumentUrls() != null && !post.getDocumentUrls().equals("[]")) {
                List<Map<String, Object>> docs = mapper.readValue(post.getDocumentUrls(), new TypeReference<List<Map<String, Object>>>(){});
                for (Map<String, Object> doc : docs) {
                    if (doc.get("url") != null) fileService.deleteFile((String) doc.get("url"));
                }
            }
        } catch (Exception e) {
            System.err.println("Cleanup failed: " + e.getMessage());
        }
    }

    private PostResponse convertToResponse(Post p, String currentUserId) {
        PostResponse res = new PostResponse();
        res.setId(p.getId());
        res.setContent(p.getContent());
        res.setLikes(p.getLikesCount() != null ? p.getLikesCount() : 0);
        res.setCommentsDisabled(p.getCommentsDisabled() != null && p.getCommentsDisabled());
        res.setCollegeId(p.getCollege().getId());

        if (p.getAuthor() != null) {
            res.setAuthorId(p.getAuthor().getId());
            res.setAuthorName(p.getAuthor().getFullName());
            res.setAuthorRole(p.getAuthor().getRole().name());
        }

        res.setCreatedAt(p.getCreatedAt().toString());

        if (currentUserId != null) {
            res.setIsLikedByMe(likeRepo.existsByIdPostIdAndIdUserId(p.getId(), currentUserId));
            res.setLikedBy(likeRepo.findUserIdsByPostId(p.getId()));
        }

        try {
            res.setImages(mapper.readValue(p.getImageUrls(), new TypeReference<List<String>>(){}));
            res.setDocuments(mapper.readValue(p.getDocumentUrls(), new TypeReference<List<Map<String, Object>>>(){}));
        } catch (Exception e) {
            res.setImages(new ArrayList<>());
            res.setDocuments(new ArrayList<>());
        }

        List<PostComment> topComments = commentRepo.findByPostIdAndParentCommentIsNullOrderByCreatedAtAsc(p.getId());
        res.setComments(topComments.stream().map(this::convertComment).collect(Collectors.toList()));
        
        return res;
    }

//    private CommentResponse convertComment(PostComment c) {
//        CommentResponse res = new CommentResponse();
//        res.setId(c.getId());
//        res.setUserId(c.getUser().getId());
//        res.setUser(c.getUser().getFullName());
//        res.setRole(c.getUser().getRole().name());
//        res.setText(c.getText());
//        res.setDate(c.getCreatedAt().toString());
//        
//        List<PostComment> replies = commentRepo.findByParentCommentId(c.getId());
//        res.setReplies(replies.stream().map(this::convertComment).collect(Collectors.toList()));
//        
//        return res;
//    }

    @Override @Transactional(readOnly = true) public long getLikeCount(String postId) { return postRepo.findById(postId).map(Post::getLikesCount).orElse(0); }
    @Override @Transactional(readOnly = true) public long getCommentCount(String postId) { return commentRepo.countByPostIdAndParentCommentIsNull(postId); }
}