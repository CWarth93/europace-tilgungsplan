# User Stories

## US-01: Enter loan data

**As a** prospective borrower,  
**I want** to enter the loan amount, nominal interest rate, initial repayment rate, and fixed-interest period,  
**so that** I can calculate a repayment plan for my financing scenario.

### Acceptance criteria

- The form contains all four required fields.
- Amount and rates accept decimal values; the fixed-interest period accepts whole years.
- The form initially shows the example values from the assignment.
- Inputs use German labels and clear units (€ / % / Jahre).

## US-02: Validate entered data

**As a** user,  
**I want** clear feedback for invalid input,  
**so that** I can correct it before a calculation is performed.

### Acceptance criteria

- All fields are required.
- The loan amount must be greater than zero.
- Interest rate and initial repayment rate must be greater than zero.
- Fixed-interest years must be a positive whole number.
- Invalid fields show an understandable German error message.
- The calculation is not sent while the form is invalid.

## US-03: Create a repayment plan

**As a** prospective borrower,  
**I want** to generate a monthly repayment plan,  
**so that** I can understand how my loan develops during the fixed-interest period.

### Acceptance criteria

- Clicking **Tilgungsplan erstellen** sends the values to the REST API.
- The first row represents the payout on the last day of the current month.
- The first regular payment is on the last day of the following month.
- One payment row is created for every month in the fixed-interest period.
- The monthly annuity remains constant for all regular payment rows.

## US-04: Inspect monthly payments

**As a** prospective borrower,  
**I want** to see each monthly payment in a table,  
**so that** I can follow the interest, repayment, and outstanding balance over time.

### Acceptance criteria

- The table shows date, remaining balance, interest, repayment/payout, and rate.
- Amounts are formatted in German euro notation.
- Dates are formatted as `DD.MM.YYYY`.
- The payout row is visually identifiable.
- Long plans remain usable through pagination or a scrollable table.

## US-05: Understand end-of-term position

**As a** prospective borrower,  
**I want** a clear summary at the end of the fixed-interest period,  
**so that** I know what refinancing or residual debt I must plan for.

### Acceptance criteria

- The UI displays the monthly rate prominently.
- The UI displays the remaining balance at the end of the fixed-interest period.
- The UI displays total interest, total repayment, and total payments for the period.
- The summary values equal the corresponding sums and final row of the calculation result.

## US-06: See the balance trend

**As a** prospective borrower,  
**I want** a simple chart of the remaining balance,  
**so that** I can quickly understand the repayment trend.

### Acceptance criteria

- The chart uses the calculated monthly balances.
- The balance trend is clearly labeled in euros.
- The chart complements rather than replaces the tabular plan.

## US-07: Receive useful technical errors

**As a** user,  
**I want** a useful error message when the calculation service is unavailable,  
**so that** I know the calculation was not completed.

### Acceptance criteria

- The UI shows a German error message for API or network failures.
- Existing results remain visible until a new calculation succeeds.
- The user can correct input and try again without refreshing the page.

## US-08: Use the application accessibly

**As a** keyboard or assistive-technology user,  
**I want** the repayment planner to be accessible,  
**so that** I can complete the calculation independently.

### Acceptance criteria

- All inputs, controls, and table content have meaningful labels.
- The complete form is usable with keyboard navigation.
- Validation and API errors are announced accessibly.
- Text, key values, and controls meet sufficient color contrast.
