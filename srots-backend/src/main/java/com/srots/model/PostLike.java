// 17. PostLike.java + PostLikeId.java
package com.srots.model;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "post_likes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostLike {

    @EmbeddedId
    private PostLikeId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("postId") // References 'postId' in PostLikeId
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId") // References 'userId' in PostLikeId
    @JoinColumn(name = "user_id")
    private User user;

	public PostLike() {
		super();
		// TODO Auto-generated constructor stub
	}

	public PostLike(PostLikeId id, Post post, User user) {
		super();
		this.id = id;
		this.post = post;
		this.user = user;
	}

	public PostLikeId getId() {
		return id;
	}

	public void setId(PostLikeId id) {
		this.id = id;
	}

	public Post getPost() {
		return post;
	}

	public void setPost(Post post) {
		this.post = post;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}
    
    
}