package com.junior.charts.service;


import com.junior.charts.dto.OffersByCategoryProjection;
import com.junior.charts.repo.OffersRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OfferServiceTest {

    @Mock
    private OffersRepo repo;

    @InjectMocks
    private OfferService service;

    @Test
    void shouldGetOffersByCategory(){
        //given
        OffersByCategoryProjection backend = new OffersByCategoryProjection() {
            @Override
            public String getCategory() {
                return "Backend";
            }

            @Override
            public Long getCount() {
                return 10L;
            }
        };

        when(repo.countOffersByCategory()).thenReturn(List.of(backend));
        //when
        List<OffersByCategoryProjection> result = service.countOffersByCategory();

        //then

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getCategory()).isEqualTo("Backend");
        assertThat(result.getFirst().getCount()).isEqualTo(10L);

        verify(repo,times(1)).countOffersByCategory();

    }
}