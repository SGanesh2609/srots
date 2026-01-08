package com.srots.model;

import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "posts")
@Data 
@NoArgsConstructor 
@AllArgsConstructor
public class Post {
    @Id 
    @GeneratedValue(strategy = GenerationType.UUID) 
    @Column(columnDefinition = "CHAR(36)")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "author_id")
    private User author;

    @Column(columnDefinition = "TEXT") 
    private String content;

    @JdbcTypeCode(SqlTypes.JSON) 
    private String imageUrls;

    @JdbcTypeCode(SqlTypes.JSON) 
    private String documentUrls;

    private Integer likesCount = 0;
    private Integer commentsCount = 0;
    private Boolean commentsDisabled = false;

    @CreationTimestamp 
    private LocalDateTime createdAt;

    // Added to ensure data integrity on deletion
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostLike> likes;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostComment> comments;

	public Post() {
		super();
		// TODO Auto-generated constructor stub
	}

	

	public Post(String id, College college, User author, String content, String imageUrls, String documentUrls,
			Integer likesCount, Integer commentsCount, Boolean commentsDisabled, LocalDateTime createdAt,
			List<PostLike> likes, List<PostComment> comments) {
		super();
		this.id = id;
		this.college = college;
		this.author = author;
		this.content = content;
		this.imageUrls = imageUrls;
		this.documentUrls = documentUrls;
		this.likesCount = likesCount;
		this.commentsCount = commentsCount;
		this.commentsDisabled = commentsDisabled;
		this.createdAt = createdAt;
		this.likes = likes;
		this.comments = comments;
	}


	

	public Integer getCommentsCount() {
		return commentsCount;
	}



	public void setCommentsCount(Integer commentsCount) {
		this.commentsCount = commentsCount;
	}



	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public College getCollege() {
		return college;
	}

	public void setCollege(College college) {
		this.college = college;
	}

	public User getAuthor() {
		return author;
	}

	public void setAuthor(User author) {
		this.author = author;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getImageUrls() {
		return imageUrls;
	}

	public void setImageUrls(String imageUrls) {
		this.imageUrls = imageUrls;
	}

	public String getDocumentUrls() {
		return documentUrls;
	}

	public void setDocumentUrls(String documentUrls) {
		this.documentUrls = documentUrls;
	}

	public Integer getLikesCount() {
		return likesCount;
	}

	public void setLikesCount(Integer likesCount) {
		this.likesCount = likesCount;
	}

	public Boolean getCommentsDisabled() {
		return commentsDisabled;
	}

	public void setCommentsDisabled(Boolean commentsDisabled) {
		this.commentsDisabled = commentsDisabled;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public List<PostLike> getLikes() {
		return likes;
	}

	public void setLikes(List<PostLike> likes) {
		this.likes = likes;
	}

	public List<PostComment> getComments() {
		return comments;
	}

	public void setComments(List<PostComment> comments) {
		this.comments = comments;
	}
    
    
    
}