package com.junior.charts.repo;

import com.junior.charts.dto.*;
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
                      SELECT DISTINCT ON (split_part(jo.offer_url, '?', 1))
                          jo.id,
                          split_part(jo.offer_url, '?', 1) AS clean_offer_url,
                          jo.scraped_at
                      FROM job_offers jo
                      WHERE jo.offer_url IS NOT NULL
                        AND TRIM(jo.offer_url) <> ''
                      ORDER BY split_part(jo.offer_url, '?', 1), jo.scraped_at DESC
                  ),
                  salary_per_offer_and_contract AS (
                      SELECT
                          jo.clean_offer_url,
                          jo.scraped_at,
                          joc.contract_type,
                          AVG((joc.salary_min + joc.salary_max) / 2.0) AS offer_avg_salary
                      FROM deduplicated_offers jo
                      JOIN job_offer_contracts joc
                        ON jo.id = joc.job_offer_id
                      WHERE joc.salary_min IS NOT NULL
                        AND joc.salary_max IS NOT NULL
                        AND joc.contract_type IS NOT NULL
                        AND TRIM(joc.contract_type) <> ''
                      GROUP BY
                          jo.clean_offer_url,
                          jo.scraped_at,
                          joc.contract_type
                  )
                  SELECT
                      DATE_TRUNC('month', scraped_at) AS month,
                      contract_type AS contractType,
                      AVG(offer_avg_salary) AS averageSalary,
                      COUNT(*) AS offersCount
                  FROM salary_per_offer_and_contract
                  GROUP BY
                      DATE_TRUNC('month', scraped_at),
                      contract_type
                  ORDER BY
                      month DESC,
                      contract_type ASC
           """,nativeQuery = true)
    List<AverageSalaryByMonthAndContractProjection> getAverageSalaryByMonth();

    @Query(value = """
    WITH deduplicated_offers AS (
        SELECT DISTINCT ON (split_part(jo.offer_url, '?', 1))
            jo.id,
            split_part(jo.offer_url, '?', 1) AS clean_offer_url,
            jo.title,
            jo.description,
            jo.requirements,
            jo.technologies,
            jo.scraped_at
        FROM job_offers jo
        WHERE jo.offer_url IS NOT NULL
          AND TRIM(jo.offer_url) <> ''
        ORDER BY split_part(jo.offer_url, '?', 1), jo.scraped_at DESC
    ),
    prepared_offers AS (
        SELECT
            clean_offer_url,
            LOWER(
                COALESCE(title, '') || ' ' ||
                COALESCE(description, '') || ' ' ||
                COALESCE(requirements, '') || ' ' ||
                COALESCE(array_to_string(technologies, ' '), '')
            ) AS searchable_text
        FROM deduplicated_offers
    ),
    categorized_offers AS (
        SELECT
            CASE
                WHEN searchable_text LIKE '%fullstack%'
                  OR searchable_text LIKE '%full stack%'
                  OR searchable_text LIKE '%full-stack%'
                THEN 'Fullstack'

                WHEN searchable_text LIKE '%machine learning%'
                  OR searchable_text LIKE '% ml engineer%'
                  OR searchable_text LIKE '% ai developer%'
                  OR searchable_text LIKE '% ai engineer%'
                  OR searchable_text LIKE '%artificial intelligence%'
                  OR searchable_text LIKE '%computer vision%'
                  OR searchable_text LIKE '%deep learning%'
                  OR searchable_text LIKE '%nlp%'
                  OR searchable_text LIKE '%mlops%'
                THEN 'AI / ML'

                WHEN searchable_text LIKE '%data analyst%'
                  OR searchable_text LIKE '%data analysis%'
                  OR searchable_text LIKE '%business intelligence%'
                  OR searchable_text LIKE '% bi developer%'
                  OR searchable_text LIKE '%power bi%'
                  OR searchable_text LIKE '%tableau%'
                  OR searchable_text LIKE '%data engineer%'
                  OR searchable_text LIKE '%data scientist%'
                  OR searchable_text LIKE '%data specialist%'
                  OR searchable_text LIKE '%etl%'
                  OR searchable_text LIKE '%spark%'
                  OR searchable_text LIKE '%pandas%'
                THEN 'Data / BI / Analytics'

                WHEN searchable_text LIKE '%devops%'
                  OR searchable_text LIKE '%sre%'
                  OR searchable_text LIKE '%site reliability%'
                  OR searchable_text LIKE '%cloud engineer%'
                  OR searchable_text LIKE '%cloud developer%'
                  OR searchable_text LIKE '%platform engineer%'
                  OR searchable_text LIKE '%kubernetes%'
                  OR searchable_text LIKE '%docker%'
                  OR searchable_text LIKE '%terraform%'
                  OR searchable_text LIKE '%aws%'
                  OR searchable_text LIKE '%azure%'
                  OR searchable_text LIKE '%gcp%'
                  OR searchable_text LIKE '%ci/cd%'
                THEN 'DevOps / Cloud / SRE'

                WHEN searchable_text LIKE '%frontend%'
                  OR searchable_text LIKE '%front-end%'
                  OR searchable_text LIKE '%front end%'
                  OR searchable_text LIKE '%react developer%'
                  OR searchable_text LIKE '%angular developer%'
                  OR searchable_text LIKE '%vue developer%'
                  OR searchable_text LIKE '%javascript developer%'
                  OR searchable_text LIKE '%typescript developer%'
                  OR searchable_text LIKE '%html%'
                  OR searchable_text LIKE '%css%'
                THEN 'Frontend'

                WHEN searchable_text LIKE '%backend%'
                  OR searchable_text LIKE '%back-end%'
                  OR searchable_text LIKE '%back end%'
                  OR searchable_text LIKE '%java developer%'
                  OR searchable_text LIKE '%spring developer%'
                  OR searchable_text LIKE '%spring boot%'
                  OR searchable_text LIKE '%.net developer%'
                  OR searchable_text LIKE '%c# developer%'
                  OR searchable_text LIKE '%python developer%'
                  OR searchable_text LIKE '%php developer%'
                  OR searchable_text LIKE '%node.js%'
                  OR searchable_text LIKE '%nodejs%'
                  OR searchable_text LIKE '%golang%'
                  OR searchable_text LIKE '%go developer%'
                  OR searchable_text LIKE '%hibernate%'
                THEN 'Backend'

                WHEN searchable_text LIKE '%qa%'
                  OR searchable_text LIKE '%tester%'
                  OR searchable_text LIKE '%testing%'
                  OR searchable_text LIKE '%test engineer%'
                  OR searchable_text LIKE '%test automation%'
                  OR searchable_text LIKE '%automation tester%'
                  OR searchable_text LIKE '%manual tester%'
                  OR searchable_text LIKE '%selenium%'
                  OR searchable_text LIKE '%cypress%'
                  OR searchable_text LIKE '%playwright%'
                THEN 'QA / Testing'

                WHEN searchable_text LIKE '%support%'
                  OR searchable_text LIKE '%helpdesk%'
                  OR searchable_text LIKE '%help desk%'
                  OR searchable_text LIKE '%service desk%'
                  OR searchable_text LIKE '%technical support%'
                  OR searchable_text LIKE '%it support%'
                  OR searchable_text LIKE '%customer support%'
                  OR searchable_text LIKE '%application support%'
                  OR searchable_text LIKE '%1st line%'
                  OR searchable_text LIKE '%2nd line%'
                  OR searchable_text LIKE '%first line%'
                  OR searchable_text LIKE '%second line%'
                THEN 'Support / Helpdesk'

                WHEN searchable_text LIKE '%business analyst%'
                  OR searchable_text LIKE '%system analyst%'
                  OR searchable_text LIKE '%systems analyst%'
                  OR searchable_text LIKE '%analityk biznesowy%'
                  OR searchable_text LIKE '%analityk systemowy%'
                  OR searchable_text LIKE '%it analyst%'
                  OR searchable_text LIKE '%functional analyst%'
                THEN 'Business / System Analyst'

                WHEN searchable_text LIKE '%administrator%'
                  OR searchable_text LIKE '%administator%'
                  OR searchable_text LIKE '%sysadmin%'
                  OR searchable_text LIKE '%system administrator%'
                  OR searchable_text LIKE '%linux administrator%'
                  OR searchable_text LIKE '%windows administrator%'
                  OR searchable_text LIKE '%network administrator%'
                  OR searchable_text LIKE '%network engineer%'
                  OR searchable_text LIKE '%infrastructure%'
                  OR searchable_text LIKE '%active directory%'
                  OR searchable_text LIKE '%microsoft 365%'
                  OR searchable_text LIKE '%office 365%'
                THEN 'Admin / Infrastructure'

                WHEN searchable_text LIKE '%sap%'
                  OR searchable_text LIKE '%erp%'
                  OR searchable_text LIKE '%crm%'
                  OR searchable_text LIKE '%salesforce%'
                  OR searchable_text LIKE '%dynamics%'
                  OR searchable_text LIKE '%servicenow%'
                  OR searchable_text LIKE '%consultant sap%'
                  OR searchable_text LIKE '%konsultant sap%'
                THEN 'ERP / SAP / CRM'

                WHEN searchable_text LIKE '%implementation%'
                  OR searchable_text LIKE '%wdrożeń%'
                  OR searchable_text LIKE '%wdrożeniowy%'
                  OR searchable_text LIKE '%konsultant%'
                  OR searchable_text LIKE '%consultant%'
                  OR searchable_text LIKE '%application consultant%'
                  OR searchable_text LIKE '%technical consultant%'
                THEN 'Implementation / Consultant'

                WHEN searchable_text LIKE '%security%'
                  OR searchable_text LIKE '%cybersecurity%'
                  OR searchable_text LIKE '%cyber security%'
                  OR searchable_text LIKE '%soc analyst%'
                  OR searchable_text LIKE '%penetration%'
                  OR searchable_text LIKE '%pentester%'
                  OR searchable_text LIKE '%iam%'
                  OR searchable_text LIKE '%siem%'
                  OR searchable_text LIKE '%vulnerability%'
                THEN 'Security / Cybersecurity'

                WHEN searchable_text LIKE '%project manager%'
                  OR searchable_text LIKE '%project coordinator%'
                  OR searchable_text LIKE '%product owner%'
                  OR searchable_text LIKE '%product manager%'
                  OR searchable_text LIKE '%scrum master%'
                  OR searchable_text LIKE '%pmo%'
                  OR searchable_text LIKE '%delivery manager%'
                THEN 'Project / Product / Management'

                WHEN searchable_text LIKE '%rpa%'
                  OR searchable_text LIKE '%robotic process automation%'
                  OR searchable_text LIKE '%power automate%'
                  OR searchable_text LIKE '%low code%'
                  OR searchable_text LIKE '%low-code%'
                  OR searchable_text LIKE '%no code%'
                  OR searchable_text LIKE '%no-code%'
                  OR searchable_text LIKE '%uipath%'
                THEN 'RPA / Low-code / Automation'

                WHEN searchable_text LIKE '%ux%'
                  OR searchable_text LIKE '%ui%'
                  OR searchable_text LIKE '%designer%'
                  OR searchable_text LIKE '%product designer%'
                  OR searchable_text LIKE '%figma%'
                  OR searchable_text LIKE '%grafik%'
                  OR searchable_text LIKE '%graficzka%'
                THEN 'UX / UI / Design'

                WHEN searchable_text LIKE '%android%'
                  OR searchable_text LIKE '%ios%'
                  OR searchable_text LIKE '%mobile developer%'
                  OR searchable_text LIKE '%flutter%'
                  OR searchable_text LIKE '%react native%'
                  OR searchable_text LIKE '%swift%'
                  OR searchable_text LIKE '%kotlin mobile%'
                THEN 'Mobile'

                WHEN searchable_text LIKE '%dba%'
                  OR searchable_text LIKE '%database administrator%'
                  OR searchable_text LIKE '%database developer%'
                  OR searchable_text LIKE '%sql developer%'
                  OR searchable_text LIKE '%postgresql%'
                  OR searchable_text LIKE '%oracle database%'
                THEN 'Database / DBA'

                WHEN searchable_text LIKE '%embedded%'
                  OR searchable_text LIKE '%firmware%'
                  OR searchable_text LIKE '%iot%'
                  OR searchable_text LIKE '%hardware%'
                  OR searchable_text LIKE '%plc%'
                THEN 'Embedded / Hardware / IoT'

                WHEN searchable_text LIKE '%game developer%'
                  OR searchable_text LIKE '%unity%'
                  OR searchable_text LIKE '%unreal%'
                  OR searchable_text LIKE '%technical artist%'
                THEN 'Game Dev'

                WHEN searchable_text LIKE '%it recruiter%'
                  OR searchable_text LIKE '%technical recruiter%'
                  OR searchable_text LIKE '%talent acquisition%'
                THEN 'IT Recruitment / HR'

                WHEN searchable_text LIKE '%software developer%'
                  OR searchable_text LIKE '%software engineer%'
                  OR searchable_text LIKE '%programista%'
                  OR searchable_text LIKE '%programistka%'
                  OR searchable_text LIKE '%developer%'
                  OR searchable_text LIKE '%engineer%'
                THEN 'General Software Development'

                WHEN searchable_text LIKE '%it specialist%'
                  OR searchable_text LIKE '%specjalista ds. it%'
                  OR searchable_text LIKE '%informatyk%'
                  OR searchable_text LIKE '%młodszy specjalista it%'
                  OR searchable_text LIKE '%junior it specialist%'
                THEN 'IT Specialist / General IT'

                ELSE 'Other / Niepewne'
            END AS category
        FROM prepared_offers
    )
    SELECT
        category AS category,
        COUNT(*) AS count
    FROM categorized_offers
    GROUP BY category
    ORDER BY count DESC
    """, nativeQuery = true)
    List<OffersByCategoryProjection> countOffersByCategory();
}
