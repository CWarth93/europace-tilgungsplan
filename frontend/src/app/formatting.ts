export const formatMoney = (cents: number): string => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(cents / 100).replace(/\u00a0/g, ' ');
export const formatDate = (value: string): string => new Intl.DateTimeFormat('de-DE', { timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
