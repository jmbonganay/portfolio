import { ChevronDown, ShieldCheck } from "lucide-react";
import { useState } from "react";
import "./business-sales-components.css";

const faqItems = [
  {
    question: "What happens if a backend automation breaks after the project is done?",
    answer:
      "Every backend automation build includes a 30-day post-launch warranty. I also structure error-routing alerts where possible, so failed scenarios, webhook issues, or broken handoffs can be caught before they disrupt the business.",
  },
  {
    question: "How do I manage the systems if I don't know how to code?",
    answer:
      "Every project delivery includes visual system maps and recorded Loom documentation, so you can understand what each workflow does, where the data goes, and how to operate the system without touching code.",
  },
  {
    question: "How does pricing work? Is it hourly?",
    answer:
      "Engagements are flat-rate and milestone-based. Instead of billing endless hourly time, the project is scoped around clear deliverables, implementation phases, and approval checkpoints.",
  },
];

export default function HandoffFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="handoff-section" id="handoff-faq">
      <div className="handoff-section__header">
        <span className="engagement-eyebrow">Risk reversal</span>
        <h2>Built so non-technical founders can actually own the system.</h2>
        <p>
          The goal is not just to launch a smart automation. The goal is to
          leave you with a documented, maintainable, and business-safe operating layer.
        </p>
      </div>

      <div className="handoff-faq">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              className={`handoff-faq__item ${
                isOpen ? "handoff-faq__item--open" : ""
              }`}
              key={item.question}
            >
              <button
                type="button"
                className="handoff-faq__question"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span className="handoff-faq__icon" aria-hidden="true">
                  <ShieldCheck size={18} />
                </span>

                <span>{item.question}</span>

                <ChevronDown className="handoff-faq__chevron" size={20} aria-hidden="true" />
              </button>

              <div className="handoff-faq__answer-wrap">
                <p className="handoff-faq__answer">{item.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
