import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-chartreuse-500" />
          <span className="font-serif text-lg font-medium text-plum-700">Impactify</span>
        </Link>
      </header>
      <main id="main-content" className="flex flex-1 items-center justify-center px-6 pb-12">
        {children}
      </main>
    </div>
  );
}
