"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, type AccessRequest } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";

const ADMIN_PASSWORD = "crownvault2025";

type Tab = "pending" | "approved" | "denied";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("access_requests")
      .select("*")
      .eq("status", activeTab)
      .order("created_at", { ascending: false });

    setRequests((data as AccessRequest[]) || []);
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    if (authenticated) {
      fetchRequests();
    }
  }, [authenticated, activeTab, fetchRequests]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "denied") => {
    setActionLoading(id);
    await supabase
      .from("access_requests")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);

    setRequests((prev) => prev.filter((r) => r.id !== id));
    setActionLoading(null);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-vault-darker flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center">
            <Logo size="large" />
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
              }}
              placeholder="Admin password"
              className="w-full px-5 py-4 bg-vault-card border border-vault-border rounded-xl
                         text-white placeholder:text-vault-muted/60
                         focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20
                         transition-all duration-300"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-400 text-sm text-center">Incorrect password</p>
            )}
            <button
              type="submit"
              className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide uppercase
                         bg-gradient-to-r from-accent-blue to-accent-pink text-white
                         hover:from-accent-blue-light hover:to-accent-pink-light
                         transition-all duration-300"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "denied", label: "Denied" },
  ];

  const timeAgo = (date: string) => {
    const seconds = Math.floor(
      (Date.now() - new Date(date).getTime()) / 1000
    );
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-vault-darker">
      {/* Header */}
      <header className="border-b border-vault-border px-6 sm:px-10 py-5 flex items-center justify-between">
        <Logo />
        <span className="text-vault-muted text-xs tracking-wider uppercase">
          Admin Panel
        </span>
      </header>

      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-vault-card rounded-xl p-1 border border-vault-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-vault-border text-white"
                  : "text-vault-muted hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Request list */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-16 text-vault-muted">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-vault-muted/60 text-sm">
              No {activeTab} requests
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {requests.map((request) => (
                <motion.div
                  key={request.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="glass rounded-xl p-5 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-medium truncate">
                      {request.email}
                    </p>
                    <p className="text-vault-muted/60 text-xs mt-1">
                      Requested {timeAgo(request.created_at)}
                    </p>
                  </div>

                  {activeTab === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => updateStatus(request.id, "approved")}
                        disabled={actionLoading === request.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium
                                   bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                                   hover:bg-emerald-500/20 transition-all
                                   disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(request.id, "denied")}
                        disabled={actionLoading === request.id}
                        className="px-4 py-2 rounded-lg text-sm font-medium
                                   bg-red-500/10 text-red-400 border border-red-500/20
                                   hover:bg-red-500/20 transition-all
                                   disabled:opacity-50"
                      >
                        Deny
                      </button>
                    </div>
                  )}

                  {activeTab === "approved" && (
                    <span className="text-emerald-400/60 text-xs tracking-wider uppercase">
                      Approved
                    </span>
                  )}

                  {activeTab === "denied" && (
                    <span className="text-red-400/60 text-xs tracking-wider uppercase">
                      Denied
                    </span>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
