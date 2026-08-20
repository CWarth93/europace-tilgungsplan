import type { PlanRow, RepaymentPlanRequest, RepaymentPlanResponse, ValidationErrors } from '../../shared/repayment-plan.types.js';

export const MAX_LOAN_AMOUNT = 100_000_000;
export const MAX_FIXED_INTEREST_YEARS = 50;
export type RequestValidationResult = { valid: true; value: RepaymentPlanRequest } | { valid: false; errors: ValidationErrors };

const numericValue = (input: Record<string, unknown>, field: keyof RepaymentPlanRequest): number =>
  typeof input[field] === 'number' ? input[field] : Number.NaN;

/** Validates untrusted JSON without coercing strings or other unexpected values. */
export function validateRequest(value: unknown): RequestValidationResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return { valid: false, errors: { loanAmount: 'Die Darlehensdaten müssen angegeben werden.' } };
  const input = value as Record<string, unknown>;
  const request: RepaymentPlanRequest = {
    loanAmount: numericValue(input, 'loanAmount'), interestRate: numericValue(input, 'interestRate'),
    initialRepaymentRate: numericValue(input, 'initialRepaymentRate'), fixedInterestYears: numericValue(input, 'fixedInterestYears'),
  };
  const errors: ValidationErrors = {};
  if (!Number.isFinite(request.loanAmount) || request.loanAmount <= 0) errors.loanAmount = 'Der Darlehensbetrag muss größer als 0 sein.';
  else if (request.loanAmount > MAX_LOAN_AMOUNT) errors.loanAmount = `Der Darlehensbetrag darf höchstens ${MAX_LOAN_AMOUNT.toLocaleString('de-DE')} € betragen.`;
  if (!Number.isFinite(request.interestRate) || request.interestRate <= 0) errors.interestRate = 'Der Sollzins muss größer als 0 sein.';
  if (!Number.isFinite(request.initialRepaymentRate) || request.initialRepaymentRate <= 0) errors.initialRepaymentRate = 'Die anfängliche Tilgung muss größer als 0 sein.';
  if (!Number.isFinite(request.fixedInterestYears) || request.fixedInterestYears <= 0 || !Number.isInteger(request.fixedInterestYears)) errors.fixedInterestYears = 'Die Zinsbindung muss eine positive ganze Zahl sein.';
  else if (request.fixedInterestYears > MAX_FIXED_INTEREST_YEARS) errors.fixedInterestYears = `Die Zinsbindung darf höchstens ${MAX_FIXED_INTEREST_YEARS} Jahre betragen.`;
  return Object.keys(errors).length === 0 ? { valid: true, value: request } : { valid: false, errors };
}

export const calculateMonthlyRate = (loanAmountCents: number, interestRate: number, initialRepaymentRate: number): number => Math.round(loanAmountCents * ((interestRate + initialRepaymentRate) / 100) / 12);
export const calculateMonthlyInterest = (balanceCents: number, interestRate: number): number => Math.round(balanceCents * (interestRate / 100) / 12);
const lastDayOfMonth = (year: number, monthIndex: number) => new Date(Date.UTC(year, monthIndex + 1, 0));
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

function createPaymentRow(date: Date, balanceCents: number, monthlyRateCents: number, interestRate: number): PlanRow {
  const interestCents = calculateMonthlyInterest(balanceCents, interestRate);
  const repaymentCents = Math.min(Math.max(monthlyRateCents - interestCents, 0), balanceCents);
  const paymentCents = Math.min(monthlyRateCents, balanceCents + interestCents);
  return { date: isoDate(date), remainingBalanceCents: balanceCents - repaymentCents, interestCents, repaymentOrPayoutCents: repaymentCents, paymentCents, type: 'payment' };
}

/** Produces every fixed-period row; post-payoff rows explicitly show zero amounts. */
export function createRepaymentPlan(input: RepaymentPlanRequest, today = new Date()): RepaymentPlanResponse {
  const loanAmountCents = Math.round(input.loanAmount * 100);
  const monthlyRateCents = calculateMonthlyRate(loanAmountCents, input.interestRate, input.initialRepaymentRate);
  const payoutDate = lastDayOfMonth(today.getUTCFullYear(), today.getUTCMonth());
  const rows: PlanRow[] = [{ date: isoDate(payoutDate), remainingBalanceCents: loanAmountCents, interestCents: 0, repaymentOrPayoutCents: -loanAmountCents, paymentCents: -loanAmountCents, type: 'payout' }];
  let balanceCents = loanAmountCents; let totalInterestCents = 0; let totalRepaymentCents = 0;
  for (let month = 1; month <= input.fixedInterestYears * 12; month += 1) {
    const row = createPaymentRow(lastDayOfMonth(payoutDate.getUTCFullYear(), payoutDate.getUTCMonth() + month), balanceCents, monthlyRateCents, input.interestRate);
    rows.push(row); balanceCents = row.remainingBalanceCents; totalInterestCents += row.interestCents; totalRepaymentCents += row.repaymentOrPayoutCents;
  }
  return { monthlyRateCents, rows, summary: { remainingBalanceCents: balanceCents, totalInterestCents, totalRepaymentCents, totalPaymentsCents: totalInterestCents + totalRepaymentCents } };
}
