import { FormArray, FormGroup } from '@angular/forms';
import {
  CourseCertificateForm,
  EducationForm,
  PersonalInfoForm,
  UserLanguageForm,
  WorkExperienceForm,
} from '../shared/user-profile.model';

export type UserProfileForm = FormGroup<{
  personalInfo: PersonalInfoForm;
  workExperience: FormArray<WorkExperienceForm>;
  education: FormArray<EducationForm>;
  courses: FormArray<CourseCertificateForm>;
  languages: FormArray<UserLanguageForm>;
}>;
