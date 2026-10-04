import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createChatModel } from "@/lib/llm";

const encoder = new TextEncoder();

export async function POST(request: Request) {
  const start = Date.now();
  const requestId = request.headers.get("x-request-id") ?? "unknown";

  const body = await request.json().catch(() => null);
  const message = body?.message;

  if (typeof message !== "string" || !message.trim()) {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  let model;
  try {
    model = createChatModel();
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "model config error" },
      { status: 500 }
    );
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const iterator = await model.stream([
          new SystemMessage("你是一个乐于助人的中文 AI 助手，回答要简洁清晰。"),
          new HumanMessage(message),
        ]);
        for await (const chunk of iterator) {
          if (typeof chunk.content === "string" && chunk.content) {
            controller.enqueue(encoder.encode(chunk.content));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
      console.log(
        `[api/chat] request-id=${requestId} stream done in ${Date.now() - start}ms`
      );
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
