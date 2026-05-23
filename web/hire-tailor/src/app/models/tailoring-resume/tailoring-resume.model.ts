import { FormArray, FormControl, FormGroup } from '@angular/forms';

import {
  CourseCertificate,
  CourseCertificateForm,
  Education,
  EducationForm,
  PersonalInfoForm,
  UserLanguage,
  UserLanguageForm,
  WorkExperience,
  WorkExperienceForm,
} from '../shared/user-profile.model';

export type ResumeTemplateLanguage = 'Hebrew' | 'English';

export interface ResumeTemplate {
  readonly TemplateId: string;
  readonly TemplateName: string;
  readonly Language: ResumeTemplateLanguage;
}

export interface GeneratedResumePreview {
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

export type ResumeForm = FormGroup<{
  personalInfo: PersonalInfoForm;
  professionalTitle: FormControl<string>;
  professionalSummary: FormControl<string>;
  workExperience: FormArray<WorkExperienceForm>;
  education: FormArray<EducationForm>;
  courses: FormArray<CourseCertificateForm>;
  languages: FormArray<UserLanguageForm>;
}>;
