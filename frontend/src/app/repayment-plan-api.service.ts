import { Injectable } from '@angular/core';
import type { RepaymentPlanRequest, RepaymentPlanResponse, ValidationErrorResponse, ValidationErrors } from './repayment-plan.models';

export class ApiValidationError extends Error {
  constructor(readonly errors: ValidationErrors) { super('Validation failed'); }
}

@Injectable({ providedIn: 'root' })
export class RepaymentPlanApiService {
  async createPlan(request: RepaymentPlanRequest): Promise<RepaymentPlanResponse> {
    const response = await fetch('/api/repayment-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) });
    if (response.status === 400) throw new ApiValidationError((await response.json() as ValidationErrorResponse).errors);
    if (!response.ok) throw new Error('API request failed');
    return response.json() as Promise<RepaymentPlanResponse>;
  }
}
