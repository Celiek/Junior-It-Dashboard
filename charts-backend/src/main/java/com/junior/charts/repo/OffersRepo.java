package com.junior.charts.repo;

import com.junior.charts.dto.OffersByLocationDTO;
import com.junior.charts.dto.PopularTechnologyProjection;
import com.junior.charts.entity.Offers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
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
            SELECT new com.junior.charts.dto.OffersByLocationDTO(
            o.location,
            COUNT(o)
            )
            FROM Offers o 
            GROUP BY o.location
            ORDER BY COUNT(o) DESC
            """)
    List<OffersByLocationDTO> countOffersByLocation();

    @Query(value = """
              SELECT *
               FROM job_offers
               WHERE scraped_at >= :startDate
                 AND scraped_at < :stopDate
               ORDER BY scraped_at DESC
            """, nativeQuery = true)
    List<Offers> findOffersBeetweenDates(@Param("startDate") LocalDateTime startDate,
                                         @Param("stopDate") LocalDateTime stopDate);

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

    @Query(value = """
            SELECT
               LOWER(TRIM(t)) AS technology,
               COUNT(*) AS count
           FROM job_offers jo
           CROSS JOIN unnest(jo.technologies) AS t
           WHERE t IS NOT NULL
             AND TRIM(t) <> ''
           GROUP BY LOWER(TRIM(t))
           ORDER BY count DESC
            """,nativeQuery = true)
    List<PopularTechnologyProjection> findMostPopularTechnologies();
}
