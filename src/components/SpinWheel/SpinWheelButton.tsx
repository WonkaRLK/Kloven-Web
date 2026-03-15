"use client";

import { motion } from "framer-motion";
import { Gift } from "lucide-react";

interface SpinWheelButtonProps {
  onClick: () => void;
  hasCode: boolean;
}

export default function SpinWheelButton({
  onClick,
  hasCode,
}: SpinWheelButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-kloven-gold rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
      title={
        hasCode
          ? "Ver tu c\u00f3digo de descuento"
          : "Gir\u00e1 para ganar un descuento"
      }
    >
      <Gift className="w-6 h-6 text-white" />
      {hasCode && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-kloven-black" />
      )}
    </motion.button>
  );
}
