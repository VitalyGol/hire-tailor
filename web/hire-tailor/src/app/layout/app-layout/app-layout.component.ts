import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

interface NavigationItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
}

@Component({
  selector: 'app-layout',
  imports: [
    MatButtonModule,
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
    {
      label: 'Templates',
      icon: 'article',
      route: '/templates',
    },
    {
      label: 'Settings',
      icon: 'settings',
      route: '/settings',
    },
  ];

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
}
