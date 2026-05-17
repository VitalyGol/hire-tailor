import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageCommunicationService } from '../../services/page-communication.service';
import { EmployerTailoringRequest } from '../../models/shared/employer-tailoring-request.model';
import { NewTailoringForm } from '../../models/new-tailoring/new-tailoring-form.model';

const EMPLOYERS_STORAGE_KEY = 'hiretailor_employers';

@Component({
  selector: 'app-new-tailoring',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './new-tailoring.html',
  styleUrl: './new-tailoring.scss',
})
export class NewTailoring {
  private readonly snackBar = inject(MatSnackBar);
  private readonly messageService = inject(PageCommunicationService);

  protected readonly tailoringForm: NewTailoringForm = new FormGroup({
    employerName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    jobPosition: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    jobRequirements: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10)],
    }),
  });


  protected get employerName(): FormControl<string> {
    return this.tailoringForm.controls.employerName;
  }

  protected get jobPosition(): FormControl<string> {
    return this.tailoringForm.controls.jobPosition;
  }

  protected get jobRequirements(): FormControl<string> {
    return this.tailoringForm.controls.jobRequirements;
  }

  protected saveEmployer(): void {
    if (this.tailoringForm.invalid) {
      this.tailoringForm.markAllAsTouched();
      return;
    }

    const formValue = this.tailoringForm.getRawValue();
    const employer: EmployerTailoringRequest = {
      id: this.createEmployerId(),
      employerName: formValue.employerName.trim(),
      jobPosition: formValue.jobPosition.trim(),
      jobRequirements: formValue.jobRequirements.trim(),
      createdAt: new Date().toISOString(),
      isArchived: false,
    };

    const employers = this.loadEmployersFromStorage();
    const nextEmployers = [employer, ...employers];
    this.saveEmployersToStorage(nextEmployers);
    this.tailoringForm.reset();

    this.snackBar.open('Employer saved successfully', 'Close', { duration: 3000 });
    this.messageService.sendMessage('newEmployer', '');
  }

  protected loadEmployersFromStorage(): EmployerTailoringRequest[] {
    
    const storedEmployers = localStorage.getItem(EMPLOYERS_STORAGE_KEY);
    if (storedEmployers) {
      try {
        const parsedEmployers: EmployerTailoringRequest[] = JSON.parse(storedEmployers);
        return parsedEmployers;
      } catch (error) {
        console.error('Failed to parse employers from storage:', error);
      }
    }
    return [];
  }

  protected hasControlError(control: AbstractControl, errorCode: string): boolean {
    return control.hasError(errorCode) && (control.touched || control.dirty);
  }


  private saveEmployersToStorage(employers: readonly EmployerTailoringRequest[]): void {
    try {
      localStorage.setItem(EMPLOYERS_STORAGE_KEY, JSON.stringify(employers));
    } catch {
      this.snackBar.open('Employer saved in this session, but local storage failed.', 'Close', {
        duration: 4000,
      });
    }
  }

  private createEmployerId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return `employer-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
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
      typeof value['jobRequirements'] === 'string' &&
      typeof value['createdAt'] === 'string'
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
