'use client';

import { useId, useState } from 'react';
import DatePicker from 'react-multi-date-picker';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import DateObject from 'react-date-object';
import {
  isoToJalaliDateObject,
  jalaliDateObjectToIso,
  persian,
  persian_fa,
} from '@/lib/jalali-datetime';
import 'react-multi-date-picker/styles/colors/red.css';

type JalaliDateTimeFieldProps = {
  name: string;
  label: string;
  initialIso?: string | null;
  hint?: string;
};

export function JalaliDateTimeField({
  name,
  label,
  initialIso,
  hint,
}: JalaliDateTimeFieldProps) {
  const inputId = useId();
  const [value, setValue] = useState<DateObject | null>(() => isoToJalaliDateObject(initialIso));
  const [isoValue, setIsoValue] = useState(() => initialIso?.trim() ?? '');

  function handleChange(next: DateObject | DateObject[] | null) {
    if (!next || Array.isArray(next)) {
      setValue(null);
      setIsoValue('');
      return;
    }

    setValue(next);
    setIsoValue(jalaliDateObjectToIso(next) ?? '');
  }

  function clearValue() {
    setValue(null);
    setIsoValue('');
  }

  return (
    <div className="form-field jalali-datetime-field">
      <label className="form-field__label" htmlFor={inputId}>
        {label}
      </label>
      {hint ? <p className="form-field__hint">{hint}</p> : null}

      <input type="hidden" name={name} value={isoValue} />

      <div className="jalali-datetime-field__controls">
        <DatePicker
          id={inputId}
          value={value}
          onChange={handleChange}
          calendar={persian}
          locale={persian_fa}
          format="YYYY/MM/DD HH:mm"
          plugins={[<TimePicker key="time" position="bottom" hideSeconds mStep={5} />]}
          calendarPosition="bottom-right"
          containerClassName="jalali-datetime-field__picker"
          inputClass="jalali-datetime-field__input"
          arrow={false}
          editable={false}
        />
        {isoValue ? (
          <button type="button" className="btn btn--ghost btn--sm" onClick={clearValue}>
            پاک کردن
          </button>
        ) : null}
      </div>
    </div>
  );
}
