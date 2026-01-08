import React, { useId } from "react";

type TextFieldRenderProps = {
  id: string;
  describedBy?: string;
  isRequired: boolean;
  disabled: boolean;
  hasError: boolean;
};

type TextFieldProps = {
  label: string;
  isRequired?: boolean;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  children: (props: TextFieldRenderProps) => React.ReactNode;
};

export default function TextField({
  label,
  isRequired = false,
  helperText,
  error,
  disabled = false,
  className,
  children,
}: TextFieldProps) {
  const id = useId();
  const hasError = Boolean(error);
  const describedBy = helperText || error ? `${id}-hint` : undefined;

  return (
    <div className={["w-full", className].filter(Boolean).join(" ")}>
      <label
        htmlFor={id}
        className={[
          "text-[16px] font-medium",
          disabled
            ? "text-zinc-400"
            : hasError
            ? "text-danger-600"
            : "",
        ].join(" ")}
      >
        {label}
        {isRequired && <span className="ml-1 text-primary-500">*</span>}
      </label>

      <div
        className={[
          "group relative mt-2 rounded-lg border bg-white transition shadow-sm",
          hasError ? "border-danger-500" : "border-zinc-200",
          !disabled && !hasError
            ? "focus-within:border-t-primary-500 focus-within:border-x-primary-500 focus-within:ring-primary-100"
            : "",
          !disabled && hasError
            ? "focus-within:border-danger-500 focus-within:ring-danger-100"
            : "",
          disabled ? "bg-zinc-50 opacity-70 cursor-not-allowed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div
          className={[
            "pointer-events-none absolute inset-x-0 bottom-0 h-[3px] rounded-b-lg transition",
            disabled
              ? "bg-zinc-200"
              : hasError
              ? "bg-danger-500"
              : "bg-gradient-to-r from-primary-500 via-rose-500 to-amber-300",
          ].join(" ")}
        />

        {children({ id, describedBy, isRequired, disabled, hasError })}
      </div>

      {(helperText || error) && (
        <p
          id={`${id}-hint`}
          className={[
            "text-xs",
            error ? "text-danger-600 font-medium" : "text-zinc-500",
          ].join(" ")}
        >
          {error ?? helperText}
        </p>
      )}
    </div>
  );
}
