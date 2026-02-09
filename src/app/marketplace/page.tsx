"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { supabase, type Watch } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";
import WatchCard from "@/components/ui/WatchCard";

type Filter = "all" | "available" | "on_hold" | "sold";

export default function MarketplacePage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated === false) return;
    if (authenticated === null) return;

    const fetchWatches = async () => {
      setLoading(true);
      let query = supabase
        .from("watches")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data } = await query;
      setWatches((data as Watch[]) || []);
      setLoading(false);
    };

    fetchWatches();
  }, [authenticated, filter]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
  };

  // Not authenticated
  if (authenticated === false) {
    return (
      <div className="min-h-screen bg-vault-darker flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-vault-card border border-vault-border flex items-center justify-center">
            <svg className="w-10 h-10 text-vault-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Members Only</h1>
          <p className="text-vault-muted text-sm max-w-sm">
            You need to be signed in to view the marketplace.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl font-semibold text-sm
                         bg-gradient-to-r from-accent-blue to-accent-pink text-white
                         hover:from-accent-blue-light hover:to-accent-pink-light
                         transition-all duration-300"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-xl font-semibold text-sm
                         text-vault-muted border border-vault-border
                         hover:text-white hover:border-accent-blue/50
                         transition-all duration-300"
            >
              Request Access
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Loading auth check
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-vault-darker flex items-center justify-center">
        <div className="text-vault-muted">Loading...</div>
      </div>
    );
  }

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "available", label: "Available" },
    { key: "on_hold", label: "On Hold" },
    { key: "sold", label: "Sold" },
  ];

  return (
    <div className="min-h-screen bg-vault-darker">
      {/* Header */}
      <header className="border-b border-vault-border px-6 sm:px-10 py-5 flex items-center justify-between">
        <Link href="/marketplace">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-vault-muted text-xs tracking-wider uppercase hidden sm:block">
            Marketplace
          </span>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-lg text-sm font-medium
                       text-vault-muted border border-vault-border
                       hover:text-white hover:border-red-500/50
                       transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8 space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-vault-card rounded-xl p-1 border border-vault-border">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  filter === f.key
                    ? "bg-vault-border text-white"
                    : "text-vault-muted hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="text-vault-muted text-sm">
            {watches.length} {watches.length === 1 ? "piece" : "pieces"}
          </div>
        </div>

        {/* Watch grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-[420px] rounded-2xl bg-vault-card border border-vault-border animate-pulse"
              />
            ))}
          </div>
        ) : watches.length === 0 ? (
          <div className="text-center py-20 text-vault-muted/60 text-sm">
            No watches to display yet.
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {watches.map((watch) => (
                <WatchCard key={watch.id} watch={watch} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
