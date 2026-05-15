import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { UserProfile } from '../features/user-profile/user-profile.component';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private readonly httpClient = inject(HttpClient);
  private readonly uploadUrl = `${environment.apiUrl}/resume/extract`;

  uploadResume(file: File): Observable<UserProfile> {
    const formData = new FormData();
    console.log('Uploading file:', file);
    formData.append('file', file, file.name);

    return this.httpClient.post<UserProfile>(this.uploadUrl, formData);
  }

  generateResume(userProfile: UserProfile, jobRequirements: string, language: string): Observable<UserProfile> {
    const generateUrl = `${environment.apiUrl}/resume/generate`;
    return this.httpClient.post<UserProfile>(generateUrl, { resume: userProfile, job_requirement:jobRequirements, language });
  }
}
