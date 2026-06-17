package com.junior.charts.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter
public class OfferDto {
    private Long id;
    private String title;
    private String company;
    private String location;
    private Integer salaryMin;
    private Integer salaryMax;
    private List<String> technologies;
    private String offerUrl;
    private String source;
    private LocalDateTime scrapedAt;
}
