package com.junior.charts.entity;

import jakarta.persistence.*;

import java.util.Date;

@Entity
@Table(name="job_offer_contracts")
public class Contracts {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "job_offer_id",nullable = false)
    private Offers offers;

    private Long job_offer_id;
    private String contract_type;
    private int salary_min;
    private int salary_max;
    private String salary_currency;
    private String salary_grossness;
    private String salary_period;
    private String raw_text;
    private Date created_at;
}
