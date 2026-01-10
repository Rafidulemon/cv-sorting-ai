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
  rightIcon?: React.ReactNode;
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
  rightIcon,
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
        <div className="relative">
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
              rightIcon ? "pr-11" : "",
              "text-zinc-900 placeholder:text-zinc-500",
              isDisabled ? "cursor-not-allowed text-zinc-500" : "",
              inputClassName,
            ]
              .filter(Boolean)
              .join(" ")}
          />
          {rightIcon ? (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
              {rightIcon}
            </span>
          ) : null}
        </div>
      )}
    </TextField>
  );
}
