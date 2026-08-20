import { Component, Input } from '@angular/core';
import type { RepaymentPlanResponse } from './repayment-plan.models';
import { formatMoney } from './formatting';

@Component({ selector: 'app-repayment-summary', template: `<div class="summary-grid"><article class="card summary-card"><p>Monatliche Rate</p><strong data-cy="monthly-rate">{{ money(plan.monthlyRateCents) }}</strong></article><article class="card summary-card"><p>Restschuld zum Ende</p><strong data-cy="remaining-balance" class="positive">{{ money(plan.summary.remainingBalanceCents) }}</strong></article><article class="card summary-card"><p>Zahlungen gesamt</p><strong data-cy="total-payments">{{ money(plan.summary.totalPaymentsCents) }}</strong></article></div>` })
export class RepaymentSummaryComponent { @Input({ required: true }) plan!: RepaymentPlanResponse; readonly money = formatMoney; }
