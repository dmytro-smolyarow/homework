import { type FC, type ReactNode } from "react";
import type { Metadata } from "next";

import "@/config/styles/global.css";
import { QueryProvider } from "@/app/shared/ui";
import { Navbar } from "@/app/widgets/navbar";

// metadata
export const metadata: Metadata = {
  title: "BookShelf — a tiny catalog",
  description: "Next.js 16 + Drizzle + Supabase + Better Auth + TanStack Query",
};

// interface
interface IProps {
  children: ReactNode;
}

// layout
const RootLayout: FC<Readonly<IProps>> = (props) => {
  const { children } = props;

  // return
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
};

export default RootLayout;
