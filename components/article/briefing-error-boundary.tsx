"use client";

import * as React from "react";

type Props = {
  children: React.ReactNode;
};

type State = { hasError: boolean };

/**
 * Isolates briefing client tree so streaming/parsing failures never take down the article.
 */
export class BriefingErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Avoid console noise in production widgets; parent shows inline fallback.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="rounded-2xl border border-plum-100 bg-parchment px-5 py-4 text-sm text-ink-muted"
        >
          Briefing could not be displayed. You can keep reading the article below.
        </div>
      );
    }
    return this.props.children;
  }
}
