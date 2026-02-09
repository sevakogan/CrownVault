"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, type AccessRequest, type Watch } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";
import ImageUpload from "@/components/ui/ImageUpload";

const ADMIN_PASSWORD = "crownvault2025";

type Section = "requests" | "watches" | "upload";
type RequestTab = "pending" | "approved" | "denied";

const emptyWatch = {
  brand: "",
  model: "",
  reference_number: "",
  year: "",
  price: "",
  condition: "Excellent" as Watch["condition"],
  status: "available" as Watch["status"],
  location: "",
  shipping_days: "",
  description: "",
  dealer_notes: "",
  images: [] as string[],
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const [section, setSection] = useState<Section>("requests");
  const [requestTab, setRequestTab] = useState<RequestTab>("pending");
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Upload form
  const [form, setForm] = useState(emptyWatch);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("access_requests")
      .select("*")
      .eq("status", requestTab)
      .order("created_at", { ascending: false });
    setRequests((data as AccessRequest[]) || []);
    setLoading(false);
  }, [requestTab]);

  const fetchWatches = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("watches")
      .select("*")
      .order("created_at", { ascending: false });
    setWatches((data as Watch[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    if (section === "requests") fetchRequests();
    if (section === "watches") fetchWatches();
  }, [authenticated, section, requestTab, fetchRequests, fetchWatches]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const updateRequestStatus = async (id: string, status: "approved" | "denied") => {
    setActionLoading(id);
    await supabase
      .from("access_requests")
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setActionLoading(null);
  };

  const generateDescription = async () => {
    if (!form.brand || !form.model) return;
    setAiLoading(true);

    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: form.brand,
          model: form.model,
          reference_number: form.reference_number,
          year: form.year,
          condition: form.condition,
          dealer_notes: form.dealer_notes,
        }),
      });
      const data = await res.json();
      if (data.description) {
        setForm((prev) => ({ ...prev, description: data.description }));
      }
    } catch {
      // Silently fail — user can write manually
    }

    setAiLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    const watchData = {
      brand: form.brand,
      model: form.model,
      reference_number: form.reference_number || null,
      year: form.year ? parseInt(form.year) : null,
      price: parseFloat(form.price),
      condition: form.condition,
      status: form.status,
      location: form.location,
      shipping_days: parseInt(form.shipping_days) || 3,
      description: form.description,
      images: form.images,
    };

    const { error } = await supabase.from("watches").insert(watchData);

    if (!error) {
      setForm(emptyWatch);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }

    setUploading(false);
  };

  const updateWatchStatus = async (id: string, status: Watch["status"]) => {
    setActionLoading(id);
    await supabase.from("watches").update({ status }).eq("id", id);
    setWatches((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status } : w))
    );
    setActionLoading(null);
  };

  const deleteWatch = async (id: string) => {
    setActionLoading(id);
    await supabase.from("watches").delete().eq("id", id);
    setWatches((prev) => prev.filter((w) => w.id !== id));
    setActionLoading(null);
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Login screen
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
              onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
              placeholder="Admin password"
              className="w-full px-5 py-4 bg-vault-card border border-vault-border rounded-xl text-white placeholder:text-vault-muted/60 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all duration-300"
              autoFocus
            />
            {passwordError && <p className="text-red-400 text-sm text-center">Incorrect password</p>}
            <button type="submit" className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide uppercase bg-gradient-to-r from-accent-blue to-accent-pink text-white hover:from-accent-blue-light hover:to-accent-pink-light transition-all duration-300">
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  const sections: { key: Section; label: string }[] = [
    { key: "requests", label: "Access Requests" },
    { key: "watches", label: "Watches" },
    { key: "upload", label: "Upload Watch" },
  ];

  const requestTabs: { key: RequestTab; label: string }[] = [
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "denied", label: "Denied" },
  ];

  const inputClass = "w-full px-4 py-3 bg-vault-card border border-vault-border rounded-xl text-white placeholder:text-vault-muted/60 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all duration-300 text-sm";
  const labelClass = "text-vault-muted text-xs tracking-wider uppercase mb-1.5 block";

  return (
    <div className="min-h-screen bg-vault-darker">
      {/* Header */}
      <header className="border-b border-vault-border px-6 sm:px-10 py-5 flex items-center justify-between">
        <Logo />
        <span className="text-vault-muted text-xs tracking-wider uppercase">Admin Panel</span>
      </header>

      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-8 space-y-6">
        {/* Section tabs */}
        <div className="flex gap-1 bg-vault-card rounded-xl p-1 border border-vault-border">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                section === s.key ? "bg-vault-border text-white" : "text-vault-muted hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Access Requests */}
        {section === "requests" && (
          <div className="space-y-4">
            <div className="flex gap-1 bg-vault-card/50 rounded-lg p-1 border border-vault-border/50">
              {requestTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setRequestTab(tab.key)}
                  className={`flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
                    requestTab === tab.key ? "bg-vault-border text-white" : "text-vault-muted hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-16 text-vault-muted">Loading...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-16 text-vault-muted/60 text-sm">No {requestTab} requests</div>
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
                        <p className="text-white font-medium truncate">{request.email}</p>
                        <p className="text-vault-muted/60 text-xs mt-1">Requested {timeAgo(request.created_at)}</p>
                      </div>
                      {requestTab === "pending" && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => updateRequestStatus(request.id, "approved")} disabled={actionLoading === request.id} className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all disabled:opacity-50">Approve</button>
                          <button onClick={() => updateRequestStatus(request.id, "denied")} disabled={actionLoading === request.id} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50">Deny</button>
                        </div>
                      )}
                      {requestTab === "approved" && <span className="text-emerald-400/60 text-xs tracking-wider uppercase">Approved</span>}
                      {requestTab === "denied" && <span className="text-red-400/60 text-xs tracking-wider uppercase">Denied</span>}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        )}

        {/* Watch list */}
        {section === "watches" && (
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-16 text-vault-muted">Loading...</div>
            ) : watches.length === 0 ? (
              <div className="text-center py-16 text-vault-muted/60 text-sm space-y-3">
                <p>No watches yet</p>
                <button onClick={() => setSection("upload")} className="text-accent-blue hover:text-accent-blue-light transition-colors text-sm">
                  Upload your first watch
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {watches.map((watch) => (
                  <motion.div
                    key={watch.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="glass rounded-xl p-5 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium">{watch.brand} {watch.model}</p>
                      <p className="text-vault-muted/60 text-xs mt-1">
                        ${watch.price.toLocaleString()} &middot; {watch.condition} &middot; {watch.location}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0 items-center">
                      <select
                        value={watch.status}
                        onChange={(e) => updateWatchStatus(watch.id, e.target.value as Watch["status"])}
                        disabled={actionLoading === watch.id}
                        className="bg-vault-card border border-vault-border rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-blue/50"
                      >
                        <option value="available">Available</option>
                        <option value="on_hold">On Hold</option>
                        <option value="sold">Sold</option>
                      </select>
                      <button
                        onClick={() => deleteWatch(watch.id)}
                        disabled={actionLoading === watch.id}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Upload watch */}
        {section === "upload" && (
          <motion.form
            onSubmit={handleUpload}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm text-center"
              >
                Watch uploaded successfully!
              </motion.div>
            )}

            {/* Brand + Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Brand *</label>
                <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Rolex" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Model *</label>
                <input type="text" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g. Submariner Date" required className={inputClass} />
              </div>
            </div>

            {/* Ref + Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Reference Number</label>
                <input type="text" value={form.reference_number} onChange={(e) => setForm({ ...form, reference_number: e.target.value })} placeholder="e.g. 126610LN" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Year</label>
                <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} placeholder="e.g. 2023" className={inputClass} />
              </div>
            </div>

            {/* Price + Condition */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Price (USD) *</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="e.g. 12500" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Condition *</label>
                <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as Watch["condition"] })} className={inputClass}>
                  <option value="New/Unworn">New/Unworn</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Very Good">Very Good</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>
            </div>

            {/* Location + Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Location *</label>
                <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Miami, FL" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Shipping Days *</label>
                <input type="number" value={form.shipping_days} onChange={(e) => setForm({ ...form, shipping_days: e.target.value })} placeholder="e.g. 3" required className={inputClass} />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className={labelClass}>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Watch["status"] })} className={inputClass}>
                <option value="available">Available</option>
                <option value="on_hold">On Hold</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            {/* Dealer notes for AI */}
            <div>
              <label className={labelClass}>Your Notes (for AI description)</label>
              <textarea
                value={form.dealer_notes}
                onChange={(e) => setForm({ ...form, dealer_notes: e.target.value })}
                placeholder="Add any details about the watch — box & papers, scratches, service history, anything you'd tell a buyer..."
                rows={3}
                className={inputClass + " resize-none"}
              />
              <button
                type="button"
                onClick={generateDescription}
                disabled={aiLoading || !form.brand || !form.model}
                className="mt-2 px-4 py-2 rounded-lg text-xs font-medium uppercase tracking-wider
                           bg-gradient-to-r from-accent-blue/20 to-accent-pink/20
                           text-accent-blue-light border border-accent-blue/20
                           hover:from-accent-blue/30 hover:to-accent-pink/30
                           disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-300"
              >
                {aiLoading ? "Generating..." : "Generate AI Description"}
              </button>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Watch description (generate with AI above or write manually)"
                rows={4}
                required
                className={inputClass + " resize-none"}
              />
            </div>

            {/* Images */}
            <div>
              <label className={labelClass}>Images</label>
              <ImageUpload
                images={form.images}
                onChange={(images) => setForm({ ...form, images })}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide uppercase
                         bg-gradient-to-r from-accent-blue to-accent-pink text-white
                         hover:from-accent-blue-light hover:to-accent-pink-light
                         disabled:opacity-60 disabled:cursor-not-allowed
                         transition-all duration-300"
            >
              {uploading ? "Uploading..." : "Upload Watch"}
            </button>
          </motion.form>
        )}
      </div>
    </div>
  );
}
