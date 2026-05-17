export interface EmployerTailoringRequest {
  id: string;
  employerName: string;
  jobPosition: string;
  jobRequirements: string;
  createdAt: string;
  isArchived?: boolean;
}
