import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
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
import { JsonPipe } from '@angular/common';

const USER_PROFILE_STORAGE_KEY = 'hiretailor_user_profile';
const KEYWORD_LIMIT = 18;
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

@Component({
  selector: 'app-tailoring-resume',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatProgressBarModule,
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
  private readonly tailoringStorage = inject(TailoringStorageService);
  private readonly uploadService = inject(UploadService);

  protected readonly offer = signal<EmployerTailoringRequest | null>(null);
  protected readonly requestedId = signal<string | null>(null);
  protected readonly userProfile = signal<UserProfile | null>(this.loadUserProfileFromStorage());

  protected jsonTest = {};

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
    let rawProfile: string | null = null;

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
