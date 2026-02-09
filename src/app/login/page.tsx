"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/ui/Logo";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Pick up errors from callback redirect or hash fragment
  useEffect(() => {
    // Check query params (from server-side callback redirect)
    const queryError = searchParams.get("error");
    if (queryError) {
      setErrorMsg(
        queryError === "access_denied"
          ? "Sign-in link expired. Please request a new one."
          : queryError
      );
      setStatus("error");
      return;
    }

    // Check hash fragment (Supabase sometimes returns errors as hash)
    const hash = window.location.hash;
    if (hash.includes("error=")) {
      const params = new URLSearchParams(hash.replace("#", ""));
      const hashError = params.get("error_description") || params.get("error");
      if (hashError) {
        setErrorMsg(
          hashError.includes("expired")
            ? "Sign-in link expired. Please request a new one."
            : hashError
        );
        setStatus("error");
        window.history.replaceState(null, "", "/login");
      }
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    setErrorMsg("");

    // Check if email is approved
    const { data: request } = await supabase
      .from("access_requests")
      .select("status")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (!request || request.status !== "approved") {
      setErrorMsg(
        request?.status === "pending"
          ? "Your access request is still under review."
          : "No approved access found for this email. Request access from the homepage."
      );
      setStatus("error");
      return;
    }

    // Send magic link
    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg("Failed to send login link. Please try again.");
      setStatus("error");
      return;
    }

    setStatus("sent");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-sm space-y-8"
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Member Sign In</h1>
        <p className="text-vault-muted text-sm">
          Enter your approved email to receive a sign-in link.
        </p>
      </div>

      {status === "sent" ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-accent-blue/10 border border-accent-blue/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Check your email</h3>
          <p className="text-vault-muted text-sm">
            We sent a sign-in link to <span className="text-white">{email}</span>.
            Click the link to access the marketplace.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-5 py-4 bg-vault-card border border-vault-border rounded-xl
                         text-white placeholder:text-vault-muted/60
                         focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20
                         transition-all duration-300"
              autoFocus
            />
          </div>

          {status === "error" && (
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-4 rounded-xl font-semibold text-sm tracking-wide uppercase
                       bg-gradient-to-r from-accent-blue to-accent-pink text-white
                       hover:from-accent-blue-light hover:to-accent-pink-light
                       disabled:opacity-60 disabled:cursor-not-allowed
                       transition-all duration-300"
          >
            {status === "loading" ? "Checking..." : "Send Sign In Link"}
          </button>

          <p className="text-center text-vault-muted/60 text-xs">
            Don&apos;t have access?{" "}
            <Link href="/" className="text-accent-blue hover:text-accent-blue-light transition-colors">
              Request it here
            </Link>
          </p>
        </form>
      )}
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-vault-darker flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-6">
        <Link href="/">
          <Logo />
        </Link>
      </header>

      {/* Login form */}
      <main className="flex-1 flex items-center justify-center px-6">
        <Suspense
          fallback={
            <div className="text-vault-muted text-sm">Loading...</div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
