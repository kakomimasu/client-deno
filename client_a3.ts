// だいたい点数の高い順にデタラメに置き、デタラメに動くアルゴリズム （KakomimasuClient版）
import { ActionPost, KakomimasuClient } from "./KakomimasuClient.ts";
import { DIR, Pnt, rnd, sortByPoint } from "./client_util.ts";

export const client = new KakomimasuClient({ name: "AI-3", spec: "デタラメ" });
const pntall: Pnt[] = [];

client.oninit = (boardPoints, _agentCount, _totalTurn) => {
  const w = boardPoints[0].length;
  const h = boardPoints.length;

  // ポイントの高い順ソート
  for (let i = 0; i < h; i++) {
    for (let j = 0; j < w; j++) {
      pntall.push({ x: j, y: i, point: boardPoints[i][j] });
    }
  }
  sortByPoint(pntall);
};

client.onturn = (_field, _playerNumber, agents, _turn) => {
  // ランダムにずらしつつ置けるだけおく
  // 置いたものはランダムに8方向動かす
  const actions: ActionPost[] = [];
  const offset = rnd(agents.length);
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    if (agent.x === -1) { // 置く前?
      const p = pntall[i + offset];
      actions.push({
        agentId: i,
        type: "PUT",
        x: p.x,
        y: p.y,
      });
    } else {
      const [dx, dy] = DIR[rnd(8)];
      actions.push({
        agentId: i,
        type: "MOVE",
        x: agent.x + dx,
        y: agent.y + dy,
      });
    }
  }
  return actions;
};

await client.match();
