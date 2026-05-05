/** Sentinel for CommitBar visibility (end of article column). */
export function ArticleInformedSentinel() {
  return (
    <div
      id="article-informed-sentinel"
      className="mt-16 flex flex-col items-center gap-4 border-t border-plum-100 pt-12 text-center"
      aria-hidden
    >
      <p className="max-w-xl font-serif text-xl font-semibold text-plum-900">
        You&apos;re informed. Now do something.
      </p>
      <p className="max-w-lg text-sm text-ink-muted">
        Use the buttons below or the sidebar to contact representatives, join events, and follow causes you care about.
      </p>
    </div>
  );
}
