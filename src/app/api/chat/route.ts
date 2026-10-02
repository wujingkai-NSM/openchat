const encoder = new TextEncoder();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunkText(text: string, size = 3): string[] {
  const chars = Array.from(text);
  const chunks: string[] = [];
  for (let i = 0; i < chars.length; i += size) {
    chunks.push(chars.slice(i, i + size).join(""));
  }
  return chunks;
}

export async function POST(request: Request) {
  const start = Date.now();
  const requestId = request.headers.get("x-request-id") ?? "unknown";

  const body = await request.json().catch(() => null);
  const message = body?.message;

  if (typeof message !== "string" || !message.trim()) {
    return Response.json({ error: "message is required" }, { status: 400 });
  }

  const reply = [
    `（模拟流式回复）我已经收到你的消息：“${message}”。`,
    "",
    "这段文字正通过 Route Handler 的 ReadableStream 分块推送，前端用 response.body.getReader() 逐段渲染，",
    "用于演示真实 LLM 接口的流式效果。替换本文件内的生成逻辑即可对接模型 API。",
  ].join("\n");

  const chunks = chunkText(reply);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
        await sleep(50);
      }
      controller.close();
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
