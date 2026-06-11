import { useState } from "react";

export default function BlurImage({
  className = "",
  alt = "",
  onLoad,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  function handleLoad(event) {
    setIsLoaded(true);
    onLoad?.(event);
  }

  return (
    <img
      className={`blur-image ${isLoaded ? "is-loaded" : ""} ${className}`.trim()}
      alt={alt}
      onLoad={handleLoad}
      {...props}
    />
  );
}
