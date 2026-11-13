package com.junior.charts.service;

import com.junior.charts.dto.*;
import com.junior.charts.dto.TechDTO.TechComboDTO;
import com.junior.charts.dto.TechDTO.TechCompanionDTO;
import com.junior.charts.dto.offer.JobSummaryDTO;
import com.junior.charts.dto.offer.OfferSummaryDTO;
import com.junior.charts.entity.Offers;
import com.junior.charts.projection.CompanyLocationProjection;
import com.junior.charts.repo.OffersRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

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

    public List<OfferDto> findOffersBeetweenDates(LocalDate startDate,
                                                LocalDate stopDate){
        LocalDateTime start = startDate.atStartOfDay();

        LocalDateTime stop = stopDate
                .plusDays(1)
                .atStartOfDay();

        System.out.println("START = " + startDate);
        System.out.println("STOP = " + stop);

        System.out.println("liczba ofert = " + repo.count());

        return repo.findOffersBeetweenDates(start,stop).
        stream()
                .map(o -> new OfferDto(
                        o.getId(),
                        o.getTitle(),
                        o.getCompany(),
                        o.getLocation(),
                        o.getSalary_min(),
                        o.getSalary_max(),
                        o.getTechnology(),
                        o.getOffer_url(),
                        o.getSource(),
                        o.getScraped_at()
                ))
                .toList();
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

    public List<OfferWithContractDTO> findOffersWithContract(){
        return repo.findOffersWithContract();
    }

    public List<AverageSalaryByMonthAndContractProjection> getAverageSalaryByMonth(){
        return repo.getAverageSalaryByMonth();
    }

    public List<OffersByCategoryProjection> countOffersByCategory(){
        return repo.countOffersByCategory();
    }

    public List<CompanyOffersDTO> countCompanyOffers(){
        return repo.countCompanyOffers();
    }

    public OfferOverwievDTO getOfferOverview() {
        Long totalOffers = repo.countOffers();
        Long amountOfSources = repo.amountOfsources();
        List<SourcesListsDTO> listOfSources = repo.listOfSources();

        return new OfferOverwievDTO(
                totalOffers,amountOfSources,listOfSources
        );
    }

    public Map<String, Map<String,Long>> getOffersByCompanyAndLocation(){
        List<CompanyLocationProjection> results =
                repo.findOffersByCompanyAndLocation();

        Map<String, Map<String, Long>> response = new LinkedHashMap<>();

        for(CompanyLocationProjection row : results){
            response
                    .computeIfAbsent(
                            row.getNazwaFirmy(),
                            key -> new LinkedHashMap<>()
                    )
                    .put(row.getMiejsce(), row.getLiczbaOfert());
        }
        return response;
    }

    //TODO:
    // dodać sprawdzanie inputów dla poniższych metod
    //
    public List<JobSummaryDTO> companyLatestJobAdvertisement(String companyName){
        return repo.companyLatestJobAdvertisements(companyName);
    }

    public Long amountOfJobAdvertisementsThisYear(String companyName, int year){
        return repo.amountOfJobAdvertisementsThisYear(companyName,year);
    }

    public List<Object[]> amountOfJobAdvertisementSources(String companyName,
                                                                        int year){
        return repo.amountOfJobAdvertisementSources(companyName,year);
    }

    public List<Object[]> countJobOffersByCategoryAndCompany(String companyName){
        return repo.countJobOffersByCategoryAndCompany(companyName);
    }

    public List<Object[]> findMonthlyNewAndRelistedoffers(String comapnyName){
        return repo.findMonthlyNewAndRelistedOffers(comapnyName);
    }

    public Page<OfferSummaryDTO> companyOfferList(String companyName, Pageable page) {
        return repo.companyOfferList(companyName, page);
    }

    public List<String> findAllDistinctComapnies(){
        return repo.findAllDistinctComapnies();
    }

    public List<Object[]> findAllOffersForCompanyOnDate(String companyName, String yearMonth){
        return repo.findAllOffersForCompanyOnDate(companyName, yearMonth);
    }

    public Long countOffersWithoutSalaryByCompany(String companyName){
        return repo.countOffersWithoutSalaryByCompany(companyName);
    }

    public List<Object[]> getMonthlySalaryTrendByCompany(String companyName){
        return repo.getMonthlySalaryTrendByCompany(companyName);
    }

    public List<Object[]> compareCompanySalaryWithMarketWithoutCount(String companyName){
        return repo.compareCompanySalaryWithMarketWithoutCount(companyName);
    }

    public List<Object[]> mostPopularTechnologiesInOffersByCompany(String companyName){
        return repo.mostPopularTechnologiesInOffersByCompany(companyName);
    }

    public List<Object[]> getLocationDistributionByCompany(String companyName){
        return repo.getLocationDistributionByCompany(companyName);
    }

    @Transactional()
    public List<TechComboDTO> getTopTechnologyCombinations(int combinationSize, int limit) {
        // 1. Pobieramy surowe tablice z bazy
        List<String[]> allRows = repo.findAllTechnologiesArrays();

        Map<List<String>, Long> comboCounts = new HashMap<>();

        // 2. Przetwarzamy każdą ofertę w pamięci
        for (String[] row : allRows) {
            if (row == null) continue;

            // Oczyszczamy, usuwamy duplikaty i sortujemy technologie w ofercie
            List<String> cleanTechs = Arrays.stream(row)
                    .filter(t -> t != null && !t.isBlank())
                    .map(String::trim)
                    .distinct()
                    .sorted()
                    .toList();

            if (cleanTechs.size() < combinationSize) continue;

            // Generujemy kombinacje (np. pary, trójki lub czwórki)
            generateCombinations(cleanTechs, combinationSize, 0, new ArrayList<>(), comboCounts);
        }

        // 3. Sortujemy po częstotliwości i ograniczamy wynik do 'limit'
        return comboCounts.entrySet().stream()
                .sorted(Map.Entry.<List<String>, Long>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> new TechComboDTO(entry.getKey(), entry.getValue()))
                .toList();
    }

    // Rekurencyjny generator kombinacji (n-elementowych)
    private void generateCombinations(List<String> techs, int k, int start, List<String> current, Map<List<String>, Long> result) {
        if (current.size() == k) {
            result.merge(new ArrayList<>(current), 1L, Long::sum);
            return;
        }
        for (int i = start; i < techs.size(); i++) {
            current.add(techs.get(i));
            generateCombinations(techs, k, i + 1, current, result);
            current.remove(current.size() - 1);
        }
    }

    @Transactional()
    public List<TechCompanionDTO> getTopCompanionsForTechnology(String targetTech, int limit) {
        // 1. Pobieramy surowe tablice z bazy jednym prostym zapytaniem
        List<String[]> allRows = repo.findAllTechnologiesArrays();

        Map<String, Long> companionCounts = new HashMap<>();
        String normalizedTarget = targetTech.trim().toLowerCase();

        // 2. Przetwarzamy oferty w pamięci
        for (String[] row : allRows) {
            if (row == null) continue;

            // Oczyszczamy i unikalizujemy technologie w danej ofercie
            List<String> cleanTechs = Arrays.stream(row)
                    .filter(t -> t != null && !t.isBlank())
                    .map(String::trim)
                    .distinct()
                    .toList();

            // Sprawdzamy, czy oferta zawiera szukaną technologię (ignorując wielkość liter)
            boolean containsTarget = cleanTechs.stream()
                    .anyMatch(t -> t.equalsIgnoreCase(normalizedTarget));

            if (containsTarget) {
                // Zliczamy wszystkie *inne* technologie z tej samej oferty
                for (String tech : cleanTechs) {
                    if (!tech.equalsIgnoreCase(normalizedTarget)) {
                        companionCounts.merge(tech, 1L, Long::sum);
                    }
                }
            }
        }

        // 3. Sortujemy po liczbie wystąpień i zwracamy top 'limit'
        return companionCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> new TechCompanionDTO(entry.getKey(), entry.getValue()))
                .toList();
    }

}
