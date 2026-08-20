import cors from 'cors';
import express from 'express';
import { createRepaymentPlan, validateRequest } from './repayment-plan.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/repayment-plan', (request, response) => {
  const input = validateRequest(request.body);
  if (!input) {
    response.status(400).json({ error: 'Bitte prüfe die eingegebenen Darlehensdaten.' });
    return;
  }
  response.json(createRepaymentPlan(input));
});

export default app;
