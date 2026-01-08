import TextInput, { TextInputProps } from "./TextInput";

export type PasswordInputProps = Omit<TextInputProps, "type">;

export default function PasswordInput({
  autoComplete,
  ...props
}: PasswordInputProps) {
  return (
    <TextInput
      {...props}
      type="password"
      autoComplete={autoComplete ?? "current-password"}
    />
  );
}
