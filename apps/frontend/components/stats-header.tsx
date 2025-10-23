export default function StatsHeader() {
  return (
    <div className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/30">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                24H Volume
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">$35.77B</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/30">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                24H Txns
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                42,811,462
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
