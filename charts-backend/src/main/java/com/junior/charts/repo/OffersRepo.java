package com.junior.charts.repo;

import com.junior.charts.dto.*;
import com.junior.charts.dto.offer.JobSummaryDTO;
import com.junior.charts.dto.offer.OfferSummaryDTO;
import com.junior.charts.entity.Offers;
import com.junior.charts.projection.CompanyLocationProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

// TODO
// wszystkie oferty z ostatniego miesiąca DONE
// oferty policzone ze wszystkich regionów DONEv2
// oferty z danego przedziału czasowego DONE
// lista najpopularniejszych technologii DONE
// oferty podzielone na kategorie DONE
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
                  WHEN LOWER(o.location) LIKE '%krakow%' THEN 'Kraków'
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
                  WHEN LOWER(o.location) LIKE '%Nie podano%' OR LOWER(o.location) LIKE '%zdalna%' THEN 'Zdalna'
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
                  WHEN LOWER(o.location) LIKE '%krakow%' THEN 'Kraków'
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
                  WHEN LOWER(o.location) LIKE '%Nie podano%' OR LOWER(o.location) LIKE '%zdalna%' THEN 'Zdalna'
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
            SELECT
                LOWER(TRIM(t)) AS technology,
                COUNT(*) AS count
            FROM job_offers
            CROSS JOIN unnest(technologies) AS t
            WHERE technologies IS NOT NULL
              AND t IS NOT NULL
              AND TRIM(t) <> ''
            GROUP BY LOWER(TRIM(t))
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
            WITH salary_per_offer_and_contract AS (
             SELECT
                 jo.id AS offer_id,
                 jo.scraped_at,
                 joc.contract_type,

                 AVG(
                     (joc.salary_min + joc.salary_max) / 2.0
                 ) AS offer_avg_salary

             FROM job_offers jo

             INNER JOIN job_offer_contracts joc
                 ON joc.job_offer_id = jo.id

             WHERE joc.salary_min IS NOT NULL
               AND joc.salary_max IS NOT NULL
               AND joc.contract_type IS NOT NULL
               AND TRIM(joc.contract_type) <> ''

             GROUP BY
                 jo.id,
                 jo.scraped_at,
                 joc.contract_type
         )

         SELECT
             DATE_TRUNC('month', scraped_at) AS month,

             contract_type AS "contractType",

             AVG(offer_avg_salary) AS "averageSalary",

             COUNT(*) AS "offersCount"

         FROM salary_per_offer_and_contract

         GROUP BY
             DATE_TRUNC('month', scraped_at),
             contract_type

         ORDER BY
             month DESC,
             contract_type ASC;
           """,nativeQuery = true)
    List<AverageSalaryByMonthAndContractProjection> getAverageSalaryByMonth();

    //do poprawy, specjalizacja jest zapisywana w bazie danych
    @Query(value = """
        Select category,
            count(*) AS count
            From job_offers
            Group BY category
        Order By count DESC;
    """, nativeQuery = true)
    List<OffersByCategoryProjection> countOffersByCategory();

    //pokazuje ile ofert wystawiłą dana firma w ogóle
    @Query(value= """
            SELECT new com.junior.charts.dto.CompanyOffersDTO(
               j.company,
               COUNT(j) )
           FROM Offers j
           WHERE j.company IS NOT NULL
             AND j.company <> ''
           GROUP BY j.company
           HAVING COUNT(j) > 5
           ORDER BY COUNT(j) DESC
           """
            )
    List<CompanyOffersDTO> countCompanyOffers();

    @Query(value = "Select Count(*) from job_offers", nativeQuery = true)
    Long countOffers();

    // zwraca liczbę źródeł z których pobierane są oferty
    // narazie 2 pracuj.pl i justjoin.it
    @Query(value="Select Count(Distinct Source) as liczba_zrodel from job_offers ", nativeQuery = true)
    Long amountOfsources();

    //zwraca listę żródeł wraz z liczbą ofert dla danego źródła
    @Query(value ="Select source AS zrodlo, Count(*) as offerAmount from job_offers group by source Order BY offerAmount", nativeQuery = true)
    List<SourcesListsDTO> listOfSources();

    @Query(value = """
            SELECT
               company AS "nazwaFirmy",
               location AS "miejsce",
               COUNT(*) AS "liczbaOfert"
           FROM job_offers
           WHERE company IS NOT NULL AND company <> ''
           GROUP BY company, location
           HAVING COUNT(*) > 5
           ORDER BY company ASC, COUNT(*) DESC
            """,nativeQuery = true)
    List<CompanyLocationProjection> findOffersByCompanyAndLocation();

    @Query(value = """
            select new com.junior.charts.dto.offer.JobSummaryDTO(
                        j.title, j.company, j.location, j.requirements, j.offer_url, j.source, j.scraped_at, j.category)
            from Offers j
            where 
                j.company like :companyName
            order by 
                j.scraped_at desc
            limit 10
            """)
    List<JobSummaryDTO> companyLatestJobAdvertisements(@Param("companyName") String companyName);

    @Query(value = """
            SELECT 
                count(j) 
            FROM
                Offers j 
            WHERE 
                j.company LIKE :companyName
            AND 
                YEAR(j.scraped_at) = :year
            """)
    Long amountOfJobAdvertisementsThisYear(@Param("companyName") String companyName,
                                           @Param("year") int year);


    @Query(value = """
            SELECT
                 j.source,
                 COUNT(j)
             FROM
                 Offers j
             WHERE
                 j.company LIKE :companyName
             AND
                 YEAR(j.scraped_at) = :year
             GROUP BY
                 j.source
            """)
    List<Object[]> amountOfJobAdvertisementSources(@Param("companyName")String companyName,
                                                                 @Param("year")int year);

    @Query(value = """
            SELECT
                j.category,
                COUNT(j)
            FROM 
                Offers j
            WHERE 
                j.company LIKE :companyName
            GROUP BY 
                category 
            """)
    List<Object[]> countJobOffersByCategoryAndCompany(@Param("companyName")String companyName);


    //zwraca array w którym w zależności od miesiąca można zoabczyć ilość
    //ofert nowych jak i ponownie wystawionych (nie duplikatów tylko ponownych wystawień ofert
    // w ciągu danych
    @Query(value = """
        WITH offer_first_seen AS (
            SELECT 
                company,
                MD5(LOWER(REPLACE(REPLACE(REPLACE(COALESCE(description, '') || COALESCE(requirements, ''), ' ', ''), E'\n', ''), E'\r', ''))) AS offer_hash,
                MIN(scraped_at) AS first_seen_at
            FROM job_offers
            WHERE company = :companyName
              AND description IS NOT NULL AND TRIM(description) <> '' 
              AND LOWER(TRIM(description)) NOT IN ('brak opisu', 'brak', '-')
              AND requirements IS NOT NULL AND TRIM(requirements) <> ''
            GROUP BY company, offer_hash
        ),
        offer_activity AS (
            SELECT 
                jo.company,
                jo.scraped_at,
                og.first_seen_at,
                CASE 
                    WHEN DATE_TRUNC('month', jo.scraped_at) = DATE_TRUNC('month', og.first_seen_at) THEN 'NEW'
                    ELSE 'RELISTED'
                END AS offer_type
            FROM job_offers jo
            JOIN offer_first_seen og 
              ON jo.company = og.company 
             AND MD5(LOWER(REPLACE(REPLACE(REPLACE(COALESCE(jo.description, '') || COALESCE(jo.requirements, ''), ' ', ''), E'\n', ''), E'\r', ''))) = og.offer_hash
            WHERE jo.company = :companyName
              AND jo.description IS NOT NULL AND TRIM(jo.description) <> '' 
              AND LOWER(TRIM(description)) NOT IN ('brak opisu', 'brak', '-')
        )
        SELECT 
            TO_CHAR(scraped_at, 'YYYY-MM') AS month,
            COUNT(CASE WHEN offer_type = 'NEW' THEN 1 END) AS brand_new_offers,   
            COUNT(CASE WHEN offer_type = 'RELISTED' THEN 1 END) AS relisted_offers, 
            COUNT(*) AS total_scraped_records                                      
        FROM offer_activity
        GROUP BY TO_CHAR(scraped_at, 'YYYY-MM')
        ORDER BY month ASC;
""", nativeQuery = true)
    List<Object[]> findMonthlyNewAndRelistedOffers(@Param("companyName") String companyName);

    @Query(value="""
            SELECT NEW com.junior.charts.dto.offer.OfferSummaryDTO(
                j.title,
                j.location,
                j.technology,
                j.description,
                j.offer_url,
                j.scraped_at
            )
            FROM Offers j 
            Where j.company = :companyName 
            AND 
                j.description is not null
            AND
                TRIM(j.description) <> ''
            AND LOWER(TRIM(j.description)) NOT IN ('brak opisu', 'brak')
            ORDER BY j.scraped_at DESC
        """)
    Page<OfferSummaryDTO> companyOfferList(@Param("companyName")String companyName, Pageable pageable);


    @Query("SELECT DISTINCT o.company FROM Offers o WHERE o.company IS NOT NULL ORDER BY o.company ASC")
    List<String> findAllDistinctComapnies();

    @Query(value = """
            select\s
            	title,
            	location,\s
            	technologies,
            	description,\s
            	offer_url,
            	scraped_at
            from\s
            	job_offers
            where\s
            	TO_CHAR(scraped_at, 'YYYY-MM') = :yearMonth
            and
            	company = :companyName;
            """,nativeQuery = true)
    List<Object[]> findAllOffersForCompanyOnDate(@Param("companyName") String companyName, @Param("yearMonth") String yearMonth);

    @Query(value = """
            SELECT COUNT(DISTINCT jo.id)\s
                FROM job_offers jo
                WHERE jo.company = :companyName
                  -- Warunki na poprawny opis
                  AND jo.description IS NOT NULL\s
                  AND TRIM(jo.description) <> ''\s
                  AND LOWER(TRIM(jo.description)) NOT IN ('brak opisu', 'brak', '-')
                  -- Warunek na brak widełek w tabeli kontraktów
                  AND NOT EXISTS (
                      SELECT 1\s
                      FROM job_offer_contracts joc\s
                      WHERE joc.job_offer_id = jo.id\s
                        AND (joc.salary_min IS NOT NULL OR joc.salary_max IS NOT NULL)
                  )
            """,nativeQuery = true)
    Long countOffersWithoutSalaryByCompany(@Param("companyName")String companyName);

    @Query(value = """
    WITH months AS (
        SELECT TO_CHAR(d, 'YYYY-MM') AS month
        FROM GENERATE_SERIES(
            DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months',
            DATE_TRUNC('month', CURRENT_DATE),
            INTERVAL '1 month'
        ) d
    ),
    filtered_offers AS (
        SELECT 
            jo.scraped_at,
            joc.salary_min,
            joc.salary_max,
            joc.id AS contract_id
        FROM job_offers jo
        JOIN job_offer_contracts joc ON jo.id = joc.job_offer_id
        WHERE jo.company = :companyName
          AND (joc.salary_min IS NOT NULL OR joc.salary_max IS NOT NULL)
    )
    SELECT 
        m.month,
        ROUND(CAST(AVG(fo.salary_min) AS NUMERIC), 2) AS avg_salary_min,
        ROUND(CAST(AVG(fo.salary_max) AS NUMERIC), 2) AS avg_salary_max,
        COUNT(fo.contract_id) AS offers_with_salary_count
    FROM months m
    LEFT JOIN filtered_offers fo ON m.month = TO_CHAR(fo.scraped_at, 'YYYY-MM')
    GROUP BY m.month
    ORDER BY m.month ASC
    """, nativeQuery = true)
    List<Object[]> getMonthlySalaryTrendByCompany(@Param("companyName") String companyName);

    @Query(value = """
    WITH global_monthly_avg AS (
        SELECT 
            TO_CHAR(jo.scraped_at, 'YYYY-MM') AS month,
            AVG(joc.salary_min) AS global_avg_min,
            AVG(joc.salary_max) AS global_avg_max
        FROM job_offers jo
        JOIN job_offer_contracts joc ON jo.id = joc.job_offer_id
        WHERE (joc.salary_min IS NOT NULL OR joc.salary_max IS NOT NULL)
        GROUP BY TO_CHAR(jo.scraped_at, 'YYYY-MM')
    ),
    company_monthly_avg AS (
        SELECT 
            TO_CHAR(jo.scraped_at, 'YYYY-MM') AS month,
            AVG(joc.salary_min) AS company_avg_min,
            AVG(joc.salary_max) AS company_avg_max
        FROM job_offers jo
        JOIN job_offer_contracts joc ON jo.id = joc.job_offer_id
        WHERE jo.company = :companyName
          AND (joc.salary_min IS NOT NULL OR joc.salary_max IS NOT NULL)
        GROUP BY TO_CHAR(jo.scraped_at, 'YYYY-MM')
    )
    SELECT 
        g.month,
        ROUND(CAST(c.company_avg_min AS NUMERIC), 2),
        ROUND(CAST(g.global_avg_min AS NUMERIC), 2),
        ROUND(CAST(c.company_avg_max AS NUMERIC), 2),
        ROUND(CAST(g.global_avg_max AS NUMERIC), 2)
    FROM global_monthly_avg g
    LEFT JOIN company_monthly_avg c ON g.month = c.month
    WHERE g.month >= TO_CHAR(CURRENT_DATE - INTERVAL '11 months', 'YYYY-MM')
    ORDER BY g.month ASC
    """, nativeQuery = true)
    List<Object[]> compareCompanySalaryWithMarketWithoutCount(@Param("companyName") String companyName);

    @Query(value = """
            SELECT\s
                unnest(technologies) AS tech,
                COUNT(*) AS frequency
            FROM job_offers
            WHERE company =:companyName
              AND technologies IS NOT NULL
            GROUP BY 1
            ORDER BY frequency DESC
            LIMIT 5;
            """, nativeQuery = true)
    List<Object[]> mostPopularTechnologiesInOffersByCompany(@Param("companyName")String comapnyName);

    @Query(value = """
            SELECT\s
                location,
                COUNT(*) AS offer_count
            FROM job_offers
            WHERE company = :companyName
              AND location IS NOT NULL
              AND TRIM(location) <> ''
            GROUP BY location
            ORDER BY offer_count DESC;
            """, nativeQuery = true)
    List<Object[]> getLocationDistributionByCompany(@Param("companyName")String companyName);

    @Query(value = """
    SELECT technologies 
    FROM job_offers 
    WHERE technologies IS NOT NULL
    """, nativeQuery = true)
    List<String[]> findAllTechnologiesArrays();

}
