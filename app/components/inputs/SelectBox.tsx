import React from "react";
import TextField from "./TextField";

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type SelectBoxProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "className" | "required"
> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  isRequired?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
};

export default function SelectBox({
  label,
  options,
  placeholder,
  isRequired = false,
  helperText,
  error,
  className,
  inputClassName,
  disabled = false,
  defaultValue,
  ...selectProps
}: SelectBoxProps) {
  const { value, ...restSelectProps } = selectProps;
  const isControlled = value !== undefined;
  const resolvedDefaultValue =
    !isControlled && placeholder && defaultValue === undefined ? "" : defaultValue;

  return (
    <TextField
      label={label}
      isRequired={isRequired}
      helperText={helperText}
      error={error}
      disabled={disabled}
      className={className}
    >
      {({ id, describedBy, isRequired: required, disabled: isDisabled, hasError }) => (
        <>
          <select
            {...restSelectProps}
            id={id}
            disabled={isDisabled}
            required={required}
            value={value}
            defaultValue={isControlled ? undefined : resolvedDefaultValue}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={[
              "w-full appearance-none rounded-lg bg-transparent px-4 py-3 pr-10 text-[16px] outline-none",
              "text-zinc-900 placeholder:text-zinc-500",
              isDisabled ? "cursor-not-allowed text-zinc-500" : "",
              inputClassName,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {placeholder && (
              <option value="" disabled={isRequired}>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.22 7.72a.75.75 0 0 1 1.06 0L10 11.44l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.78a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </>
      )}
    </TextField>
  );
}
