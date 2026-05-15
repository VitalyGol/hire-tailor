import { Injectable } from '@angular/core';

import { EmployerTailoringRequest } from '../features/new-tailoring/new-tailoring';

export const EMPLOYERS_STORAGE_KEY = 'hiretailor_employers';

@Injectable({
  providedIn: 'root',
})
export class TailoringStorageService {
  getEmployers(): EmployerTailoringRequest[] {
    let storedEmployers: string | null = null;

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

  saveEmployers(employers: readonly EmployerTailoringRequest[]): boolean {
    try {
      localStorage.setItem(EMPLOYERS_STORAGE_KEY, JSON.stringify(employers));
      return true;
    } catch (error) {
      console.error('Failed to save employers to storage:', error);
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

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }
}
