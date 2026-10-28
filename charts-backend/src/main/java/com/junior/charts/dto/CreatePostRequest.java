package com.junior.charts.dto;

import com.junior.charts.entity.PostStatus;
import jakarta.validation.constraints.NotBlank;

public record CreatePostRequest(@NotBlank String title,
                                @NotBlank String content,
                                PostStatus status) {
}
