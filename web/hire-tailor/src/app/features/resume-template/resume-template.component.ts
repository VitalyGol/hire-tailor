import { Component, Input } from '@angular/core';

import { AtsResumeData, AtsResumeLanguage } from '../../models/resume-template/resume.models';

@Component({
  selector: 'app-resume-template',
  imports: [],
  templateUrl: './resume-template.component.html',
  styleUrl: './resume-template.component.scss',
})
export class ResumeTemplateComponent {
  @Input({ required: true }) resume: AtsResumeData | null = null;
  @Input() language: AtsResumeLanguage = 'en';

  protected get direction(): 'ltr' | 'rtl' {
    return this.language === 'he' ? 'rtl' : 'ltr';
  }

  protected get fullName(): string {
    const firstName = this.resume?.personalInfo.firstName.trim() ?? '';
    const lastName = this.resume?.personalInfo.lastName.trim() ?? '';

    return `${firstName} ${lastName}`.trim();
  }

  protected get labels(): ResumeTemplateLabels {
    return this.language === 'he'
      ? {
          professionalSummary: 'תקציר מקצועי',
          workExperience: 'ניסיון תעסוקתי',
          education: 'השכלה',
          courses: 'קורסים והסמכות',
          languages: 'שפות',
          present: 'היום',
        }
      : {
          professionalSummary: 'Professional Summary',
          workExperience: 'Work Experience',
          education: 'Education',
          courses: 'Courses & Certifications',
          languages: 'Languages',
          present: 'Present',
        };
  }

  protected hasItems<T>(items: readonly T[] | null | undefined): items is readonly T[] {
    return Array.isArray(items) && items.length > 0;
  }

  protected hasText(value: string | null | undefined): value is string {
    return !!value?.trim();
  }

  protected formatDateRange(
    startDate: string | Date | null,
    endDate: string | Date | null | undefined,
  ): string {
    const start = this.formatDate(startDate);
    const end = endDate ? this.formatDate(endDate) : this.labels.present;

    if (!start) {
      return end;
    }

    return `${start} – ${end}`;
  }

  protected formatSingleDate(date: string | Date | null): string {
    return this.formatDate(date);
  }

  private formatDate(value: string | Date | null): string {
    const date = this.parseDate(value);

    if (!date) {
      return '';
    }

    return new Intl.DateTimeFormat(this.language === 'he' ? 'he-IL' : 'en-US', {
      month: this.language === 'he' ? 'long' : 'short',
      year: 'numeric',
    }).format(date);
  }

  private parseDate(value: string | Date | null): Date | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}

interface ResumeTemplateLabels {
  readonly professionalSummary: string;
  readonly workExperience: string;
  readonly education: string;
  readonly courses: string;
  readonly languages: string;
  readonly present: string;
}
