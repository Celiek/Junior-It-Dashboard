package com.junior.charts.service;

import com.junior.charts.dto.OffersByLocationDTO;
import com.junior.charts.dto.PopularTechnologyProjection;
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

    public List<Offers> findOffersBeetweenDates(LocalDate startDate,
                                                LocalDate stopDate){
        LocalDateTime start = startDate.atStartOfDay();

        LocalDateTime stop = stopDate
                .plusDays(1)
                .atStartOfDay();

        System.out.println("START = " + startDate);
        System.out.println("STOP = " + stop);

        System.out.println("liczba ofert = " + repo.count());

        return repo.findOffersBeetweenDates(start,stop);
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

}
