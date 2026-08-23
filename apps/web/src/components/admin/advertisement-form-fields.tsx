'use client';

import { useState } from 'react';
import { AdImageField } from '@/components/admin/ad-image-field';
import { JalaliDateTimeField } from '@/components/admin/jalali-datetime-field';
import type { AdminAdvertisement } from '@/lib/types/admin-api';

type Placement = AdminAdvertisement['placement'];

type Props = {
  idPrefix?: string;
  initial?: Partial<AdminAdvertisement>;
};

export function AdvertisementFormFields({ idPrefix = 'ad', initial }: Props) {
  const [placement, setPlacement] = useState<Placement>(initial?.placement ?? 'ad-slot');

  return (
    <>      <label className="form-field">
        <span className="form-field__label">جایگاه</span>
        <select
          name="placement"
          value={placement}
          onChange={(event) => setPlacement(event.target.value as Placement)}
        >
          <option value="ad-slot">زیر مهم‌ترین اخبار (ad-slot)</option>
          <option value="ad-banner">بنر پایین سایت (ad-banner)</option>
        </select>
      </label>

      <label className="form-field">
        <span className="form-field__label">اسلات نمایش</span>
        <select name="slotIndex" defaultValue={String(initial?.slotIndex ?? 0)}>
          <option value="0">اسلات ۱ (چپ در دسکتاپ)</option>
          <option value="1">اسلات ۲ (راست در دسکتاپ)</option>
        </select>
      </label>

      <AdImageField
        idPrefix={idPrefix}
        placement={placement}
        initialImageUrl={initial?.imageUrl}
      />

      <label className="form-field">
        <span className="form-field__label">ترتیب نمایش</span>
        <input
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={initial?.sortOrder ?? 0}
        />
      </label>

      <label className="form-field">
        <span className="form-field__label">فاصله چرخش (ثانیه)</span>
        <input
          name="rotationIntervalSeconds"
          type="number"
          min={3}
          max={120}
          defaultValue={initial?.rotationIntervalSeconds ?? 8}
        />
      </label>

      <JalaliDateTimeField
        name="startsAt"
        label="شروع نمایش"
        initialIso={initial?.startsAt}
        hint="تقویم شمسی — خالی بگذارید برای نمایش بدون محدودیت شروع."
      />

      <JalaliDateTimeField
        name="endsAt"
        label="پایان نمایش"
        initialIso={initial?.endsAt}
        hint="تقویم شمسی — خالی بگذارید برای نمایش بدون محدودیت پایان."
      />
      <label className="checkbox-field">
        <input name="isActive" type="checkbox" defaultChecked={initial?.isActive ?? true} />
        <span>تبلیغ فعال</span>
      </label>

      <label className="checkbox-field">
        <input
          name="rotationEnabled"
          type="checkbox"
          defaultChecked={initial?.rotationEnabled ?? true}
        />
        <span>مشارکت در چرخش خودکار</span>
      </label>
    </>
  );
}
