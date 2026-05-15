import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { EmployerTailoringRequest } from '../new-tailoring/new-tailoring';
import { PageCommunicationService } from '../../services/page-communication.service';
import { TailoringStorageService } from '../../services/tailoring-storage.service';

@Component({
  selector: 'app-tailoring-details',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './tailoring-details.component.html',
  styleUrl: './tailoring-details.component.scss',
})
export class TailoringDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(PageCommunicationService);
  private readonly tailoringStorage = inject(TailoringStorageService);

  protected readonly offer = signal<EmployerTailoringRequest | null>(null);
  protected readonly requestedId = signal<string | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(
        map(params => params.get('id')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(id => {
        this.requestedId.set(id);
        this.offer.set(id ? this.tailoringStorage.findEmployerById(id) : null);
      });
  }

  protected markAsNotRelevant(): void {
    const currentOffer = this.offer();
    if (!currentOffer) {
      return;
    }

    const employers = this.tailoringStorage.getEmployers();
    const employerIndex = employers.findIndex(employer => employer.id === currentOffer.id);
    if (employerIndex === -1) {
      this.offer.set(null);
      return;
    }

    const updatedOffer: EmployerTailoringRequest = {
      ...employers[employerIndex],
      isArchived: true,
    };
    const nextEmployers = [
      ...employers.slice(0, employerIndex),
      updatedOffer,
      ...employers.slice(employerIndex + 1),
    ];

    if (!this.tailoringStorage.saveEmployers(nextEmployers)) {
      this.snackBar.open('Unable to update this offer in local storage', 'Close', {
        duration: 4000,
      });
      return;
    }

    this.offer.set(updatedOffer);
    this.snackBar.open('Offer marked as not relevant', 'Close', { duration: 3000 });
    this.messageService.sendMessage('newEmployer', '');
  }

  protected generateResume(): void {
    const currentOffer = this.offer();

    if (!currentOffer) {
      return;
    }

    void this.router.navigate(['/tailoring', currentOffer.id, 'resume']);
  }

  protected askAiConsultant(): void {
    // TODO: Integrate AI consultant chat.
    this.snackBar.open('AI consultant chat will be available soon', 'Close', { duration: 3000 });
  }

  protected backToNewTailoring(): void {
    void this.router.navigate(['/new-tailoring']);
  }
}
