import { useMemo, useState } from "react";
import { Calculator, Clock, TrendingUp } from "lucide-react";
import "./business-components.css";

export default function ROICalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(25);
  const [hourlyRate, setHourlyRate] = useState(45);

  const yearlyHoursSaved = useMemo(() => hoursPerWeek * 52, [hoursPerWeek]);
  const yearlyMoneySaved = useMemo(
    () => yearlyHoursSaved * hourlyRate,
    [hourlyRate, yearlyHoursSaved],
  );

  return (
    <section className="business-section roi-section" aria-labelledby="roi-title">
      <div className="business-section__header">
        <span className="business-eyebrow">The Business Case</span>
        <h2 id="roi-title">Automation should pay for itself.</h2>
        <p>
          Model the annual cost of repetitive team execution before investing in a
          backend pipeline that removes manual routing, scoping, and follow-up work.
        </p>
      </div>

      <div className="roi-card">
        <div className="roi-card__top">
          <div className="roi-card__icon" aria-hidden="true">
            <Calculator size={22} />
          </div>

          <div>
            <h3>ROI & Hours Saved Calculator</h3>
            <p>Estimate operational savings from backend automation.</p>
          </div>
        </div>

        <div className="roi-controls">
          <label className="roi-control">
            <div className="roi-control__label">
              <span>
                <Clock size={16} aria-hidden="true" />
                Manual Hours Spent Per Week
              </span>
              <strong>{hoursPerWeek} hrs</strong>
            </div>

            <input
              type="range"
              min="5"
              max="100"
              value={hoursPerWeek}
              onChange={(event) => setHoursPerWeek(Number(event.target.value))}
              aria-label="Manual hours spent per week"
            />
          </label>

          <label className="roi-control">
            <div className="roi-control__label">
              <span>
                <TrendingUp size={16} aria-hidden="true" />
                Average Hourly Rate of Team
              </span>
              <strong>${hourlyRate}/hr</strong>
            </div>

            <input
              type="range"
              min="15"
              max="150"
              value={hourlyRate}
              onChange={(event) => setHourlyRate(Number(event.target.value))}
              aria-label="Average hourly rate of team"
            />
          </label>
        </div>

        <div className="roi-output" aria-live="polite">
          <p>
            An automated backend pipeline will save your business{" "}
            <strong>{yearlyHoursSaved.toLocaleString()} hours</strong> and{" "}
            <strong>
              ${yearlyMoneySaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </strong>{" "}
            every year.
          </p>
        </div>
      </div>
    </section>
  );
}
