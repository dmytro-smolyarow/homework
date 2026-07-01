import type { Metadata } from "next";
import "@/config/styles/global.css";
import { QueryProvider } from "@/app/shared/ui";
import { Navbar } from "@/app/widgets/navbar";

export const metadata: Metadata = {
  title: "BookShelf — a tiny catalog",
  description: "Next.js 16 + Drizzle + Supabase + Better Auth + TanStack Query",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <Navbar />
          <main className="container">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
