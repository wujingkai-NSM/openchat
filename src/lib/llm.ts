import { ChatOpenAI } from "@langchain/openai";

export function createChatModel() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not set");
  }
  return new ChatOpenAI({
    model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
    apiKey,
    temperature: 0.7,
    configuration: {
      baseURL: "https://api.deepseek.com",
    },
  });
}
