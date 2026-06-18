package com.junior.charts.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@Getter
public class OfferWithContractDTO {
    private Long offerId;
    private String title;
    private String company;
    private String location;
    private Integer offerSalaryMin;
    private Integer offerSalaryMax;

    private Long contractId;
    private String contractType;
    private Integer contractSalaryMin;
    private Integer contractSalaryMax;
    private String salaryCurrency;
    private String salaryGrossness;
    private String salaryPeriod;
}
