import { AgentPos, Algorithm } from "./algorithm.ts";
import { ActionPost } from "./deps.ts";
import { Field } from "./KakomimasuClient.ts";

export class ClientNone extends Algorithm {
  onInit(_boardPoints: number[][], _agentCount: number, _totalTurn: number) {
  }
  onTurn(
    _field: Field[][],
    _playerNumber: number,
    _agents: AgentPos[],
    _turn: number,
  ): ActionPost[] {
    return [];
  }
}

if (import.meta.main) {
  const a = new ClientNone();
  a.match({
    name: "AI-NONE",
    spec: "なにもしない",
  });
}
