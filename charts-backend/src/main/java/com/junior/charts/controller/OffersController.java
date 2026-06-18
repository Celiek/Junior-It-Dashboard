package com.junior.charts.controller;

import com.junior.charts.dto.AverageSalaryByMonthProjection;
import com.junior.charts.dto.OfferDto;
import com.junior.charts.dto.OfferWithContractDTO;
import com.junior.charts.dto.OffersByLocationDTO;
import com.junior.charts.entity.Offers;
import com.junior.charts.service.OfferService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.query.Param;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OffersController {
    private final OfferService service;

    @GetMapping("/countOffersByLocation")
    public ResponseEntity<List<OffersByLocationDTO>> countOffersByLocation() {
        return ResponseEntity.ok(service.countOffersByLocation());
    }

    @GetMapping("/findOffersBetweenDates")
    public ResponseEntity<List<OfferDto>> findOffersBetweenDates
            (@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate stopDate){
        System.out.println("Start DATE" + startDate);
        System.out.println("STOP DATE" + stopDate);
        //service.listaOfert();
        return ResponseEntity.ok(service.findOffersBeetweenDates(startDate,stopDate));
    }

    @GetMapping("/findOffersWithContract")
    public ResponseEntity<List<OfferWithContractDTO>> findOffersWithContract(){
        return ResponseEntity.ok(service.findOffersWithContract());
    }

    @GetMapping("/averageSalaryByMonth")
    public ResponseEntity<List<AverageSalaryByMonthProjection>> getAverageSalaryByMonth(){
        return ResponseEntity.ok(service.getAverageSalaryByMonth());
    }
}
