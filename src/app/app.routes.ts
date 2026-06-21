import { Routes } from '@angular/router';
import { TabsComponent } from './tabs.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    component: TabsComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'children',
        loadComponent: () =>
          import('./pages/children-list/children-list.page').then((m) => m.ChildrenListPage),
      },
      {
        path: 'children/:id',
        loadComponent: () =>
          import('./pages/child-detail/child-detail.page').then((m) => m.ChildDetailPage),
      },
      {
        path: 'campaigns',
        loadComponent: () =>
          import('./pages/campaigns/campaigns.page').then((m) => m.CampaignsPage),
      },
      { path: '', redirectTo: 'children', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
