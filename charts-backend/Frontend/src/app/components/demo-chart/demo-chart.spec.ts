import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoChartComponent } from './demo-chart';

describe('DemoChartComponent', () => {
  let fixture: ComponentFixture<DemoChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoChartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DemoChartComponent);
  });

  it('should create', () => {
    fixture.detectChanges();

    expect(fixture.componentInstance).toBeTruthy();
  });
});