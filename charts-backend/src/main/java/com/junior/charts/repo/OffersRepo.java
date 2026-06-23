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
// oferty policzone ze wszystkich regionów DONEv2
// oferty z danego przedziału czasowego DONE
// lista najpopularniejszych technologii DONE
// oferty podzielone na kategorie ( może)
// średnie zarobki dla :
// miesięcy DONE
// * miasta
// * technologii
// najczęstsze formy zatrudnienia

public interface OffersRepo extends JpaRepository<Offers, Long>{


    @Query(value = """
            SELECT new com.junior.charts.dto.OffersByLocationDTO(
              CASE
                  WHEN LOWER(o.location) LIKE '%warszawa%' THEN 'Warszawa'
                  WHEN LOWER(o.location) LIKE '%pruszków%' THEN 'Warszawa'
                  WHEN LOWER(o.location) LIKE '%pruszkowski%' THEN 'Warszawa'
                  WHEN LOWER(o.location) LIKE '%warszawski%' THEN 'Warszawa'
                  WHEN LOWER(o.location) LIKE '% piaseczno%' THEN 'Piaseczno'
                  WHEN LOWER(o.location) LIKE '%kraków%' THEN 'Kraków'
                  WHEN LOWER(o.location) LIKE '%krakowski%' THEN 'Kraków'
                  WHEN LOWER(o.location) LIKE '%wrocław%' THEN 'Wrocław'
                  WHEN LOWER(o.location) LIKE '%poznań%' THEN 'Poznań'
                  WHEN LOWER(o.location) LIKE '%gdańsk%' THEN 'Gdańsk'
                  WHEN LOWER(o.location) LIKE '%gdynia%' THEN 'Gdynia'
                  WHEN LOWER(o.location) LIKE '%sopot%' THEN 'Sopot'
                  WHEN LOWER(o.location) LIKE '%lublin%' THEN 'Lublin'
                  WHEN LOWER(o.location) LIKE '%opole%' THEN 'Opole'
                  WHEN LOWER(o.location) LIKE '%łódź%' THEN 'Łódź'
                  WHEN LOWER(o.location) LIKE '%dąbrowa górnicza%' THEN 'Dąbrowa górnicza'
                  WHEN LOWER(o.location) LIKE '%katowice%' THEN 'Katowice'
                  WHEN LOWER(o.location) LIKE '%jelenia góra%' THEN 'Jelenia Góra'
                  WHEN LOWER(o.location) LIKE '%gliwice%' THEN 'Gliwice'
                  WHEN LOWER(o.location) LIKE '%szczecin%' THEN 'Szczecin'
                  WHEN LOWER(o.location) LIKE '%rybnik%' THEN 'Rybnik'
                  WHEN LOWER(o.location) LIKE '%racibórz%' THEN 'Racibórz'
                  WHEN LOWER(o.location) LIKE '%toruń%' THEN 'Toruń'
                  WHEN LOWER(o.location) LIKE '%rzeszów%' THEN 'Rzeszów'
                  WHEN LOWER(o.location) LIKE '%bydgoszcz%' THEN 'Bydgoszcz'
                  WHEN LOWER(o.location) LIKE '%wieliczka%' THEN 'Wieliczka'
                  WHEN LOWER(o.location) LIKE '%piotrków trybunalski%' THEN 'Piotrków Trybunalski'
                  WHEN LOWER(o.location) LIKE '%kostrzyn%' THEN 'Kostrzyn'
                  WHEN LOWER(o.location) LIKE '%andrychów%' THEN 'Andrychów'
                  WHEN LOWER(o.location) LIKE '%siemiatycze%' THEN 'Siemiatycze'
                  WHEN LOWER(o.location) LIKE '%bieruń%' THEN 'Bieruń'
                  WHEN LOWER(o.location) LIKE '%mszczonów%' THEN 'Mszczonów'
                  WHEN LOWER(o.location) LIKE '%grudziądz%' THEN 'Grudziądz'
                  WHEN LOWER(o.location) LIKE '%aleksandrów łódzki%' THEN 'Aleksandrów Łódzki'
                  WHEN LOWER(o.location) LIKE '%tychy%' THEN 'Tychy'
                  WHEN LOWER(o.location) LIKE '%zabrze%' THEN 'Zabrze'
                  WHEN LOWER(o.location) LIKE '%komorniki%' THEN 'Komorniki'
                  WHEN LOWER(o.location) LIKE '%białystok%' THEN 'Białystok'
                  WHEN LOWER(o.location) LIKE '%radom%' THEN 'Radom'
                  WHEN LOWER(o.location) LIKE '%bielsko-biała%' THEN 'Bielsko-Biała'
                  WHEN LOWER(o.location) LIKE '%skierniewice%' THEN 'Skierniewice'
                  WHEN LOWER(o.location) LIKE '%częstochowa%' THEN 'Częstochowa'
                  WHEN LOWER(o.location) LIKE '%remote%' OR LOWER(o.location) LIKE '%zdalna%' THEN 'Zdalna'
                  ELSE TRIM(o.location)
              END,
              COUNT(DISTINCT FUNCTION('split_part', o.offer_url, '?', 1))
          )
          FROM Offers o
          WHERE o.location IS NOT NULL
            AND TRIM(o.location) <> ''
            AND o.offer_url IS NOT NULL
            AND TRIM(o.offer_url) <> ''
          GROUP BY
              CASE
                  WHEN LOWER(o.location) LIKE '%warszawa%' THEN 'Warszawa'
                  WHEN LOWER(o.location) LIKE '%pruszków%' THEN 'Warszawa'
                  WHEN LOWER(o.location) LIKE '%pruszkowski%' THEN 'Warszawa'
                  WHEN LOWER(o.location) LIKE '%warszawski%' THEN 'Warszawa'
                  WHEN LOWER(o.location) LIKE '% piaseczno%' THEN 'Piaseczno'
                  WHEN LOWER(o.location) LIKE '%kraków%' THEN 'Kraków'
                  WHEN LOWER(o.location) LIKE '%krakowski%' THEN 'Kraków'
                  WHEN LOWER(o.location) LIKE '%wrocław%' THEN 'Wrocław'
                  WHEN LOWER(o.location) LIKE '%poznań%' THEN 'Poznań'
                  WHEN LOWER(o.location) LIKE '%gdańsk%' THEN 'Gdańsk'
                  WHEN LOWER(o.location) LIKE '%gdynia%' THEN 'Gdynia'
                  WHEN LOWER(o.location) LIKE '%sopot%' THEN 'Sopot'
                  WHEN LOWER(o.location) LIKE '%lublin%' THEN 'Lublin'
                  WHEN LOWER(o.location) LIKE '%opole%' THEN 'Opole'
                  WHEN LOWER(o.location) LIKE '%łódź%' THEN 'Łódź'
                  WHEN LOWER(o.location) LIKE '%dąbrowa górnicza%' THEN 'Dąbrowa górnicza'
                  WHEN LOWER(o.location) LIKE '%katowice%' THEN 'Katowice'
                  WHEN LOWER(o.location) LIKE '%jelenia góra%' THEN 'Jelenia Góra'
                  WHEN LOWER(o.location) LIKE '%gliwice%' THEN 'Gliwice'
                  WHEN LOWER(o.location) LIKE '%szczecin%' THEN 'Szczecin'
                  WHEN LOWER(o.location) LIKE '%rybnik%' THEN 'Rybnik'
                  WHEN LOWER(o.location) LIKE '%racibórz%' THEN 'Racibórz'
                  WHEN LOWER(o.location) LIKE '%toruń%' THEN 'Toruń'
                  WHEN LOWER(o.location) LIKE '%rzeszów%' THEN 'Rzeszów'
                  WHEN LOWER(o.location) LIKE '%bydgoszcz%' THEN 'Bydgoszcz'
                  WHEN LOWER(o.location) LIKE '%wieliczka%' THEN 'Wieliczka'
                  WHEN LOWER(o.location) LIKE '%piotrków trybunalski%' THEN 'Piotrków Trybunalski'
                  WHEN LOWER(o.location) LIKE '%kostrzyn%' THEN 'Kostrzyn'
                  WHEN LOWER(o.location) LIKE '%andrychów%' THEN 'Andrychów'
                  WHEN LOWER(o.location) LIKE '%siemiatycze%' THEN 'Siemiatycze'
                  WHEN LOWER(o.location) LIKE '%bieruń%' THEN 'Bieruń'
                  WHEN LOWER(o.location) LIKE '%mszczonów%' THEN 'Mszczonów'
                  WHEN LOWER(o.location) LIKE '%grudziądz%' THEN 'Grudziądz'
                  WHEN LOWER(o.location) LIKE '%aleksandrów łódzki%' THEN 'Aleksandrów Łódzki'
                  WHEN LOWER(o.location) LIKE '%tychy%' THEN 'Tychy'
                  WHEN LOWER(o.location) LIKE '%zabrze%' THEN 'Zabrze'
                  WHEN LOWER(o.location) LIKE '%komorniki%' THEN 'Komorniki'
                  WHEN LOWER(o.location) LIKE '%białystok%' THEN 'Białystok'
                  WHEN LOWER(o.location) LIKE '%radom%' THEN 'Radom'
                  WHEN LOWER(o.location) LIKE '%bielsko-biała%' THEN 'Bielsko-Biała'
                  WHEN LOWER(o.location) LIKE '%skierniewice%' THEN 'Skierniewice'
                  WHEN LOWER(o.location) LIKE '%częstochowa%' THEN 'Częstochowa'
                  WHEN LOWER(o.location) LIKE '%remote%' OR LOWER(o.location) LIKE '%zdalna%' THEN 'Zdalna'
                  ELSE TRIM(o.location)
              END
          ORDER BY COUNT(DISTINCT FUNCTION('split_part', o.offer_url, '?', 1)) DESC
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
            WITH deduplicated_offers AS (
           SELECT DISTINCT ON (split_part(jo.offer_url, '?', 1))
               jo.id,
               jo.offer_url,
               jo.technologies
           FROM job_offers jo
           WHERE jo.offer_url IS NOT NULL
             AND TRIM(jo.offer_url) <> ''
             AND jo.technologies IS NOT NULL
           ORDER BY split_part(jo.offer_url, '?', 1), jo.scraped_at DESC
       ),
       offer_technologies AS (
           SELECT DISTINCT
               split_part(offer_url, '?', 1) AS clean_offer_url,
               LOWER(TRIM(t)) AS technology
           FROM deduplicated_offers
           CROSS JOIN unnest(technologies) AS t
           WHERE t IS NOT NULL
             AND TRIM(t) <> ''
       )
       SELECT
           technology,
           COUNT(*) AS count
       FROM offer_technologies
       GROUP BY technology
       ORDER BY count DESC;
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
