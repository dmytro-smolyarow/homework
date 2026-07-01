"use client";

import { type FC, useState } from "react";

// interface
interface IProps {
  src: string | null;
  alt: string;
}

// component
// shimmer while the cover loads, then blur it in; graceful fallback on error/no src
const CoverImage: FC<Readonly<IProps>> = (props) => {
  const { src, alt } = props;

  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="cover cover--empty" role="img" aria-label={alt}>
        📚
      </div>
    );
  }

  // return
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`cover ${loaded ? "is-loaded" : "is-loading"}`}
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      // covers images already cached before the handler attaches
      ref={(node) => {
        if (node?.complete) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );
};

export default CoverImage;
