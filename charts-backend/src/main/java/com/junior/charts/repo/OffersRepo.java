package com.junior.charts.repo;
import com.junior.charts.entity.Offers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface OffersRepo extends JpaRepository<Offers, Long>{

    @Query(value = """
            SELECT * FROM job_offers WHERE scraped_at >= NOW() - INTERVAL '1 month' ORDER BY scraped_at DESC;
            """,nativeQuery = true)
    List<Offers> getAlloffersFromTheLastMonth();

    @Query(value = """
            SELECT location, COUNT(*) as liczba_ofert FROM job_offers GROUP BY location, ORDER BY liczba_ofert DESC;
            """,nativeQuery = true)
    Optional<Offers> getOffersGroupedByLocation();


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
            """)
    List<Offers> findOffersFromMonthBeforeDate(@Param("date") Date date);
}
