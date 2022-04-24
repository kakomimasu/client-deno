// だいたい点数の高い順にデタラメに置き、デタラメに動くアルゴリズム （KakomimasuClient版）
import { ActionPost, AgentPos, Algorithm, Field } from "./algorithm.ts";
import { DIR, Pnt, rnd, sortByPoint } from "./client_util.ts";

export class ClientA3 extends Algorithm {
  private pntall: Pnt[] = [];

  onInit(boardPoints: number[][], _agentCount: number, _totalTurn: number) {
    const w = boardPoints[0].length;
    const h = boardPoints.length;

    // ポイントの高い順ソート
    this.pntall = [];
    for (let i = 0; i < h; i++) {
      for (let j = 0; j < w; j++) {
        this.pntall.push({ x: j, y: i, point: boardPoints[i][j] });
      }
    }
    sortByPoint(this.pntall);
  }

  onTurn(
    _field: Field[][],
    _playerNumber: number,
    agents: AgentPos[],
    _turn: number,
  ): ActionPost[] {
    // ランダムにずらしつつ置けるだけおく
    // 置いたものはランダムに8方向動かす
    const actions: ActionPost[] = [];
    const offset = rnd(agents.length);
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      if (agent.x === -1) { // 置く前?
        const p = this.pntall[i + offset];
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
  }
}

if (import.meta.main) {
  const a = new ClientA3();
  a.match({
    name: "AI-3",
    spec: "デタラメ",
  });
}
