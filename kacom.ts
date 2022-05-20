// 大きく囲む戦略
import { ActionPost, KakomimasuClient } from "./KakomimasuClient.ts";

export const client = new KakomimasuClient("kacom", "kacom");
const line: number[][] = [];

client.oninit = (boardPoints, _agentCount, _totalTurn) => {
  const w = boardPoints[0].length;
  const h = boardPoints.length;

  for (let i = 0; i < w; i++) line.push([i, 0]);
  for (let i = 1; i < h; i++) line.push([w - 1, i]);
  for (let i = w - 2; i >= 0; i--) line.push([i, h - 1]);
  for (let i = h - 2; i >= 1; i--) line.push([0, i]);
};

client.onturn = (_field, _playerNumber, agents, _turn) => {
  const actions: ActionPost[] = [];
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    // console.log(field);
    if (agent.x === -1) { // 置く前？
      const p = line[(line.length / agents.length * i) >> 0];
      actions.push({
        agentId: i,
        type: "PUT",
        x: p[0],
        y: p[1],
      });
    } else {
      const n = line.findIndex((p) => p[0] === agent.x && p[1] === agent.y);
      if (n >= 0) {
        const next = line[(n + 1) % line.length];
        actions.push({
          agentId: i,
          type: "MOVE",
          x: next[0],
          y: next[1],
        });
      }
    }
  }
  return actions;
};

await client.match();
