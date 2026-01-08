import React from "react";
import TextField from "./TextField";

export type TextInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "className" | "required"
> & {
  label: string;
  isRequired?: boolean;
  type?: React.HTMLInputTypeAttribute;
  helperText?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
};

export default function TextInput({
  label,
  isRequired = false,
  helperText,
  error,
  className,
  inputClassName,
  type = "text",
  disabled = false,
  autoComplete,
  ...inputProps
}: TextInputProps) {
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
        <input
          {...inputProps}
          id={id}
          type={type}
          disabled={isDisabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={[
            "w-full rounded-lg bg-transparent px-4 py-3 text-[16px] outline-none",
            "text-zinc-900 placeholder:text-zinc-500",
            isDisabled ? "cursor-not-allowed text-zinc-500" : "",
            inputClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        />
      )}
    </TextField>
  );
}
