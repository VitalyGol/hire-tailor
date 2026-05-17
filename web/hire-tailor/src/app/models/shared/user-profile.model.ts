export type UserLanguageLevel = 'beginner' | 'intermediate' | 'advanced' | 'fluent' | 'native';

export interface UserProfile {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
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
