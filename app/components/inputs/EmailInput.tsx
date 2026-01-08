import TextInput, { TextInputProps } from "./TextInput";

export type EmailInputProps = Omit<TextInputProps, "type">;

export default function EmailInput({
  autoComplete,
  inputMode,
  ...props
}: EmailInputProps) {
  return (
    <TextInput
      {...props}
      type="email"
      autoComplete={autoComplete ?? "email"}
      inputMode={inputMode ?? "email"}
    />
  );
}
