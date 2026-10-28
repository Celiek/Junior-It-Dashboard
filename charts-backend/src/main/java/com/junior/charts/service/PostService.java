package com.junior.charts.service;

import com.junior.charts.dto.CreatePostRequest;
import com.junior.charts.entity.Post;
import com.junior.charts.entity.PostStatus;
import com.junior.charts.repo.PostRepository;
import com.junior.charts.utils.SlugUtils;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class PostService {

    private final PostRepository repo;


    public PostService(PostRepository repo) {
        this.repo = repo;
    }

    private Optional<Post> findBySlugAndStatus(String slug, PostStatus status){
        return repo.findBySlugAndStatus(slug,status);
    }

    private Page<Post> findAllByStatus(PostStatus status, Pageable pageable){
        return repo.findAllByStatus(status,pageable);
    }

    private boolean existBySlug(String slug){
        return repo.existsBySlug(slug);
    }

    @Transactional
    public Long createPost(CreatePostRequest request){
        String slug = SlugUtils.toSlug(request.title());

        if(repo.existsBySlug(slug)){
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Wpis o takim  tytule już istnieje!");
        }
        Post post = new Post();
        post.setTitle(request.title());
        post.setContent(request.content());
        post.setStatus(request.status());
        post.setSlug(slug);

        if (request.status() == PostStatus.PUBLISHED) {
            post.setPublishedAt(LocalDateTime.now());
        }

        Post savedPost = repo.save(post);

        return savedPost.getId();
    }

}
