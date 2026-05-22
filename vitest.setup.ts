import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Polyfill HTMLFormElement.prototype.requestSubmit for JSDOM in beforeEach
beforeEach(() => {
  if (typeof window !== 'undefined' && window.HTMLFormElement) {
    window.HTMLFormElement.prototype.requestSubmit = function (submitter) {
      const event = new window.Event('submit', { bubbles: true, cancelable: true });
      Object.defineProperty(event, 'submitter', { value: submitter || this });
      this.dispatchEvent(event);
    };
  }
});

vi.mock('react-dom', async () => {
  const actual = await vi.importActual<typeof import('react-dom')>('react-dom');
  return {
    ...actual,
    useFormState: (action: any, initialState: any) => {
      const React = require('react');
      const [state, setState] = React.useState(initialState);
      const formAction = async (formData?: any) => {
        const result = await action(state, formData);
        setState(result);
        return result;
      };
      return [state, formAction];
    },
    useFormStatus: () => ({
      pending: false,
      data: null,
      method: null,
      action: null,
    }),
  };
});
