package com.junior.charts.repo;

import com.junior.charts.DTO.OffersByLocationDTO;
import com.junior.charts.DTO.PopularTechnologyDTO;
import com.junior.charts.entity.Offers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;

// TODO
// wszystkie oferty z ostatniego miesiąca DONE
// oferty policzone ze wszystkich regionów DONE
// oferty z danego przedziału czasowego DONE
// lista najpopularniejszych technologii
// oferty podzielone na kategorie ( może)
// średnie zarobki dla :
// * miasta
// * technologii

public interface OffersRepo extends JpaRepository<Offers, Long>{


    @Query(value = """
            SELECT new com.junior.charts.dto.OffersByLocationDto(
            o.location,
            COUNT(o)
            )
            FROM Offers o 
            GROUP BY o.location
            ORDER COUNT(o) DESC
            """)
    List<OffersByLocationDTO> countOffersByLocation();

    @Query("""
            SELECT o from Offers o
            WHERE o.scraped_at BETWEEN :startDate AND stopDate
            ORDER BY o.scraped_at DESC
            """)
    List<Offers> findOffersBeetweenDates(@Param("startDate") Date startDate,
                                         @Param("stopDate") Date stopDate);

    @Query(value = """
        SELECT * 
        FROM job_offers 
        WHERE scraped_at >= NOW() - INTERVAL '1 month' 
        ORDER BY scraped_at DESC
        """, nativeQuery = true)
    List<Offers> findAllFromLastMonth();

    @Query(value = """
            SELECT * FROM job_offers where scraped_at >= :date - INTERVAL '1 month'
            ORDER BY scraped_at DESC;
            """,nativeQuery = true)
    List<Offers> findOffersFromMonthBeforeDate(@Param("date") Date date);

    @Query("""
            SELECT new com.junior.charts.dto.PopularTechnologyDTO(
            LOWER(TRIM(t)),
            COUNT(t))
            FROM Offers o
            JOIN o.technologies t
            WHRE t IS NOT NULL
            AND LOWER(TRIM(t))
            ORDER BY COUNT(t) DESC
            """)
    List<PopularTechnologyDTO> findMostPopularTechnologies();
}
