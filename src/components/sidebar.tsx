"use client";

import { useRef, useState } from "react";
import { MessageSquare, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/chat";

type SidebarProps = {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onRename,
  onDelete,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  const startRename = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setDraftTitle(conversation.title);
    requestAnimationFrame(() => editInputRef.current?.select());
  };

  const commitRename = (id: string) => {
    onRename(id, draftTitle);
    setEditingId(null);
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="p-3">
        <Button className="w-full justify-start" variant="outline" onClick={onNewChat}>
          <Plus data-icon="inline-start" />
          新对话
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <nav className="flex flex-col gap-0.5 px-2 pb-2" aria-label="会话列表">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeId;
            return (
              <div
                key={conversation.id}
                className={cn(
                  "group flex items-center rounded-lg",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/60"
                )}
              >
                {editingId === conversation.id ? (
                  <input
                    ref={editInputRef}
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    onBlur={() => commitRename(conversation.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") commitRename(conversation.id);
                      if (event.key === "Escape") setEditingId(null);
                    }}
                    className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                    aria-label="重命名会话"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    className="flex h-10 min-w-0 flex-1 items-center gap-2 px-3 text-left text-sm"
                  >
                    <MessageSquare className="size-4 shrink-0 opacity-60" aria-hidden />
                    <span className="truncate">{conversation.title}</span>
                  </button>
                )}

                {editingId !== conversation.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={<Button variant="ghost" size="icon-xs" />}
                      aria-label={`${conversation.title} 更多操作`}
                      className="me-1 opacity-0 group-hover:opacity-100 data-[popup-open]:opacity-100"
                    >
                      <MoreHorizontal />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem onClick={() => startRename(conversation)}>
                        <Pencil />
                        重命名
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(conversation.id)}>
                        <Trash2 />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-3 text-xs text-muted-foreground">
        OpenChat · 本地演示版
      </div>
    </aside>
  );
}
