import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { UserLanguageLevel } from '../shared/user-profile.model';

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

export type UserProfileForm = FormGroup<{
  personalInfo: PersonalInfoForm;
  workExperience: FormArray<WorkExperienceForm>;
  education: FormArray<EducationForm>;
  courses: FormArray<CourseCertificateForm>;
  languages: FormArray<UserLanguageForm>;
}>;
