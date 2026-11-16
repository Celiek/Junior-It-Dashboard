package com.junior.charts.controller;

import com.junior.charts.dto.*;
import com.junior.charts.dto.TechDTO.TechComboDTO;
import com.junior.charts.dto.TechDTO.TechCompanionDTO;
import com.junior.charts.dto.offer.JobSummaryDTO;
import com.junior.charts.dto.offer.OfferSummaryDTO;
import com.junior.charts.service.OfferService;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@Validated
public class OffersController {
    private final OfferService service;

    private static final int MAX_PAGE_SIZE = 100;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "title",
            "company",
            "location",
            "scraped_at"
    );

    @GetMapping("/countOffersByLocation")
    public ResponseEntity<List<OffersByLocationDTO>> countOffersByLocation() {
        return ResponseEntity.ok(service.countOffersByLocation());
    }

    @GetMapping("/findOffersBetweenDates")
    public ResponseEntity<List<OfferDto>> findOffersBetweenDates
            (@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
             @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate stopDate){

        if (startDate.isAfter(stopDate)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "startDate cannot be after stopDate"
            );
        }

        return ResponseEntity.ok(service.findOffersBeetweenDates(startDate,stopDate));
    }

    @GetMapping("/findOffersWithContract")
    public ResponseEntity<List<OfferWithContractDTO>> findOffersWithContract(){
        return ResponseEntity.ok(service.findOffersWithContract());
    }

    @GetMapping("/averageSalaryByMonth")
    public ResponseEntity<List<AverageSalaryByMonthAndContractProjection>> getAverageSalaryByMonth(){
        return ResponseEntity.ok(service.getAverageSalaryByMonth());
    }

    @GetMapping("/popularTechnologies")
    public ResponseEntity<List<PopularTechnologyProjection>> findMostPopularTechnologies(){
        return ResponseEntity.ok(service.findMostPopularTechnologies());
    }

    @GetMapping("/countOffersByCategory")
    public ResponseEntity<List<OffersByCategoryProjection>> countOffersByCategory(){
        return ResponseEntity.ok(service.countOffersByCategory());
    }

    @GetMapping("/countCompanyOffers")
    public ResponseEntity<List<CompanyOffersDTO>> countCompanyOffers(){
        return ResponseEntity.ok(service.countCompanyOffers());
    }

    @GetMapping("/overview")
    public OfferOverwievDTO getOfferOverwiev(){
        return service.getOfferOverview();
    }

    @GetMapping("/offersAmountByCompanyAndLocation")
    public Map<String, Map<String, Long>> getOffersByCompanyAndLocation(){
        return service.getOffersByCompanyAndLocation();
    }

    @GetMapping("/latestJobAdvertisement")
    public List<JobSummaryDTO> companyLatestJobAdvertisement(@RequestParam
                                                             @NotBlank
                                                             @Size(max = 200)
                                                             String companyName){
        return service.companyLatestJobAdvertisement(companyName);
    }

    @GetMapping("/amountOfjobAdvertisements")
    public Long amountOfJobAdvertisementsThisYear(
            @RequestParam
            @NotBlank
            @Size(max = 200)
            String companyName,

            @RequestParam
            @Min(2000)
            @Max(2100)
            int year
    ) {
        return service.amountOfJobAdvertisementsThisYear(companyName, year);
    }

    @GetMapping("/jobAdvertisementSources")
    public List<Object[]> amountOfJobAdvertisementSources(
            @RequestParam
            @NotBlank
            @Size(max = 200)
            String companyName,

            @RequestParam
            @Min(2000)
            @Max(2100)
            int year
    ) {
        return service.amountOfJobAdvertisementSources(companyName, year);
    }

    @GetMapping("/jobOffersByCategory")
    public List<Object[]> countJobOffersByCategoryAndCompany(
            @RequestParam
            @NotBlank
            @Size(max = 200)
            String companyName
    ) {
        return service.countJobOffersByCategoryAndCompany(companyName);
    }

    @GetMapping("/relistedoffers")
    public List<Object[]> findMonthlyNewAndReslistedOffers(
            @RequestParam
            @NotBlank
            @Size(max = 200)
            String companyName
    ) {
        return service.findMonthlyNewAndRelistedoffers(companyName);
    }

    // =========================================================
    // LISTA OFERT FIRMY
    // =========================================================

    @GetMapping("/companyOfferList")
    public Page<OfferSummaryDTO> companyOfferList(
            @RequestParam
            @NotBlank
            @Size(max = 200)
            String companyName,

            Pageable pageable
    ) {
        validatePageable(pageable);

        return service.companyOfferList(companyName, pageable);
    }

    @GetMapping("/companies")
    public List<String> findAllDistinctComapnies() {
        return service.findAllDistinctComapnies();
    }

    @GetMapping("/offersForCompanyOnDate")
    public List<Object[]> findAllOffersForCompanyOnDate(
            @RequestParam
            @NotBlank
            @Size(max = 200)
            String companyName,

            @RequestParam
            @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$")
            String yearMonth
    ) {
        return service.findAllOffersForCompanyOnDate(
                companyName,
                yearMonth
        );
    }

    // =========================================================
    // WYNAGRODZENIA
    // =========================================================

    @GetMapping("/offerWithoutSalary")
    public Long countOffersWithoutSalaryByCompany(
            @RequestParam
            @NotBlank
            @Size(max = 200)
            String companyName
    ) {
        return service.countOffersWithoutSalaryByCompany(companyName);
    }

    @GetMapping("/averageMonthlySalaryByCompany")
    public List<Object[]> getMonthlySalaryTrendByCompany(
            @RequestParam
            @NotBlank
            @Size(max = 200)
            String companyName
    ) {
        return service.getMonthlySalaryTrendByCompany(companyName);
    }

    @GetMapping("/averageCompanySalaryOnAverageSalary")
    public List<Object[]> compareCompanySalaryWithMarketWithoutCount(
            @RequestParam
            @NotBlank
            @Size(max = 200)
            String companyName
    ) {
        return service.compareCompanySalaryWithMarketWithoutCount(companyName);
    }

    @GetMapping("/mostPopularTechnologiesByCompany")
    public List<Object[]> mostPopularTechnologiesInOffersByCompany(
            @RequestParam
            @NotBlank
            @Size(max = 200)
            String companyName
    ) {
        return service.mostPopularTechnologiesInOffersByCompany(companyName);
    }

    @GetMapping("/locationDistributionByCompany")
    public List<Object[]> getLocationDistributionByCompany(
            @RequestParam
            @NotBlank
            @Size(max = 200)
            String companyName
    ) {
        return service.getLocationDistributionByCompany(companyName);
    }

    @GetMapping("/getAllTechnologies")
    public List<TechComboDTO> getTopTechnologyCombinations(
                                                        @RequestParam
                                                        @Min(2)
                                                        @Max(10)
                                                        int combinationSize,

                                                        @RequestParam
                                                        @Min(1)
                                                        @Max(100)
                                                        int limit) {
        return service.getTopTechnologyCombinations(
                combinationSize,
                limit
        );
    }

    @GetMapping("/topTechnoForTechnology")
    public List<TechCompanionDTO> getTopCompanionsForTechnology(
            @RequestParam
            @NotBlank
            @Size(max = 100)
            String targetTech,

            @RequestParam(defaultValue = "10")
            @Min(1)
            @Max(100)
            int limit
    ) {
        return service.getTopCompanionsForTechnology(targetTech, limit);
    }

    // =========================================================
    // WALIDACJA PAGINACJI I SORTOWANIA
    // =========================================================

    private void validatePageable(Pageable pageable) {

        if (pageable.getPageSize() > MAX_PAGE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Maximum page size is " + MAX_PAGE_SIZE
            );
        }

        for (Sort.Order order : pageable.getSort()) {

            if (!ALLOWED_SORT_FIELDS.contains(order.getProperty())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unsupported sort field: " + order.getProperty()
                );
            }
        }
    }
}