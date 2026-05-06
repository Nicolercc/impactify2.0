export default function Loading() {
  return (
    <div className="min-h-screen bg-parchment pb-20 font-sans text-ink">
      <div className="mx-auto max-w-[1152px] px-6 pt-6 md:px-12 md:pt-10">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[65%_35%] lg:gap-12">
          <div>
            <div className="h-4 w-24 rounded bg-parchment-100" />
            <div className="mt-6 h-4 w-64 rounded bg-parchment-100" />

            <div className="mt-6 h-12 w-3/4 rounded bg-parchment-100" />
            <div className="mt-3 h-12 w-1/2 rounded bg-parchment-100" />

            <div className="mt-4 h-5 w-full rounded bg-parchment-100" />
            <div className="mt-2 h-5 w-2/3 rounded bg-parchment-100" />

            <div className="mt-8 aspect-[16/9] w-full animate-pulse rounded-xl bg-parchment-100" />

            <div className="mt-8 space-y-3">
              <div className="h-3 w-full rounded bg-parchment-100" />
              <div className="h-3 w-11/12 rounded bg-parchment-100" />
              <div className="h-3 w-10/12 rounded bg-parchment-100" />
              <div className="h-3 w-9/12 rounded bg-parchment-100" />
              <div className="h-3 w-11/12 rounded bg-parchment-100" />
              <div className="h-3 w-10/12 rounded bg-parchment-100" />
              <div className="h-3 w-8/12 rounded bg-parchment-100" />
              <div className="h-3 w-9/12 rounded bg-parchment-100" />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-2xl border border-plum-100 bg-plum-50 p-6">
              <div className="h-4 w-28 rounded bg-plum-100" />
              <div className="mt-3 space-y-2">
                <div className="h-2 w-full rounded bg-plum-100/80" />
                <div className="h-2 w-5/6 rounded bg-plum-100/80" />
                <div className="h-2 w-4/5 rounded bg-plum-100/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
