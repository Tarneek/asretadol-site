'use client';

import { useFormStatus } from 'react-dom';

type ConfirmSubmitProps = {
  children: React.ReactNode;
  confirmMessage: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'default' | 'sm';
  pendingLabel?: string;
};

export function ConfirmSubmit({
  children,
  confirmMessage,
  variant = 'danger',
  size = 'default',
  pendingLabel = 'لطفاً صبر کنید…',
}: ConfirmSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`btn btn--${variant}${size === 'sm' ? ' btn--sm' : ''}`}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
