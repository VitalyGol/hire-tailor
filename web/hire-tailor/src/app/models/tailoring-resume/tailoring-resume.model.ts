import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { AtsResumeData } from '../resume-template/resume.models';
import {
  CourseCertificate,
  Education,
  UserLanguage,
  UserLanguageLevel,
  WorkExperience,
} from '../shared/user-profile.model';

export type ResumeTemplateLanguage = 'Hebrew' | 'English';

export interface ResumeTemplate {
  readonly TemplateId: string;
  readonly TemplateName: string;
  readonly Language: ResumeTemplateLanguage;
}

export interface GeneratedResumePreview extends AtsResumeData {
  readonly personalInfo: {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
  };
  readonly fullName: string;
  readonly professionalTitle: string;
  readonly professionalSummary: string;
  readonly skills: readonly string[];
  readonly workExperience: readonly WorkExperience[];
  readonly education: readonly Education[];
  readonly courses: readonly CourseCertificate[];
  readonly languages: readonly UserLanguage[];
}

export interface TemplatePreviewDialogData {
  readonly template: ResumeTemplate;
  readonly resume: GeneratedResumePreview | null;
}

export type PersonalInfoForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
}>;

export type WorkProjectForm = FormGroup<{
  projectName: FormControl<string>;
  projectDescription: FormControl<string>;
}>;

export type WorkExperienceForm = FormGroup<{
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  companyName: FormControl<string>;
  position: FormControl<string>;
  projects: FormArray<WorkProjectForm>;
}>;

export type EducationForm = FormGroup<{
  institution: FormControl<string>;
  specialization: FormControl<string>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
}>;

export type CourseCertificateForm = FormGroup<{
  title: FormControl<string>;
  organization: FormControl<string>;
  issueDate: FormControl<Date | null>;
  certificateUrl: FormControl<string>;
}>;

export type UserLanguageForm = FormGroup<{
  language: FormControl<string>;
  level: FormControl<UserLanguageLevel | null>;
}>;

export type ResumeForm = FormGroup<{
  personalInfo: PersonalInfoForm;
  professionalTitle: FormControl<string>;
  professionalSummary: FormControl<string>;
  workExperience: FormArray<WorkExperienceForm>;
  education: FormArray<EducationForm>;
  courses: FormArray<CourseCertificateForm>;
  languages: FormArray<UserLanguageForm>;
}>;
