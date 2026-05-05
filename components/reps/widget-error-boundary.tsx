"use client";

import * as React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = { hasError: boolean };

export class WidgetErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Intentionally no console noise for a sidebar widget.
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-2xl border border-border/60 bg-white p-4 text-sm text-ink-muted dark:bg-[#0E0A14] dark:text-[#d4c9bc]">
            Data unavailable
          </div>
        )
      );
    }
    return this.props.children;
  }
}

