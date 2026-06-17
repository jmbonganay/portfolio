import { AnimatePresence, motion } from "framer-motion";

export function HoverCard({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1.02,
        boxShadow: "0 24px 80px rgba(45, 212, 191, 0.16)",
      }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredGrid({ children, className = "", ...props }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.05,
          },
        },
      }}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredGridItem({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function SlideDrawer({ isOpen, onClose, children, className = "", direction = "right" }) {
  const isBottom = direction === "bottom";

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="motion-drawer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="motion-drawer__backdrop"
            aria-label="Close drawer"
            onClick={onClose}
          />

          <motion.aside
            className={[
              "motion-drawer__panel",
              isBottom ? "motion-drawer__panel--bottom" : "motion-drawer__panel--right",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            initial={isBottom ? { y: "100%" } : { x: "100%" }}
            animate={isBottom ? { y: 0 } : { x: 0 }}
            exit={isBottom ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 220, damping: 28 }}
          >
            {children}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
