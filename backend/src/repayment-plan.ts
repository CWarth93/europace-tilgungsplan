export interface RepaymentPlanRequest {
  loanAmount: number;
  interestRate: number;
  initialRepaymentRate: number;
  fixedInterestYears: number;
}

export interface PlanRow {
  date: string;
  remainingBalanceCents: number;
  interestCents: number;
  repaymentOrPayoutCents: number;
  paymentCents: number;
  type: 'payout' | 'payment';
}

export interface RepaymentPlanResponse {
  monthlyRateCents: number;
  rows: PlanRow[];
  summary: { remainingBalanceCents: number; totalInterestCents: number; totalRepaymentCents: number; totalPaymentsCents: number };
}

export function validateRequest(value: unknown): RepaymentPlanRequest | null {
  if (typeof value !== 'object' || value === null) return null;
  const input = value as Record<string, unknown>;
  const request: RepaymentPlanRequest = {
    loanAmount: Number(input['loanAmount']), interestRate: Number(input['interestRate']),
    initialRepaymentRate: Number(input['initialRepaymentRate']), fixedInterestYears: Number(input['fixedInterestYears']),
  };
  if (!Number.isFinite(request.loanAmount) || request.loanAmount <= 0 || !Number.isFinite(request.interestRate) || request.interestRate <= 0 || !Number.isFinite(request.initialRepaymentRate) || request.initialRepaymentRate <= 0 || !Number.isInteger(request.fixedInterestYears) || request.fixedInterestYears <= 0) return null;
  return request;
}

const lastDayOfMonth = (year: number, monthIndex: number) => new Date(Date.UTC(year, monthIndex + 1, 0));
const isoDate = (date: Date) => date.toISOString().slice(0, 10);

export function createRepaymentPlan(input: RepaymentPlanRequest, today = new Date()): RepaymentPlanResponse {
  const loanAmountCents = Math.round(input.loanAmount * 100);
  const monthlyRateCents = Math.round(loanAmountCents * ((input.interestRate + input.initialRepaymentRate) / 100) / 12);
  const payoutDate = lastDayOfMonth(today.getUTCFullYear(), today.getUTCMonth());
  const rows: PlanRow[] = [{ date: isoDate(payoutDate), remainingBalanceCents: loanAmountCents, interestCents: 0, repaymentOrPayoutCents: -loanAmountCents, paymentCents: -loanAmountCents, type: 'payout' }];
  let balanceCents = loanAmountCents;
  let totalInterestCents = 0;
  let totalRepaymentCents = 0;
  for (let month = 1; month <= input.fixedInterestYears * 12; month += 1) {
    const interestCents = Math.round(balanceCents * (input.interestRate / 100) / 12);
    const repaymentCents = Math.min(Math.max(monthlyRateCents - interestCents, 0), balanceCents);
    const paymentCents = Math.min(monthlyRateCents, balanceCents + interestCents);
    balanceCents -= repaymentCents;
    totalInterestCents += interestCents;
    totalRepaymentCents += repaymentCents;
    const paymentDate = lastDayOfMonth(payoutDate.getUTCFullYear(), payoutDate.getUTCMonth() + month);
    rows.push({ date: isoDate(paymentDate), remainingBalanceCents: balanceCents, interestCents, repaymentOrPayoutCents: repaymentCents, paymentCents, type: 'payment' });
  }
  return { monthlyRateCents, rows, summary: { remainingBalanceCents: balanceCents, totalInterestCents, totalRepaymentCents, totalPaymentsCents: totalInterestCents + totalRepaymentCents } };
}
