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
import { fakeAssistantReply } from "@/lib/mock-assistant";

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
                messages: [...conversation.messages, userMessage],
                updatedAt: Date.now(),
              }
            : conversation
        )
      );
      setPendingIds((current) => new Set(current).add(targetId));

      try {
        const reply = await fakeAssistantReply(content);
        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === targetId
              ? {
                  ...conversation,
                  messages: [
                    ...conversation.messages,
                    {
                      id: messageId(),
                      role: "assistant" as const,
                      content: reply,
                      createdAt: Date.now(),
                    },
                  ],
                  updatedAt: Date.now(),
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
    [active]
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
