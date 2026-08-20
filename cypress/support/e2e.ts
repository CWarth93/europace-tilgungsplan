import 'cypress-axe';

declare global {
  namespace Cypress {
    interface Chainable {
      injectAxe(): Chainable<void>;
      checkA11y(context?: string, options?: object): Chainable<void>;
    }
  }
}
