export default function ArticleReadLoading() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6">
      <div className="h-4 w-40 animate-pulse rounded-full bg-plum-100" />
      <div className="mt-6 h-10 max-w-2xl animate-pulse rounded-lg bg-plum-100" />
      <div className="mt-4 h-24 max-w-3xl animate-pulse rounded-lg bg-plum-50" />
      <div className="mt-10 aspect-[16/9] w-full animate-pulse rounded-2xl bg-plum-50" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-2xl bg-plum-50" />
          <div className="h-64 animate-pulse rounded-2xl bg-plum-50" />
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-plum-50" />
      </div>
    </div>
  );
}
