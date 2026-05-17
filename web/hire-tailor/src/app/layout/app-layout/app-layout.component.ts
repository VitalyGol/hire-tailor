import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { NavigationItem } from '../../models/app-layout/navigation-item.model';
import { EmployerTailoringRequest } from '../../models/shared/employer-tailoring-request.model';
import { PageCommunicationService } from '../../services/page-communication.service';

const EMPLOYERS_STORAGE_KEY = 'hiretailor_employers';

@Component({
  selector: 'app-layout',
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss',
})
export class AppLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly messageService = inject(PageCommunicationService);

  protected readonly navigationItems: readonly NavigationItem[] = [
    {
      label: 'New Tailoring',
      icon: 'auto_fix_high',
      route: '/new-tailoring',
    },
    {
      label: 'History',
      icon: 'history',
      route: '/history',
    },
  ];

  protected readonly employerList: EmployerTailoringRequest[] = [];

  constructor() {
    this.loadEmployersFromStorage();
    this.messageService.message$.subscribe(message => {
      if (message?.key === 'newEmployer') {
        this.loadEmployersFromStorage();
      }
    });
  }

  protected readonly isCompact = toSignal(
    this.breakpointObserver.observe('(max-width: 959px)').pipe(map(state => state.matches)),
    { initialValue: false },
  );

  protected readonly isMobileSidenavOpen = signal(false);
  protected readonly sidenavMode = computed(() => (this.isCompact() ? 'over' : 'side'));
  protected readonly isSidenavOpen = computed(() =>
    this.isCompact() ? this.isMobileSidenavOpen() : true,
  );

  protected toggleSidenav(): void {
    this.isMobileSidenavOpen.update(isOpen => !isOpen);
  }

  protected closeSidenavAfterNavigation(): void {
    if (this.isCompact()) {
      this.isMobileSidenavOpen.set(false);
    }
  }

  protected loadEmployersFromStorage(): void {
    const storedEmployers = localStorage.getItem(EMPLOYERS_STORAGE_KEY);
    if (storedEmployers) {
      try {
        const parsedEmployers: EmployerTailoringRequest[] = JSON.parse(storedEmployers);
        this.employerList.length = 0;
        this.employerList.push(...parsedEmployers.filter(emp => !emp.isArchived));
      } catch (error) {
        console.error('Failed to parse employers from storage:', error);
      }
    }
  }
}
