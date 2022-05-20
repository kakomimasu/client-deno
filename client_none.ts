import { KakomimasuClient } from "./KakomimasuClient.ts";

export const client = new KakomimasuClient("AI-NONE", "なにもしない");

await client.match();
