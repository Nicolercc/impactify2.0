"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { EyebrowBadge } from "@/components/layout/eyebrow-badge";
import { GrainOverlay } from "@/components/decorative/grain-overlay";
import { SubtleZoom } from "@/components/motion/subtle-zoom";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=2400&q=80";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const blob1Y = useTransform(scrollY, [0, 500], [0, 80]);
  const blob2Y = useTransform(scrollY, [0, 500], [0, -60]);
  const blob3Y = useTransform(scrollY, [0, 500], [0, 50]);

  return (
    <section
      className="relative flex h-screen min-h-[720px] flex-col justify-center overflow-hidden"
      aria-label="Hero section"
    >
      <div className="absolute inset-0">
        <SubtleZoom className="absolute inset-0 h-full w-full">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </SubtleZoom>
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-br from-plum-900/85 via-plum-700/80 to-plum-900/90"
        aria-hidden
      />
      <GrainOverlay />

      {!prefersReducedMotion ? (
        <>
          <motion.div
            style={{ y: blob1Y }}
            className="pointer-events-none absolute left-[10%] top-[20%] h-40 w-40 rounded-full bg-chartreuse-500/10 blur-3xl lg:h-56 lg:w-56"
            aria-hidden
          />
          <motion.div
            style={{ y: blob2Y }}
            className="pointer-events-none absolute right-[12%] top-[28%] h-36 w-36 rounded-full bg-chartreuse-500/10 blur-3xl lg:h-52 lg:w-52"
            aria-hidden
          />
          <motion.div
            style={{ y: blob3Y }}
            className="pointer-events-none absolute bottom-[22%] left-[38%] h-32 w-32 rounded-full bg-chartreuse-300/15 blur-3xl lg:h-48 lg:w-48"
            aria-hidden
          />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute left-[10%] top-[20%] h-40 w-40 rounded-full bg-chartreuse-500/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute right-[12%] top-[28%] h-36 w-36 rounded-full bg-chartreuse-500/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute bottom-[22%] left-[38%] h-32 w-32 rounded-full bg-chartreuse-300/15 blur-3xl"
            aria-hidden
          />
        </>
      )}

      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 py-8 sm:px-8">
        <div className="flex w-full max-w-4xl flex-col items-center gap-6 sm:gap-8">
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center"
          >
            <EyebrowBadge tone="chartreuse">
              Civic action hub
            </EyebrowBadge>
          </motion.div>

          <motion.h1
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl text-center font-serif text-hero leading-[1.05] tracking-tight text-parchment sm:leading-[1.08]"
          >
            Your <em className="font-serif italic text-chartreuse-500">voice</em>,<br />
            organized.
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-prose text-center text-lead leading-[1.6] text-parchment/85 sm:leading-[1.65]"
          >
            Find local events, understand global issues, track your representatives — all in one place, built for people
            taking their civic life seriously.
          </motion.p>

          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/feed"
              className="inline-flex min-h-12 min-w-[180px] items-center justify-center rounded-full bg-chartreuse-500 px-8 font-medium text-ink transition-colors hover:bg-chartreuse-700"
            >
              Explore the feed
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex min-h-12 min-w-[180px] items-center justify-center rounded-full border-2 border-parchment/50 px-8 font-medium text-parchment transition-colors hover:bg-parchment/10"
            >
              How it works
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <a
          href="#events"
          className="flex flex-col items-center gap-2 rounded-sm text-parchment/60 transition-colors hover:text-parchment focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chartreuse-500 focus-visible:ring-offset-2 focus-visible:ring-offset-plum-900"
          aria-label="Scroll to events section"
        >
          <span className="text-xs font-medium uppercase tracking-wider">Scroll</span>
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </a>
      </motion.div>
    </section>
  );
}
