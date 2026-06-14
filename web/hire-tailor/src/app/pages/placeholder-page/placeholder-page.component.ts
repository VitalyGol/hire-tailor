import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

@Component({
  selector: 'app-placeholder-page',
  imports: [MatIconModule],
  templateUrl: './placeholder-page.component.html',
  styleUrl: './placeholder-page.component.scss',
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);

  private readonly routeTitle = toSignal(
    this.route.data.pipe(map(data => String(data['title'] ?? 'New Tailoring'))),
    { initialValue: 'New Tailoring' },
  );

  protected readonly title = computed(() => this.routeTitle());
}
