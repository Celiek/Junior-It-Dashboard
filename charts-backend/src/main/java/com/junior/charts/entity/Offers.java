package com.junior.charts.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Table(name="job_offers")
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter @Setter
public class Offers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String company;
    private String location;
    private Integer salary_min;
    private Integer salary_max;
    @ElementCollection
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "technology",columnDefinition = "text[]")
    private List<String> technology = new ArrayList<>();
    private String description;
    private String requirements;
    private String offer_url;
    @Column(name = "\"source\"")
    private String source;
    @Column(name = "scraped_at")
    private LocalDateTime scraped_at;
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> raw_json;

    @OneToMany(mappedBy = "offers", cascade = CascadeType.ALL)
    private List<Contracts> umowy = new ArrayList<>();

}
