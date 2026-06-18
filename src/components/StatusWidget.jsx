export default function StatusWidget() {
  return (
    <div className="status-widget" aria-label="Availability">
      <span className="status-widget__dot" aria-hidden="true">
        <i />
      </span>
      <span className="status-widget__content">
        <strong>Open to projects and remote roles</strong>
        <em>Remote from the Philippines</em>
      </span>
    </div>
  );
}
