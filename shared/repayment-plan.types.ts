/** The API contract shared by the Angular client and Express service. */
export interface RepaymentPlanRequest {
  loanAmount: number;
  interestRate: number;
  initialRepaymentRate: number;
  fixedInterestYears: number;
}

export type RepaymentPlanField = keyof RepaymentPlanRequest;
export type ValidationErrors = Partial<Record<RepaymentPlanField, string>>;

export interface PlanRow {
  date: string;
  remainingBalanceCents: number;
  interestCents: number;
  repaymentOrPayoutCents: number;
  paymentCents: number;
  type: 'payout' | 'payment';
}

export interface PlanSummary {
  remainingBalanceCents: number;
  totalInterestCents: number;
  totalRepaymentCents: number;
  totalPaymentsCents: number;
}

export interface RepaymentPlanResponse {
  monthlyRateCents: number;
  rows: PlanRow[];
  summary: PlanSummary;
}

export interface ValidationErrorResponse {
  errors: ValidationErrors;
}
