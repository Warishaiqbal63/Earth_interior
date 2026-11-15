export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="space-y-4">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-line" />
      <div className="h-24 animate-pulse rounded-xl bg-line/70" />
      <div className="h-64 animate-pulse rounded-xl bg-line/50" />
    </div>
  );
}
