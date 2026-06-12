import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Gauge,
  Layers3,
  ShoppingCart,
  Sparkles,
  Workflow,
} from "lucide-react";

const platformStack = [
  {
    name: "WordPress",
    description: "Elementor builds, service pages, landing pages",
    icon: FileText,
  },
  {
    name: "Shopify",
    description: "Product pages, ecommerce layout, CRO sections",
    icon: ShoppingCart,
  },
  {
    name: "GoHighLevel",
    description: "Funnels, CRM forms, lead capture flow",
    icon: Workflow,
  },
];

const operatorChips = [
  "Fast page production",
  "CRO structure",
  "Remote execution",
];

const croFocus = [
  "Visual hierarchy that makes the offer easier to understand.",
  "Section sequencing built around decision-making and conversion flow.",
  "QA mindset across responsive behavior, spacing, forms, and launch details.",
];

export default function AboutMetrics() {
  const sectionRef = useRef(null);
  const counterIntervalRef = useRef(null);
  const hasStartedCounterRef = useRef(false);

  const [hasRevealed, setHasRevealed] = useState(false);
  const [count, setCount] = useState(0);

  function startExperienceCounter() {
    if (hasStartedCounterRef.current) return;

    hasStartedCounterRef.current = true;
    setCount(0);

    let currentValue = 0;

    counterIntervalRef.current = window.setInterval(() => {
      currentValue += 1;

      if (currentValue >= 4) {
        setCount(4);
        window.clearInterval(counterIntervalRef.current);
        counterIntervalRef.current = null;
        return;
      }

      setCount(currentValue);
    }, 150);
  }

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    let observer = null;
    let hasActivated = false;
    let fallbackTimeout = null;

    function activateSection() {
      if (hasActivated) return;

      hasActivated = true;
      setHasRevealed(true);
      startExperienceCounter();

      if (observer) observer.disconnect();
      window.removeEventListener("scroll", checkSectionVisibility);
      window.removeEventListener("resize", checkSectionVisibility);
    }

    function checkSectionVisibility() {
      const rect = section.getBoundingClientRect();
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      const entersViewport = rect.top <= viewportHeight * 0.88;
      const stillVisible = rect.bottom >= viewportHeight * 0.08;

      if (entersViewport && stillVisible) {
        activateSection();
      }
    }

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          activateSection();
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -10% 0px",
        },
      );

      observer.observe(section);
    }

    window.addEventListener("scroll", checkSectionVisibility, { passive: true });
    window.addEventListener("resize", checkSectionVisibility);

    fallbackTimeout = window.setTimeout(checkSectionVisibility, 150);

    return () => {
      if (observer) observer.disconnect();
      if (fallbackTimeout) window.clearTimeout(fallbackTimeout);
      window.removeEventListener("scroll", checkSectionVisibility);
      window.removeEventListener("resize", checkSectionVisibility);

      if (counterIntervalRef.current) {
        window.clearInterval(counterIntervalRef.current);
        counterIntervalRef.current = null;
      }
    };
  }, []);

  function revealClass() {
    return [
      "about-reveal-card",
      hasRevealed ? "is-revealed" : "is-hidden",
    ].join(" ");
  }

  function revealStyle(index) {
    return {
      transitionDelay: hasRevealed ? `${index * 100}ms` : "0ms",
    };
  }

  return (
    <section
      ref={sectionRef}
      className="about-metrics-section"
      id="about"
      aria-labelledby="about-metrics-title"
    >
      <div className="about-metrics-shell">
        <div className="about-metrics-heading">
          <p className="section-kicker">Identity & Performance</p>

          <h2 id="about-metrics-title">
            Built like an operator, designed like a conversion system.
          </h2>

          <p>
            A compact view of how I work: platform execution, conversion-first
            layout decisions, and launch-ready quality control.
          </p>
        </div>

        <div className="about-bento-grid">
          <article
            className={`about-metrics-card about-metrics-card--operator ${revealClass()}`}
            style={revealStyle(0)}
          >
            <div className="about-metrics-card__glow" aria-hidden="true" />

            <div className="about-card-heading">
              <div>
                <span>Founder Note</span>
                <h3>The Operator</h3>
              </div>

              <i aria-hidden="true">
                <Sparkles size={22} />
              </i>
            </div>

            <p>
              I build pages with a direct eye for the conversion path: headline
              clarity, visual hierarchy, benefit sequencing, mobile behavior,
              tracking readiness, and automation support for repetitive campaign
              work.
            </p>

            <div className="about-chip-row" aria-label="Operator strengths">
              {operatorChips.map((chip) => (
                <span key={chip}>{chip}</span>
              ))}
            </div>
          </article>

          <article
            className={`about-metrics-card about-metrics-card--stack ${revealClass()}`}
            style={revealStyle(1)}
          >
            <div className="about-card-heading about-card-heading--compact">
              <div>
                <span>Core Tools</span>
                <h3>The Stack</h3>
              </div>

              <Layers3 size={24} aria-hidden="true" />
            </div>

            <div className="about-stack-list">
              {platformStack.map((platform) => {
                const Icon = platform.icon;

                return (
                  <div className="about-stack-item" key={platform.name}>
                    <span className="about-stack-icon" aria-hidden="true">
                      <Icon size={19} />
                    </span>

                    <div>
                      <strong>{platform.name}</strong>
                      <small>{platform.description}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article
            className={`about-metrics-card about-metrics-card--experience ${revealClass()}`}
            style={revealStyle(2)}
          >
            <div className="about-metrics-card__orb" aria-hidden="true" />

            <span>Experience</span>

            <div className="about-years" aria-label={`${count}+ years experience`}>
              <strong>{count}+</strong>
              <em>Years</em>
            </div>

            <p>
              Conversion-first builds across landing pages, service pages,
              ecommerce layouts, and funnel-ready web experiences.
            </p>
          </article>

          <article
            className={`about-metrics-card about-metrics-card--cro ${revealClass()}`}
            style={revealStyle(3)}
          >
            <div className="about-card-heading about-card-heading--wide">
              <div>
                <span>Performance Mindset</span>
                <h3>The CRO Focus</h3>
              </div>

              <div className="about-cro-badge">
                <Gauge size={15} aria-hidden="true" />
                Conversion-First Builds
              </div>
            </div>

            <div className="about-cro-grid">
              {croFocus.map((item) => (
                <div className="about-cro-item" key={item}>
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <p>{item}</p>
                </div>
              ))}
            </div>

            <a className="about-work-link" href="#work">
              See selected builds
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
