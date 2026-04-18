"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowUp, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoice } from "@/lib/hooks/use-voice";

export function InputBar({
  onSubmit,
  placeholder = "Ask Clarity anything…",
  autoFocus,
}: {
  onSubmit?: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleTranscript = useCallback((transcript: string) => {
    const cleaned = transcript.trim();
    if (!cleaned) return;
    setValue((prev) => (prev ? prev + " " + cleaned : cleaned));
    requestAnimationFrame(() => ref.current?.focus());
  }, []);

  const { listening, supported, start, stop } = useVoice({
    onResult: handleTranscript,
  });

  // Auto-size textarea
  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 192) + "px";
  }, [value]);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  // ⌘K / Ctrl+K → toggle voice
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!supported) return;
        if (listening) stop();
        else start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listening, supported, start, stop]);

  const send = () => {
    const v = value.trim();
    if (!v) return;
    onSubmit?.(v);
    setValue("");
    if (listening) stop();
  };

  const toggleMic = () => {
    if (!supported) return;
    if (listening) stop();
    else start();
  };

  return (
    <div
      className={cn(
        "relative flex items-end gap-2 w-full rounded-[1.5rem] border bg-surface/80 backdrop-blur-sm px-3 py-2.5 transition-colors duration-200",
        listening ? "border-primary/70" : "border-border",
      )}
    >
      <button
        type="button"
        onClick={toggleMic}
        disabled={!supported}
        aria-label={
          !supported
            ? "Voice unsupported in this browser"
            : listening
              ? "Stop listening"
              : "Start voice input (⌘K)"
        }
        title={
          !supported
            ? "Voice unsupported in this browser"
            : listening
              ? "Stop listening"
              : "Voice input · ⌘K"
        }
        className={cn(
          "shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all",
          !supported && "opacity-40 cursor-not-allowed",
          listening
            ? "bg-primary/10 text-primary"
            : "text-foreground-muted hover:text-primary hover:bg-surface-highlight",
        )}
      >
        {listening ? <VoiceWaveform /> : <Mic className="h-4 w-4" />}
      </button>

      <textarea
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        placeholder={listening ? "Listening…" : placeholder}
        className="flex-1 resize-none bg-transparent py-2 text-[0.95rem] leading-relaxed text-foreground placeholder:italic placeholder:text-foreground-muted focus:outline-none"
        style={{ maxHeight: "12rem" }}
      />

      <button
        type="button"
        onClick={send}
        disabled={!value.trim()}
        aria-label="Send"
        className={cn(
          "shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all duration-200",
          value.trim()
            ? "bg-primary text-background hover:opacity-90 active:scale-[0.96]"
            : "bg-surface-highlight text-foreground-muted cursor-not-allowed",
        )}
      >
        <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function VoiceWaveform() {
  return (
    <div className="flex items-center gap-[3px] h-4" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="block w-[3px] rounded-full bg-primary"
          style={{
            height: "100%",
            animation: `wave 1.1s cubic-bezier(0.25,0.1,0.25,1) ${i * 0.12}s infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}
