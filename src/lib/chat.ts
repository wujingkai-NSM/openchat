export type MessageRole = "user" | "assistant";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

export const DEFAULT_TITLE = "新对话";

export const SUGGESTIONS = [
  "介绍一下这个项目",
  "帮我写一封请假邮件",
  "解释一下 React 的 useEffect",
];

export function createConversation(): Conversation {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return {
    id,
    title: DEFAULT_TITLE,
    messages: [],
    updatedAt: Date.now(),
  };
}

export function titleFromText(text: string): string {
  const collapsed = text.trim().replace(/\s+/g, " ");
  if (!collapsed) return DEFAULT_TITLE;
  return collapsed.length > 20 ? `${collapsed.slice(0, 20)}…` : collapsed;
}

export function messageId(): string {
  return Math.random().toString(36).slice(2);
}
