import { useEffect, useState } from "react";

const loadingMessages = [
  "> Authenticating webhook...",
  "> Querying Gemini 2.5 Flash...",
  "> Compiling PDF architecture...",
  "> Dispatching email payload...",
];

export default function TerminalLoader({ isLoading }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setMessageIndex((currentIndex) =>
        currentIndex === loadingMessages.length - 1 ? 0 : currentIndex + 1,
      );
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [isLoading]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="terminal-loader" role="status" aria-live="polite">
      <div className="terminal-loader__chrome" aria-hidden="true">
        <span />
        <span />
        <span />
        <strong>ai-proposal-engine.sh</strong>
      </div>

      <p className="terminal-loader__line">
        {loadingMessages[messageIndex]}
        <span className="terminal-loader__cursor" aria-hidden="true" />
      </p>
    </div>
  );
}
