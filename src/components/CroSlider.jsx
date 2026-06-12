import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, CheckCircle2, MousePointer2 } from "lucide-react";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeInOutCubic(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

export default function CroSlider() {
  const sliderRef = useRef(null);
  const autoFrameRef = useRef(null);
  const sliderPositionRef = useRef(50);
  const isInteractedRef = useRef(false);

  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isInteracted, setIsInteracted] = useState(false);

  useEffect(() => {
    sliderPositionRef.current = sliderPosition;
  }, [sliderPosition]);

  useEffect(() => {
    isInteractedRef.current = isInteracted;
  }, [isInteracted]);

  function setSyncedSliderPosition(nextPosition) {
    const safePosition = clamp(nextPosition, 0, 100);
    sliderPositionRef.current = safePosition;
    setSliderPosition(safePosition);
  }

  function cancelAutoPeek() {
    if (autoFrameRef.current) {
      cancelAnimationFrame(autoFrameRef.current);
      autoFrameRef.current = null;
    }
  }

  function markInteracted() {
    if (!isInteractedRef.current) {
      isInteractedRef.current = true;
      setIsInteracted(true);
    }

    cancelAutoPeek();
  }

  function animateSliderTo(targetPosition, duration = 520) {
    return new Promise((resolve) => {
      const startPosition = sliderPositionRef.current;
      const startTime = performance.now();

      function frame(now) {
        if (isInteractedRef.current) {
          resolve();
          return;
        }

        const progress = clamp((now - startTime) / duration, 0, 1);
        const eased = easeInOutCubic(progress);
        const nextPosition =
          startPosition + (targetPosition - startPosition) * eased;

        setSyncedSliderPosition(nextPosition);

        if (progress < 1) {
          autoFrameRef.current = requestAnimationFrame(frame);
        } else {
          autoFrameRef.current = null;
          resolve();
        }
      }

      autoFrameRef.current = requestAnimationFrame(frame);
    });
  }

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider || hasAnimated) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || isInteractedRef.current) return;

        setHasAnimated(true);
        setSyncedSliderPosition(50);

        window.setTimeout(async () => {
          if (isInteractedRef.current) return;

          await animateSliderTo(65, 520);

          if (isInteractedRef.current) return;

          await animateSliderTo(50, 620);
        }, 350);

        observer.disconnect();
      },
      {
        threshold: 0.38,
      },
    );

    observer.observe(slider);

    return () => {
      observer.disconnect();
      cancelAutoPeek();
    };
  }, [hasAnimated]);

  function updateSliderPosition(clientX) {
    const slider = sliderRef.current;

    if (!slider) return;

    const rect = slider.getBoundingClientRect();
    const rawPosition = ((clientX - rect.left) / rect.width) * 100;

    setSyncedSliderPosition(rawPosition);
  }

  function handlePointerDown(event) {
    event.preventDefault();
    markInteracted();
    setIsDragging(true);

    event.currentTarget.setPointerCapture?.(event.pointerId);
    updateSliderPosition(event.clientX);
  }

  function handlePointerMove(event) {
    if (!isDragging) return;
    updateSliderPosition(event.clientX);
  }

  function handlePointerUp(event) {
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      markInteracted();
      setSyncedSliderPosition(sliderPositionRef.current - 4);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      markInteracted();
      setSyncedSliderPosition(sliderPositionRef.current + 4);
    }
  }

  return (
    <section
      className="cro-slider-section"
      id="cro-slider"
      aria-labelledby="cro-slider-title"
    >
      <div className="cro-slider-shell">
        <div className="cro-slider-heading">
          <p className="section-kicker">CRO Demonstration</p>

          <h2 id="cro-slider-title">Visual Proof: The Conversion Redesign</h2>

          <p>
            Drag the slider to see how I restructure messy layouts into clean,
            high-converting architectures.
          </p>
        </div>

        <div className="cro-slider-frame">
          <div
            ref={sliderRef}
            className={
              isDragging
                ? "cro-comparison is-dragging"
                : "cro-comparison"
            }
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerUp}
            role="presentation"
          >
            <div className="cro-layer cro-layer--before">
              <div className="cro-layer__wash" aria-hidden="true" />

              <div className="cro-mockup cro-mockup--before">
                <div className="cro-mockup-header cro-mockup-header--before">
                  <div>
                    <span>Before</span>
                    <h3>Messy Before Design</h3>
                  </div>

                  <em>Low clarity</em>
                </div>

                <div className="cro-wireframe cro-wireframe--before">
                  <div className="cro-wireframe-main">
                    <span className="cro-skeleton cro-skeleton--title" />

                    <div className="cro-skeleton-lines">
                      <span />
                      <span />
                      <span />
                    </div>

                    <div className="cro-card-grid cro-card-grid--messy">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <span key={index} />
                      ))}
                    </div>
                  </div>

                  <div className="cro-wireframe-side">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>

            <div
              className="cro-layer cro-layer--after"
              style={{
                clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
              }}
            >
              <div className="cro-layer__wash" aria-hidden="true" />

              <div className="cro-mockup cro-mockup--after">
                <div className="cro-mockup-header cro-mockup-header--after">
                  <div>
                    <span>After</span>
                    <h3>Optimized After Design</h3>
                  </div>

                  <em>Conversion-first</em>
                </div>

                <div className="cro-wireframe cro-wireframe--after">
                  <div className="cro-wireframe-main cro-wireframe-main--after">
                    <div className="cro-offer-pill">Clear offer hierarchy</div>

                    <span className="cro-skeleton cro-skeleton--after-title" />

                    <div className="cro-skeleton-lines cro-skeleton-lines--after">
                      <span />
                      <span />
                    </div>

                    <div className="cro-cta-row">
                      <span>Primary CTA</span>
                      <span>Social proof</span>
                      <span>Offer flow</span>
                    </div>

                    <div className="cro-card-grid cro-card-grid--after">
                      {["Hook", "Proof", "Action"].map((item) => (
                        <div key={item}>
                          <CheckCircle2 size={18} aria-hidden="true" />
                          <strong>{item}</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="cro-wireframe-side cro-wireframe-side--after">
                    <div>
                      <span>CRO System</span>
                      <i />
                      <i />
                      <i />
                    </div>

                    <div>
                      <MousePointer2 size={22} aria-hidden="true" />
                      <strong>Fewer distractions.</strong>
                      <p>
                        Cleaner section rhythm, clearer CTAs, and stronger scanability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="cro-slider-divider"
              style={{ left: `${sliderPosition}%` }}
              aria-hidden="true"
            />

            <button
              type="button"
              className={[
                "cro-slider-handle",
                !isInteracted ? "cro-handle--teaser" : "",
              ].join(" ")}
              style={{ left: `${sliderPosition}%` }}
              onKeyDown={handleKeyDown}
              role="slider"
              aria-label="Compare before and after redesign"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(sliderPosition)}
            >
              <ArrowLeftRight size={22} aria-hidden="true" />

              {!isInteracted ? (
                <span className="cro-handle-label">Grab me</span>
              ) : null}
            </button>

            <div className="cro-label cro-label--before">Before</div>
            <div className="cro-label cro-label--after">After</div>
          </div>
        </div>

        <p className="cro-slider-note">
          Placeholder demonstration only. Replace the two layers with real before/after
          screenshots once the assets are ready.
        </p>
      </div>
    </section>
  );
}
