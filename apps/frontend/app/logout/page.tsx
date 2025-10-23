export default function LogoutPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Logout</h1>
        <p className="text-muted-foreground mt-2">
          You have been logged out successfully.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Session Ended
          </h2>
          <p className="text-muted-foreground mt-2">
            Your session has been terminated. Redirecting to login...
          </p>
        </div>
      </div>
    </div>
  );
}
