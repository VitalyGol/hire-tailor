import { Injectable } from '@angular/core';

import { EmployerTailoringRequest } from '../models/shared/employer-tailoring-request.model';
import {
  CourseCertificate,
  Education,
  UserLanguage,
  UserProfile,
  WorkExperience,
  WorkProject,
} from '../models/shared/user-profile.model';

export const EMPLOYERS_STORAGE_KEY = 'hiretailor_employers';
export const USER_PROFILE_STORAGE_KEY = 'hiretailor_user_profile';

@Injectable({
  providedIn: 'root',
})
export class TailoringStorageService {
  getEmployers(): EmployerTailoringRequest[] {
    let storedEmployers: string | null;

    try {
      storedEmployers = localStorage.getItem(EMPLOYERS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to read employers from storage:', error);
      return [];
    }

    if (!storedEmployers) {
      return [];
    }

    try {
      const parsedEmployers: unknown = JSON.parse(storedEmployers);
      return this.isEmployerArray(parsedEmployers) ? parsedEmployers : [];
    } catch (error) {
      console.error('Failed to parse employers from storage:', error);
      return [];
    }
  }

  findEmployerById(id: string): EmployerTailoringRequest | null {
    return this.getEmployers().find(employer => employer.id === id) ?? null;
  }

  saveEmployer(employer: EmployerTailoringRequest): boolean {
    const employers = this.getEmployers();
    const existingIndex = employers.findIndex(e => e.id === employer.id);

    if (existingIndex >= 0) {
      employers[existingIndex] = employer;
    } else {
      employers.push(employer);
    }

    return this.saveEmployers(employers);
  }

  saveEmployers(employers: readonly EmployerTailoringRequest[]): boolean {
    try {
      localStorage.setItem(EMPLOYERS_STORAGE_KEY, JSON.stringify(employers));
      return true;
    } catch (error) {
      console.error('Failed to save employers to storage:', error);
      return false;
    }
  }

  getUserProfile(): UserProfile | null {
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

  saveUserProfile(profile: UserProfile): boolean {
    try {
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Failed to save user profile to storage:', error);
      return false;
    }
  }

  private isEmployerArray(value: unknown): value is EmployerTailoringRequest[] {
    return Array.isArray(value) && value.every(item => this.isEmployerTailoringRequest(item));
  }

  private isEmployerTailoringRequest(value: unknown): value is EmployerTailoringRequest {
    if (!this.isRecord(value)) {
      return false;
    }

    return (
      typeof value['id'] === 'string' &&
      typeof value['employerName'] === 'string' &&
      typeof value['jobPosition'] === 'string' &&
      typeof value['jobRequirements'] === 'string' &&
      typeof value['createdAt'] === 'string' &&
      (value['isArchived'] === undefined || typeof value['isArchived'] === 'boolean')
    );
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
