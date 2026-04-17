"use client";

import { useState } from "react";
import { CommandBar } from "@/components/command-bar";
import { VoiceInput } from "@/components/voice-input";
import {
  ClarityScorePanel,
  InboxPulsePanel,
  SchedulePanel,
  WorldFeedPanel,
  ActiveAgentPanel,
  QuickActionsBar,
} from "@/components/dashboard";

export default function HomePage() {
  const [isListening, setIsListening] = useState(false);

  return (
    <div className="min-h-screen bg-clarity-dark-bg text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-clarity-electric-blue to-clarity-emerald rounded-lg flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-white"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Clarity</h1>
          </div>
          <div className="flex items-center gap-4">
            <VoiceInput onListenChange={setIsListening} />
            <button className="px-4 py-2 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
              Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard - 3 Column Layout */}
      <main className="flex-1 container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-full">
          {/* Left Sidebar - Navigation & Quick Stats */}
          <aside className="col-span-3 space-y-6">
            <QuickActionsBar />
            {/* TODO: Add navigation/sidebar components */}
          </aside>

          {/* Center - Main Content Dashboard Panels */}
          <section className="col-span-6 space-y-6">
            {/* Clarity Score - Hero Metric */}
            <ClarityScorePanel />

            <div className="grid grid-cols-2 gap-6">
              <InboxPulsePanel />
              <SchedulePanel />
            </div>

            <WorldFeedPanel />
          </section>

          {/* Right - Active Agent Log */}
          <aside className="col-span-3">
            <ActiveAgentPanel />
          </aside>
        </div>
      </main>

      {/* Command Bar - Persistent at bottom */}
      <CommandBar isListening={isListening} />
    </div>
  );
}
