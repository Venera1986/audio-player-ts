import { el } from 'redom';
import type { AuthCredentials } from '../types/Auth';

interface AuthFormOptions {
  title: string;
  submitText: string;
  switchText: string;
  switchActionText: string;
  onSubmit: (credentials: AuthCredentials) => void;
  onSwitch: () => void;
}

export function createAuthForm(options: AuthFormOptions): HTMLElement {
  const usernameInput = el('input.auth-form__input', {
    name: 'username',
    placeholder: 'Имя пользователя',
    autocomplete: 'username',
    required: true,
  }) as HTMLInputElement;

  const passwordInput = el('input.auth-form__input', {
    name: 'password',
    placeholder: 'Пароль',
    type: 'password',
    autocomplete: 'current-password',
    required: true,
  }) as HTMLInputElement;

  const form = el(
    'form.auth-form',
    el('h1.auth-form__title', options.title),
    el('label.auth-form__field', el('span.auth-form__label', 'Логин'), usernameInput),
    el('label.auth-form__field', el('span.auth-form__label', 'Пароль'), passwordInput),
    el('button.auth-form__submit', { type: 'submit' }, options.submitText),
    el(
      'p.auth-form__switch',
      options.switchText,
      ' ',
      el(
        'button.auth-form__link',
        { type: 'button', onclick: options.onSwitch },
        options.switchActionText,
      ),
    ),
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    options.onSubmit({
      username: usernameInput.value.trim(),
      password: passwordInput.value,
    });
  });

  return form;
}
