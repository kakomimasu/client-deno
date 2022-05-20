// だいたい点数の高い順にデタラメに置き、画面外を避けつつデタラメに動くアルゴリズム
import { ActionPost, KakomimasuClient } from "./KakomimasuClient.ts";
import { DIR, Pnt, rnd, sortByPoint } from "./client_util.ts";

export const client = new KakomimasuClient({ name: "AI-2", spec: "" });
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

client.onturn = (field, _playerNumber, agents, _turn) => {
  const w = field[0].length;
  const h = field.length;

  // ランダムにずらしつつ置けるだけおく
  // 置いたものはランダムに8方向動かす
  // 画面外にはでない判定を追加（a1 → a2)
  const actions: ActionPost[] = [];
  const offset = rnd(agents.length);
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    if (agent.x === -1) {
      const p = pntall[i + offset];
      actions.push({
        agentId: i,
        type: "PUT",
        x: p.x,
        y: p.y,
      });
    } else {
      for (;;) {
        const [dx, dy] = DIR[rnd(8)];
        const x = agent.x + dx;
        const y = agent.y + dy;
        if (x < 0 || x >= w || y < 0 || y >= h) {
          continue;
        }
        actions.push({
          agentId: i,
          type: "MOVE",
          x,
          y,
        });
        break;
      }
    }
  }
  return actions;
};

await client.match();
