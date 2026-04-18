"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowUp, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export function InputBar({
  onSubmit,
  placeholder = "Ask Clarity anything…",
  listening = false,
  onToggleMic,
}: {
  onSubmit?: (text: string) => void;
  placeholder?: string;
  listening?: boolean;
  onToggleMic?: () => void;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-size textarea
  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 192) + "px";
  }, [value]);

  const send = () => {
    const v = value.trim();
    if (!v) return;
    onSubmit?.(v);
    setValue("");
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
        onClick={onToggleMic}
        aria-label={listening ? "Stop listening" : "Start voice input"}
        className={cn(
          "shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-all",
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
        placeholder={placeholder}
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
  // Subtle, quiet animated bars — no neon, no glow
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
