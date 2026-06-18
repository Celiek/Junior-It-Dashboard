package com.junior.charts.dto;

import java.time.LocalDateTime;

public interface AverageSalarySingleByMonthProjection {

    LocalDateTime getMonth();
    Double getAverageSalary();
    Long getOffersCount();
}
