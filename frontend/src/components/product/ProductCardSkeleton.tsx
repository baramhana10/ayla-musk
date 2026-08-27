export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] bg-ivory-deep" />
      <div className="mt-5 space-y-3">
        <div className="flex items-baseline justify-between gap-3 border-b border-charcoal/10 pb-2.5">
          <div className="h-3.5 w-2/3 bg-ivory-deep" />
          <div className="h-3 w-10 bg-ivory-deep" />
        </div>
        <div className="h-2 w-1/3 bg-ivory-deep" />
      </div>
    </div>
  );
}
