import Phaser from "phaser";
import "./styles.css";
import "@fontsource/noto-sans";
import "@fontsource/noto-sans-thai";
import { TitleScene } from "./game/scenes/TitleScene";
import { GameScene } from "./game/scenes/GameScene";
import { VisualLabScene } from "./game/scenes/VisualLabScene";
import { isVisualMode } from "./qa/qaMode";

const visualLab = isVisualMode(window.location.search);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#0b0e14",
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  render: { antialias: true, pixelArt: false },
  // ?visual=1 boots the presentation review lab instead of the game.
  scene: visualLab ? [VisualLabScene] : [TitleScene, GameScene],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
