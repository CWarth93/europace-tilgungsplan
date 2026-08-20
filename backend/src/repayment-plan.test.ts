import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateMonthlyInterest, calculateMonthlyRate, createRepaymentPlan, validateRequest } from './repayment-plan.js';

const example = { loanAmount: 100000, interestRate: 2.12, initialRepaymentRate: 2, fixedInterestYears: 10 };

test('calculates the exercise example in cents with month-end dates', () => {
  const plan = createRepaymentPlan(example, new Date('2025-11-15T00:00:00Z'));
  assert.equal(plan.monthlyRateCents, 34333);
  assert.equal(plan.rows.length, 121);
  assert.deepEqual(plan.rows.slice(0, 2).map(({ date, interestCents, repaymentOrPayoutCents, paymentCents }) => ({ date, interestCents, repaymentOrPayoutCents, paymentCents })), [
    { date: '2025-11-30', interestCents: 0, repaymentOrPayoutCents: -10000000, paymentCents: -10000000 },
    { date: '2025-12-31', interestCents: 17667, repaymentOrPayoutCents: 16666, paymentCents: 34333 },
  ]);
  assert.deepEqual(plan.summary, { remainingBalanceCents: 7774414, totalInterestCents: 1894374, totalRepaymentCents: 2225586, totalPaymentsCents: 4119960 });
});

test('rounds rate and interest independently to cents', () => {
  assert.equal(calculateMonthlyRate(10000000, 2.12, 2), 34333);
  assert.equal(calculateMonthlyInterest(10000000, 2.12), 17667);
});

test('retains zero-value rows after early repayment so the fixed period stays complete', () => {
  const plan = createRepaymentPlan({ loanAmount: 100, interestRate: 1, initialRepaymentRate: 120, fixedInterestYears: 1 }, new Date('2024-01-01T00:00:00Z'));
  assert.equal(plan.rows.length, 13);
  const firstZeroBalance = plan.rows.findIndex(row => row.type === 'payment' && row.remainingBalanceCents === 0);
  assert.ok(firstZeroBalance > 0);
  assert.ok(plan.rows.slice(firstZeroBalance + 1).every(row => row.interestCents === 0 && row.paymentCents === 0));
});

test('returns field-specific validation errors and rejects coercion', () => {
  const result = validateRequest({ loanAmount: '100000', interestRate: 0, initialRepaymentRate: -1, fixedInterestYears: 2.5 });
  assert.equal(result.valid, false);
  if (!result.valid) assert.deepEqual(Object.keys(result.errors).sort(), ['fixedInterestYears', 'initialRepaymentRate', 'interestRate', 'loanAmount']);
});
