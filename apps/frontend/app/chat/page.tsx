"use client";

import { ChatInterface } from "@/components/ChatInterface";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header with navigation */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="font-semibold text-lg">MemeSentinel AI Chat</h1>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with Analytics */}
        <DashboardSidebar />
        
        {/* Main Chat Interface */}
        <div className="flex-1">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}