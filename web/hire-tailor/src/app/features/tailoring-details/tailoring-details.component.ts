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

const EMPLOYERS_STORAGE_KEY = 'hiretailor_employers';

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
        this.offer.set(id ? this.findEmployerById(id) : null);
      });
  }

  protected markAsNotRelevant(): void {
    const currentOffer = this.offer();
    if (!currentOffer) {
      return;
    }

    const employers = this.loadEmployersFromStorage();
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

    if (!this.saveEmployersToStorage(nextEmployers)) {
      return;
    }

    this.offer.set(updatedOffer);
    this.snackBar.open('Offer marked as not relevant', 'Close', { duration: 3000 });
    this.messageService.sendMessage('newEmployer', '');
  }

  protected generateResume(): void {
    // TODO: Integrate resume generation API.
    this.snackBar.open('Resume generation will be available soon', 'Close', { duration: 3000 });
  }

  protected askAiConsultant(): void {
    // TODO: Integrate AI consultant chat.
    this.snackBar.open('AI consultant chat will be available soon', 'Close', { duration: 3000 });
  }

  protected backToNewTailoring(): void {
    void this.router.navigate(['/new-tailoring']);
  }

  private findEmployerById(id: string): EmployerTailoringRequest | null {
    return this.loadEmployersFromStorage().find(employer => employer.id === id) ?? null;
  }

  private loadEmployersFromStorage(): EmployerTailoringRequest[] {
    let storedEmployers: string | null = null;

    try {
      storedEmployers = localStorage.getItem(EMPLOYERS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to read employers from storage:', error);
      return [];
    }

    if (!storedEmployers) {
      return [];
    }

    try {
      const parsedEmployers: unknown = JSON.parse(storedEmployers);
      return this.isEmployerArray(parsedEmployers) ? parsedEmployers : [];
    } catch (error) {
      console.error('Failed to parse employers from storage:', error);
      return [];
    }
  }

  private saveEmployersToStorage(employers: readonly EmployerTailoringRequest[]): boolean {
    try {
      localStorage.setItem(EMPLOYERS_STORAGE_KEY, JSON.stringify(employers));
      return true;
    } catch {
      this.snackBar.open('Unable to update this offer in local storage', 'Close', {
        duration: 4000,
      });
      return false;
    }
  }

  private isEmployerArray(value: unknown): value is EmployerTailoringRequest[] {
    return Array.isArray(value) && value.every(item => this.isEmployerTailoringRequest(item));
  }

  private isEmployerTailoringRequest(value: unknown): value is EmployerTailoringRequest {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value['id'] === 'string' &&
      typeof value['employerName'] === 'string' &&
      typeof value['jobPosition'] === 'string' &&
      typeof value['jobRequirements'] === 'string' &&
      typeof value['createdAt'] === 'string' &&
      (value['isArchived'] === undefined || typeof value['isArchived'] === 'boolean')
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
