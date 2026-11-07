package com.junior.charts.dto.offer;

import java.time.LocalDateTime;
import java.util.List;

public record OfferSummaryDTO(String title, String location,
                              List<String> technology, String description,
                              String offer_url, LocalDateTime    scraped_at) {
}
