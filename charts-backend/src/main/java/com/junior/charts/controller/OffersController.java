package com.junior.charts.controller;

import com.junior.charts.DTO.OffersByLocationDTO;
import com.junior.charts.service.OfferService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequestMapping("/api/offers")
public class OffersController {
    private static OfferService service;

    @GetMapping("/countOffersByLocation")
    public ResponseEntity<List<OffersByLocationDTO>> countOffersByLocation() {
        return ResponseEntity.ok(service.countOffersByLocation());
    }
}
