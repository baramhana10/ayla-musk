export default function ProductLoading() {
  return (
    <div className="container-luxe grid grid-cols-1 gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-14">
      <div className="aspect-[4/5] animate-pulse rounded-2xl bg-blush-soft/70" />
      <div className="space-y-4">
        <div className="h-3 w-24 animate-pulse rounded-full bg-blush-soft/70" />
        <div className="h-10 w-2/3 animate-pulse rounded-full bg-blush-soft/70" />
        <div className="h-4 w-full animate-pulse rounded-full bg-blush-soft/70" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-blush-soft/70" />
        <div className="mt-8 h-14 w-full animate-pulse rounded-full bg-blush-soft/70" />
      </div>
    </div>
  );
}
