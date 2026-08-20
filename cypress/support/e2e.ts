import 'cypress-axe';

// Cypress intentionally does not implement {tab} in cy.type(). The acceptance
// suite uses it to express ordinary keyboard navigation, so provide the missing
// browser-level behavior without changing the story specifications themselves.
Cypress.Commands.overwrite('type' as never, ((originalFn: (...args: unknown[]) => Cypress.Chainable, subject: JQuery<HTMLElement>, text: string, options?: unknown) => {
  if (text !== '{tab}') return originalFn(subject, text, options);

  return cy.wrap(subject).then(($subject) => {
    const current = $subject.get(0) as HTMLElement;
    const focusable = Array.from(current.ownerDocument.querySelectorAll<HTMLElement>(
      'input:not([disabled]), button:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => element.offsetParent !== null);
    const next = focusable[focusable.indexOf(current) + 1];
    next?.focus();
    return cy.wrap(next);
  });
}) as never);
