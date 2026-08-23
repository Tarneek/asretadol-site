'use client';

import { FormEvent, useState } from 'react';

const CONTACT_EMAIL = 'info@niranews.ir';

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError(null);
    if (submitted) setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();

    if (name.length < 2) {
      setError('لطفاً نام خود را وارد کنید.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('لطفاً یک آدرس ایمیل معتبر وارد کنید.');
      return;
    }
    if (subject.length < 2) {
      setError('لطفاً موضوع پیام را وارد کنید.');
      return;
    }
    if (message.length < 10) {
      setError('متن پیام باید حداقل ۱۰ کاراکتر باشد.');
      return;
    }

    const body = `نام: ${name}\nایمیل: ${email}\n\n${message}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSubmitted(true);
    setError(null);
    setForm(INITIAL_FORM);
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <h2 className="contact-form__title">ارسال پیام</h2>
      <p className="contact-form__hint">
        فرم زیر برنامه ایمیل پیش‌فرض شما را با متن پیام باز می‌کند. برای تماس سریع‌تر می‌توانید
        مستقیماً با ایمیل درج‌شده در همین صفحه ارتباط بگیرید.
      </p>

      <div className="contact-form__grid">
        <div className="contact-form__field">
          <label className="contact-form__label" htmlFor="contact-name">
            نام و نام خانوادگی
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            className="contact-form__input"
            value={form.name}
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="نام شما"
            required
          />
        </div>

        <div className="contact-form__field">
          <label className="contact-form__label" htmlFor="contact-email">
            ایمیل
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            className="contact-form__input"
            value={form.email}
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="example@email.com"
            dir="ltr"
            required
          />
        </div>
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor="contact-subject">
          موضوع
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          className="contact-form__input"
          value={form.subject}
          onChange={(event) => updateField('subject', event.target.value)}
          placeholder="موضوع پیام"
          required
        />
      </div>

      <div className="contact-form__field">
        <label className="contact-form__label" htmlFor="contact-message">
          پیام
        </label>
        <textarea
          id="contact-message"
          name="message"
          className="contact-form__textarea"
          value={form.message}
          onChange={(event) => updateField('message', event.target.value)}
          placeholder="متن پیام خود را بنویسید..."
          rows={6}
          required
        />
      </div>

      {error ? (
        <p className="contact-form__error" role="alert">
          {error}
        </p>
      ) : null}

      {submitted ? (
        <p className="contact-form__success" role="status">
          در حال باز کردن برنامه ایمیل شما... اگر باز نشد، مستقیماً به{' '}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> ایمیل بفرستید.
        </p>
      ) : null}

      <button type="submit" className="btn-danger contact-form__submit">
        ارسال پیام
      </button>
    </form>
  );
}
