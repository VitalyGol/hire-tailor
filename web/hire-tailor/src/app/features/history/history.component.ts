import { Component, computed, inject } from '@angular/core';
import { PageCommunicationService } from '../../services/page-communication.service';
import { TailoringStorageService } from '../../services/tailoring-storage.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/internal/operators/map';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-history',
  imports: [MatIconModule, MatButtonModule, MatExpansionModule, MatCardModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss',
})
export class HistoryComponent {
  private readonly messageService = inject(PageCommunicationService);
  private readonly tailoringStorageService = inject(TailoringStorageService);

  protected archivedEmployers = this.tailoringStorageService.getArchivedEmployers();

  private readonly route = inject(ActivatedRoute);

  private readonly routeTitle = toSignal(
    this.route.data.pipe(map(data => String(data['title'] ?? 'New Tailoring'))),
    { initialValue: 'New Tailoring' },
  );

  protected readonly title = computed(() => this.routeTitle());

  protected markAsRelevant(id: string): void {
    const success = this.tailoringStorageService.markEmployerAsRelevant(id);
    if (success) {
      this.archivedEmployers = this.tailoringStorageService.getArchivedEmployers();
      this.messageService.sendMessage('newEmployer', null);
    }
  }

  protected removeEmployer(id: string): void {
    const success = this.tailoringStorageService.removeEmployer(id);
    if (success) {
      this.archivedEmployers = this.tailoringStorageService.getArchivedEmployers();
    }
  }
}
