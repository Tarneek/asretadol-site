'use client';

import { useState } from 'react';
import { ConfirmSubmit } from './confirm-submit';
import { SubmitButton } from './submit-button';
import type { AdminUser } from '@/lib/api/admin-users';
import { adminRoleLabel } from '@/lib/admin-labels';

type CreateProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function UserCreateForm({ action }: CreateProps) {
  return (
    <form action={action} className="card admin-form-stack" style={{ marginBottom: '1.5rem' }}>
      <h2 className="section-title">افزودن کاربر جدید</h2>
      <div className="admin-form-grid">
        <div className="form-field">
          <label className="form-field__label" htmlFor="new-user-mobile">
            شماره موبایل
          </label>
          <input
            id="new-user-mobile"
            name="mobile"
            type="tel"
            dir="ltr"
            required
            pattern="09[0-9]{9}"
            placeholder="09123456789"
            maxLength={14}
          />
        </div>
        <div className="form-field">
          <label className="form-field__label" htmlFor="new-user-name">
            نام نمایشی
          </label>
          <input id="new-user-name" name="displayName" placeholder="اختیاری" />
        </div>
        <div className="form-field">
          <label className="form-field__label" htmlFor="new-user-password">
            رمز عبور
          </label>
          <input
            id="new-user-password"
            name="password"
            type="password"
            dir="ltr"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="form-field">
          <label className="form-field__label" htmlFor="new-user-confirm">
            تکرار رمز عبور
          </label>
          <input
            id="new-user-confirm"
            name="confirmPassword"
            type="password"
            dir="ltr"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="form-field">
          <label className="form-field__label" htmlFor="new-user-role">
            نقش
          </label>
          <select id="new-user-role" name="role" defaultValue="author">
            <option value="admin">مدیر</option>
            <option value="editor">سردبیر</option>
            <option value="author">خبرنگار</option>
          </select>
        </div>
        <div className="form-field">
          <label className="checkbox-row" style={{ marginTop: '1.75rem' }}>
            <input type="checkbox" name="isActive" value="1" defaultChecked />
            فعال
          </label>
        </div>
      </div>
      <div className="admin-form-actions">
        <SubmitButton pendingLabel="در حال ثبت…">افزودن کاربر</SubmitButton>
      </div>
    </form>
  );
}

type RowProps = {
  user: AdminUser;
  updateAction: (formData: FormData) => void | Promise<void>;
  deleteAction: () => void | Promise<void>;
  canDelete: boolean;
};

export function UserRowEditor({ user, updateAction, deleteAction, canDelete }: RowProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="stack stack--sm">
      <div className="admin-table__actions">
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => setOpen((v) => !v)}>
          {open ? 'بستن' : 'ویرایش'}
        </button>
        {canDelete ? (
          <form action={deleteAction}>
            <ConfirmSubmit
              confirmMessage="این کاربر حذف شود؟"
              size="sm"
              pendingLabel="در حال حذف…"
            >
              حذف
            </ConfirmSubmit>
          </form>
        ) : null}
      </div>

      {open ? (
        <form action={updateAction} className="card card--flat admin-form-stack--tight">
          <p className="form-field__hint" style={{ marginBottom: '0.5rem' }}>
            برای تغییر رمز، هر دو فیلد رمز را پر کنید. خالی گذاشتن یعنی بدون تغییر رمز.
          </p>
          <div className="admin-form-grid">
            <div className="form-field">
              <label className="form-field__label" htmlFor={`name-${user.id}`}>
                نام نمایشی
              </label>
              <input
                id={`name-${user.id}`}
                name="displayName"
                defaultValue={user.displayName}
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor={`role-${user.id}`}>
                نقش
              </label>
              <select id={`role-${user.id}`} name="role" defaultValue={user.role}>
                <option value="admin">مدیر</option>
                <option value="editor">سردبیر</option>
                <option value="author">خبرنگار</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor={`pass-${user.id}`}>
                رمز عبور جدید
              </label>
              <input
                id={`pass-${user.id}`}
                name="password"
                type="password"
                dir="ltr"
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="form-field">
              <label className="form-field__label" htmlFor={`pass2-${user.id}`}>
                تکرار رمز جدید
              </label>
              <input
                id={`pass2-${user.id}`}
                name="confirmPassword"
                type="password"
                dir="ltr"
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="form-field">
              <label className="checkbox-row" style={{ marginTop: '1.75rem' }}>
                <input type="checkbox" name="isActive" value="1" defaultChecked={user.isActive} />
                فعال ({adminRoleLabel(user.role)})
              </label>
            </div>
          </div>
          <div className="admin-form-actions">
            <SubmitButton pendingLabel="در حال ذخیره…">ذخیره تغییرات</SubmitButton>
          </div>
        </form>
      ) : null}
    </div>
  );
}
