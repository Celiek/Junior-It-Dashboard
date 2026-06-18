package com.junior.charts.dto;

import java.time.LocalDateTime;

public interface AverageSalaryByMonthProjection {
    LocalDateTime getMonth();
    Double getAverageSalary();
    Long getOffersCount();
}
