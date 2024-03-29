// だいたい点数の高い順に置き、点数の高い順に壊しながら動くアルゴリズム （KakomimasuClient版）
import { ActionPost, KakomimasuClient } from "./KakomimasuClient.ts";
import { DIR, Pnt, rnd, sortByPoint } from "./client_util.ts";

export const client = new KakomimasuClient({ name: "AI-5", spec: "破壊者" });
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

client.onturn = (field, playerNumber, agents, _turn) => {
  const w = field[0].length;
  const h = field.length;

  const actions: ActionPost[] = [];
  const offset = rnd(agents.length);
  const poschk: { x: number; y: number }[] = []; // 動く予定の場所
  const checkFree = (x: number, y: number) => {
    for (let i = 0; i < poschk.length; i++) {
      const p = poschk[i];
      if (p.x === x && p.y === y) {
        return false;
      }
    }
    return true;
  };
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
      const dirall = [];
      for (const [dx, dy] of DIR) {
        const x = agent.x + dx;
        const y = agent.y + dy;
        if (x >= 0 && x < w && y >= 0 && y < h && checkFree(x, y)) {
          const f = field[y][x];
          if (f.point > 0) { // プラスのときだけ
            if (
              f.type === 0 && f.pid !== -1 && f.pid !== playerNumber &&
              f.point > 0
            ) { // 敵土地、おいしい！
              dirall.push(
                { x, y, type: f.type, pid: f.pid, point: f.point + 10 },
              );
            } else if (f.type === 0 && f.pid === -1 && f.point > 0) { // 空き土地優先
              dirall.push(
                { x, y, type: f.type, pid: f.pid, point: f.point + 5 },
              );
            } else if (f.type === 1 && f.pid !== playerNumber) { // 敵壁
              dirall.push({ x, y, type: f.type, pid: f.pid, point: f.point });
            }
          }
        }
      }
      if (dirall.length > 0) { //  && this.rnd(5) > 0) { // 膠着状態を防ぐために20%で回避 → 弱くなった
        sortByPoint(dirall);
        const p = dirall[0];
        if (p.type === 0 || p.pid === -1) {
          actions.push({
            agentId: i,
            type: "MOVE",
            x: p.x,
            y: p.y,
          });
          poschk.push({ x: p.x, y: p.y });
        } else {
          actions.push({
            agentId: i,
            type: "REMOVE",
            x: p.x,
            y: p.y,
          });
        }
        poschk.push({ x: agent.x, y: agent.y });
      } else {
        // 周りが全部埋まっていたら空いている高得点で一番近いところを目指す
        let dis = w * h;
        let target = null;
        for (const p of pntall) {
          if (field[p.y][p.x].type === 0 && field[p.y][p.x].pid === -1) {
            const dx = agent.x - p.x;
            const dy = agent.y - p.y;
            const d = dx * dx + dy * dy;
            if (d < dis) {
              dis = d;
              target = p;
            }
          }
        }
        if (target) {
          const sgn = (n: number) => {
            if (n < 0) return -1;
            if (n > 0) return 1;
            return 0;
          };
          const x2 = agent.x + sgn(target.x - agent.x);
          const y2 = agent.y + sgn(target.y - agent.y);
          const p = field[y2][x2];
          if (p.type === 0 || p.pid === -1) {
            actions.push({
              agentId: i,
              type: "MOVE",
              x: x2,
              y: y2,
            });
            poschk.push({ x: x2, y: y2 });
          } else {
            actions.push({
              agentId: i,
              type: "REMOVE",
              x: x2,
              y: y2,
            });
          }
          poschk.push({ x: agent.x, y: agent.y });
        } else {
          // 空いているところなければランダム
          for (;;) {
            const [dx, dy] = DIR[rnd(8)];
            const x = agent.x + dx;
            const y = agent.y + dy;
            if (x < 0 || x >= w || y < 0 || y >= w) {
              continue;
            }
            actions.push({
              agentId: i,
              type: "MOVE",
              x: x,
              y: y,
            });
            poschk.push({ x, y });
            break;
          }
        }
      }
    }
  }
  return actions;
};

if (import.meta.main) {
  await client.match();
}
