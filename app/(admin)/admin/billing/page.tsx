import ComingSoon from "@/app/components/admin/ComingSoon";

export default function BillingPage() {
  return (
    <div className="space-y-4">
      <ComingSoon
        title="Billing overview"
        description="High-level billing dashboard will summarize plans, invoices, payments, and revenue once wired."
      />
    </div>
  );
}
