export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile settings and information.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Profile Information
          </h2>
          <p className="text-muted-foreground mt-2">
            Your profile details will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}
