import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/nunito";
import "./globals.css";
import { ThemeScript } from "@/lib/theme";
import { MotionProvider } from "@/lib/motion-provider";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "miniflow",
    template: "%s",
  },
  description:
    "A from-scratch minimalist React component library: one accent per view, whitespace over boxes, motion as a first-class citizen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full">
        <ThemeScript />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
