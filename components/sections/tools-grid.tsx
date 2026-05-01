"use client";

import Link from "next/link";
import { actionCategories } from "@/lib/constants/categories";
import { Section } from "@/components/layout/section";
import { EyebrowBadge } from "@/components/layout/eyebrow-badge";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { cn } from "@/lib/utils";

function hrefForTool(id: string, href: string) {
  if (id === "create") return "/events/new";
  return href;
}

const toolsTitle = "font-serif text-2xl text-plum-700 md:text-4xl md:leading-tight";

export function ToolsGrid() {
  return (
    <Section tone="parchment" aria-labelledby="tools-heading">
      <header className="mb-12 text-center md:mb-16">
        <div className="flex flex-col items-center gap-3 md:gap-4">
          <div className="flex justify-center">
            <EyebrowBadge>Everything in one place</EyebrowBadge>
          </div>
          <h2 id="tools-heading" className={toolsTitle}>
            Six ways to take action.
          </h2>
          <p className="mx-auto max-w-[52ch] text-center text-[1.125rem] leading-[1.55] text-ink-muted md:text-[1.25rem]">
            Browse. Attend. Create. Donate. Discover. Vote. The civic stack, unified.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {actionCategories.map((tool, index) => (
          <ScrollReveal key={tool.id} delay={index * 0.06}>
            <Link
              href={hrefForTool(tool.id, tool.href)}
              className={cn(
                "group block rounded-2xl border-l-4 border-l-chartreuse-500 bg-parchment-100 transition-all duration-300",
                "hover:translate-x-1 hover:border-l-[6px] hover:bg-parchment",
              )}
            >
              <div className="flex h-full flex-col p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chartreuse-300">
                  <tool.icon className="h-6 w-6 text-plum-700" aria-hidden />
                </div>
                <h3 className="mt-4 font-serif text-title text-plum-700">{tool.title}</h3>
                <p className="mt-2 font-sans text-caption leading-relaxed text-ink-muted">{tool.description}</p>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}
