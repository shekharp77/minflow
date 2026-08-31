import { DocsNavSheet } from "@/components/site/docs-nav-sheet";
import { DocsSidebar } from "@/components/site/docs-sidebar";
import { SiteHeader } from "@/components/site/site-header";
import { Toaster } from "@/registry/minflow/ui/toast";

/*
 * The documentation shell: a standing left rail of every component plus the
 * two guides, and the page itself in the centre column. The rail scrolls
 * independently and sticks below the header, so moving between components
 * never costs a scroll back up.
 */
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-[1180px] gap-16 px-6">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 overflow-y-auto py-12 lg:block [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <DocsSidebar />
        </aside>
        <main className="min-w-0 flex-1 py-12 pb-32">
          <div className="mb-10 lg:hidden">
            <DocsNavSheet />
          </div>
          {children}
        </main>
      </div>
      <Toaster />
    </>
  );
}
