package com.junior.charts.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// DTO do mapowania wyników technologii z

@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter
public class PopularTechnologyDTO {
    private String technology;
    private Long count;

}
