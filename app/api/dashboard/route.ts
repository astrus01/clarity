import { NextResponse } from "next/server";

// Mock data for dashboard panels (in real app, this calls tools/agent)
const MOCK_DASHBOARD = {
  clarityScore: {
    score: 73,
    factors: {
      emailUrgency: "3 high",
      calendarLoad: "65%",
      newsRelevance: "Strong",
    },
  },
  inbox: {
    unreadCount: 12,
    urgentCount: 3,
    topEmails: [
      {
        id: "1",
        sender: "Sarah Chen",
        subject: "Project Update - Q2 Roadmap",
        urgency: "high",
        timestamp: "10m ago",
      },
      {
        id: "2",
        sender: "Michael Torres",
        subject: "Re: Budget Approval",
        urgency: "medium",
        timestamp: "32m ago",
      },
    ],
  },
  calendar: {
    todayCount: 4,
    upcomingEvents: [
      { id: "1", title: "Team Standup", time: "09:00 - 09:30" },
      { id: "2", title: "Deep Work Block", time: "10:00 - 12:00" },
      { id: "3", title: "Client Presentation", time: "14:00 - 15:30" },
    ],
  },
  news: {
    topStories: [
      {
        id: "1",
        headline:
          "Federal Reserve Signals Shift in Monetary Policy",
        source: "Bloomberg",
        topic: "Finance",
        sentiment: "positive",
      },
    ],
  },
};

export async function GET() {
  // In production, this would aggregate real data from tools/Gmail/Calendar/Exa
  return NextResponse.json(MOCK_DASHBOARD);
}
