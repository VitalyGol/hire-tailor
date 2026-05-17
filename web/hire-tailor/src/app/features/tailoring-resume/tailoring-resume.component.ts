import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { EmployerTailoringRequest } from '../new-tailoring/new-tailoring';
import {
  CourseCertificate,
  Education,
  UserLanguage,
  UserProfile,
  WorkExperience,
  WorkProject,
} from '../user-profile/user-profile.component';
import { TailoringStorageService } from '../../services/tailoring-storage.service';
import { UploadService } from '../../services/upload.service';

const USER_PROFILE_STORAGE_KEY = 'hiretailor_user_profile';
const KEYWORD_LIMIT = 18;
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
const STOP_WORDS = new Set([
  'and',
  'are',
  'for',
  'from',
  'have',
  'the',
  'this',
  'that',
  'with',
  'you',
  'your',
  'will',
  'about',
  'ability',
  'able',
  'experience',
  'knowledge',
  'requirements',
  'skills',
  'work',
  'working',
]);

type ResumeTemplateLanguage = 'Hebrew' | 'English';

interface ResumeTemplate {
  readonly TemplateId: string;
  readonly TemplateName: string;
  readonly Language: ResumeTemplateLanguage;
}

interface GeneratedResumePreview {
  readonly fullName: string;
  readonly professionalTitle: string;
  readonly professionalSummary: string;
  readonly skills: readonly string[];
  readonly workExperience: readonly WorkExperience[];
  readonly education: readonly Education[];
  readonly courses: readonly CourseCertificate[];
  readonly languages: readonly UserLanguage[];
}

interface TemplatePreviewDialogData {
  readonly template: ResumeTemplate;
  readonly resume: GeneratedResumePreview | null;
}

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
    MatDividerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressBarModule,
    MatSelectModule,
    MatSnackBarModule,
    JsonPipe
  ],
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
  protected readonly userProfile = signal<UserProfile | null>(this.loadUserProfileFromStorage());

  protected jsonTest = {};

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

  protected readonly selectedTemplatePreviewAlt = computed(() => this.selectedTemplate()?.TemplateName ?? 'No preview');

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
      skills: this.deriveSkills(currentOffer.jobRequirements, profile),
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
        this.offer.set(id ? this.tailoringStorage.findEmployerById(id) : null);
      });
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
    this.uploadService.generateResume(
      this.userProfile()!,
      this.offer()?.jobRequirements ?? '',
      'English',
    ).subscribe({
      next: updatedProfile => {
        this.jsonTest = updatedProfile;
        this.snackBar.open('Resume regenerated successfully', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to regenerate resume. Please try again later.', 'Close', { duration: 3000 });
      },
    });
    this.snackBar.open('Resume regeneration will be available soon', 'Close', { duration: 3000 });
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

  private loadUserProfileFromStorage(): UserProfile | null {
    let rawProfile: string | null;

    try {
      rawProfile = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to read user profile from storage:', error);
      return null;
    }

    if (!rawProfile) {
      return null;
    }

    try {
      const parsedProfile: unknown = JSON.parse(rawProfile);
      return this.isUserProfile(parsedProfile) ? parsedProfile : null;
    } catch (error) {
      console.error('Failed to parse user profile from storage:', error);
      return null;
    }
  }

  private deriveSkills(jobRequirements: string, profile: UserProfile): string[] {
    const profileKeywords = profile.workExperience.flatMap(experience => [
      experience.position,
      ...experience.projects.flatMap(project => [
        project.projectName,
        ...this.extractKeywords(project.projectDescription),
      ]),
    ]);

    return this.uniqueValues([...this.extractKeywords(jobRequirements), ...profileKeywords])
      .filter(skill => skill.length > 1)
      .slice(0, KEYWORD_LIMIT);
  }

  private extractKeywords(value: string): string[] {
    const words = value
      .toLowerCase()
      .match(/[a-z][a-z0-9+#.-]{2,}/g);

    if (!words) {
      return [];
    }

    return this.uniqueValues(words)
      .filter(word => !STOP_WORDS.has(word))
      .slice(0, KEYWORD_LIMIT)
      .map(word => this.formatKeyword(word));
  }

  private getFullName(profile: UserProfile): string {
    const firstName = profile.personalInfo.firstName.trim();
    const lastName = profile.personalInfo.lastName.trim();
    return `${firstName} ${lastName}`.trim() || 'Candidate Name';
  }

  private getProfessionalTitle(
    profile: UserProfile,
    offer: EmployerTailoringRequest,
  ): string {
    const professionalTitle = profile.professionalTitle?.trim();
    return professionalTitle || offer.jobPosition;
  }

  private getProfessionalSummary(profile: UserProfile): string {
    return profile.professionalSummary?.trim() ?? '';
  }

  private countProjects(workExperience: readonly WorkExperience[]): number {
    return workExperience.reduce((total, experience) => total + experience.projects.length, 0);
  }

  private uniqueValues(values: readonly string[]): string[] {
    const result: string[] = [];
    const seen = new Set<string>();

    values.forEach(value => {
      const normalizedValue = value.trim();
      const key = normalizedValue.toLowerCase();

      if (!normalizedValue || seen.has(key)) {
        return;
      }

      seen.add(key);
      result.push(normalizedValue);
    });

    return result;
  }

  private formatKeyword(value: string): string {
    const knownUppercase = new Set(['ai', 'api', 'aws', 'css', 'html', 'js', 'sql', 'ui', 'ux']);

    if (knownUppercase.has(value)) {
      return value.toUpperCase();
    }

    return value
      .split(/([+#.-])/)
      .map(part => (part.match(/^[a-z]/) ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
      .join('');
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
      (value['professionalTitle'] === undefined ||
        typeof value['professionalTitle'] === 'string') &&
      (value['professionalSummary'] === undefined ||
        typeof value['professionalSummary'] === 'string') &&
      this.isWorkExperienceArray(value['workExperience']) &&
      this.isEducationArray(value['education']) &&
      this.isCourseArray(value['courses']) &&
      this.isLanguageArray(value['languages'])
    );
  }

  private isWorkExperienceArray(value: unknown): value is WorkExperience[] {
    return Array.isArray(value) && value.every(item => this.isWorkExperience(item));
  }

  private isWorkExperience(value: unknown): value is WorkExperience {
    return (
      this.isRecord(value) &&
      typeof value['startDate'] === 'string' &&
      (value['endDate'] === undefined ||
        value['endDate'] === null ||
        typeof value['endDate'] === 'string') &&
      typeof value['companyName'] === 'string' &&
      typeof value['position'] === 'string' &&
      this.isProjectArray(value['projects'])
    );
  }

  private isProjectArray(value: unknown): value is WorkProject[] {
    return Array.isArray(value) && value.every(item => this.isProject(item));
  }

  private isProject(value: unknown): value is WorkProject {
    return (
      this.isRecord(value) &&
      typeof value['projectName'] === 'string' &&
      typeof value['projectDescription'] === 'string'
    );
  }

  private isEducationArray(value: unknown): value is Education[] {
    return Array.isArray(value) && value.every(item => this.isEducation(item));
  }

  private isEducation(value: unknown): value is Education {
    return (
      this.isRecord(value) &&
      typeof value['institution'] === 'string' &&
      typeof value['specialization'] === 'string' &&
      typeof value['startDate'] === 'string' &&
      (value['endDate'] === undefined ||
        value['endDate'] === null ||
        typeof value['endDate'] === 'string')
    );
  }

  private isCourseArray(value: unknown): value is CourseCertificate[] {
    return Array.isArray(value) && value.every(item => this.isCourse(item));
  }

  private isCourse(value: unknown): value is CourseCertificate {
    return (
      this.isRecord(value) &&
      typeof value['title'] === 'string' &&
      typeof value['organization'] === 'string' &&
      typeof value['issueDate'] === 'string' &&
      (value['certificateUrl'] === undefined ||
        value['certificateUrl'] === null ||
        typeof value['certificateUrl'] === 'string')
    );
  }

  private isLanguageArray(value: unknown): value is UserLanguage[] {
    return Array.isArray(value) && value.every(item => this.isLanguage(item));
  }

  private isLanguage(value: unknown): value is UserLanguage {
    return (
      this.isRecord(value) &&
      typeof value['language'] === 'string' &&
      typeof value['level'] === 'string'
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
