import { useEffect, useState } from "react";

const GITHUB_COMMITS_ENDPOINT = "https://api.github.com/repos/jmbonganay/portfolio/commits";

function formatRelativeTime(dateValue) {
  if (!dateValue) return "Last deploy: syncing";

  const timestamp = new Date(dateValue).getTime();
  const diffInMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));

  if (diffInMinutes < 60) {
    return `Last deploy: ${diffInMinutes} min ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Last deploy: ${diffInHours} hr${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `Last deploy: ${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
}

export default function StatusWidget() {
  const [lastDeployText, setLastDeployText] = useState("Last deploy: checking");

  useEffect(() => {
    let isMounted = true;

    async function loadLatestCommit() {
      try {
        const response = await fetch(GITHUB_COMMITS_ENDPOINT, {
          headers: {
            Accept: "application/vnd.github+json",
          },
        });

        if (!response.ok) {
          throw new Error("GitHub commits endpoint unavailable.");
        }

        const commits = await response.json();
        const latestCommitDate = commits?.[0]?.commit?.committer?.date;

        if (isMounted) {
          setLastDeployText(formatRelativeTime(latestCommitDate));
        }
      } catch (error) {
        if (isMounted) {
          setLastDeployText("Last deploy: unavailable");
        }
      }
    }

    loadLatestCommit();

    // Future upgrade: swap the commits endpoint for the GitHub Deployments API
    // if you want the badge to show actual deployment timestamps instead of latest commit time.

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="status-widget" aria-label="System status">
      <span className="status-widget__dot" aria-hidden="true">
        <span />
        <i />
      </span>
      <span className="status-widget__content">
        <strong>All Systems Operational</strong>
        <em>{lastDeployText}</em>
      </span>
    </div>
  );
}
