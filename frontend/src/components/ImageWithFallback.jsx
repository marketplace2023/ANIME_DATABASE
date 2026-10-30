import { useState } from "react";

export default function ImageWithFallback({ src, alt, className, ...rest }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={`${className} img-fallback`} {...rest}>
        <span>{alt?.slice(0, 2)?.toUpperCase()}</span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
