export type AtsResumeLanguage = 'en' | 'he';

export interface AtsResumePersonalInfo {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
}

export interface AtsResumeProject {
  readonly projectName: string;
  readonly projectDescription: string;
}

export interface AtsResumeWorkExperience {
  readonly startDate: string | Date | null;
  readonly endDate?: string | Date | null;
  readonly companyName: string;
  readonly position: string;
  readonly projects?: readonly AtsResumeProject[] | null;
}

export interface AtsResumeEducation {
  readonly institution: string;
  readonly specialization: string;
  readonly startDate: string | Date | null;
  readonly endDate?: string | Date | null;
}

export interface AtsResumeCourse {
  readonly title: string;
  readonly organization: string;
  readonly issueDate: string | Date | null;
  readonly certificateUrl?: string | null;
}

export interface AtsResumeUserLanguage {
  readonly language: string;
  readonly level: string;
}

export interface AtsResumeData {
  readonly personalInfo: AtsResumePersonalInfo;
  readonly professionalTitle?: string | null;
  readonly professionalSummary?: string | null;
  readonly workExperience?: readonly AtsResumeWorkExperience[] | null;
  readonly education?: readonly AtsResumeEducation[] | null;
  readonly courses?: readonly AtsResumeCourse[] | null;
  readonly languages?: readonly AtsResumeUserLanguage[] | null;
}
