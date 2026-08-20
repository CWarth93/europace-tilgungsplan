import assert from 'node:assert/strict';
import test from 'node:test';
import type { AddressInfo } from 'node:net';
import { app } from './app.js';

const withServer = async (run: (baseUrl: string) => Promise<void>) => {
  const server = app.listen(0);
  await new Promise<void>(resolve => server.once('listening', resolve));
  try { await run(`http://127.0.0.1:${(server.address() as AddressInfo).port}`); }
  finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
};

test('POST /api/repayment-plan returns the shared response contract', async () => withServer(async baseUrl => {
  const response = await fetch(`${baseUrl}/api/repayment-plan`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ loanAmount: 100000, interestRate: 2.12, initialRepaymentRate: 2, fixedInterestYears: 10 }) });
  assert.equal(response.status, 200);
  const result = await response.json() as { rows: unknown[]; monthlyRateCents: number };
  assert.equal(result.monthlyRateCents, 34333);
  assert.equal(result.rows.length, 121);
}));

test('POST /api/repayment-plan returns structured 400 errors', async () => withServer(async baseUrl => {
  const response = await fetch(`${baseUrl}/api/repayment-plan`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ loanAmount: 0, interestRate: 1, initialRepaymentRate: 1, fixedInterestYears: 2 }) });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { errors: { loanAmount: 'Der Darlehensbetrag muss größer als 0 sein.' } });
}));
