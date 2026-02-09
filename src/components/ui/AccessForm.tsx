"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function AccessForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase
      .from("access_requests")
      .insert({ email: email.toLowerCase().trim() });

    if (error) {
      if (error.code === "23505") {
        // Unique constraint — email already submitted
        setStatus("success");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
        setStatus("error");
      }
      return;
    }

    setStatus("success");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center space-y-3"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-accent-blue"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Request Received</h3>
            <p className="text-vault-muted text-sm">
              We&apos;ll review your application and get back to you within 24 hours.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email to request access"
                required
                className="w-full px-5 py-4 bg-vault-card border border-vault-border rounded-xl
                           text-white placeholder:text-vault-muted/60
                           focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20
                           transition-all duration-300
                           group-hover:border-vault-border/80"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-blue/5 to-accent-pink/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>

            <motion.button
              type="submit"
              disabled={status === "loading"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide uppercase
                         bg-gradient-to-r from-accent-blue to-accent-pink
                         hover:from-accent-blue-light hover:to-accent-pink-light
                         text-white shadow-lg shadow-accent-blue/20
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all duration-300"
            >
              {status === "loading" ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Request Access"
              )}
            </motion.button>

            {status === "error" && (
              <p className="text-center text-red-400 text-sm">{errorMsg}</p>
            )}

            <p className="text-center text-vault-muted/60 text-xs">
              By invitation only. Your request will be reviewed by our team.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
