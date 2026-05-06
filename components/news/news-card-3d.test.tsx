import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { NewsCard3D, type NewsCard3DProps } from "@/components/news/news-card-3d";

vi.mock("next/image", () => ({
  default: ({
    // next/image-only props we don't want on DOM
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fill,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sizes,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; sizes?: string }) => <img {...rest} />,
}));

function baseProps(overrides: Partial<NewsCard3DProps> = {}): NewsCard3DProps {
  return {
    href: "/news/test",
    headline: "A very long headline that should wrap and clamp to multiple lines without breaking layout",
    publication: "The Guardian",
    publishedLabel: "2h ago",
    readTimeLabel: "8 min read",
    issueTags: [
      { id: "t1", label: "Housing", topic: "housing" },
      { id: "t2", label: "Voting", topic: "voting" },
      { id: "t3", label: "Tech", topic: "tech" },
    ],
    imageUrl: null,
    imageAlt: "A placeholder image",
    ...overrides,
  };
}

describe("NewsCard3D", () => {
  it("renders headline and metadata", () => {
    render(<NewsCard3D {...baseProps()} />);
    expect(screen.getByText(/A very long headline/i)).toBeInTheDocument();
    expect(screen.getByText("The Guardian")).toBeInTheDocument();
    expect(screen.getByText("2h ago")).toBeInTheDocument();
    expect(screen.getByText("8 min read")).toBeInTheDocument();
  });

  it("limits tags to 2 and shows +N for extras", () => {
    render(<NewsCard3D {...baseProps()} />);
    expect(screen.getByText("HOUSING")).toBeInTheDocument();
    expect(screen.getByText("VOTING")).toBeInTheDocument();
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("renders 3D surface element", () => {
    render(<NewsCard3D {...baseProps()} />);
    expect(screen.getByTestId("news-card-3d-surface")).toBeInTheDocument();
  });
});

