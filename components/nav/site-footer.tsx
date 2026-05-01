import Link from "next/link";
import { X, Camera, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { footerNavItems, socialLinks } from "@/lib/constants/nav";

export function SiteFooter() {
  return (
    <footer
      role="contentinfo"
      className="bg-plum-900 text-parchment"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="font-serif text-2xl font-semibold tracking-tight text-parchment"
            >
              Impactify
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-plum-100/80">
              Your voice, organized. Find local events, global issues, and your
              representatives — all in one civic action hub.
            </p>

            <div className="mt-6 flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-plum-700/40 text-plum-100 transition-colors duration-200 ease-out-expo hover:bg-chartreuse-500 hover:text-ink"
                  aria-label={link.label}
                >
                  {link.icon === "twitter" && <X className="h-5 w-5" />}
                  {link.icon === "instagram" && <Camera className="h-5 w-5" />}
                  {link.icon === "linkedin" && <Globe className="h-5 w-5" />}
                </a>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="font-sans text-eyebrow uppercase tracking-widest text-parchment">
                Stay informed
              </h3>
              <form className="mt-3 flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-11 border-plum-500/30 bg-plum-700/40 text-parchment placeholder:text-plum-100/50 focus-visible:ring-chartreuse-500"
                  aria-label="Email address for newsletter"
                />
                <Button
                  type="submit"
                  className="h-11 bg-chartreuse-500 px-4 font-medium text-ink hover:bg-chartreuse-700"
                >
                  Subscribe
                </Button>
              </form>
            </div>
          </div>

          <div>
            <h3 className="font-sans text-eyebrow uppercase tracking-widest text-parchment">
              Explore
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {footerNavItems.explore.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-plum-100 transition-colors duration-200 ease-out-expo hover:text-chartreuse-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-eyebrow uppercase tracking-widest text-parchment">
              Act
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {footerNavItems.act.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-plum-100 transition-colors duration-200 ease-out-expo hover:text-chartreuse-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-eyebrow uppercase tracking-widest text-parchment">
              Company
            </h3>
            <ul className="mt-4 flex flex-col gap-3">
              {footerNavItems.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-plum-100 transition-colors duration-200 ease-out-expo hover:text-chartreuse-500"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-plum-500/20 pt-8 lg:flex-row">
          <p className="text-sm text-plum-100/60">
            &copy; {new Date().getFullYear()} Impactify. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-plum-100/60 lg:gap-6">
            {footerNavItems.legal.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors duration-200 ease-out-expo hover:text-chartreuse-500"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <p className="text-sm text-plum-100/60">
            Built with <span className="text-peach-400">&#9829;</span> for civic action
          </p>
        </div>
      </div>
    </footer>
  );
}
