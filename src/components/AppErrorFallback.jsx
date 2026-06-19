export default function AppErrorFallback() {
  return (
    <main className="app-error-fallback" role="alert" aria-labelledby="app-error-title">
      <div className="app-error-fallback__card">
        <p>Temporary application error</p>
        <h1 id="app-error-title">This page could not finish loading.</h1>
        <span>
          The technical error was recorded without your submitted form details.
          Reload the page to try again.
        </span>
        <button type="button" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    </main>
  );
}
