# OpenChat

一个**即开即用**的 AI 聊天前端。左侧 DeepSeek 风格会话列表 + 右侧 ChatGPT 风格聊天区，内置流式 mock 接口——开箱跑通完整收发体验，替换一个文件即可对接真实模型，直接集成进你的前端项目。

## 特性

- 💬 双栏聊天界面：会话新建 / 切换 / 重命名 / 删除，消息流自动滚动
- 📢 流式回复：Route Handler 基于 `ReadableStream` 分块推送，前端 `getReader()` 逐字渲染，与真实 LLM 体验一致
- 🧩 基于 [shadcn/ui](https://ui.shadcn.com)（base-nova 风格 + @base-ui/react），零额外运行时依赖
- 🎨 Tailwind v4 主题令牌，深浅色只需切换 `.dark` class
- ♿ 语义化结构与 ARIA，键盘可完整操作

## 快速开始

```bash
pnpm install
pnpm dev
```

打开 http://localhost:3000 即可使用。默认回复来自本地 mock 接口 `src/app/api/chat/route.ts`，无需任何 API Key。

## 集成到你的项目

聊天界面是一个自包含的客户端组件，状态与数据流互不外部依赖：

```
src/
├── app/
│   ├── page.tsx               # 仅挂载 <ChatApp />
│   └── api/chat/route.ts      # 流式 mock 接口（替换此文件即对接真实模型）
├── components/
│   ├── chat-app.tsx           # 状态根：会话集合、收发、流式读取
│   ├── sidebar.tsx            # 会话列表（纯展示 + 回调）
│   ├── chat-panel.tsx         # 消息流 + 输入区（纯展示 + 回调）
│   └── ui/                    # shadcn 组件（button / dropdown-menu / scroll-area）
└── lib/chat.ts                # 类型与工具函数
```

三种集成方式，按你的技术栈选择：

1. **Next.js 项目（推荐）**：把 `components/`、`lib/chat.ts` 和 `app/api/chat/route.ts` 拷入即可；`<ChatApp />` 放进任意页面。主题令牌来自 `src/app/globals.css`，一并复制或用你项目已有的 shadcn 主题。
2. **任意前端项目（React / Vue / 原生）**：本项目直接部署，用 `<iframe>` 嵌入；聊天区占满容器，适配无障碍。
3. **非流式后端**：接口约定为 `POST /api/chat`，请求体 `{ message: string }`，响应体为纯文本流（`text/plain; charset=utf-8`）。只要后端满足这个形状，前端无需改动。

## 对接真实模型

mock 与 UI 完全解耦，只需改 `src/app/api/chat/route.ts` 内的生成逻辑，把模拟分块替换为模型 SDK 的流式输出（OpenAI / Claude / 本地 Ollama 均可），保持返回 `Response(stream)` 不变。

## 技术栈

Next.js 16（App Router, Turbopack）· React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (base-ui) · lucide-react

## 开发

```bash
pnpm dev     # 开发服务器
pnpm build   # 生产构建（含 TypeScript 检查）
pnpm lint    # ESLint
```

## Roadmap

- [ ] 响应式抽屉侧边栏（移动端）
- [ ] Markdown 渲染与代码高亮
- [ ] localStorage / 服务端会话持久化
- [ ] 封装为独立 npm 包，一行代码引入
