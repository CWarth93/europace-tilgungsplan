# End-to-End Tests

The Cypress suite in `cypress/e2e/repayment-planner.cy.ts` is an executable reproduction of the stories in `user-stories.md`. It uses the real deployed application and `POST /api/repayment-plan` for every calculation: it contains no mocked or intercepted API responses.

| Test | User story |
| --- | --- |
| `US-01` | Enter loan data |
| `US-02` | Validate entered data |
| `US-03` | Create a repayment plan |
| `US-04` | Inspect monthly payments |
| `US-05` | Understand end-of-term position |
| `US-06` | See the balance trend |
| `US-07` | Receive useful technical errors |
| `US-08` | Use the application accessibly |

The `data-cy` selectors in the suite are the implementation contract for the UI. Calculation assertions use the example input and independently verify the real API's complete 120-month schedule and its resulting totals.

## Run locally

```bash
npm ci
CYPRESS_BASE_URL=https://europace-tilgungsplan-christopherwarths-projects.vercel.app npm run e2e
```

## Deployment pipeline

Vercel deploys pushes to `main` through its existing GitHub integration. When Vercel reports a successful GitHub production deployment, `.github/workflows/e2e-after-vercel-deploy.yml` automatically starts Cypress against that deployment's public environment URL. The workflow fails while any user story is not fulfilled and uploads screenshots/videos as evidence.
