"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LoaderDemo } from "@/components/Loader";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const SUGGESTED_PROMPTS = [
  "What are the trending memecoins right now?",
  "Show me high-risk high-reward opportunities",
  "What tokens should I avoid right now?",
  "Analyze the current market sentiment",
  "Give me a portfolio recommendation",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm MemeSentinel AI, powered by Groq. I can help you analyze memecoin trends, assess risks, and provide market insights based on real-time data. What would you like to know?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_DASHBOARD_API_URL || "http://localhost:4007";
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Sorry, I couldn't process your request.",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again later.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm MemeSentinel AI, powered by Groq. I can help you analyze memecoin trends, assess risks, and provide market insights based on real-time data. What would you like to know?",
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">MemeSentinel AI</h1>
              <p className="text-sm text-muted-foreground">
                Powered by Groq • Real-time memecoin analysis
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === "user"
                  ? "bg-accent text-accent-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {message.role === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            <Card
              className={`max-w-2xl p-4 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              }`}
            >
              {message.role === "assistant" && (
                <p className="text-sm text-muted-foreground mb-2">
                  MemeSentinel AI
                </p>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              <p className="text-xs text-muted-foreground mt-2 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </Card>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <LoaderDemo number={3} />
                <span className="text-sm text-muted-foreground">
                  MemeSentinel is thinking...
                </span>
              </div>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-6">
        <div className="space-y-4">
          {/* Suggested Prompts */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt, index) => (
                <Button
                  key={index}
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={() => sendMessage(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-3">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about tokens, market trends, or get investment insights..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
