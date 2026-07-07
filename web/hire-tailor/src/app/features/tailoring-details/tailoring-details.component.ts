import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { DialogType } from '../../models/shared/dialog-message.model';
import { EmployerTailoringRequest } from '../../models/shared/employer-tailoring-request.model';
import { ConfirmDialogService, DialogResult } from '../../services/confirm-dialog.service';
import { PageCommunicationService } from '../../services/page-communication.service';
import { TailoringStorageService } from '../../services/tailoring-storage.service';

@Component({
  selector: 'app-tailoring-details',
  imports: [MatButtonModule, MatCardModule, MatChipsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './tailoring-details.component.html',
  styleUrl: './tailoring-details.component.scss',
})
export class TailoringDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(PageCommunicationService);
  private readonly tailoringStorage = inject(TailoringStorageService);

  protected readonly offer = signal<EmployerTailoringRequest | null>(null);
  protected readonly requestedId = signal<string | null>(null);
  private readonly isMarkAsNotRelevantDialogOpen = signal(false);

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
    if (this.isMarkAsNotRelevantDialogOpen()) {
      return;
    }

    this.isMarkAsNotRelevantDialogOpen.set(true);
    this.confirmDialog.clearResult();
    this.confirmDialog.showDialog(
      DialogType.Confirm,
      'Mark this tailoring as not relevant?',
      'This tailoring will be removed from your active list and moved to History. You can restore it from History at any time.',
    );

    this.confirmDialog.dialogResult$
      .pipe(
        filter((result): result is DialogResult => result !== null),
        take(1),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(result => {
        this.isMarkAsNotRelevantDialogOpen.set(false);
        this.confirmDialog.clearResult();

        if (result === DialogResult.Confirmed) {
          this.archiveCurrentOffer();
        }
      });
  }

  private archiveCurrentOffer(): void {
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
    const currentOffer = this.offer();

    if (!currentOffer) {
      return;
    }

    void this.router.navigate(['/tailoring', currentOffer.id, 'ai-consultant']);
  }

  protected backToNewTailoring(): void {
    void this.router.navigate(['/new-tailoring']);
  }
}
