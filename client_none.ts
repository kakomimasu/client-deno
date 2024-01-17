import { KakomimasuClient } from "./KakomimasuClient.ts";

export const client = new KakomimasuClient({
  name: "AI-NONE",
  spec: "なにもしない",
});

await client.match();
