"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommandBarProps {
  isListening: boolean;
  onVoiceToggle?: () => void;
}

export function CommandBar({ isListening, onVoiceToggle }: CommandBarProps) {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      // TODO: Send to agent API
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input.trim() }),
      });

      // TODO: Handle response and update UI/dashboard
      console.log("Agent response:", response);

      setInput("");
      textareaRef.current?.blur();
    } catch (error) {
      console.error("Failed to submit command:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border/40 bg-background/80 backdrop-blur-lg p-4 z-50">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          <Button
            type="button"
            variant={isListening ? "destructive" : "outline"}
            size="icon"
            className="shrink-0"
            onClick={onVoiceToggle}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>

          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything: 'Draft a reply to Sarah', 'What's in the news?', 'Do I have time for a meeting?'"
              className="min-h-[56px] max-h-[200px] resize-none pr-12 bg-card border-border"
              disabled={isProcessing}
            />
            {isProcessing && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isProcessing}
            className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>

      {isListening && (
        <div className="mt-3 h-12 flex items-center justify-center gap-1">
          <div className="flex items-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
