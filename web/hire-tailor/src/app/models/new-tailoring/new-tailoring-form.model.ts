import { FormControl, FormGroup } from '@angular/forms';

export type NewTailoringForm = FormGroup<{
  employerName: FormControl<string>;
  jobPosition: FormControl<string>;
  jobRequirements: FormControl<string>;
}>;
