package com.junior.charts.dto.offer;

import java.time.LocalDateTime;
import java.util.List;

//DTO do zwracania ogólnych ilości ofert do overviev ofert od pracodawcy
public record JobSummaryDTO(String title, String company, String location, String requirements,
                            String offer_url, String source, LocalDateTime scraped_at, String category) {
}
