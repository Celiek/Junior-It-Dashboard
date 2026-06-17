package com.junior.charts.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter
public class OffersByLocationDTO {
    private String location;
    private Long liczba_ofert;
}
