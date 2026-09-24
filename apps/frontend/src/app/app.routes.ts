import { Routes } from '@angular/router';
import { FeatureShellComponent } from './feature-shell.component';

export const APP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', component: FeatureShellComponent, data: { title: 'Dashboard' } },
  { path: 'items', component: FeatureShellComponent, data: { title: 'Items' } },
  { path: 'projects', component: FeatureShellComponent, data: { title: 'Projects' } },
  { path: 'procurement', component: FeatureShellComponent, data: { title: 'Procurement' } },
  { path: 'inventory', component: FeatureShellComponent, data: { title: 'Inventory' } },
  { path: 'administration', component: FeatureShellComponent, data: { title: 'Administration' } },
];
