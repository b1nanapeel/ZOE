import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <header className="px-6 pt-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-primary-600"
        >
          ZOE
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm text-neutral-600">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
          {footer && (
            <div className="mt-6 text-sm text-neutral-600 text-center">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
