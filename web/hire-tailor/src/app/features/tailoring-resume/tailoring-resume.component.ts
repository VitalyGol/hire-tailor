import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JsonPipe } from '@angular/common';
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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { EmployerTailoringRequest } from '../../models/shared/employer-tailoring-request.model';
import {
  CourseCertificate,
  Education,
  UserLanguage,
  UserLanguageLevel,
  UserProfile,
  WorkExperience,
  WorkProject,
} from '../../models/shared/user-profile.model';
import {
  CourseCertificateForm,
  EducationForm,
  GeneratedResumePreview,
  PersonalInfoForm,
  ResumeForm,
  ResumeTemplate,
  ResumeTemplateLanguage,
  TemplatePreviewDialogData,
  UserLanguageForm,
  WorkExperienceForm,
  WorkProjectForm,
} from '../../models/tailoring-resume/tailoring-resume.model';
import { TailoringStorageService } from '../../services/tailoring-storage.service';
import { UploadService } from '../../services/upload.service';

const NO_PREVIEW_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="900" viewBox="0 0 640 900">
  <rect width="640" height="900" fill="#f4f6f9"/>
  <rect x="72" y="72" width="496" height="756" rx="18" fill="#ffffff" stroke="#d8dee9" stroke-width="4"/>
  <path d="M214 358h212M214 410h212M214 462h150" stroke="#a8b2c3" stroke-width="18" stroke-linecap="round"/>
  <circle cx="320" cy="270" r="54" fill="#d8dee9"/>
  <text x="320" y="598" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#687386">No preview</text>
</svg>
`);

@Component({
  selector: 'app-template-preview-dialog',
  imports: [JsonPipe, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>{{ data.template.TemplateName }}</h2>
    <mat-dialog-content class="template-dialog-content">
      <div class="dialog-meta">
        <span>{{ data.template.Language }}</span>
        <span>{{ data.template.TemplateId }}</span>
      </div>
      <div class="template-render-placeholder">
        <mat-icon>description</mat-icon>
        <p>Template preview with resume data will be available soon.</p>
      </div>
      <pre>{{ data.resume | json }}</pre>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button type="button" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .template-dialog-content {
        display: flex;
        width: min(760px, 78vw);
        max-height: 72vh;
        flex-direction: column;
        gap: 16px;
      }

      .dialog-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .dialog-meta span {
        border: 1px solid #d8dee9;
        border-radius: 8px;
        padding: 6px 10px;
        color: #445066;
        font-size: 0.88rem;
        font-weight: 700;
      }

      .template-render-placeholder {
        display: flex;
        min-height: 260px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        border: 1px dashed #c8d1df;
        border-radius: 8px;
        background: #f7f8fa;
        color: #445066;
        text-align: center;
      }

      .template-render-placeholder mat-icon {
        width: 44px;
        height: 44px;
        color: #687386;
        font-size: 44px;
      }

      .template-render-placeholder p {
        margin: 0;
        font-weight: 700;
      }

      pre {
        max-height: 220px;
        margin: 0;
        overflow: auto;
        border-radius: 8px;
        background: #172033;
        color: #f7f8fa;
        padding: 14px;
        font-size: 0.82rem;
        white-space: pre-wrap;
      }

      @media (max-width: 699px) {
        .template-dialog-content {
          width: auto;
        }
      }
    `,
  ],
})
export class TemplatePreviewDialogComponent {
  protected readonly data = inject<TemplatePreviewDialogData>(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-tailoring-resume',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDividerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './tailoring-resume.component.html',
  styleUrl: './tailoring-resume.component.scss',
})
export class TailoringResumeComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly tailoringStorage = inject(TailoringStorageService);
  private readonly uploadService = inject(UploadService);

  protected readonly languageLevels: readonly UserLanguageLevel[] = [
    'beginner',
    'intermediate',
    'advanced',
    'fluent',
    'native',
  ];
  protected readonly languages: readonly ResumeTemplateLanguage[] = ['Hebrew', 'English'];
  protected readonly templates: readonly ResumeTemplate[] = [
    { TemplateId: 'he-modern', TemplateName: 'Modern Hebrew', Language: 'Hebrew' },
    { TemplateId: 'he-classic', TemplateName: 'Classic Hebrew', Language: 'Hebrew' },
    { TemplateId: 'he-compact', TemplateName: 'Compact Hebrew', Language: 'Hebrew' },
    { TemplateId: 'en-modern', TemplateName: 'Modern English', Language: 'English' },
    { TemplateId: 'en-classic', TemplateName: 'Classic English', Language: 'English' },
    { TemplateId: 'en-compact', TemplateName: 'Compact English', Language: 'English' },
  ];
  protected readonly selectedLanguage = signal<ResumeTemplateLanguage>('Hebrew');
  protected readonly selectedTemplateId = signal<string>(
    this.templates.find(template => template.Language === 'Hebrew')?.TemplateId ?? '',
  );
  protected readonly offer = signal<EmployerTailoringRequest | null>(null);
  protected readonly requestedId = signal<string | null>(null);
  protected readonly userProfile = signal<UserProfile | null>(
    this.tailoringStorage.getUserProfile(),
  );

  protected readonly resumeForm: ResumeForm = this.createResumeForm(this.userProfile());

  protected readonly filteredTemplates = computed(() =>
    this.templates.filter(template => template.Language === this.selectedLanguage()),
  );

  protected readonly selectedTemplate = computed(() => {
    const templateId = this.selectedTemplateId();
    return (
      this.filteredTemplates().find(template => template.TemplateId === templateId) ??
      this.filteredTemplates()[0] ??
      null
    );
  });

  protected readonly selectedTemplatePreviewUrl = computed(() => {
    const template = this.selectedTemplate();
    return template ? `templates/${template.TemplateId}.png` : NO_PREVIEW_IMAGE;
  });

  protected readonly selectedTemplatePreviewAlt = computed(
    () => this.selectedTemplate()?.TemplateName ?? 'No preview',
  );

  protected readonly generatedResume = computed<GeneratedResumePreview | null>(() => {
    const currentOffer = this.offer();
    const profile = this.userProfile();

    if (!currentOffer || !profile) {
      return null;
    }

    const fullName = this.getFullName(profile);
    const professionalTitle = this.getProfessionalTitle(profile, currentOffer);
    const professionalSummary =
      this.getProfessionalSummary(profile) ||
      `Resume preview tailored for ${currentOffer.jobPosition} at ${currentOffer.employerName}, aligned with the listed job requirements.`;

    return {
      fullName,
      professionalTitle,
      professionalSummary,
      skills: [],
      workExperience: profile.workExperience,
      education: profile.education,
      courses: profile.courses,
      languages: profile.languages,
    };
  });

  constructor() {
    this.route.paramMap
      .pipe(
        map(params => params.get('id')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(id => {
        this.requestedId.set(id);
        let offer = id ? this.tailoringStorage.findEmployerById(id) : null;
        console.log('Loaded tailoring request:', offer);
        if (offer && !offer.userProfile) {
          const profile = this.tailoringStorage.getUserProfile();
          if (profile) {
            offer = {
              ...offer,
              userProfile: profile,
              templateId: offer.templateId ?? this.selectedTemplate()?.TemplateId,
              language: offer.language ?? this.selectedTemplate()?.Language,
            };
          }
          this.tailoringStorage.saveEmployer({ ...offer, id: offer.id });
        }
        this.offer.set(id ? this.tailoringStorage.findEmployerById(id) : null);
        this.userProfile.set(this.offer()!.userProfile ?? this.tailoringStorage.getUserProfile());
        this.resumeForm.patchValue(this.createResumeForm(this.userProfile()).getRawValue());
      });
  }

  protected get personalInfo(): PersonalInfoForm {
    return this.resumeForm.controls.personalInfo;
  }

  protected get workExperience(): FormArray<WorkExperienceForm> {
    return this.resumeForm.controls.workExperience;
  }

  protected get education(): FormArray<EducationForm> {
    return this.resumeForm.controls.education;
  }

  protected get courses(): FormArray<CourseCertificateForm> {
    return this.resumeForm.controls.courses;
  }

  protected get resumeLanguages(): FormArray<UserLanguageForm> {
    return this.resumeForm.controls.languages;
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
    this.resumeLanguages.push(this.createLanguageForm());
  }

  protected removeLanguage(index: number): void {
    this.resumeLanguages.removeAt(index);
  }

  protected saveResumeForm(): void {
    if (this.resumeForm.invalid) {
      this.resumeForm.markAllAsTouched();
      this.snackBar.open('Please fix the highlighted fields before saving.', 'Close', {
        duration: 4000,
      });
      return;
    }
    const offer = this.tailoringStorage.findEmployerById(this.requestedId()!);
    if (this.tailoringStorage.saveEmployer({ ...offer!, userProfile: this.toUserProfile() })) {
      this.snackBar.open('Resume data saved successfully.', 'Close', { duration: 3000 });
      this.resumeForm.markAsPristine();
      return;
    }

    this.snackBar.open('Resume data could not be saved.', 'Close', { duration: 4000 });
  }

  protected hasControlError(control: AbstractControl, errorCode: string): boolean {
    return control.hasError(errorCode) && (control.touched || control.dirty);
  }

  protected hasDateRangeError(control: AbstractControl): boolean {
    return control.hasError('endDateBeforeStartDate') && (control.touched || control.dirty);
  }

  protected downloadResume(): void {
    this.snackBar.open('PDF export will be available soon', 'Close', { duration: 3000 });
  }

  protected changeTemplateLanguage(event: MatSelectChange): void {
    const nextLanguage = event.value as ResumeTemplateLanguage;
    this.selectedLanguage.set(nextLanguage);
    this.selectedTemplateId.set(
      this.templates.find(template => template.Language === nextLanguage)?.TemplateId ?? '',
    );
  }

  protected changeTemplate(event: MatSelectChange): void {
    this.selectedTemplateId.set(event.value as string);
  }

  protected useNoPreviewImage(event: Event): void {
    const image = event.target;

    if (!(image instanceof HTMLImageElement) || image.src === NO_PREVIEW_IMAGE) {
      return;
    }

    image.src = NO_PREVIEW_IMAGE;
    image.alt = 'No preview';
  }

  protected openTemplatePreview(): void {
    const template = this.selectedTemplate();

    if (!template) {
      return;
    }

    this.dialog.open(TemplatePreviewDialogComponent, {
      data: {
        template,
        resume: this.generatedResume(),
      } satisfies TemplatePreviewDialogData,
      maxWidth: '92vw',
    });
  }

  protected regenerateResume(): void {
    this.uploadService
      .generateResume(
        this.userProfile()!,
        this.offer()?.jobRequirements ?? '',
        this.selectedTemplate()?.Language,
      )
      .subscribe({
        next: response => {
          this.userProfile.set({ ...this.userProfile(), ...response });
          this.resumeForm.patchValue(this.createResumeForm(this.userProfile()).getRawValue());
          this.resumeForm.markAsDirty();
          this.resumeForm.updateValueAndValidity();

          this.snackBar.open('Resume regenerated successfully', 'Close', { duration: 3000 });
        },
        error: () => {
          this.snackBar.open('Failed to regenerate resume. Please try again later.', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  private createResumeForm(profile: UserProfile | null): ResumeForm {
    return new FormGroup({
      personalInfo: new FormGroup({
        firstName: this.createTextControl(
          [Validators.required, Validators.minLength(2)],
          profile?.personalInfo.firstName,
        ),
        lastName: this.createTextControl(
          [Validators.required, Validators.minLength(2)],
          profile?.personalInfo.lastName,
        ),
        email: this.createTextControl(
          [Validators.required, Validators.email],
          profile?.personalInfo.email,
        ),
      }),
      professionalTitle: this.createTextControl([], profile?.professionalTitle),
      professionalSummary: this.createTextControl([], profile?.professionalSummary),
      workExperience: new FormArray<WorkExperienceForm>(
        (profile?.workExperience.length ? profile.workExperience : [undefined]).map(experience =>
          this.createWorkExperienceForm(experience),
        ),
      ),
      education: new FormArray<EducationForm>(
        (profile?.education.length ? profile.education : [undefined]).map(education =>
          this.createEducationForm(education),
        ),
      ),
      courses: new FormArray<CourseCertificateForm>(
        (profile?.courses.length ? profile.courses : [undefined]).map(course =>
          this.createCourseCertificateForm(course),
        ),
      ),
      languages: new FormArray<UserLanguageForm>(
        (profile?.languages.length ? profile.languages : [undefined]).map(language =>
          this.createLanguageForm(language),
        ),
      ),
    });
  }

  private createTextControl(validators: ValidatorFn[] = [], value = ''): FormControl<string> {
    return new FormControl(value ?? '', { nonNullable: true, validators });
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
      const startDate = control.get('startDate')?.value;
      const endDate = control.get('endDate')?.value;

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

  private toUserProfile(): UserProfile {
    return {
      personalInfo: this.personalInfo.getRawValue(),
      professionalTitle: this.resumeForm.controls.professionalTitle.value,
      professionalSummary: this.resumeForm.controls.professionalSummary.value,
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
      languages: this.resumeLanguages.controls.map(language => ({
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

  protected askAiConsultant(): void {
    this.snackBar.open('AI consultant will be available soon', 'Close', { duration: 3000 });
  }

  protected backToTailoringDetails(): void {
    const id = this.requestedId();
    void this.router.navigate(id ? ['/tailoring', id] : ['/new-tailoring']);
  }

  protected backToNewTailoring(): void {
    void this.router.navigate(['/new-tailoring']);
  }

  private getFullName(profile: UserProfile): string {
    const firstName = profile.personalInfo.firstName.trim();
    const lastName = profile.personalInfo.lastName.trim();
    return `${firstName} ${lastName}`.trim() || 'Candidate Name';
  }

  private getProfessionalTitle(profile: UserProfile, offer: EmployerTailoringRequest): string {
    const professionalTitle = profile.professionalTitle?.trim();
    return professionalTitle || offer.jobPosition;
  }

  private getProfessionalSummary(profile: UserProfile): string {
    return profile.professionalSummary?.trim() ?? '';
  }
}
