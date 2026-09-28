import Phaser from "phaser";
import "./styles.css";
import "@fontsource/noto-sans";
import "@fontsource/noto-sans-thai";
import { TitleScene } from "./game/scenes/TitleScene";
import { GameScene } from "./game/scenes/GameScene";

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
  scene: [TitleScene, GameScene],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
