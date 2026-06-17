import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function ScrollToTop() {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    function handleScroll() {
      setIsVisible(window.scrollY > 400);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (!isMounted) {
    return null;
  }

  const buttonStyle = {
    position: "fixed",
    right: "clamp(18px, 3vw, 32px)",
    bottom: "clamp(18px, 3vw, 32px)",
    zIndex: 2147483647,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "52px",
    height: "52px",
    borderRadius: "999px",
    border: isInteractive
      ? "1px solid rgba(125, 255, 245, 0.82)"
      : "1px solid rgba(22, 214, 200, 0.48)",
    color: "rgba(225, 255, 250, 0.96)",
    background:
      "linear-gradient(135deg, rgba(22, 214, 200, 0.16), rgba(255, 255, 255, 0.04)), rgba(6, 9, 8, 0.94)",
    boxShadow: isInteractive
      ? "0 22px 54px rgba(0, 0, 0, 0.44), 0 0 38px rgba(22, 214, 200, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.12)"
      : "0 18px 44px rgba(0, 0, 0, 0.34), 0 0 26px rgba(22, 214, 200, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    cursor: "pointer",
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? "auto" : "none",
    transform: isVisible
      ? isInteractive
        ? "translate3d(0, -3px, 0) scale(1.06)"
        : "translate3d(0, 0, 0) scale(1)"
      : "translate3d(0, 16px, 0) scale(0.94)",
    transition:
      "opacity 220ms ease, transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease, background 220ms ease",
  };

  return createPortal(
    <button
      type="button"
      className="scroll-to-top"
      style={buttonStyle}
      onClick={scrollToTop}
      onMouseEnter={() => setIsInteractive(true)}
      onMouseLeave={() => setIsInteractive(false)}
      onFocus={() => setIsInteractive(true)}
      onBlur={() => setIsInteractive(false)}
      aria-label="Back to top"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 19V5"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <path
          d="M5 12L12 5L19 12"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>,
    document.body,
  );
}
