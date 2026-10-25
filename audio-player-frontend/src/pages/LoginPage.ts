import { el } from 'redom';
import { createAuthForm } from '../components/AuthForm';
import type { AuthCredentials } from '../types/Auth';

interface LoginPageOptions {
  message: string;
  onSubmit: (credentials: AuthCredentials) => void;
  onRegister: () => void;
}

export function createLoginPage(options: LoginPageOptions): HTMLElement {
  return el(
    'main.auth-page',
    el('div.auth-page__brand', el('span.logo__mark'), el('span.logo__text', 'VibeCast Studio')),
    createAuthForm({
      title: 'Log in',
      submitText: 'Log in',
      switchText: 'Don\'t have an account?',
      switchActionText: 'Sign up',
      onSubmit: options.onSubmit,
      onSwitch: options.onRegister,
    }),
    options.message ? el('p.auth-page__message', options.message) : el('span'),
  );
}
