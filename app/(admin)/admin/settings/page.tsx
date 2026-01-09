import ComingSoon from "@/app/components/admin/ComingSoon";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <ComingSoon
        title="System settings"
        description="Platform operations, integrations, and regional settings will be configurable here."
      />
    </div>
  );
}
