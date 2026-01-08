package com.srots.model;

import java.io.Serializable;
import java.util.Objects;
import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Data
@NoArgsConstructor // Lombok generates the empty constructor
@AllArgsConstructor // Lombok generates the (String, String) constructor
public class PostLikeId implements Serializable {
    private String postId;
    private String userId;

    // Hibernate REQUIRES this explicit no-args constructor if Lombok fails
    public PostLikeId() {} 

    public PostLikeId(String postId, String userId) {
        this.postId = postId;
        this.userId = userId;
    }

    // Embeddable IDs MUST override equals and hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PostLikeId that = (PostLikeId) o;
        return Objects.equals(postId, that.postId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(postId, userId);
    }

    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}