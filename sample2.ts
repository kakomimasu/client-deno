import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";

import { ActionPost, KakomimasuClient } from "./KakomimasuClient.ts";

// .envファイルの読み込み
const env = config();

// コマンドライン引数の読み込み
const gameId = Deno.args[0];

export const client = new KakomimasuClient({
  bearerToken: env.BEARER_TOKEN,
  host: env.HOST,
  gameId: gameId,
});

client.oninit = (boardPoints, agentCount, totalTurn) => {
  // ゲーム開始時にしておきたい処理を書く
};

client.onturn = (field, playerNumber, agents, turn) => {
  // 毎ターンしたい処理を書く
  const actions: ActionPost[] = [];
  return actions;
};

// ゲーム参加
await client.match();
