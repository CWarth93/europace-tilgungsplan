import cors from 'cors';
import express from 'express';
import { createRepaymentPlan, validateRequest } from './repayment-plan.js';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '16kb' }));

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

app.post('/api/repayment-plan', (request, response) => {
  const validation = validateRequest(request.body);
  if (!validation.valid) {
    response.status(400).json({ errors: validation.errors });
    return;
  }
  response.json(createRepaymentPlan(validation.value));
});

export default app;
