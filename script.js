const form = document.getElementById('login-form');
const email = document.getElementById('email');
const password = document.getElementById('password');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const status = document.getElementById('status');
const submit = form.querySelector('.submit');
const togglePassword = document.getElementById('toggle-password');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

togglePassword.addEventListener('click', () => {
  const showing = password.type === 'text';
  password.type = showing ? 'password' : 'text';
  togglePassword.textContent = showing ? 'Show' : 'Hide';
  togglePassword.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  password.focus();
});

function setError(input, slot, message) {
  slot.textContent = message;
  input.classList.toggle('invalid', Boolean(message));
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
  return !message;
}

function validateEmail() {
  const value = email.value.trim();
  if (!value) return setError(email, emailError, 'Email is required.');
  if (!EMAIL_PATTERN.test(value)) return setError(email, emailError, 'Enter a valid email address.');
  return setError(email, emailError, '');
}

function validatePassword() {
  const value = password.value;
  if (!value) return setError(password, passwordError, 'Password is required.');
  if (value.length < 8) return setError(password, passwordError, 'Password must be at least 8 characters.');
  return setError(password, passwordError, '');
}

// Only re-validate a field once it has been blurred, so typing isn't nagged at.
email.addEventListener('blur', validateEmail);
password.addEventListener('blur', validatePassword);
email.addEventListener('input', () => email.classList.contains('invalid') && validateEmail());
password.addEventListener('input', () => password.classList.contains('invalid') && validatePassword());

form.addEventListener('submit', (event) => {
  event.preventDefault();
  status.textContent = '';

  const valid = [validateEmail(), validatePassword()].every(Boolean);
  if (!valid) {
    form.querySelector('.invalid')?.focus();
    return;
  }

  // No backend here — stand in for the real sign-in request.
  submit.disabled = true;
  submit.textContent = 'Signing in…';

  // Stay disabled through the redirect so the form can't be submitted twice.
  setTimeout(() => {
    status.textContent = `Signed in as ${email.value.trim()}. Redirecting…`;
    window.location.assign('dashboard.html');
  }, 700);
});
