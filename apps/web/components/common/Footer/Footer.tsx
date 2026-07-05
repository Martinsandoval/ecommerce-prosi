/**
 * Site-wide footer with the brand mark and copyright notice.
 *
 * @author Martin Sandoval
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left lg:px-8">
        <div className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight italic">
          <span>Prósi</span>
          <span aria-hidden="true" className="text-primary">
            &middot;
          </span>
          <span className="font-sans text-xs font-normal not-italic text-muted-foreground">
            Product Catalog
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {year} Prósi. Crafted for the storefront catalog.
        </p>
      </div>
    </footer>
  );
}
