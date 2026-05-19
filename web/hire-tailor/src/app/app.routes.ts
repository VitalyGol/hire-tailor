import { Routes } from '@angular/router';

import { AppLayoutComponent } from './layout/app-layout/app-layout.component';
import { PlaceholderPageComponent } from './pages/placeholder-page/placeholder-page.component';

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
        loadComponent: () =>
          import('./features/new-tailoring/new-tailoring.component').then(
            m => m.NewTailoringComponent,
          ),
        data: { title: 'New Tailoring' },
      },
      {
        path: 'tailoring/:id/resume',
        loadComponent: () =>
          import('./features/tailoring-resume/tailoring-resume.component').then(
            m => m.TailoringResumeComponent,
          ),
        data: { title: 'Generated Resume' },
      },
      {
        path: 'tailoring/:id',
        loadComponent: () =>
          import('./features/tailoring-details/tailoring-details.component').then(
            m => m.TailoringDetailsComponent,
          ),
        data: { title: 'Tailoring Details' },
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/history.component').then(m => m.HistoryComponent),
        data: { title: 'History' },
      },
      {
        path: 'tailoring/:id/ai-consultant',
        loadComponent: () =>
          import('./features/ai-consultant/ai-consultant.component').then(
            m => m.AiConsultantComponent,
          ),
        data: { title: 'AI Consultant' },
      },
      {
        path: 'templates',
        component: PlaceholderPageComponent,
        data: { title: 'Templates' },
      },
      {
        path: 'user-profile',
        loadComponent: () =>
          import('./features/user-profile/user-profile.component').then(
            m => m.UserProfileComponent,
          ),
        data: { title: 'User Profile' },
      },
    ],
  },
];
