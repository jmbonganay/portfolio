export default function StatusWidget() {
  return (
    <div className="status-widget" aria-label="System status">
      <span className="status-widget__dot" aria-hidden="true">
        <span />
        <i />
      </span>
      <span className="status-widget__content">
        <strong>Systems operational</strong>
        <em>Remote-ready workflow</em>
      </span>
    </div>
  );
}
