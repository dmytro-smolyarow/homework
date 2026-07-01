"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { signOut, useSession } from "@/lib/auth-client";

export function Navbar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await signOut();
    queryClient.clear();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand">
          📚 BookShelf
        </Link>
        <Link href="/" className="nav-link">
          Catalog
        </Link>
        {session && (
          <Link href="/favorites" className="nav-link">
            Favorites
          </Link>
        )}
        <div className="spacer" />
        {isPending ? null : session ? (
          <div className="row">
            <span className="muted">{session.user.email}</span>
            <button className="btn" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        ) : (
          <div className="row">
            <Link href="/login" className="btn">
              Log in
            </Link>
            <Link href="/register" className="btn primary">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
