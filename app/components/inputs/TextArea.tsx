import React from "react";
import TextField from "./TextField";

export type TextAreaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "className" | "required"
> & {
  label: string;
  isRequired?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  inputClassName?: string;
};

export default function TextArea({
  label,
  isRequired = false,
  helperText,
  error,
  className,
  inputClassName,
  disabled = false,
  rows = 4,
  ...textAreaProps
}: TextAreaProps) {
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
        <textarea
          {...textAreaProps}
          id={id}
          rows={rows}
          disabled={isDisabled}
          required={required}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className={[
            "w-full rounded-lg bg-transparent px-4 py-3 text-[16px] outline-none",
            "text-zinc-900 placeholder:text-zinc-500",
            "resize-y min-h-[120px]",
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
