"use client";

import { useCallback, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatPanel } from "@/components/chat-panel";
import {
  createConversation,
  messageId,
  titleFromText,
  type Conversation,
  DEFAULT_TITLE,
} from "@/lib/chat";

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    createConversation(),
  ]);
  const [activeId, setActiveId] = useState(() => conversations[0].id);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  const active =
    conversations.find((conversation) => conversation.id === activeId) ??
    conversations[0];

  const handleNewChat = useCallback(() => {
    const conversation = createConversation();
    setConversations((current) => [...current, conversation]);
    setActiveId(conversation.id);
  }, []);

  const handleRename = useCallback((id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === id
          ? { ...conversation, title: trimmed }
          : conversation
      )
    );
  }, []);

  const handleDelete = useCallback((id: string) => {
    setConversations((current) => {
      const remaining = current.filter((conversation) => conversation.id !== id);
      if (remaining.length === 0) {
        const fresh = createConversation();
        setActiveId(fresh.id);
        return [fresh];
      }
      setActiveId((currentActive) => {
        if (currentActive !== id) return currentActive;
        return [...remaining].sort((a, b) => b.updatedAt - a.updatedAt)[0].id;
      });
      return remaining;
    });
  }, []);

  const appendToMessage = useCallback(
    (conversationId: string, targetMessageId: string, delta: string) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                updatedAt: Date.now(),
                messages: conversation.messages.map((message) =>
                  message.id === targetMessageId
                    ? { ...message, content: message.content + delta }
                    : message
                ),
              }
            : conversation
        )
      );
    },
    []
  );

  const handleSend = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content) return;
      const targetId = active.id;

      const userMessage = {
        id: messageId(),
        role: "user" as const,
        content,
        createdAt: Date.now(),
      };
      const assistantMessage = {
        id: messageId(),
        role: "assistant" as const,
        content: "",
        createdAt: Date.now(),
      };

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === targetId
            ? {
                ...conversation,
                title:
                  conversation.messages.length === 0 &&
                  conversation.title === DEFAULT_TITLE
                    ? titleFromText(content)
                    : conversation.title,
                messages: [
                  ...conversation.messages,
                  userMessage,
                  assistantMessage,
                ],
                updatedAt: Date.now(),
              }
            : conversation
        )
      );
      setPendingIds((current) => new Set(current).add(targetId));

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        });
        if (!response.ok || !response.body) {
          throw new Error(`接口返回 ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          appendToMessage(
            targetId,
            assistantMessage.id,
            decoder.decode(value, { stream: true })
          );
        }
      } catch {
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === targetId
              ? {
                  ...conversation,
                  messages: conversation.messages.map((message) =>
                    message.id === assistantMessage.id
                      ? { ...message, content: "（请求失败，请稍后重试）" }
                      : message
                  ),
                }
              : conversation
          )
        );
      } finally {
        setPendingIds((current) => {
          const next = new Set(current);
          next.delete(targetId);
          return next;
        });
      }
    },
    [active, appendToMessage]
  );

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-sm">
      <Sidebar
        conversations={sorted}
        activeId={active.id}
        onSelect={setActiveId}
        onNewChat={handleNewChat}
        onRename={handleRename}
        onDelete={handleDelete}
      />
      <ChatPanel
        conversation={active}
        pending={pendingIds.has(active.id)}
        onSend={handleSend}
      />
    </div>
  );
}
