import { Routes } from '@angular/router';

import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { PlaceholderPageComponent } from './pages/placeholder-page/placeholder-page.component';
import { UserProfileComponent } from './features/user-profile/user-profile.component';
import { NewTailoring } from './features/new-tailoring/new-tailoring';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'new-tailoring',
      },
      {
        path: 'new-tailoring',
        component: NewTailoring,
        data: { title: 'New Tailoring' },
      },
      {
        path: 'history',
        component: PlaceholderPageComponent,
        data: { title: 'History' },
      },
      {
        path: 'templates',
        component: PlaceholderPageComponent,
        data: { title: 'Templates' },
      },
      {
        path: 'settings',
        component: PlaceholderPageComponent,
        data: { title: 'Settings' },
      },
      {
        path: 'user-profile',
        component: UserProfileComponent,
        data: { title: 'User Profile' },
      },
    ],
  },
];
