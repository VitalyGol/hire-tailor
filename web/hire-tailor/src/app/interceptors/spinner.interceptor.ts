import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { SpinnerService } from '../services/spinner.service';

export const SKIP_SPINNER_HEADER = 'skip-spinner';

export const spinnerInterceptor: HttpInterceptorFn = (request, next) => {
  const spinner = inject(SpinnerService);
  const shouldSkipSpinner = request.headers.has(SKIP_SPINNER_HEADER);
  const requestWithoutSpinnerHeader = shouldSkipSpinner
    ? request.clone({ headers: request.headers.delete(SKIP_SPINNER_HEADER) })
    : request;

  if (shouldSkipSpinner) {
    return next(requestWithoutSpinnerHeader);
  }

  spinner.show();

  return next(requestWithoutSpinnerHeader).pipe(finalize(() => spinner.hide()));
};
