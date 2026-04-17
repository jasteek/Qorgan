import { motion, HTMLMotionProps } from "motion/react";
import { ReactNode } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  variant?: "default" | "gold" | "turquoise";
  className?: string;
}

export function GlassCard({
  children,
  variant = "default",
  className = "",
  ...props
}: GlassCardProps) {
  const borderColors = {
    default: "border-white/10",
    gold: "border-[#DAA520]/30",
    turquoise: "border-[#40E0D0]/30",
  };

  return (
    <motion.div
      className={`backdrop-blur-xl bg-white/5 border rounded-3xl ${borderColors[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
