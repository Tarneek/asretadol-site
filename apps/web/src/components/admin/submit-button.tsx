'use client';

import { useFormStatus } from 'react-dom';

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
};

export function SubmitButton({
  children,
  pendingLabel,
  variant = 'primary',
  className = '',
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const variantClass = `btn btn--${variant}`;

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${variantClass}${className ? ` ${className}` : ''}`.trim()}
    >
      {pending ? pendingLabel ?? 'در حال ذخیره…' : children}
    </button>
  );
}
