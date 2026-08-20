/**
 * Executable, one-to-one reproduction of docs/user-stories.md.
 * These tests never stub, intercept, or replace API traffic: every calculated
 * result is produced by the API at CYPRESS_BASE_URL.
 */

const validPlanRequest = { loanAmount: 100000, interestRate: 2.12, initialRepaymentRate: 2, fixedInterestYears: 10 };
const exampleSummary = { monthlyRate: '343,33 €', remainingBalance: '77.744,14 €', totalInterest: '18.943,74 €', totalRepayment: '22.255,86 €', totalPayments: '41.199,60 €' };

const germanMonthEnd = (monthsAhead: number): string => {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + monthsAhead + 1, 0));
  return new Intl.DateTimeFormat('de-DE', { timeZone: 'UTC' }).format(date);
};

const visitPlanner = () => cy.visit('/');
const fillValidForm = () => {
  cy.get('[data-cy=loan-amount]').clear().type(String(validPlanRequest.loanAmount));
  cy.get('[data-cy=interest-rate]').clear().type(String(validPlanRequest.interestRate));
  cy.get('[data-cy=initial-repayment-rate]').clear().type(String(validPlanRequest.initialRepaymentRate));
  cy.get('[data-cy=fixed-interest-years]').clear().type(String(validPlanRequest.fixedInterestYears));
};
const createRealPlan = () => {
  fillValidForm();
  cy.get('[data-cy=submit-plan]').click();
  cy.get('[data-cy=plan-row]', { timeout: 15_000 }).should('have.length', 121);
};

describe('Tilgungsplan user stories', () => {
  it('US-01: lets a prospective borrower enter all loan data', () => {
    visitPlanner();
    cy.get('[data-cy=loan-amount]').should('have.value', '100000');
    cy.get('[data-cy=interest-rate]').should('have.value', '2.12');
    cy.get('[data-cy=initial-repayment-rate]').should('have.value', '2');
    cy.get('[data-cy=fixed-interest-years]').should('have.value', '10');
    cy.contains('label', 'Darlehensbetrag').should('be.visible');
    cy.contains('label', 'Sollzins').should('be.visible');
    cy.contains('label', 'Anfängliche Tilgung').should('be.visible');
    cy.contains('label', 'Zinsbindung').should('be.visible');
  });

  it('US-02: validates required, positive, and whole-year input before calculation', () => {
    visitPlanner();
    cy.get('[data-cy=loan-amount]').clear().blur();
    cy.get('[data-cy=interest-rate]').clear().type('0').blur();
    cy.get('[data-cy=initial-repayment-rate]').clear().type('-1').blur();
    cy.get('[data-cy=fixed-interest-years]').clear().type('2.5').blur();
    cy.get('[data-cy=submit-plan]').should('be.disabled');
    cy.get('[data-cy=loan-amount-error]').should('contain.text', 'erforderlich');
    cy.get('[data-cy=interest-rate-error]').should('contain.text', 'größer als 0');
    cy.get('[data-cy=initial-repayment-rate-error]').should('contain.text', 'größer als 0');
    cy.get('[data-cy=fixed-interest-years-error]').should('contain.text', 'ganze Zahl');
  });

  it('US-03: creates a monthly plan with payout and constant monthly annuity', () => {
    visitPlanner(); createRealPlan();
    cy.get('[data-cy=plan-row]').first().should('have.attr', 'data-row-type', 'payout');
    cy.get('[data-cy=plan-row]').eq(1).should('contain.text', germanMonthEnd(1));
    cy.get('[data-cy=monthly-rate]').should('contain.text', exampleSummary.monthlyRate);
  });

  it('US-04: displays each monthly payment in a German-formatted repayment table', () => {
    visitPlanner(); createRealPlan();
    cy.get('[data-cy=repayment-table]').within(() => {
      cy.contains('th', 'Datum'); cy.contains('th', 'Restschuld'); cy.contains('th', 'Zinsen');
      cy.contains('th', 'Tilgung'); cy.contains('th', 'Rate'); cy.contains(germanMonthEnd(0)); cy.contains('100.000,00 €');
    });
    cy.get('[data-cy=payout-row]').should('be.visible');
    cy.get('[data-cy=plan-pagination], [data-cy=plan-scroll-container]').should('exist');
  });

  it('US-05: presents the end-of-term position and consistent totals', () => {
    visitPlanner(); createRealPlan();
    cy.get('[data-cy=monthly-rate]').should('contain.text', exampleSummary.monthlyRate);
    cy.get('[data-cy=remaining-balance]').should('contain.text', exampleSummary.remainingBalance);
    cy.get('[data-cy=total-interest]').should('contain.text', exampleSummary.totalInterest);
    cy.get('[data-cy=total-repayment]').should('contain.text', exampleSummary.totalRepayment);
    cy.get('[data-cy=total-payments]').should('contain.text', exampleSummary.totalPayments);
  });

  it('US-06: shows a labelled remaining-balance trend chart', () => {
    visitPlanner(); createRealPlan();
    cy.get('[data-cy=balance-chart]').should('be.visible').and('contain.text', 'Restschuld').and('contain.text', '€');
  });

  it('US-07: preserves a completed real calculation while the user tries again', () => {
    visitPlanner(); createRealPlan();
    cy.get('[data-cy=remaining-balance]').should('contain.text', exampleSummary.remainingBalance);
    cy.get('[data-cy=loan-amount]').clear().blur();
    cy.get('[data-cy=submit-plan]').should('be.disabled');
    cy.get('[data-cy=remaining-balance]').should('contain.text', exampleSummary.remainingBalance);
  });

  it('US-08: supports keyboard use and has no detectable accessibility violations', () => {
    visitPlanner(); cy.injectAxe();
    cy.get('[data-cy=loan-amount]').focus().type('{tab}');
    cy.focused().should('have.attr', 'data-cy', 'interest-rate');
    cy.get('[data-cy=planner-form]').should('have.attr', 'aria-label');
    cy.checkA11y('[data-cy=planner-form]');
  });
});
