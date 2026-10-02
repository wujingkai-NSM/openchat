"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUGGESTIONS, type Conversation } from "@/lib/chat";

type ChatPanelProps = {
  conversation: Conversation;
  pending: boolean;
  onSend: (text: string) => void | Promise<void>;
};

export function ChatPanel({ conversation, pending, onSend }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lastMessageLength =
    conversation.messages[conversation.messages.length - 1]?.content.length ?? 0;

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [lastMessageLength, pending, conversation.id]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [input]);

  const submit = () => {
    const text = input.trim();
    if (!text || pending) return;
    setInput("");
    void onSend(text);
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col bg-background">
      <header className="flex h-12 shrink-0 items-center border-b px-4">
        <h1 className="truncate text-sm font-medium">{conversation.title}</h1>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {conversation.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">你好，有什么可以帮你？</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                当前为本地模拟回复，尚未接入真实模型。
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  className="rounded-full"
                  onClick={() => {
                    setInput(suggestion);
                    textareaRef.current?.focus();
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
            {conversation.messages
              .filter((message) => !(message.role === "assistant" && !message.content))
              .map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                  aria-hidden
                >
                  {message.role === "user" ? (
                    <User className="size-4" />
                  ) : (
                    <Bot className="size-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[15px] leading-7",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {pending && (
              <div className="flex gap-3">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  aria-hidden
                >
                  <Bot className="size-4" />
                </div>
                <div
                  className="flex items-center gap-1.5 rounded-2xl bg-muted px-4 py-3"
                  role="status"
                >
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                  <span className="sr-only">助手正在生成回复</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 px-4 pb-4">
        <div className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border bg-background p-2 shadow-sm focus-within:ring-3 focus-within:ring-ring/30">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            rows={1}
            placeholder="给 OpenChat 发送消息…（Enter 发送，Shift+Enter 换行）"
            aria-label="消息输入框"
            className="max-h-[200px] min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] leading-6 outline-none placeholder:text-muted-foreground"
          />
          <Button
            size="icon"
            onClick={submit}
            disabled={!input.trim() || pending}
            aria-label="发送"
            className="shrink-0 rounded-full"
          >
            <ArrowUp aria-hidden />
          </Button>
        </div>
      </div>
    </main>
  );
}
