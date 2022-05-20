import { ActionPost, KakomimasuClient } from "./KakomimasuClient.ts";

export const client = new KakomimasuClient({ name: "sample", spec: "test" });
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
