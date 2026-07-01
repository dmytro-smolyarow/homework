"use client";

import { type FC } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { signOut, useSession } from "@/pkg/auth/auth-client";

// component
const Navbar: FC = () => {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // sign out — drop cached user data
  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
    router.push("/");
    router.refresh();
  };

  // return
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
};

export default Navbar;
