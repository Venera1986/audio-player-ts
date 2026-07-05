import { el } from 'redom';
import { createAuthForm } from '../components/AuthForm';
import type { AuthCredentials } from '../types/Auth';

interface RegisterPageOptions {
  message: string;
  onSubmit: (credentials: AuthCredentials) => void;
  onLogin: () => void;
}

export function createRegisterPage(options: RegisterPageOptions): HTMLElement {
  return el(
    'main.auth-page',
    el('div.auth-page__brand', el('span.logo__mark'), el('span.logo__text', 'VibeCast Studio')),
    createAuthForm({
      title: 'Регистрация',
      submitText: 'Создать аккаунт',
      switchText: 'Уже есть аккаунт?',
      switchActionText: 'Войти',
      onSubmit: options.onSubmit,
      onSwitch: options.onLogin,
    }),
    options.message ? el('p.auth-page__message', options.message) : el('span'),
  );
}
