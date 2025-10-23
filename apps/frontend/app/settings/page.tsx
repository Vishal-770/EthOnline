export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your application settings and preferences.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">
            General Settings
          </h2>
          <p className="text-muted-foreground mt-2">
            Configure your application preferences here.
          </p>
        </div>
      </div>
    </div>
  );
}
