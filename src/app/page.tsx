"use client";

import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";
import AccessForm from "@/components/ui/AccessForm";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" as const },
  }),
};

const stats = [
  { value: "500+", label: "Active Dealers" },
  { value: "$2M+", label: "Monthly Volume" },
  { value: "48h", label: "Avg. Delivery" },
];

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-vault-darker" />
      <div className="fixed inset-0 bg-glow-mixed opacity-60" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-glow-blue opacity-30 blur-3xl" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-glow-pink opacity-20 blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 sm:px-10 py-6">
          <Logo />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-vault-muted text-xs tracking-wider uppercase"
          >
            Invite Only
          </motion.div>
        </header>

        {/* Hero */}
        <main className="flex-1 flex items-center justify-center px-6 sm:px-10">
          <div className="max-w-2xl w-full text-center space-y-10">
            {/* Badge */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs tracking-wider uppercase text-vault-muted"
            >
              <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
              Private Dealer Network
            </motion.div>

            {/* Headline */}
            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight"
            >
              Where Dealers Trade{" "}
              <span className="gradient-text">Premium Timepieces</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-vault-muted text-lg sm:text-xl max-w-lg mx-auto leading-relaxed"
            >
              An exclusive, invite-only marketplace built for serious watch dealers.
              Verified members. Authenticated pieces. Direct trades.
            </motion.p>

            {/* Form */}
            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <AccessForm />
            </motion.div>

            {/* Stats */}
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center justify-center gap-8 sm:gap-12 pt-6"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="text-vault-muted text-xs tracking-wider uppercase mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 sm:px-10 py-6 flex items-center justify-between text-vault-muted/40 text-xs">
          <span>&copy; 2025 CrownVault. All rights reserved.</span>
          <div className="flex gap-6">
            <span className="hover:text-vault-muted transition-colors cursor-pointer">
              Terms
            </span>
            <span className="hover:text-vault-muted transition-colors cursor-pointer">
              Privacy
            </span>
          </div>
        </footer>
      </div>

      {/* Floating watch silhouettes — decorative */}
      <motion.div
        className="fixed top-1/4 left-[8%] w-32 h-32 border border-vault-border/20 rounded-full opacity-20"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="fixed bottom-1/4 right-[10%] w-48 h-48 border border-vault-border/15 rounded-full opacity-15"
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="fixed top-[60%] left-[15%] w-20 h-20 border border-accent-blue/10 rounded-full"
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" as const }}
      />
    </div>
  );
}
