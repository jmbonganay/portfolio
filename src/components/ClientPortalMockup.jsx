import {
  Activity,
  BarChart3,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Milestone,
  ReceiptText,
} from "lucide-react";
import "./business-components.css";

const apiEvents = [
  {
    event: "Webhook received",
    status: "200 OK",
    time: "2s ago",
  },
  {
    event: "Gemini scope compiled",
    status: "Complete",
    time: "8s ago",
  },
  {
    event: "PDF dispatched",
    status: "Sent",
    time: "15s ago",
  },
];

export default function ClientPortalMockup() {
  return (
    <section className="business-section portal-section" aria-labelledby="portal-title">
      <div className="business-section__header">
        <span className="business-eyebrow">The Enterprise Experience</span>
        <h2 id="portal-title">Not just pages client-facing systems.</h2>
        <p>
          A polished portal-style interface showing how project status, invoices,
          API events, and automation metrics can live in one premium experience.
        </p>
      </div>

      <div className="portal-window">
        <div className="portal-window__bar">
          <div className="portal-window__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <p>client-portal.systems/dashboard</p>
        </div>

        <div className="portal-shell">
          <aside className="portal-sidebar">
            <div className="portal-sidebar__brand">
              <BarChart3 size={18} aria-hidden="true" />
              <span>OpsPanel</span>
            </div>

            <nav className="portal-nav" aria-label="Client portal preview">
              <a>
                <LayoutDashboard size={17} aria-hidden="true" />
                Dashboard
              </a>
              <a>
                <ReceiptText size={17} aria-hidden="true" />
                Invoices
              </a>
              <a>
                <Milestone size={17} aria-hidden="true" />
                Milestones
              </a>
              <a>
                <Activity size={17} aria-hidden="true" />
                API Metrics
              </a>
            </nav>
          </aside>

          <main className="portal-main">
            <div className="portal-main__header">
              <div>
                <span>Enterprise Delivery Hub</span>
                <h3>Client Portal Preview</h3>
              </div>

              <div className="portal-status-pill">
                <span aria-hidden="true" />
                Live sync
              </div>
            </div>

            <div className="portal-grid">
              <section className="portal-card portal-card--wide">
                <div className="portal-card__header">
                  <div>
                    <span>Project Status</span>
                    <h4>AI proposal engine rollout</h4>
                  </div>
                  <strong>80%</strong>
                </div>

                <div className="portal-progress" aria-label="Project is 80 percent complete">
                  <span style={{ width: "80%" }} />
                </div>

                <p>
                  Core automation deployed. Final QA, analytics events, and PDF
                  branding polish remaining.
                </p>
              </section>

              <section className="portal-card">
                <div className="portal-card__icon" aria-hidden="true">
                  <CircleDollarSign size={20} />
                </div>
                <span>Pending Invoices</span>
                <h4>$1,240.00</h4>
                <p>Next milestone invoice scheduled after final review.</p>
              </section>

              <section className="portal-card portal-card--table">
                <div className="portal-card__header">
                  <div>
                    <span>Recent API Events</span>
                    <h4>Webhook Traffic</h4>
                  </div>
                  <FileText size={18} aria-hidden="true" />
                </div>

                <div className="portal-table">
                  {apiEvents.map((row) => (
                    <div className="portal-table__row" key={row.event}>
                      <span>{row.event}</span>
                      <strong>{row.status}</strong>
                      <em>{row.time}</em>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
