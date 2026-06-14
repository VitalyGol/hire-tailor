import { FormArray, FormControl, FormGroup } from '@angular/forms';

export type UserLanguageLevel = 'beginner' | 'intermediate' | 'advanced' | 'fluent' | 'native';

export type PersonalInfoForm = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phoneNumber: FormControl<string>;
}>;

export type WorkProjectForm = FormGroup<{
  projectName: FormControl<string>;
  projectDescription: FormControl<string>;
  skills: FormControl<string[]>;
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

export interface UserProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string | null;
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
  skills: string[];
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
