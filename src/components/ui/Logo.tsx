"use client";

import { motion } from "framer-motion";

export default function Logo({ size = "default" }: { size?: "default" | "large" }) {
  const isLarge = size === "large";

  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Crown icon */}
      <div className={`relative ${isLarge ? "w-10 h-10" : "w-8 h-8"}`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            d="M4 28L8 12L14 20L20 8L26 20L32 12L36 28H4Z"
            className="fill-accent-blue stroke-accent-pink"
            strokeWidth="1.5"
          />
          <rect x="4" y="28" width="32" height="4" rx="1" className="fill-accent-blue" />
          <circle cx="20" cy="14" r="2" className="fill-accent-pink" />
          <circle cx="12" cy="18" r="1.5" className="fill-accent-pink/60" />
          <circle cx="28" cy="18" r="1.5" className="fill-accent-pink/60" />
        </svg>
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <span
          className={`font-bold tracking-wider uppercase ${
            isLarge ? "text-2xl" : "text-lg"
          }`}
        >
          <span className="text-white">Crown</span>
          <span className="gradient-text">Vault</span>
        </span>
        {isLarge && (
          <span className="text-vault-muted text-xs tracking-[0.3em] uppercase -mt-1">
            Private Marketplace
          </span>
        )}
      </div>
    </motion.div>
  );
}
