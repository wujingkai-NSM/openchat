export async function fakeAssistantReply(userText: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [
    `（模拟回复）我已经收到你的消息：“${userText}”。`,
    "",
    "当前是本地模拟的助手回复，用于验证收发流程。后续接入真实模型 API 时，替换本函数即可，签名保持 async 不变。",
  ].join("\n");
}
