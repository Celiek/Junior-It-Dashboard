import { Routes } from '@angular/router';
import {DashboardComponent} from './features/dashboard/dashboard.component';
import {AboutComponent} from '../app/pages/about/about.component';

export const routes: Routes = [
  { 
    path: '', component: DashboardComponent
  },
  { 
    path: 'about', component: AboutComponent 
  }
];
