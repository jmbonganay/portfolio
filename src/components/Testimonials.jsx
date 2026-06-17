import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    highlightedText:
      "John Michael was reliable across every part of our front-end campaign workflow.",
    bodyText:
      "He built and optimized high-speed WordPress landing pages, structured Shopify product pages around conversion clarity, and helped manage GoHighLevel funnels that supported stronger lead generation and smoother campaign performance.",
    name: "Adam Cherrington",
    role: "Founder, Cherrington Media",
    outcome: "WordPress / Shopify / GHL",
  },
  {
    highlightedText:
      "John Michael has a strong eye for translating high-fidelity Figma and Sketch designs into pixel-perfect, responsive WordPress builds.",
    bodyText:
      "His execution of visual hierarchy was clean, and the Zapier automations he set up helped our team save hours of repetitive manual work.",
    name: "Umar Shaikh",
    role: "Founder, Nest Marketing",
    outcome: "WordPress Build / Automation",
  },
  {
    highlightedText:
      "His Shopify product page work made the buying path feel much clearer on mobile.",
    bodyText:
      "The layout, offer structure, and checkout flow improvements gave us a visible lift in conversion quality.",
    name: "eCommerce Client",
    role: "eCommerce Director",
    outcome: "Shopify CRO",
  },
  {
    highlightedText:
      "Working with him remotely was easy across time zones.",
    bodyText:
      "His updates were clear, the QA was organized, and every page felt launch-ready before it reached our client.",
    name: "Marketing Director",
    role: "Remote Campaign Team",
    outcome: "Launch QA",
  },
];

const marqueeTestimonials = [...testimonials, ...testimonials];

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function TestimonialCard({ testimonial }) {
  return (
    <article className="testimonial-card testimonial-card--marquee">
      <div className="testimonial-card__top">
        <span className="testimonial-card__quote">
          <Quote size={18} aria-hidden="true" />
        </span>

        <div className="testimonial-card__stars" aria-label="Five-star feedback">
          {Array.from({ length: 5 }).map((_, starIndex) => (
            <Star
              key={`${testimonial.name}-${starIndex}`}
              size={14}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      <p className="testimonial-card__quote-text">
        <span className="testimonial-card__highlight">
          “{testimonial.highlightedText}
        </span>{" "}
        <span className="testimonial-card__body">{testimonial.bodyText}”</span>
      </p>

      <div className="testimonial-card__footer testimonial-card__footer--avatar">
        <div className="testimonial-client">
          <div className="testimonial-avatar" aria-hidden="true">
            {getInitials(testimonial.name)}
          </div>

          <div>
            <strong>{testimonial.name}</strong>
            <span>{testimonial.role}</span>
          </div>
        </div>

        <em>{testimonial.outcome}</em>
      </div>
    </article>
  );
}

export default function Testimonials() {
  return (
    <section
      className="testimonials-section"
      aria-labelledby="testimonials-title"
    >
      <div className="testimonials-shell">
        <div className="testimonials-header testimonials-header--marquee">
          <div className="testimonials-heading">
            <p className="section-kicker">Social proof</p>

            <h2 id="testimonials-title">
              Trusted delivery signals from conversion-focused work.
            </h2>

            <p>
              Feedback signals across WordPress builds, Shopify CRO, GoHighLevel
              automation, and remote launch support.
            </p>
          </div>
        </div>

        <div className="testimonial-marquee" aria-label="Client testimonials">
          <div
            className="testimonial-marquee__fade testimonial-marquee__fade--left"
            aria-hidden="true"
          />
          <div
            className="testimonial-marquee__fade testimonial-marquee__fade--right"
            aria-hidden="true"
          />

          <div className="testimonial-marquee__track">
            {marqueeTestimonials.map((testimonial, index) => (
              <TestimonialCard
                key={`${testimonial.name}-${testimonial.outcome}-${index}`}
                testimonial={testimonial}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
