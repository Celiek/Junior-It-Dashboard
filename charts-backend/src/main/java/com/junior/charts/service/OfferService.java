package com.junior.charts.service;

import com.junior.charts.dto.*;
import com.junior.charts.entity.Offers;
import com.junior.charts.repo.OffersRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OfferService {
    private final OffersRepo repo;

    public List<OffersByLocationDTO> countOffersByLocation(){
        return repo.countOffersByLocation();
    }

    public List<Offers> findAllFromLastMonth(){
        return repo.findAllFromLastMonth();
    }

    public List<OfferDto> findOffersBeetweenDates(LocalDate startDate,
                                                LocalDate stopDate){
        LocalDateTime start = startDate.atStartOfDay();

        LocalDateTime stop = stopDate
                .plusDays(1)
                .atStartOfDay();

        System.out.println("START = " + startDate);
        System.out.println("STOP = " + stop);

        System.out.println("liczba ofert = " + repo.count());

        return repo.findOffersBeetweenDates(start,stop).
        stream()
                .map(o -> new OfferDto(
                        o.getId(),
                        o.getTitle(),
                        o.getCompany(),
                        o.getLocation(),
                        o.getSalary_min(),
                        o.getSalary_max(),
                        o.getTechnology(),
                        o.getOffer_url(),
                        o.getSource(),
                        o.getScraped_at()
                ))
                .toList();
    }

    public List<Offers> findOffersFromMonthBeforeDate(Date date){
        return repo.findOffersFromMonthBeforeDate(date);
    }

    public List<PopularTechnologyProjection> findMostPopularTechnologies(){
        return repo.findMostPopularTechnologies();
    }
    public void listaOfert(){
        System.out.println("liczba ofert = " + repo.count());
    }

    public List<OfferWithContractDTO> findOffersWithContract(){
        return repo.findOffersWithContract();
    }

    public List<AverageSalaryByMonthProjection> getAverageSalaryByMonth(){
        return repo.getAverageSalaryByMonth();
    }

}
