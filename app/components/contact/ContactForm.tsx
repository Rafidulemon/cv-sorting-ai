import React from "react";
import TextInput from "@/app/components/inputs/TextInput";
import EmailInput from "@/app/components/inputs/EmailInput";
import TextArea from "@/app/components/inputs/TextArea";
import SelectBox from "@/app/components/inputs/SelectBox";
import Button from "@/app/components/buttons/Button";

type ContactFormProps = {
  className?: string;
};

export default function ContactForm({ className }: ContactFormProps) {
  return (
    <div className={["rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10", className].filter(Boolean).join(" ")}>
      <p className="text-sm text-zinc-700">
        Tell us a bit about your needs and we will route you to the right specialist.
      </p>

      <form
        className="mt-8 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <TextInput
            label="Name"
            name="name"
            placeholder="Your name"
            isRequired
            autoComplete="name"
          />
          <EmailInput
            label="Work email"
            name="email"
            placeholder="you@company.com"
            isRequired
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <TextInput
            label="Company"
            name="company"
            placeholder="Company name"
            autoComplete="organization"
          />
          <SelectBox
            label="Topic"
            name="topic"
            placeholder="Choose an option"
            options={[
              { value: "sales", label: "Sales inquiry" },
              { value: "support", label: "Support" },
              { value: "press", label: "Press" },
              { value: "partnership", label: "Partnerships" },
            ]}
          />
        </div>

        <TextInput label="Subject" name="subject" placeholder="How can we help?" />

        <TextArea
          label="Message"
          name="message"
          rows={6}
          placeholder="Share details about your hiring goals..."
        />

        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
}
