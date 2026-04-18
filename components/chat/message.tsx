"use client";

import { cn } from "@/lib/utils";
import { AgentActivity, type ActivityLine } from "./agent-activity";

export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end w-full">
      <div
        className="rounded-full bg-primary text-background px-4 py-2.5 text-[0.95rem] leading-relaxed"
        style={{ maxWidth: "80%", minWidth: "160px" }}
      >
        {content}
      </div>
    </div>
  );
}

export function AssistantMessage({
  text,
  activity,
  panel,
}: {
  text?: string;
  activity?: ActivityLine[];
  panel?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 max-w-[85%]">
      {text && (
        <p className="text-foreground-muted leading-relaxed text-[0.95rem]">
          {text}
        </p>
      )}
      {activity && activity.length > 0 && (
        <AgentActivity lines={activity} collapsed={!!panel} />
      )}
      {panel && (
        <div
          className={cn(
            "w-full opacity-0 translate-y-2",
            "animate-[panel-in_320ms_cubic-bezier(0.25,0.1,0.25,1)_100ms_forwards]",
          )}
        >
          {panel}
        </div>
      )}
    </div>
  );
}
