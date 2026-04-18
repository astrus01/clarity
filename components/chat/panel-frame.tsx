import { cn } from "@/lib/utils";

export function PanelFrame({
  title,
  eyebrow,
  meta,
  children,
  className,
}: {
  title?: string;
  eyebrow?: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "w-full rounded-lg border border-border bg-surface",
        "[--stagger:80ms]",
        className,
      )}
    >
      {(title || eyebrow) && (
        <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-border">
          <div className="min-w-0">
            {eyebrow && (
              <div
                className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-foreground-muted mb-1.5"
                style={{ letterSpacing: "0.12em" }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <h3
                className="font-serif text-[1.5rem] leading-tight text-foreground m-0"
                style={{ letterSpacing: "-0.01em" }}
              >
                {title}
              </h3>
            )}
          </div>
          {meta && <div className="shrink-0">{meta}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PanelFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-4 mt-5 border-t border-border">
      {children}
    </div>
  );
}
