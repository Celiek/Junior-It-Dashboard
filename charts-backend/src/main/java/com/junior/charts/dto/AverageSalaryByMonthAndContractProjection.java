package com.junior.charts.dto;

import java.time.LocalDateTime;

public interface AverageSalaryByMonthAndContractProjection {
    LocalDateTime getMonth();
    String getContractType();
    Double getAverageSalary();
    Long getOffersCount();
}
