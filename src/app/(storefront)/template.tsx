"use client";

import { motion } from "framer-motion";

export default function StorefrontTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Page content fade in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.div>

      {/* Red curtain wipe overlay */}
      <motion.div
        className="fixed inset-0 z-[9000] bg-kloven-red origin-left pointer-events-none"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      />
    </>
  );
}
