/**
 * Executable, one-to-one reproduction of docs/user-stories.md.
 * The data-cy attributes used here are the UI contract for the Angular implementation.
 */

const validPlanRequest = {
  loanAmount: 100000,
  interestRate: 2.12,
  initialRepaymentRate: 2,
  fixedInterestYears: 10,
};

const planResponse = {
  monthlyRateCents: 34333,
  rows: [
    {
      date: '2025-11-30',
      remainingBalanceCents: 10000000,
      interestCents: 0,
      repaymentOrPayoutCents: -10000000,
      paymentCents: -10000000,
      type: 'payout',
    },
    {
      date: '2025-12-31',
      remainingBalanceCents: 9983334,
      interestCents: 17667,
      repaymentOrPayoutCents: 16666,
      paymentCents: 34333,
      type: 'payment',
    },
  ],
  summary: {
    remainingBalanceCents: 7774414,
    totalInterestCents: 1894374,
    totalRepaymentCents: 2225586,
    totalPaymentsCents: 4119960,
  },
};

const visitPlanner = () => {
  cy.visit('/');
};

const fillValidForm = () => {
  cy.get('[data-cy=loan-amount]').clear().type('100000');
  cy.get('[data-cy=interest-rate]').clear().type('2.12');
  cy.get('[data-cy=initial-repayment-rate]').clear().type('2');
  cy.get('[data-cy=fixed-interest-years]').clear().type('10');
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
    cy.intercept('POST', '/api/repayment-plan', { statusCode: 200, body: planResponse }).as('createPlan');
    visitPlanner();
    fillValidForm();

    cy.get('[data-cy=submit-plan]').click();
    cy.wait('@createPlan').its('request.body').should('deep.equal', validPlanRequest);
    cy.get('[data-cy=plan-row]').should('have.length.at.least', 2);
    cy.get('[data-cy=plan-row]').first().should('have.attr', 'data-row-type', 'payout');
    cy.get('[data-cy=plan-row]').eq(1).should('contain.text', '31.12.2025');
    cy.get('[data-cy=monthly-rate]').should('contain.text', '343,33');
  });

  it('US-04: displays each monthly payment in a German-formatted repayment table', () => {
    cy.intercept('POST', '/api/repayment-plan', { statusCode: 200, body: planResponse }).as('createPlan');
    visitPlanner();
    fillValidForm();
    cy.get('[data-cy=submit-plan]').click();
    cy.wait('@createPlan');

    cy.get('[data-cy=repayment-table]').within(() => {
      cy.contains('th', 'Datum');
      cy.contains('th', 'Restschuld');
      cy.contains('th', 'Zinsen');
      cy.contains('th', 'Tilgung');
      cy.contains('th', 'Rate');
      cy.contains('30.11.2025');
      cy.contains('100.000,00 €');
    });
    cy.get('[data-cy=payout-row]').should('be.visible');
    cy.get('[data-cy=plan-pagination], [data-cy=plan-scroll-container]').should('exist');
  });

  it('US-05: presents the end-of-term position and consistent totals', () => {
    cy.intercept('POST', '/api/repayment-plan', { statusCode: 200, body: planResponse }).as('createPlan');
    visitPlanner();
    fillValidForm();
    cy.get('[data-cy=submit-plan]').click();
    cy.wait('@createPlan');

    cy.get('[data-cy=monthly-rate]').should('contain.text', '343,33 €');
    cy.get('[data-cy=remaining-balance]').should('contain.text', '77.744,14 €');
    cy.get('[data-cy=total-interest]').should('contain.text', '18.943,74 €');
    cy.get('[data-cy=total-repayment]').should('contain.text', '22.255,86 €');
    cy.get('[data-cy=total-payments]').should('contain.text', '41.199,60 €');
  });

  it('US-06: shows a labelled remaining-balance trend chart', () => {
    cy.intercept('POST', '/api/repayment-plan', { statusCode: 200, body: planResponse }).as('createPlan');
    visitPlanner();
    fillValidForm();
    cy.get('[data-cy=submit-plan]').click();
    cy.wait('@createPlan');

    cy.get('[data-cy=balance-chart]').should('be.visible');
    cy.get('[data-cy=balance-chart]').should('contain.text', 'Restschuld');
    cy.get('[data-cy=balance-chart]').should('contain.text', '€');
  });

  it('US-07: keeps existing results and explains an API failure in German', () => {
    cy.intercept('POST', '/api/repayment-plan', { statusCode: 200, body: planResponse }).as('successfulPlan');
    visitPlanner();
    fillValidForm();
    cy.get('[data-cy=submit-plan]').click();
    cy.wait('@successfulPlan');
    cy.get('[data-cy=remaining-balance]').should('contain.text', '77.744,14 €');

    cy.intercept('POST', '/api/repayment-plan', { forceNetworkError: true }).as('failedPlan');
    cy.get('[data-cy=submit-plan]').click();
    cy.wait('@failedPlan');
    cy.get('[data-cy=api-error]').should('contain.text', 'Berechnung konnte nicht durchgeführt werden');
    cy.get('[data-cy=remaining-balance]').should('contain.text', '77.744,14 €');
  });

  it('US-08: supports keyboard use and has no detectable accessibility violations', () => {
    visitPlanner();
    cy.injectAxe();

    cy.get('[data-cy=loan-amount]').focus().type('{tab}');
    cy.focused().should('have.attr', 'data-cy', 'interest-rate');
    cy.get('[data-cy=planner-form]').should('have.attr', 'aria-label');
    cy.checkA11y('[data-cy=planner-form]');
  });
});
