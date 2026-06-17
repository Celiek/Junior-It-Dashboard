package com.junior.charts.dto;

// interfejs do mapowania wyników technologii z OffersRepo.findMostPopularTechnologies()


public interface PopularTechnologyProjection {
    String getTechnology();
    Long getCount();

}
