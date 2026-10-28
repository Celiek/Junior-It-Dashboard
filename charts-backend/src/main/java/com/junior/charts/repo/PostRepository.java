package com.junior.charts.repo;

import com.junior.charts.dto.CreatePostRequest;
import com.junior.charts.entity.Post;
import com.junior.charts.entity.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {


    Optional<Post> findBySlugAndStatus(String slug, PostStatus status);

    Page<Post> findAllByStatus(PostStatus status, Pageable pageable);

    boolean existsBySlug(String slug);
}
