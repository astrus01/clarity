"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  RefreshCw,
  ChevronDown,
  MessageSquare,
  Clock,
} from "lucide-react";

interface EmailDraftCardProps {
  to?: string;
  cc?: string[];
  subject?: string;
  body?: string;
  originalThread?: string;
  tone?: "professional" | "friendly" | "concise";
  onSend?: () => void;
  onRegenerate?: () => void;
  onToneChange?: (tone: string) => void;
}

export function EmailDraftCard({
  to = "sarah.chen@example.com",
  cc = [],
  subject = "Re: Q2 Roadmap Project Update",
  body = "Hi Sarah,\n\nThanks for sharing the roadmap. I've reviewed it and have a few suggestions regarding the timeline.\n\nCould we discuss this tomorrow at 2pm? I'll send a calendar invite.\n\nBest,\nTristan",
  originalThread,
  tone = "professional",
  onSend,
  onRegenerate,
  onToneChange,
}: EmailDraftCardProps) {
  const [draftBody, setDraftBody] = useState(body);
  const [selectedTone, setSelectedTone] = useState(tone);

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly" },
    { value: "concise", label: "Concise" },
  ];

  return (
    <Card className="bg-card/50 backdrop-blur border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Email Draft</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onRegenerate}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Regenerate</span>
            </Button>
            <Button size="sm" className="gap-2" onClick={onSend}>
              <Send className="h-4 w-4" />
              <span>Send</span>
            </Button>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium w-12">To:</span>
            <span className="text-sm">{to}</span>
          </div>
          {cc.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium w-12">CC:</span>
              <span className="text-sm">{cc.join(", ")}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium w-12">Subject:</span>
            <span className="text-sm">{subject}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Tone Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Tone:</span>
            <div className="flex items-center gap-1">
              {tones.map((t) => (
                <Button
                  key={t.value}
                  variant={
                    selectedTone === t.value ? "default" : "outline"
                  }
                  size="sm"
                  className="h-8 px-3 text-xs"
                  onClick={() => {
                    setSelectedTone(t.value as any);
                    onToneChange?.(t.value);
                  }}
                >
                  {t.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Email Body */}
          <div className="relative">
            <Textarea
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              className="min-h-[200px] max-h-[400px] resize-y bg-muted/20 border-border/50 font-mono text-sm leading-relaxed"
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
              {draftBody.length} characters
            </div>
          </div>

          {originalThread && (
            <div className="pt-4 border-t border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Original Thread</span>
              </div>
              <div className="p-3 rounded-lg bg-muted/20 text-sm text-muted-foreground italic line-clamp-3">
                {originalThread}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                AI-generated
              </Badge>
              <span className="text-xs text-muted-foreground">
                Review before sending
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                Discard
              </Button>
              <Button size="sm" className="gap-2" onClick={onSend}>
                <Send className="h-4 w-4" />
                Send Email
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
