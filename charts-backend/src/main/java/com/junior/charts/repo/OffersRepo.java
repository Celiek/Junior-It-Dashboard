package com.junior.charts.repo;

import com.junior.charts.dto.AverageSalaryByMonthProjection;
import com.junior.charts.dto.OfferWithContractDTO;
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
// lista najpopularniejszych technologii DONE
// oferty podzielone na kategorie ( może)
// średnie zarobki dla :
// miesięcy DONE
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

    @Query("""
            SELECT new com.junior.charts.dto.OfferWithContractDTO(
            o.id,
            o.title,
            o.company,
            o.location,
            o.salary_min,
            o.salary_max,
            c.id,
            c.contract_type,
            c.salary_min,
            c.salary_max,
            c.salary_currency,
            c.salary_grossness,
            c.salary_period)
            FROM Offers o
            JOIN o.umowy c
            where c.salary_min is not null
            ORDER BY o.id DESC
            """)
    List<OfferWithContractDTO> findOffersWithContract();

    @Query(value = """
             WITH deduplicated_offers AS (
            SELECT DISTINCT ON (jo.offer_url)
                jo.id,
                jo.offer_url,
                jo.scraped_at
            FROM job_offers jo
            WHERE jo.offer_url IS NOT NULL
            ORDER BY jo.offer_url, jo.scraped_at DESC
        )
        SELECT
            DATE_TRUNC('month', jo.scraped_at) AS month,
            AVG((joc.salary_min + joc.salary_max) / 2.0) AS averageSalary,
            COUNT(*) AS offersCount
        FROM deduplicated_offers jo
        JOIN job_offer_contracts joc
          ON jo.id = joc.job_offer_id
        WHERE joc.salary_min IS NOT NULL
          AND joc.salary_max IS NOT NULL
        GROUP BY DATE_TRUNC('month', jo.scraped_at)
        ORDER BY month DESC
           """,nativeQuery = true)
    List<AverageSalaryByMonthProjection> getAverageSalaryByMonth();
}
