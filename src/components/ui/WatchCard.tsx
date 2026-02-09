"use client";

import { motion } from "framer-motion";
import type { Watch } from "@/lib/supabase";

const statusColors = {
  available: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", label: "Available" },
  on_hold: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "On Hold" },
  sold: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", label: "Sold" },
};

const conditionColors: Record<string, string> = {
  "New/Unworn": "text-accent-blue",
  "Excellent": "text-emerald-400",
  "Very Good": "text-green-400",
  "Good": "text-amber-400",
  "Fair": "text-vault-muted",
};

export default function WatchCard({ watch }: { watch: Watch }) {
  const statusStyle = statusColors[watch.status];
  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(watch.price);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group rounded-2xl bg-vault-card border border-vault-border overflow-hidden
                 hover:border-accent-blue/30 hover:glow-border-blue transition-all duration-500"
    >
      {/* Image area */}
      <div className="relative h-56 bg-vault-darker overflow-hidden">
        {watch.images && watch.images.length > 0 ? (
          <img
            src={watch.images[0]}
            alt={`${watch.brand} ${watch.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-vault-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
            {statusStyle.label}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5 space-y-4">
        {/* Brand + model */}
        <div>
          <p className="text-vault-muted text-xs tracking-wider uppercase">{watch.brand}</p>
          <h3 className="text-white font-semibold text-lg mt-0.5 leading-tight">{watch.model}</h3>
          {watch.reference_number && (
            <p className="text-vault-muted/60 text-xs mt-1 font-mono">Ref. {watch.reference_number}</p>
          )}
        </div>

        {/* Description (truncated) */}
        <p className="text-vault-muted text-sm leading-relaxed line-clamp-2">
          {watch.description}
        </p>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-vault-muted/60 text-xs">Condition</span>
            <p className={`font-medium ${conditionColors[watch.condition] || "text-white"}`}>
              {watch.condition}
            </p>
          </div>
          <div>
            <span className="text-vault-muted/60 text-xs">Year</span>
            <p className="text-white font-medium">{watch.year || "N/A"}</p>
          </div>
          <div>
            <span className="text-vault-muted/60 text-xs">Location</span>
            <p className="text-white font-medium">{watch.location}</p>
          </div>
          <div>
            <span className="text-vault-muted/60 text-xs">Ships in</span>
            <p className="text-white font-medium">{watch.shipping_days} day{watch.shipping_days !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Price */}
        <div className="pt-3 border-t border-vault-border flex items-center justify-between">
          <span className="text-2xl font-bold gradient-text">{priceFormatted}</span>
          {watch.status === "available" && (
            <button className="px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider
                               text-accent-blue border border-accent-blue/30
                               hover:bg-accent-blue/10 transition-all duration-300">
              Inquire
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
