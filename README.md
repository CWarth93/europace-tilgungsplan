# Europace Tilgungsplan

A German-language web application that creates a monthly repayment plan (*Tilgungsplan*) for an annuity loan. Enter the loan amount, nominal interest rate, initial repayment rate, and fixed-interest period to see the monthly payments, the remaining balance, and a visual balance trend.

## The exercise

This project implements the requirements from the original [exercise brief](docs/Aufgabe.pdf). The calculation creates an initial payout entry and then monthly annuity payments for the selected fixed-interest period. It shows interest, repayment, payment amount, and the outstanding balance for each month.

## Solution architecture

The application uses TypeScript throughout.

| Part | Technology | Responsibility |
| --- | --- | --- |
| Frontend | Angular | Feature components for the loan form, summary, repayment table, and balance chart |
| Backend | Express | REST API, structured request validation, and repayment-plan calculation |
| Shared contract | TypeScript | Request, response, schedule, and validation-error types used by both applications |
| Quality assurance | Node test + Cypress | Calculation/API tests plus end-to-end tests against the deployed application |
| Hosting | Vercel | Public deployment of the frontend and API |

The flow is: **Angular form → `POST /api/repayment-plan` → Express calculation domain → typed repayment plan → Angular result components**.

The backend calculates monetary values in cents to avoid floating-point rounding errors and returns the complete payment schedule plus the end-of-term totals. Invalid requests receive field-specific `400` errors, which the form displays next to the relevant inputs. The calculation domain has unit tests and the API has integration tests for the exercise example, date/rounding edge cases, early repayment, and invalid requests.

## Documentation

- [Exercise brief](docs/Aufgabe.pdf) — original task specification.
- [User stories](docs/user-stories.md) — user needs and acceptance criteria.
- [UI mockup](docs/ui-mockup.png) — intended screen layout and visual direction.
- [Implementation plan](docs/implementation-plan.md) — architecture, calculation rules, API contract, and delivery steps.
- [E2E test documentation](docs/e2e-tests.md) — Cypress coverage and deployment-test workflow.
- [AI session log](docs/ai-session-log.md) — project-focused transcript of the implementation session.

## Project structure

```text
frontend/   Angular application
backend/    Express API and calculation domain
shared/     TypeScript API request, response, and error contracts
cypress/    Cypress end-to-end tests
docs/       Product and implementation documentation
```

## Local development

Install dependencies in the root, frontend, and backend folders. Start the API and Angular app in separate terminals:

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm start
```

Run the backend type check and tests:

```bash
cd backend
npm run build
npm test
```

Run the Cypress suite against the public deployment from the repository root:

```bash
npm run e2e
```
