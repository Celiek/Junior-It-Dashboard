import { Routes } from '@angular/router';
import {DashboardComponent} from './features/dashboard/dashboard.component';
import {AboutComponent} from '../app/pages/about/about.component';
import {CompanyDetailsComponent} from '../app/pages/company-details/company-details.component';

export const routes: Routes = [
  { 
    path: '', component: DashboardComponent
  },
  { 
    path: 'about', component: AboutComponent 
  },
  {
    path: 'companies', component: CompanyDetailsComponent
  }
];
