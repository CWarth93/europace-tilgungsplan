import { Component } from '@angular/core';
import { ApiValidationError, RepaymentPlanApiService } from './repayment-plan-api.service';
import { BalanceChartComponent } from './balance-chart.component';
import { LoanFormComponent } from './loan-form.component';
import type { RepaymentPlanRequest, RepaymentPlanResponse, ValidationErrors } from './repayment-plan.models';
import { RepaymentSummaryComponent } from './repayment-summary.component';
import { RepaymentTableComponent } from './repayment-table.component';

@Component({ selector: 'app-root', imports: [LoanFormComponent, RepaymentSummaryComponent, RepaymentTableComponent, BalanceChartComponent], templateUrl: './app.html', styleUrl: './app.scss' })
export class App {
  readonly form: RepaymentPlanRequest = { loanAmount: 100000, interestRate: 2.12, initialRepaymentRate: 2, fixedInterestYears: 10 };
  loading = false;
  error = '';
  serverErrors: ValidationErrors = {};
  plan: RepaymentPlanResponse | null = null;

  constructor(private readonly api: RepaymentPlanApiService) {}

  async createPlan(request: RepaymentPlanRequest): Promise<void> {
    this.error = '';
    this.serverErrors = {};
    this.loading = true;
    try {
      this.plan = await this.api.createPlan(request);
    } catch (error) {
      if (error instanceof ApiValidationError) this.serverErrors = error.errors;
      else this.error = 'Berechnung konnte nicht durchgeführt werden. Bitte versuche es erneut.';
    } finally {
      this.loading = false;
    }
  }
}
