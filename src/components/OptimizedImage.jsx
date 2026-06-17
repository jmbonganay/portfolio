import { useState } from "react";

export default function OptimizedImage({
  src,
  alt = "",
  width,
  height,
  sizes = "100vw",
  className = "",
  wrapperClassName = "",
  loading = "lazy",
  decoding = "async",
  onLoad,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const hasDimensions = Number(width) > 0 && Number(height) > 0;

  if (import.meta.env?.DEV && !hasDimensions) {
    console.warn(
      `OptimizedImage requires explicit width and height for: ${alt || src}`,
    );
  }

  function handleLoad(event) {
    setIsLoaded(true);
    onLoad?.(event);
  }

  return (
    <span
      className={[
        "optimized-image-shell",
        !isLoaded ? "is-loading" : "is-loaded",
        wrapperClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        hasDimensions
          ? {
              aspectRatio: `${width} / ${height}`,
            }
          : undefined
      }
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        sizes={sizes}
        onLoad={handleLoad}
        className={[
          "blur-image",
          isLoaded ? "is-loaded" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    </span>
  );
}
