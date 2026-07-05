import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideHttpClient } from '@angular/common/http';
import { ChartModule } from 'angular-highcharts';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideCharts(withDefaultRegisterables()),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(ChartModule)
  ]
};
