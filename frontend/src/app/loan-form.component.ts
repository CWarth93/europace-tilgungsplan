import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { RepaymentPlanRequest, ValidationErrors } from './repayment-plan.models';

@Component({
  selector: 'app-loan-form',
  imports: [FormsModule],
  template: `
    <section class="card input-card" aria-labelledby="loan-data-title">
      <div class="section-heading"><div><p class="eyebrow">SCHRITT 1</p><h2 id="loan-data-title">Darlehensdaten</h2></div><span>Monatliche Annuität</span></div>
      <form data-cy="planner-form" aria-label="Darlehensdaten eingeben" (ngSubmit)="submit()" novalidate>
        <div class="form-grid">
          <div class="field"><label for="loan-amount">Darlehensbetrag <span>in €</span></label><input data-cy="loan-amount" id="loan-amount" name="loanAmount" type="number" min="0" step="0.01" [(ngModel)]="value.loanAmount" (blur)="submitted = true" aria-describedby="loan-amount-error" />@if (message('loanAmount')) { <p class="field-error" data-cy="loan-amount-error" id="loan-amount-error">{{ message('loanAmount') }}</p> }</div>
          <div class="field"><label for="interest-rate">Sollzins <span>in % p.a.</span></label><input data-cy="interest-rate" id="interest-rate" name="interestRate" type="number" min="0" step="0.01" [(ngModel)]="value.interestRate" (blur)="submitted = true" aria-describedby="interest-rate-error" />@if (message('interestRate')) { <p class="field-error" data-cy="interest-rate-error" id="interest-rate-error">{{ message('interestRate') }}</p> }</div>
          <div class="field"><label for="initial-repayment-rate">Anfängliche Tilgung <span>in % p.a.</span></label><input data-cy="initial-repayment-rate" id="initial-repayment-rate" name="initialRepaymentRate" type="number" min="0" step="0.01" [(ngModel)]="value.initialRepaymentRate" (blur)="submitted = true" aria-describedby="initial-repayment-rate-error" />@if (message('initialRepaymentRate')) { <p class="field-error" data-cy="initial-repayment-rate-error" id="initial-repayment-rate-error">{{ message('initialRepaymentRate') }}</p> }</div>
          <div class="field"><label for="fixed-interest-years">Zinsbindung <span>in Jahren</span></label><input data-cy="fixed-interest-years" id="fixed-interest-years" name="fixedInterestYears" type="number" min="1" step="1" [(ngModel)]="value.fixedInterestYears" (blur)="submitted = true" aria-describedby="fixed-interest-years-error" />@if (message('fixedInterestYears')) { <p class="field-error" data-cy="fixed-interest-years-error" id="fixed-interest-years-error">{{ message('fixedInterestYears') }}</p> }</div>
        </div>
        <button data-cy="submit-plan" class="primary-button" type="submit" [disabled]="!isValid() || loading">{{ loading ? 'Tilgungsplan wird erstellt …' : 'Tilgungsplan erstellen' }}</button>
      </form>
    </section>`,
})
export class LoanFormComponent {
  @Input({ required: true }) value!: RepaymentPlanRequest;
  @Input() loading = false;
  @Input() serverErrors: ValidationErrors = {};
  @Output() readonly calculate = new EventEmitter<RepaymentPlanRequest>();
  submitted = false;

  isValid(): boolean { return this.value && this.value.loanAmount > 0 && this.value.interestRate > 0 && this.value.initialRepaymentRate > 0 && this.value.fixedInterestYears > 0 && Number.isInteger(this.value.fixedInterestYears); }
  message(field: keyof RepaymentPlanRequest): string | undefined {
    if (this.serverErrors[field]) return this.serverErrors[field];
    if (!this.submitted) return undefined;
    const value = this.value[field];
    if (value === null || value === undefined || Number.isNaN(value)) return 'Dieses Feld ist erforderlich.';
    if (field === 'fixedInterestYears' && !Number.isInteger(value)) return 'Bitte gib eine ganze Zahl ein.';
    return value <= 0 ? 'Der Wert muss größer als 0 sein.' : undefined;
  }
  submit(): void { this.submitted = true; if (this.isValid()) this.calculate.emit({ ...this.value }); }
}
