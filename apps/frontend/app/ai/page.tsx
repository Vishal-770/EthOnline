"use client";
import { useState, useRef, useEffect } from "react";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message";
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/components/ui/prompt-input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Square, Sparkles, RotateCcw } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hello! I'm Claude, your AI assistant. I can help you with writing, analysis, coding, math, research, and much more. What would you like to work on today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Simulate realistic AI response with typing effect
  const simulateTyping = async (text: string) => {
    const aiMessage = {
      role: "ai",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setIsTyping(true);

    const words = text.split(" ");
    let currentText = "";

    for (let i = 0; i < words.length; i++) {
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }

      currentText += (i > 0 ? " " : "") + words[i];

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          ...aiMessage,
          content: currentText,
        };
        return newMessages;
      });

      // Variable delay for more natural typing
      const delay = Math.random() * 30 + 20;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    setIsTyping(false);
    setIsLoading(false);
  };

  // Generate contextual AI responses
  const generateResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
      return "Hello! It's great to hear from you. How can I assist you today? I'm here to help with any questions, tasks, or discussions you'd like to explore.";
    }

    if (lowerInput.includes("code") || lowerInput.includes("program")) {
      return "I'd be happy to help you with coding! I can assist with a wide range of programming languages including Python, JavaScript, TypeScript, React, and more. I can help debug code, explain concepts, write new functions, or review your existing code. What specifically would you like help with?";
    }

    if (lowerInput.includes("write") || lowerInput.includes("essay")) {
      return "I can definitely help you with writing! Whether you need help with essays, articles, creative writing, technical documentation, or any other written content, I'm here to assist. Would you like me to help you brainstorm ideas, create an outline, or draft the content? Let me know what you're working on.";
    }

    if (lowerInput.includes("explain") || lowerInput.includes("what is")) {
      return "I'd be glad to explain that for you! I can break down complex topics into clear, understandable explanations. I can provide examples, analogies, and step-by-step breakdowns to help make things clearer. What specific topic or concept would you like me to explain?";
    }

    if (lowerInput.includes("help") || lowerInput.includes("assist")) {
      return "Of course! I'm here to help. I can assist with a wide variety of tasks including: writing and editing, coding and debugging, research and analysis, math and problem-solving, brainstorming ideas, answering questions, and much more. What do you need help with today?";
    }

    // Default contextual response
    return "That's an interesting question! I'd be happy to help you explore that topic. Could you provide a bit more context or let me know what specific aspect you'd like me to focus on? The more details you share, the better I can tailor my response to your needs.";
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    abortControllerRef.current = new AbortController();

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const response = generateResponse(userMessage.content);
    await simulateTyping(response);

    abortControllerRef.current = null;
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "ai",
        content:
          "Hello! I'm Claude, your AI assistant. I can help you with writing, analysis, coding, math, research, and much more. What would you like to work on today?",
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setIsLoading(false);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="relative flex flex-col min-h-[91vh] bg-gradient-to-b from-background to-muted/20">
      {/* Header */}

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <Message
              key={idx}
              className={msg.role === "user" ? "justify-end" : "justify-start"}
            >
              {msg.role === "ai" && (
                <MessageAvatar
                  className="bg-gradient-to-br from-orange-400 to-orange-600"
                  fallback={<Sparkles className="w-4 h-4 text-white" />}
                />
              )}
              <div className="flex flex-col gap-1 max-w-[85%] md:max-w-[70%]">
                <MessageContent
                  markdown
                  className={`${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl"
                      : "bg-muted text-foreground rounded-2xl"
                  } px-4 py-3`}
                >
                  {msg.content}
                </MessageContent>
                <span className="text-xs text-muted-foreground px-2">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              {msg.role === "user" && (
                <MessageAvatar className="bg-primary" fallback="U" />
              )}
            </Message>
          ))}
          {isLoading && !isTyping && (
            <Message className="justify-start">
              <MessageAvatar
                className="bg-gradient-to-br from-orange-400 to-orange-600"
                fallback={<Sparkles className="w-4 h-4 text-white" />}
              />
              <MessageContent className="bg-muted rounded-2xl px-4 py-3">
                Claude is typing...
              </MessageContent>
            </Message>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed input area */}
      <div className="sticky bottom-0  bg-transparent   p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <PromptInput
            value={input}
            onValueChange={setInput}
            isLoading={isLoading}
            onSubmit={handleSend}
            className="w-full shadow-lg"
          >
            <PromptInputTextarea
              ref={textareaRef}
              placeholder="Message Claude..."
              className="resize-none min-h-[56px] max-h-[200px]"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <PromptInputActions className="justify-end pt-2">
              <PromptInputAction
                tooltip={isLoading ? "Stop generating" : "Send message"}
              >
                <Button
                  variant="default"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 shadow-md"
                  onClick={isLoading ? handleStop : handleSend}
                  disabled={!input.trim() && !isLoading}
                >
                  {isLoading ? (
                    <Square className="w-4 h-4 fill-current" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </Button>
              </PromptInputAction>
            </PromptInputActions>
          </PromptInput>
          <p className="text-xs text-center text-muted-foreground mt-3">
            Claude can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
