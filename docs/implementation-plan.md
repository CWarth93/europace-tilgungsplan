# Implementation Plan

## Goal

Build a German-language web application that creates a monthly annuity-loan repayment plan from the loan amount, annual nominal interest rate, initial repayment rate, and fixed-interest period.

## Scope and acceptance criteria

The application must:

- accept all four parameters and validate them before calculation;
- create an initial payout row on the last day of the current month;
- create monthly payment rows beginning on the last day of the following month;
- keep the monthly annuity constant throughout the fixed-interest period;
- show date, remaining balance, interest, repayment/payout, and monthly payment for every row;
- show remaining balance and aggregated interest, repayment, and payments at the end of the fixed-interest period;
- expose the calculation through a TypeScript Express REST API;
- present the result in Angular, guided by `docs/ui-mockup.png`.

## Architecture

| Area | Responsibility |
| --- | --- |
| `frontend/` | Angular form, API client, result summary, table, responsive UI |
| `backend/` | Express REST API, request validation, repayment calculation |
| `backend/src/` | Calculation domain types, service, routes, unit tests |
| `docs/` | Mockup, this plan, and short AI-usage documentation |

### API contract

`POST /api/repayment-plan`

Request body:

```json
{
  "loanAmount": 100000,
  "interestRate": 2.12,
  "initialRepaymentRate": 2,
  "fixedInterestYears": 10
}
```

Response includes normalized input, monthly rate, payout date, rows, and end-of-term totals. Monetary values are represented as integer cents in the API calculation/result model to prevent floating-point rounding errors.

## Delivery steps

### 1. Define calculation rules and domain model

- Create request, plan-row, summary, and response TypeScript types.
- Define the annuity as `(annual interest rate + initial repayment rate) / 12 × loan amount`.
- Use full calendar months and determine each date with `last day of month` logic, including leap years.
- Round displayed and stored monetary values consistently to cents.
- Record the payout row with negative payout/payment values as shown in the assignment.

### 2. Implement and test the calculation service

- Build a pure `createRepaymentPlan` function with no Express dependency.
- For each payment month: calculate interest from the previous outstanding balance, derive repayment from the fixed rate minus interest, and reduce the balance.
- Produce an end-of-term summary for remaining balance, total interest, total repayment, and total payments.
- Add unit tests for the provided example, a leap-year boundary, short fixed-interest periods, invalid input, and rounding consistency.

### 3. Expose the REST API

- Add `POST /api/repayment-plan`.
- Validate required fields, positive amount/rates, and whole positive fixed-interest years.
- Return `400` with a clear error payload for invalid requests.
- Keep `GET /api/health` for deployment checks.
- Add integration tests for successful and invalid requests.

### 4. Build the Angular input experience

- Replace the default Angular screen with the layout in `ui-mockup.png`.
- Create a typed reactive form for the four loan fields.
- Apply German number formatting, field-level validation, sensible defaults from the exercise, and an accessible submit button.
- Call the API on submit and show loading and error states.

### 5. Build the results view

- Add summary cards for monthly rate, end balance, and total payments.
- Render the repayment plan table with German dates and currency formatting.
- Add client-side pagination or a scrollable table for long plans.
- Add a simple remaining-balance chart; this is a usability enhancement, not required for the calculation.
- Display an end-of-fixed-interest summary row matching the exercise wording.

### 6. Quality, documentation, and deployment

- Run frontend and backend builds plus all tests.
- Check responsive and keyboard-accessible behavior.
- Add a concise README covering local setup, API endpoint, calculation assumptions, and deployment URL.
- Add an `AI_USAGE.md` explaining how AI helped scaffold, design, and review the work, as requested by the exercise.
- Commit the completed implementation and confirm the production deployment responds correctly.

## Suggested implementation order

1. Backend domain model and pure calculation tests.
2. Express endpoint and API tests.
3. Angular form and API integration.
4. Results table and summary cards.
5. Chart, visual polish, documentation, and final verification.

## Key decisions to confirm while implementing

- Use the machine's current date for the payout date, as the brief requires the last day of the current month.
- Treat the fixed-interest duration as exactly `years × 12` monthly payments after payout.
- Keep the contract in euros at the UI boundary and convert to cents in calculation code.
- Do not calculate an early final payoff: the objective is the balance at the end of the fixed-interest period.
