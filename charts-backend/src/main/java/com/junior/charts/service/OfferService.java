package com.junior.charts.service;

import com.junior.charts.DTO.OffersByLocationDTO;
import com.junior.charts.DTO.PopularTechnologyDTO;
import com.junior.charts.entity.Offers;
import com.junior.charts.repo.OffersRepo;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class OfferService {
    public static OffersRepo repo;

    public List<OffersByLocationDTO> countOffersByLocation(){
        return repo.countOffersByLocation();
    }

    public List<Offers> findAllFromLastMonth(){
        return repo.findAllFromLastMonth();
    }

    public List<Offers> findOffersBeetweenDates(Date startDate,
                                                Date stopDate){
        return repo.findOffersBeetweenDates(startDate,stopDate);
    }

    public List<Offers> findOffersFromMonthBeforeDate(Date date){
        return repo.findOffersFromMonthBeforeDate(date);
    }

    public List<PopularTechnologyDTO> findMostPopularTechnologies(){
        return repo.findMostPopularTechnologies();
    }

}
