import React from "react";
import { Eye, EyeOff } from "lucide-react";
import TextField from "./TextField";
import type { TextInputProps } from "./TextInput";

export type PasswordInputProps = Omit<TextInputProps, "type">;

export default function PasswordInput({
  label,
  isRequired = false,
  helperText,
  error,
  className,
  inputClassName,
  autoComplete,
  disabled = false,
  ...inputProps
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = React.useState(false);

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
            type={isVisible ? "text" : "password"}
            disabled={isDisabled}
            required={required}
            autoComplete={autoComplete ?? "current-password"}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            className={[
              "w-full rounded-lg bg-transparent px-4 py-3 text-[16px] outline-none",
              "text-zinc-900 placeholder:text-zinc-500",
              isDisabled ? "cursor-not-allowed text-zinc-500" : "",
              "pr-12",
              inputClassName,
            ]
              .filter(Boolean)
              .join(" ")}
          />

          <button
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
            disabled={isDisabled}
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
            className={[
              "absolute inset-y-0 right-3 flex items-center justify-center rounded-md p-2 text-zinc-500 transition",
              isDisabled
                ? "cursor-not-allowed opacity-60"
                : "hover:text-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {isVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      )}
    </TextField>
  );
}
