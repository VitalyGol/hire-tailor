import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideNativeDateAdapter } from '@angular/material/core';
import { finalize } from 'rxjs';

import { UploadService } from '../../services/upload.service';
import { StorageService } from '../../services/storage.service';

export interface UserProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  professionalTitle?: string;
  professionalSummary?: string;
  workExperience: WorkExperience[];
  education: Education[];
  courses: CourseCertificate[];
  languages: UserLanguage[];
}

export interface WorkExperience {
  startDate: string;
  endDate?: string | null;
  companyName: string;
  position: string;
  projects: WorkProject[];
}

export interface WorkProject {
  projectName: string;
  projectDescription: string;
}

export interface Education {
  institution: string;
  specialization: string;
  startDate: string;
  endDate?: string | null;
}

export interface CourseCertificate {
  title: string;
  organization: string;
  issueDate: string;
  certificateUrl?: string | null;
}

export interface UserLanguage {
  language: string;
  level: UserLanguageLevel;
}

type UserLanguageLevel = 'beginner' | 'intermediate' | 'advanced' | 'fluent' | 'native';

type PersonalInfoForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
}>;

type WorkProjectForm = FormGroup<{
  projectName: FormControl<string>;
  projectDescription: FormControl<string>;
}>;

type WorkExperienceForm = FormGroup<{
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  companyName: FormControl<string>;
  position: FormControl<string>;
  projects: FormArray<WorkProjectForm>;
}>;

type EducationForm = FormGroup<{
  institution: FormControl<string>;
  specialization: FormControl<string>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
}>;

type CourseCertificateForm = FormGroup<{
  title: FormControl<string>;
  organization: FormControl<string>;
  issueDate: FormControl<Date | null>;
  certificateUrl: FormControl<string>;
}>;

type UserLanguageForm = FormGroup<{
  language: FormControl<string>;
  level: FormControl<UserLanguageLevel | null>;
}>;

type UserProfileForm = FormGroup<{
  personalInfo: PersonalInfoForm;
  workExperience: FormArray<WorkExperienceForm>;
  education: FormArray<EducationForm>;
  courses: FormArray<CourseCertificateForm>;
  languages: FormArray<UserLanguageForm>;
}>;

const STORAGE_KEY = 'hiretailor_user_profile';
const MAX_RESUME_FILE_SIZE_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-user-profile',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  private readonly snackBar = inject(MatSnackBar);
  private readonly uploadService = inject(UploadService);
  private readonly storage = inject(StorageService);

  protected readonly languageLevels: readonly UserLanguageLevel[] = [
    'beginner',
    'intermediate',
    'advanced',
    'fluent',
    'native',
  ];

  protected readonly selectedResumeFileName = signal<string | null>(null);
  protected readonly isUploadingResume = signal(false);
  protected readonly hasResumeFile = computed(() => this.selectedResumeFileName() !== null);

  protected readonly profileForm: UserProfileForm = new FormGroup({
    personalInfo: new FormGroup({
      firstName: this.createTextControl([Validators.required, Validators.minLength(2)]),
      lastName: this.createTextControl([Validators.required, Validators.minLength(2)]),
      email: this.createTextControl([Validators.required, Validators.email]),
    }),
    workExperience: new FormArray<WorkExperienceForm>([this.createWorkExperienceForm()]),
    education: new FormArray<EducationForm>([this.createEducationForm()]),
    courses: new FormArray<CourseCertificateForm>([this.createCourseCertificateForm()]),
    languages: new FormArray<UserLanguageForm>([this.createLanguageForm()]),
  });

  constructor() {
    this.loadProfileFromStorage();
  }

  protected get personalInfo(): PersonalInfoForm {
    return this.profileForm.controls.personalInfo;
  }

  protected get workExperience(): FormArray<WorkExperienceForm> {
    return this.profileForm.controls.workExperience;
  }

  protected get education(): FormArray<EducationForm> {
    return this.profileForm.controls.education;
  }

  protected get courses(): FormArray<CourseCertificateForm> {
    return this.profileForm.controls.courses;
  }

  protected get languages(): FormArray<UserLanguageForm> {
    return this.profileForm.controls.languages;
  }

  protected getExperienceProjects(experienceIndex: number): FormArray<WorkProjectForm> {
    return this.workExperience.at(experienceIndex).controls.projects;
  }

  protected addExperience(): void {
    this.workExperience.push(this.createWorkExperienceForm());
  }

  protected removeExperience(index: number): void {
    this.workExperience.removeAt(index);
  }

  protected addProject(experienceIndex: number): void {
    this.getExperienceProjects(experienceIndex).push(this.createWorkProjectForm());
  }

  protected removeProject(experienceIndex: number, projectIndex: number): void {
    this.getExperienceProjects(experienceIndex).removeAt(projectIndex);
  }

  protected addEducation(): void {
    this.education.push(this.createEducationForm());
  }

  protected removeEducation(index: number): void {
    this.education.removeAt(index);
  }

  protected addCourse(): void {
    this.courses.push(this.createCourseCertificateForm());
  }

  protected removeCourse(index: number): void {
    this.courses.removeAt(index);
  }

  protected addLanguage(): void {
    this.languages.push(this.createLanguageForm());
  }

  protected removeLanguage(index: number): void {
    this.languages.removeAt(index);
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.snackBar.open('Please fix the highlighted fields before saving.', 'Close', {
        duration: 4000,
      });
      return;
    }
    
    this.storage.setItem(STORAGE_KEY, JSON.stringify(this.toUserProfile()));

    this.snackBar.open('Profile saved successfully.', 'Close', { duration: 3000 });
  }

  protected onResumeFileSelected(event: Event): void {
    const input = event.target;

    if (!(input instanceof HTMLInputElement)) {
      return;
    }

    const file = input.files?.item(0);

    if (!file) {
      return;
    }

    const fileName = file.name.trim();
    const hasPdfExtension = fileName.toLowerCase().endsWith('.pdf');
    const isPdfMimeType = file.type === 'application/pdf';

    if (!hasPdfExtension || !isPdfMimeType) {
      this.clearResumeInput(input);
      this.snackBar.open('Only PDF resume files are supported.', 'Close', { duration: 4000 });
      return;
    }

    if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
      this.clearResumeInput(input);
      this.snackBar.open('Resume file must be 5 MB or smaller.', 'Close', { duration: 4000 });
      return;
    }

    this.selectedResumeFileName.set(fileName);
    this.isUploadingResume.set(true);

    this.uploadService
      .uploadResume(file)
      .pipe(finalize(() => this.isUploadingResume.set(false)))
      .subscribe({
        next: response => {
          console.log('Resume upload response:', response);
          try {
            this.loadProfileFromResume(response);
          } catch {
            this.snackBar.open('Saved profile data could not be loaded.', 'Close', {
              duration: 4000,
            });
          }
        },
        error: () => {
          this.clearResumeInput(input);
          this.snackBar.open('Resume upload failed. Please try again.', 'Close', {
            duration: 4000,
          });
        },
      });
  }

  protected hasControlError(control: AbstractControl, errorCode: string): boolean {
    return control.hasError(errorCode) && (control.touched || control.dirty);
  }

  protected hasDateRangeError(control: AbstractControl): boolean {
    return control.hasError('endDateBeforeStartDate') && (control.touched || control.dirty);
  }

  private createTextControl(validators: ValidatorFn[] = [], value = ''): FormControl<string> {
    return new FormControl(value, { nonNullable: true, validators });
  }

  private createWorkExperienceForm(value?: WorkExperience): WorkExperienceForm {
    return new FormGroup(
      {
        startDate: new FormControl(this.parseDate(value?.startDate), {
          validators: Validators.required,
        }),
        endDate: new FormControl(this.parseDate(value?.endDate ?? null)),
        companyName: this.createTextControl([Validators.required], value?.companyName),
        position: this.createTextControl([Validators.required], value?.position),
        projects: new FormArray<WorkProjectForm>(
          (value?.projects.length ? value.projects : [undefined]).map(project =>
            this.createWorkProjectForm(project),
          ),
        ),
      },
      { validators: this.endDateAfterStartDateValidator() },
    );
  }

  private createWorkProjectForm(value?: WorkProject): WorkProjectForm {
    return new FormGroup({
      projectName: this.createTextControl([Validators.required], value?.projectName),
      projectDescription: this.createTextControl(
        [Validators.required, Validators.minLength(20)],
        value?.projectDescription,
      ),
    });
  }

  private createEducationForm(value?: Education): EducationForm {
    return new FormGroup(
      {
        institution: this.createTextControl([Validators.required], value?.institution),
        specialization: this.createTextControl([Validators.required], value?.specialization),
        startDate: new FormControl(this.parseDate(value?.startDate), {
          validators: Validators.required,
        }),
        endDate: new FormControl(this.parseDate(value?.endDate ?? null)),
      },
      { validators: this.endDateAfterStartDateValidator() },
    );
  }

  private createCourseCertificateForm(value?: CourseCertificate): CourseCertificateForm {
    return new FormGroup({
      title: this.createTextControl([Validators.required], value?.title),
      organization: this.createTextControl([Validators.required], value?.organization),
      issueDate: new FormControl(this.parseDate(value?.issueDate), {
        validators: Validators.required,
      }),
      certificateUrl: this.createTextControl(
        [this.optionalUrlValidator()],
        value?.certificateUrl ?? '',
      ),
    });
  }

  private createLanguageForm(value?: UserLanguage): UserLanguageForm {
    return new FormGroup({
      language: this.createTextControl([Validators.required], value?.language),
      level: new FormControl<UserLanguageLevel | null>(value?.level ?? null, {
        validators: Validators.required,
      }),
    });
  }

  private endDateAfterStartDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startDateControl = control.get('startDate');
      const endDateControl = control.get('endDate');
      const startDate = startDateControl?.value;
      const endDate = endDateControl?.value;

      if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
        return null;
      }

      return endDate.getTime() < startDate.getTime() ? { endDateBeforeStartDate: true } : null;
    };
  }

  private optionalUrlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '').trim();

      if (!value) {
        return null;
      }

      try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:' ? null : { url: true };
      } catch {
        return { url: true };
      }
    };
  }

  private loadProfileFromStorage(): void {
    const rawProfile = this.storage.getItem(STORAGE_KEY);

    if (!rawProfile) {
      return;
    }

    try {
      const parsedProfile: unknown = JSON.parse(rawProfile);

      if (!this.isUserProfile(parsedProfile)) {
        return;
      }

      this.loadProfileFromResume(parsedProfile);
    } catch {
      this.snackBar.open('Saved profile data could not be loaded.', 'Close', { duration: 4000 });
    }
  }

  private loadProfileFromResume(profile: UserProfile): void {
    this.personalInfo.setValue(profile.personalInfo);
    this.replaceFormArray(this.workExperience, profile.workExperience, item =>
      this.createWorkExperienceForm(item),
    );
    this.replaceFormArray(this.education, profile.education, item =>
      this.createEducationForm(item),
    );
    this.replaceFormArray(this.courses, profile.courses, item =>
      this.createCourseCertificateForm(item),
    );
    this.replaceFormArray(this.languages, profile.languages, item => this.createLanguageForm(item));
  }

  private replaceFormArray<TControl extends AbstractControl, TValue>(
    formArray: FormArray<TControl>,
    values: readonly TValue[],
    createControl: (value: TValue) => TControl,
  ): void {
    formArray.clear();
    values.forEach(value => formArray.push(createControl(value)));
  }

  private toUserProfile(): UserProfile {
    return {
      personalInfo: this.personalInfo.getRawValue(),
      workExperience: this.workExperience.controls.map(experience => ({
        startDate: this.formatDate(experience.controls.startDate.value),
        endDate: this.formatNullableDate(experience.controls.endDate.value),
        companyName: experience.controls.companyName.value,
        position: experience.controls.position.value,
        projects: experience.controls.projects.controls.map(project => ({
          projectName: project.controls.projectName.value,
          projectDescription: project.controls.projectDescription.value,
        })),
      })),
      education: this.education.controls.map(education => ({
        institution: education.controls.institution.value,
        specialization: education.controls.specialization.value,
        startDate: this.formatDate(education.controls.startDate.value),
        endDate: this.formatNullableDate(education.controls.endDate.value),
      })),
      courses: this.courses.controls.map(course => ({
        title: course.controls.title.value,
        organization: course.controls.organization.value,
        issueDate: this.formatDate(course.controls.issueDate.value),
        certificateUrl: course.controls.certificateUrl.value.trim() || null,
      })),
      languages: this.languages.controls.map(language => ({
        language: language.controls.language.value,
        level: language.controls.level.value ?? 'beginner',
      })),
    };
  }

  private parseDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private formatDate(value: Date | null): string {
    return value ? this.formatDateParts(value) : '';
  }

  private formatNullableDate(value: Date | null): string | null {
    return value ? this.formatDateParts(value) : null;
  }

  private formatDateParts(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private clearResumeInput(input: HTMLInputElement): void {
    input.value = '';
    this.selectedResumeFileName.set(null);
  }

  private isUserProfile(value: unknown): value is UserProfile {
    if (!this.isRecord(value) || !this.isRecord(value['personalInfo'])) {
      return false;
    }

    const personalInfo = value['personalInfo'];

    return (
      typeof personalInfo['firstName'] === 'string' &&
      typeof personalInfo['lastName'] === 'string' &&
      typeof personalInfo['email'] === 'string' &&
      Array.isArray(value['workExperience']) &&
      Array.isArray(value['education']) &&
      Array.isArray(value['courses']) &&
      Array.isArray(value['languages'])
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
