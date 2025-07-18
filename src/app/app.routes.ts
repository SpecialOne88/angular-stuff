import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
    { path: 'pg', loadComponent: () => import('./components/playground/playground.component').then(m => m.PlaygroundComponent) },
];
