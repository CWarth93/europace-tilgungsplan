import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface PlanRow { date: string; remainingBalanceCents: number; interestCents: number; repaymentOrPayoutCents: number; paymentCents: number; type: 'payout' | 'payment'; }
interface PlanResult { monthlyRateCents: number; rows: PlanRow[]; summary: { remainingBalanceCents: number; totalInterestCents: number; totalRepaymentCents: number; totalPaymentsCents: number }; }

@Component({ selector: 'app-root', imports: [FormsModule], templateUrl: './app.html', styleUrl: './app.scss' })
export class App {
  loanAmount: number | null = 100000;
  interestRate: number | null = 2.12;
  initialRepaymentRate: number | null = 2;
  fixedInterestYears: number | null = 10;
  submitted = false;
  loading = false;
  error = '';
  plan: PlanResult | null = null;

  isValid(): boolean { return this.loanAmount !== null && this.loanAmount > 0 && this.interestRate !== null && this.interestRate > 0 && this.initialRepaymentRate !== null && this.initialRepaymentRate > 0 && this.fixedInterestYears !== null && this.fixedInterestYears > 0 && Number.isInteger(this.fixedInterestYears); }
  hasError(field: 'loanAmount' | 'interestRate' | 'initialRepaymentRate' | 'fixedInterestYears'): boolean { const value = this[field]; return this.submitted && (value === null || Number(value) <= 0 || (field === 'fixedInterestYears' && !Number.isInteger(Number(value)))); }
  fieldMessage(field: 'loanAmount' | 'interestRate' | 'initialRepaymentRate' | 'fixedInterestYears'): string { const value = this[field]; if (value === null) return 'Dieses Feld ist erforderlich.'; return field === 'fixedInterestYears' && !Number.isInteger(Number(value)) ? 'Bitte gib eine ganze Zahl ein.' : 'Der Wert muss größer als 0 sein.'; }

  async createPlan(): Promise<void> {
    this.submitted = true; this.error = '';
    if (!this.isValid()) return;
    this.loading = true;
    try {
      const response = await fetch('/api/repayment-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ loanAmount: this.loanAmount, interestRate: this.interestRate, initialRepaymentRate: this.initialRepaymentRate, fixedInterestYears: this.fixedInterestYears }) });
      if (!response.ok) throw new Error('API request failed');
      this.plan = await response.json() as PlanResult;
    } catch { this.error = 'Berechnung konnte nicht durchgeführt werden. Bitte versuche es erneut.'; } finally { this.loading = false; }
  }
  money(cents: number): string { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100).replace(/\u00a0/g, ' '); }
  date(value: string): string { return new Intl.DateTimeFormat('de-DE', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)); }
  chartPoints(): string { if (!this.plan || this.plan.rows.length < 2) return ''; const rows = this.plan.rows.slice(1); const max = Math.max(...rows.map(row => row.remainingBalanceCents), 1); return rows.map((row, index) => `${4 + index / Math.max(rows.length - 1, 1) * 292},${92 - row.remainingBalanceCents / max * 82}`).join(' '); }
}
