import { type FC } from "react";
import Link from "next/link";

// component
const NotFoundModule: FC = () => {
  // return
  return (
    <div className="notfound">
      <h1>404</h1>
      <p className="muted">This page could not be found.</p>
      <Link href="/" className="btn primary">
        ← Back to catalog
      </Link>
    </div>
  );
};

export default NotFoundModule;
