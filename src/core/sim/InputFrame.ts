// One simulation tick of player intent. Framework-free: the Phaser adapter
// samples the keyboard and builds this; the simulation never touches input APIs.
export interface InputFrame {
  /** -1..1, already normalized. */
  moveX: number;
  moveY: number;
  /** Edge-triggered dash request for this tick. */
  dashPressed: boolean;
}
