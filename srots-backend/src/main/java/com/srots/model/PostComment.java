// 16. PostComment.java
package com.srots.model;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_comments")
@Data @NoArgsConstructor @AllArgsConstructor
public class PostComment {
    @Id @GeneratedValue(strategy = GenerationType.UUID) @Column(columnDefinition = "CHAR(36)")
    private String id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "parent_comment_id")
    private PostComment parentComment;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @Column(columnDefinition = "TEXT") private String text;
    @CreationTimestamp private LocalDateTime createdAt;
    
 // Inside PostComment.java
    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostComment> replies;
    
	public PostComment() {
		super();
		// TODO Auto-generated constructor stub
	}
	
	
	
	public PostComment(String id, Post post, PostComment parentComment, User user, String text, LocalDateTime createdAt,
			List<PostComment> replies) {
		super();
		this.id = id;
		this.post = post;
		this.parentComment = parentComment;
		this.user = user;
		this.text = text;
		this.createdAt = createdAt;
		this.replies = replies;
	}


	
	

	public List<PostComment> getReplies() {
		return replies;
	}



	public void setReplies(List<PostComment> replies) {
		this.replies = replies;
	}



	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public Post getPost() {
		return post;
	}
	public void setPost(Post post) {
		this.post = post;
	}
	public PostComment getParentComment() {
		return parentComment;
	}
	public void setParentComment(PostComment parentComment) {
		this.parentComment = parentComment;
	}
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
    
    
}