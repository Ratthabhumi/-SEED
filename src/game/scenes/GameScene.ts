import { childCondition } from "../../core/progression/childWorld";
import { historyTechName, currentWorldHistoryStart } from "../ui/historyTechName";
import { effectBeforeAfter, effectSummary } from "../ui/techEffects";
// GameScene — ADAPTER (ADR 0003). Owns no canonical gameplay state.
// Browser input → InputFrame → RunSimulation.step() → state → Phaser render.
// SimEvent → DOM / audio / camera. Restart = NEW RunSimulation instance.
import Phaser from "phaser";
import {groundViewport,groundDetailViewport,groundBoundsKey,type GroundBounds} from "../render/groundViewport";
import {groundRasterReview} from "../render/groundRasterReview";
import {PreparedGround} from "../render/PreparedGround";
import { beginAttempt, attemptReward, settleAttempt } from "../../core/progression/archiveLedger";
import { normalizeSeedString, generateRandomSeed } from "../../core/seed/hash";
import { WORLDGEN_VERSION, CONTENT_VERSION, SAVE_SCHEMA_VERSION } from "../../core/seed/versions";
import { FixedAccumulator, SIM_DT } from "../../core/sim/fixedStep";
import { InputLatch } from "../../core/sim/InputLatch";
import { RunSimulation, fallbackCards } from "../../core/sim/RunSimulation";
import {recommendedCard} from "../../core/tech/pathGuidance";
import {heroPortrait} from "../ui/heroPortrait";
import type { SimEvent } from "../../core/sim/SimEvent";
import { MAX_ENEMIES, MAX_PROJ, MAX_PICKUP, type SimEnemy } from "../../core/sim/RunState";
import { CLAIM_CLEAR_RADIUS, CLAIM_REACH_RADIUS } from "../../core/world/territory";
import { classifySite, frontierObjective, type FrontierObjective, type FrontierSite } from "../frontier/sites";
import { dominionProgress } from "../../core/progression/ages";
import { worldToChunk, CHUNK_SIZE, ACTIVE_RADIUS_CHUNKS } from "../../core/world/chunks";
import { BIOME_STYLE, CIV_LAYER, ENEMY_LINEAGE } from "../../content/content";
import { OUTPOST_MAXHP } from "../../core/world/territory";
import type { AgeId } from "../../core/tech/graph";
import { AGES } from "../../core/tech/graph";
import { BREAKTHROUGHS, breakthroughProgress, nearestBreakthroughs, completingBreakthrough, tagDisplayKey } from "../../core/tech/synergy";
import { activeFamilies, ORIGINS, originById, type OriginId } from "../../core/progression/origins";
import { legacyDefById } from "../../core/progression/legacies";
import type { WeaponFamily } from "../../core/combat/weapons";
import { CRITICAL_SPINE } from "../../core/tech/graph";
import { AGE_DEFS, ageGates } from "../../core/progression/ages";
import { ORIGIN_SQUAD_NAME, ORIGIN_ABILITY, squadCap } from "../../core/combat/squad";
import { deriveWorldTraits } from "../../core/emergence/worldLaws";
import { militaryBonusSlots, territoryKnowledgeBonus, activeTerritories, TIER2_HOLD_SEC, REPAIR_NEED, outpostUpgradeCost, calculateLogisticsCost, calculateMaxLogistics, type OutpostSpec } from "../../core/world/territory";
import { calculateMaxLogistics as calculateMaxLogisticsEmergence } from "../../core/emergence/outpostLogistics";
import { scaleKnowledge } from "../../core/sim/progression";
import { threatBudget } from "../../core/director/director";
import { getWeaponStage } from "../../core/combat/weapons";
import { t, setLang, getLang } from "../../i18n/i18n";
import type { EnKeys } from "../../i18n/en";
import { loadSave, storeSave } from "../../core/save/save";
import { sfx } from "../audio/sfx";
import { uiRoot, clearUI, el, button, toast, clearNotifications, notificationCounts, applyUiScale, isKeyRepeat } from "../ui";
import { SurfaceCoordinator } from "../ui/surfaces";
import { TITLE_SEED_KEY, TITLE_ORIGIN_KEY } from "./TitleScene";
import { isQAMode, GOLDEN_QA_SEED } from "../../qa/qaMode";
import { QaSession, type QaFrameData, type QaPOIInfo } from "../../qa/qaPanel";
import {onceKeyboardEvent} from "../input/onceKeyboardEvent";
import { drawEnemy } from "../render/EnemyRenderer";
import {eligibleFamilies} from "../../core/director/director";
import {guardianCount} from "../render/weaponPresentation";
import {drawEnemyTelegraph,enemyDisplayHeading,enemyDisplayMoving} from "../render/enemyTelegraph";
import {ActorMotion,humanoid} from "../render/actorMotion";
import { ACTOR_ASSETS, actorFor, BOSS_ASSET_V2,ENEMIES_ASSET_V2 } from "../assets/actorAssets";
import {HERO_ASSETS,NEUTRAL_HERO_ATLAS,REFERENCE_HERO_ATLAS} from "../assets/heroAssets";
import {HeroActions} from "../render/heroActions";
import {drawBossTelegraph} from "../render/BossTelegraph";
import {bossWarningDuration} from "../../core/combat/bossEncounter";
import {TerrainPainter,TERRAIN_TEXTURES} from "../render/TerrainPainter";
import {PERIODIC_TERRAIN_TEXTURES,PERIODIC_TERRAIN_BYTES} from "../assets/periodicTerrain";
import {siteOriginY} from '../render/siteGrounding';
import {SiteArrival} from '../render/siteArrival';
import {COMBAT_ASSETS,combatFrames} from "../assets/combatAssets";
import {CombatSprites} from "../render/CombatSprites";
import {HeroEquipment} from "../render/HeroEquipment";
import {DeathResponse} from "../render/DeathResponse";
import {WORLD_SCALE,gameZoom,enemyArtSize} from "../render/combatPresentation";
import { ActorRenderer } from "../render/ActorRenderer";
import { BossRig } from "../render/BossRig";
import { BossPresentation, type BossArtMode } from "../render/BossPresentation";
import { repairPresentation } from "../render/repairPresentation";
import { CombatFeedback, energyCharge } from "../render/CombatFeedback";
import { KNOWLEDGE_ICON } from "../render/knowledgeIdentity";
import { phaserColors } from "../../theme/tokens";
import { drawPlayer } from "../render/PlayerRenderer";
import {
  drawFriendlyProj, drawHostileProj, drawAura, drawOrbit, drawMine, drawKnowledge,
} from "../render/ProjectileRenderer";
import { drawGround, drawPoi, drawTerritoryDressing } from "../render/WorldRenderer";
import { drawOffscreenIndicator, minimapCells } from "../render/NavigationRenderer";
import { TechMapView } from "../tech/TechMapView";
import { DOMAIN_ICONS } from "../assets/domainIcons";
import { SEED_ASSETS } from "../assets/seedAssets";
import { TutorialDirector } from "../onboarding/TutorialDirector";
import pkg from "../../../package.json";

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))] as number;
}

import { AbilityLoadout } from "../ui/AbilityLoadout";
import { DecisionInputBoundary } from "../ui/DecisionInputBoundary";
import {FriendlyProjectileBatch} from "../render/FriendlyProjectileBatch";
import hostileAttackArt from "../../../assets/seed/content153/hostile-attacks-v1.png";
import attackArt from "../../../assets/seed/content153/hunters-attack-v2.png";
import {naturalBossEvidence} from "../../../scripts/naturalBossEvidence";
import { RenderDiagnostics } from "../render/RenderDiagnostics";
import { HostileProjectileBatch } from "../render/HostileProjectileBatch";
import { NumericFeedback } from "../render/NumericFeedback";

export class GameScene extends Phaser.Scene {
  private diagnostics?:RenderDiagnostics;
  private hostileBatch!:HostileProjectileBatch;
  private friendlyBatch!:FriendlyProjectileBatch;
  private vectorHostiles=false;
  private numericFeedback?:NumericFeedback;
  private loadout!: AbilityLoadout;
  private displayedOffers:unknown=null;
  private decisionInput!: DecisionInputBoundary;
  private sim!: RunSimulation;
  private masterSeed = "EPOCH-GOLDEN-001";
  private acc = new FixedAccumulator();
  private latch = new InputLatch();
  private paused = false;
  private deathPersisted = false;
  private attemptId = 0;
  private archiveEarned = 0;
  private archiveStorageOK = true;

  private enemyActors!: ActorRenderer;
  private bossRig!:BossPresentation;
  private bossArtMode:BossArtMode="painted";
  private bossLaneObserver?:ResizeObserver;
  private allyActors!: ActorRenderer;
  private repairLabel!: Phaser.GameObjects.Text;
  private lastAbilityArtT = -10;
  private actorMotion=new ActorMotion();
  private artWorld="";
  private enemyWarningT={rush:-Infinity,burst:-Infinity};
  private artLastX = 0;
  private artLastY = 0;
  private gfx!: Phaser.GameObjects.Graphics;
  private ground!: Phaser.GameObjects.Graphics;
  private preparedGround!:PreparedGround;
  private playerArc!: Phaser.GameObjects.Arc;
  private debugText!: Phaser.GameObjects.Text;
  private showDebug = false;
  private lastGroundKey = "";

  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};
  private keyHandlers: { event: string; fn: () => void }[] = [];
  private hud: Record<string, HTMLElement> = {};
  private hudT = 0;
  // Modal overlays: blocking choice modals (expansion/legacy/origin) pause
  // stepping until decided; timed beats (breakthrough/age) pause briefly.
  private blockingModal: HTMLElement | null = null;
  private modalT = 0;
  /** UI surface policy: exactly-one BLOCKING (FIFO), suspendable CONTEXT. */
  private surfaces = new SurfaceCoordinator();
  // Presentation state (never canonical): facing, hurt flash, contrast, hints.
  private playerFacing = -Math.PI / 2;
  private lastHurtT = -10;
  private bossGfx: Phaser.GameObjects.Graphics | null = null;
  private navT = 0;
  /** Frontier scan (1 Hz): open sites + single shared focus (§22). */
  private frontierSites: FrontierSite[] = [];
  private frontierFocus: FrontierObjective | null = null;
  private siteScratch: SimEnemy[] = [];
  /** Telemetry-only seen sets (presentation-side, never canonical). */
  private claimPromptsSeen = new Set<string>();
  private firstClaimLogged = false;
  private prevFocusId = "";
  private prevDominion = -1;
  /** Transient impact presentation (never canonical): death rings + damage numbers. */
  private landmarkArt: Phaser.GameObjects.Image[] = [];
  private reducedEffects=false;
  private combatFeedback = new CombatFeedback();
  private knowledgeHintShown=false;
  private knowledgeCollectUntil=-Infinity;
  private arcs: Array<{x1:number;y1:number;x2:number;y2:number;until:number;relay:boolean}> = [];
  private bursts: Array<{ x: number; y: number; t: number; max: number; big: boolean }> = [];
  private dmgNums: Array<{ x: number; y: number; txt: string; t: number }> = [];
  private floatText: Phaser.GameObjects.Text[] = [];
  private onboard: { done: Set<string>; active: string; until: number } = { done: new Set(), active: "", until: 0 };
  /** Transient NEW markers for the last reroll (presentation-only). */
  private rerollNewIds = new Set<string>();
  /** Civ-map tracked outpost (presentation-only highlight, never canonical). */
  private trackedPoiId: string | null = null;
  private tutorial: TutorialDirector | null = null;

  // QA harness (read-only observer, ?qa=1 only — null in normal play).
  private qa: QaSession | null = null;
  private qaOverlay = false;
  private qaGfx: Phaser.GameObjects.Graphics | null = null;
  private qaText: Phaser.GameObjects.Text | null = null;
  private qaBiome = "?";
  private qaPoi: QaPOIInfo | null = null;
  private qaScanT = 0;

  // Rolling performance samples (bounded) — real p50/p95, never EMA-as-p95.
  private simSamples: number[] = [];
  private frameSamples: number[] = [];
  private lastFrameAt = 0;
  private renderSamples: number[] = [];
  private renderStart = 0;
  private onPreRender = () => { this.renderStart = performance.now(); };
  private onPostRender = () => {
    if(!this.renderStart)return;
    const at=performance.now(),render=at-this.renderStart;this.pushSample(this.renderSamples,render);
    if(this.uniqueTiming){const s=this.sim.state;this.uniqueFrames.push({frame:this.game.loop.frame,at,rendererCpuSubmit:render,sim:this.uniqueSim,elapsed:s.elapsed,world:s.ascension,
      enemies:s.enemies.filter(e=>e.active).length,friendly:s.projs.filter(p=>p.active&&p.friendly).length,hostile:s.projs.filter(p=>p.active&&!p.friendly).length,
      warnings:s.enemies.filter(e=>e.active&&(e.encounter?.phase==="warning"||e.evolution?.phase==="warning")).length,camera:[this.cameras.main.scrollX,this.cameras.main.scrollY,this.cameras.main.zoom]});
      this.uniqueSim=[];if(this.uniqueFrames.length>1200)this.uniqueFrames.shift();}
  };
  private fpsEMA = 60;
  private fpsHud: HTMLElement | null = null;
  private fpsHudT = 0;
  /** Tech Map / Civ Map overlay open (pauses stepping like a modal). */
  private techMapOpen = false;
  private heroActions = new HeroActions();
  private lastAgeCardKey="";
  private terrainPainter!:TerrainPainter;
  private siteArrival=new SiteArrival();
  private groundRefreshMs=0;
  private chunkReadMs=0;
  private groundMaxMs=0;
  private chunkReadMaxMs=0;
  private heroEquipment=new HeroEquipment();
  private combatSprites!:CombatSprites;
  private equipmentGraphics!:Phaser.GameObjects.Graphics;
  private submittedGroundBounds?:GroundBounds;
  private submittedDetailBounds?:GroundBounds;
  private groundProbe?:Phaser.GameObjects.Graphics;
  private uniqueTiming=false;
  private uniqueSim:number[]=[];
  private uniqueFrames:Array<{frame:number;at:number;rendererCpuSubmit:number;sim:number[];elapsed:number;world:number;enemies:number;friendly:number;hostile:number;warnings:number;camera:number[]}>=[];
  private actorReviewCleanup?:()=>void;
  private reviewActors?:ActorRenderer;
  private deathResponse!:DeathResponse;
  private techMapSel = "";
  private techMapView: TechMapView | null = null;
  private civMapOpen = false;
  private vfxPool: Phaser.GameObjects.Image[] = [];

  constructor() {
    super("game");
  }

  preload(): void {
    // Only Guardian still uses the authored six-era SVG rig. Keep other old
    // sources for diagnostics/provenance without uploading dead gameplay bodies.
    this.load.svg("actor-guardian",ACTOR_ASSETS.guardian,{width:1152,height:64});
    this.load.image("hero-neutral",NEUTRAL_HERO_ATLAS);
    for(const [id,url] of Object.entries(HERO_ASSETS))this.load.image("hero-v2-"+id,url);
    this.load.image("hero-reference",REFERENCE_HERO_ATLAS);
    this.load.spritesheet("hostile-painted",hostileAttackArt,{frameWidth:128,frameHeight:128});
    this.load.spritesheet("hero-reference-attack",attackArt,{frameWidth:128,frameHeight:128});
    if(new URLSearchParams(location.search).get('terrainSource')==='runtime'){
      for(const [id,url] of Object.entries(TERRAIN_TEXTURES))this.load.image(`terrain-${id}`,url);
    }else{
      if(new URLSearchParams(location.search).get('terrainSource')==='prebaked-png')for(const [id,url] of Object.entries(PERIODIC_TERRAIN_TEXTURES))this.load.image(`terrain-periodic-${id}`,url);
      this.load.binary('terrain-periodic-bytes',PERIODIC_TERRAIN_BYTES);
    }
    this.load.image("combat-projectiles",COMBAT_ASSETS.projectiles);
    this.load.image("combat-equipment",COMBAT_ASSETS.equipment);
    this.load.image("world-props",COMBAT_ASSETS.props);
    this.load.image("boss-v2",BOSS_ASSET_V2);
    const bossArt=new URLSearchParams(location.search).get("bossArt");
    this.bossArtMode=bossArt==="rig"||bossArt==="baseline"?bossArt:"painted";
    if(this.bossArtMode==="rig")BossRig.preload(this);
    this.load.image("enemies-v2",ENEMIES_ASSET_V2);
    this.load.image("outposts-v2",SEED_ASSETS.structures.atlasV2);
    this.load.svg("frontier-scout", SEED_ASSETS.frontier.scout, {width:64,height:64});
    this.load.svg("frontier-mite", SEED_ASSETS.frontier.mite, {width:64,height:64});
    this.load.svg("frontier-observatory", SEED_ASSETS.frontier.observatory, {width:96,height:96});
    this.load.image("seed_hit_impact", SEED_ASSETS.vfx.hitImpact);
    this.load.image("seed_claim_glow", SEED_ASSETS.vfx.claimGlow);
    this.load.image("seed_breakthrough_spark", SEED_ASSETS.vfx.breakthroughSpark);
    this.load.image("seed_raid_alert", SEED_ASSETS.vfx.raidAlert);
    this.load.image("seed_outpost_research", SEED_ASSETS.structures.research);
    this.load.image("seed_outpost_military", SEED_ASSETS.structures.military);
    this.load.image("seed_outpost_economic", SEED_ASSETS.structures.economic);
  }

  private spawnVfx(
    key: string,
    x: number,
    y: number,
    scale = 1,
    tint = 0xffffff,
    duration = 300,
    blendMode = Phaser.BlendModes.ADD,
  ): void {
    if (this.reducedEffects) return;
    let img = this.vfxPool.find((item) => !item.visible);
    if (!img) {
      if (this.vfxPool.length >= 16) return;
      img = this.add.image(x, y, key);
      img.setDepth(45);
      this.vfxPool.push(img);
    }
    img.setTexture(key);
    img.setPosition(x, y);
    img.setScale(scale);
    img.setAlpha(1);
    img.setTint(tint);
    img.setBlendMode(blendMode);
    img.setVisible(true);
    this.tweens.add({
      targets: img,
      alpha: 0,
      scale: scale * 1.35,
      duration,
      onComplete: () => {
        img?.setVisible(false);
      },
    });
  }

  create(): void {
    this.decisionInput = new DecisionInputBoundary(
      () => !!this.sim && !this.paused && !this.sim.state.over && !this.sim.state.draftOpen && !this.blockingModal && !this.techMapOpen && !this.civMapOpen,
      () => !!this.sim?.state.draftOpen,
      () => { this.latch.setMove(0,0);this.latch.discardEdges();this.input.keyboard?.resetKeys(); },
    );
    this.heroActions = new HeroActions();
    const save = loadSave(localStorage);
    setLang(save.settings.lang);
    sfx.setVolume(save.settings.volume);
    applyUiScale(save.settings.uiScale ?? 1);

    const pending = sessionStorage.getItem(TITLE_SEED_KEY);
    this.masterSeed = normalizeSeedString(pending || generateRandomSeed()) || generateRandomSeed();
    sessionStorage.removeItem(TITLE_SEED_KEY);

    this.startRun(this.masterSeed);
  }

  /** Fresh run (and restart path): new simulation, clean adapter state. */
  private startRun(seed: string): void {
    this.siteArrival.reset();
    const observeSites=()=>this.siteArrival.afterRender((x,y)=>this.cameras.main.worldView.contains(x,y),this.game.loop.frame,performance.now());
    this.game.events.on('postrender',observeSites);
    this.events.once('shutdown',()=>this.game.events.off('postrender',observeSites));
    // Phaser destroys display objects on shutdown while reusing this Scene.
    // A previous pooled Text/Image has a destroyed canvas/scene, not a free slot.
    this.floatText=[];this.vfxPool=[];this.bursts=[];this.dmgNums=[];
    this.displayedOffers=null;
    this.groundMaxMs=this.chunkReadMaxMs=0;
    this.lastAgeCardKey="";
    this.heroActions = new HeroActions();
    const terrainSource=new URLSearchParams(location.search).get('terrainSource');
    this.terrainPainter = new TerrainPainter(this,terrainSource==='runtime'?'runtime':terrainSource==='prebaked-png'?'prebaked-png':'offline-canvas');
    this.heroEquipment=new HeroEquipment(this,new URLSearchParams(location.search).get("equipment")==="float"?"float":"hand");
    this.combatSprites=new CombatSprites(this);
    this.hostileBatch=new HostileProjectileBatch(this,new URLSearchParams(location.search).get("hostile")!=="legacy");
    this.friendlyBatch=new FriendlyProjectileBatch(this,new URLSearchParams(location.search).get("friendly")!=="fullquad");
    this.vectorHostiles=new URLSearchParams(location.search).get("hostile")==="vector";
    this.numericFeedback=new URLSearchParams(location.search).get("numbers")==="atlas"?new NumericFeedback(this):undefined;
    const originRaw = sessionStorage.getItem(TITLE_ORIGIN_KEY) ?? "";
    sessionStorage.removeItem(TITLE_ORIGIN_KEY);
    const savedArchive = loadSave(localStorage);
    const begun = beginAttempt(savedArchive.meta); savedArchive.meta = begun.ledger;
    this.archiveStorageOK = storeSave(localStorage, savedArchive);
    this.attemptId = this.archiveStorageOK ? begun.id : 0; this.archiveEarned = 0;
    this.sim = new RunSimulation({ masterSeed: seed, originId: originRaw,
      archivePerks: savedArchive.meta.purchased, archiveEnergyStart: savedArchive.meta.energyStart });
    this.surfaces.reset();
    this.blockingModal = null;
    this.modalT = 0;
    this.acc = new FixedAccumulator();
    this.latch = new InputLatch();
    this.paused = false;
    this.deathPersisted = false;
    ActorRenderer.frames(this);
    combatFrames(this);
    this.enemyActors = new ActorRenderer(this,650,2,new URLSearchParams(location.search).get("actors")!=="images");
    this.allyActors = new ActorRenderer(this,128,4);
    this.deathResponse=new DeathResponse(this);
    this.bossRig=new BossPresentation(this,this.bossArtMode);
    this.repairLabel = this.add.text(0,0,"",{fontFamily:"Noto Sans Thai, Noto Sans",fontSize:"18px",color:"#F1F5F2",backgroundColor:"#0B1218",padding:{x:8,y:6}}).setLineSpacing(14).setOrigin(0.5,0).setDepth(40);
    this.lastAbilityArtT=-10;
    document.documentElement.dataset.contrast=loadSave(localStorage).settings.contrast;
    this.actorMotion.reset();this.artWorld=this.sim.state.worldNonce;this.enemyWarningT.rush=this.enemyWarningT.burst=-Infinity;
    this.combatFeedback.reset(this.sim.state.worldNonce);
    this.combatFeedback.initialize(this);
    this.knowledgeHintShown=false;this.knowledgeCollectUntil=-Infinity;
    this.artLastX=this.sim.state.px; this.artLastY=this.sim.state.py;
    this.landmarkArt = []; this.arcs=[];this.reducedEffects=loadSave(localStorage).settings.reducedEffects;
    this.lastGroundKey = "";this.groundProbe=undefined;
    this.simSamples = [];
    this.frameSamples = []; this.lastFrameAt = 0;
    this.renderSamples = [];
    this.uniqueTiming=new URLSearchParams(location.search).has("e2e");this.uniqueFrames=[];this.uniqueSim=[];
    this.game.events.on(Phaser.Core.Events.PRE_RENDER, this.onPreRender);
    this.game.events.on(Phaser.Core.Events.POST_RENDER, this.onPostRender);
    if(new URLSearchParams(location.search).get("profile")==="1"){
      this.diagnostics=new RenderDiagnostics(this);
      for(const [target,key,label] of [
        [this,"update","scene.update"],[this,"drawFrame","presentation.prepare"],
        [this,"refreshGround","terrain.refresh"],[this,"handleEvents","events.feedback"],
        [this,"floatTextAt","text.feedback"],[this.sim,"step","simulation.step"],
        [this.enemyActors,"draw","actors.prepare"],[this.allyActors,"draw","allies.prepare"],
        [this.terrainPainter,"update","terrain.update"],[this.terrainPainter,"upload","terrain.upload"],
      ] as const)this.diagnostics.wrap(target,key,label);
      const contexts=this.terrainPainter.diagnosticTargets();
      this.diagnostics.wrap(contexts.tile,"putImageData","terrain.putImageData");
      this.diagnostics.wrap(contexts.backing,"drawImage","terrain.backingDrawImage");
    }else this.diagnostics=undefined;

    this.ground = this.add.graphics().setDepth(-10);
    this.preparedGround=new PreparedGround(this.ground);
    this.preparedGround.enabled=false;
    if(this.diagnostics)this.diagnostics.wrap(this.ground,'renderWebGL','render.Graphics');
    this.gfx = this.add.graphics().setDepth(0);
    this.equipmentGraphics=this.add.graphics().setDepth(5);
    this.ground.setName("ground");this.gfx.setName("combat");this.equipmentGraphics.setName("equipment");
    this.playerArc = this.add.circle(0, 0, 16, 0xffd166) as unknown as Phaser.GameObjects.Arc;
    // Camera anchor only — the player body is drawn by PlayerRenderer.
    this.playerArc.setVisible(false);
    this.playerArc.setDepth(10);
    this.cameras.main.startFollow(this.playerArc, false, 0.14, 0.14);
    this.cameras.main.setZoom(gameZoom(this.scale.height));
    const resizeWorld=()=>{this.cameras.main.setZoom(gameZoom(this.scale.height));this.refreshGround(true);};
    this.scale.on("resize",resizeWorld);this.events.once("shutdown",()=>this.scale.off("resize",resizeWorld));
    this.bossGfx = this.add.graphics().setDepth(45);
    this.bossGfx.setScrollFactor(0);
    this.playerFacing = -Math.PI / 2;
    this.lastHurtT = -10;
    this.onboard = { done: new Set(), active: "", until: 0 };
    this.frontierSites = [];
    this.frontierFocus = null;
    this.claimPromptsSeen = new Set<string>();
    this.firstClaimLogged = false;
    this.prevFocusId = "";
    this.prevDominion = -1;

    this.tutorial?.dispose();
    const save = loadSave(localStorage);
    this.tutorial = new TutorialDirector(save.settings.tutorialCompleted ?? false);

    const kb = this.input.keyboard;
    if (kb) {
      this.keys = {
        W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        UP: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        DOWN: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
        LEFT: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        RIGHT: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      };
      const on = (event: string, fn: (event?:KeyboardEvent) => void): void => {
        const handler=onceKeyboardEvent(fn);
        kb.on(event, handler);
        this.keyHandlers.push({ event, fn:handler });
      };
      // P1-02: Space edge latches in the adapter (survives zero-step frames);
      // movement is level-polled per frame. Never JustDown() inside step timing.
      on("keydown-SPACE", (ev) => {
        if(this.sim.state.draftOpen||this.blockingModal||this.paused||this.sim.state.over)return;
        if(this.techMapOpen||this.civMapOpen||!this.decisionInput.allows(ev))return;
        this.latch.pressDash();
      });
      on("keydown-F3", () => {
        this.showDebug = !this.showDebug;
        this.debugText.setVisible(this.showDebug);
      });
      on("keydown-F10", () => {
        this.qa?.toggleInspector();
      });
      on("keydown-ESC", () => {
        // Nested confirm dialogs dismiss before anything else toggles.
        if (document.getElementById("tutorial-replay-confirm")) {
          document.getElementById("tutorial-replay-confirm")?.remove();
          return;
        }
        if (this.techMapOpen) {
          this.toggleTechMap();
          return;
        }
        if (this.civMapOpen) {
          this.toggleCivMap();
          return;
        }
        if (this.blockingModal) {
          // Optional specialization and timed beats dismiss; binding choices remain.
          if (this.modalT > 0 || (this.blockingModal.id === "spec-screen" || this.blockingModal.id === "child-intro-screen")) this.closeBlocking();
          return;
        }
        const s = this.sim.state;
        if (!s.over && !s.draftOpen) this.togglePause();
      });
      on("keydown-ONE", ev => { if(this.decisionInput.allows(ev)) this.pickCard(0); });
      on("keydown-TWO", ev => { if(this.decisionInput.allows(ev)) this.pickCard(1); });
      on("keydown-THREE", ev => { if(this.decisionInput.allows(ev)) this.pickCard(2); });
      // Command layer (v021): squad orders + origin ability + map screens.
      // Q/E/R/F are edge-triggered: ignore held-key auto-repeat so one
      // physical press is exactly one intentional command (v0.24).
      on("keydown-Q", (ev?: KeyboardEvent) => { if (!isKeyRepeat(ev)) this.issueSquad("follow"); });
      on("keydown-E", (ev?: KeyboardEvent) => { if (!isKeyRepeat(ev)) this.issueSquad("focus"); });
      on("keydown-R", (ev?: KeyboardEvent) => { if (!isKeyRepeat(ev)) this.issueSquad("hold"); });
      on("keydown-F", (ev?: KeyboardEvent) => { if (!isKeyRepeat(ev)) this.useAbility(); });
      on("keydown-C", () => this.claimNearestSite());
      on("keydown-T", () => this.toggleTechMap());
      on("keydown-M", () => this.toggleCivMap());
    }
    this.input.on("pointerdown", this.unlockAudio);

    this.debugText = this.add.text(10, 110, "", {
      fontSize: "12px", color: "#7fff9f", fontFamily: "monospace", backgroundColor: "rgba(0,0,0,0.6)",
    });
    this.debugText.setScrollFactor(0).setDepth(50).setVisible(this.showDebug);

    document.addEventListener("visibilitychange", this.onHidden);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);

    this.buildHUD();
    this.tutorial.start();
    this.refreshGround(true);
    toast("ui.ageReached", t("age.stone"), t("objective.stone"));
    const startTraits = deriveWorldTraits(this.sim.state.worldLaws);
    if (startTraits.length > 0) {
      toast("ui.worldTraits", startTraits.map((tr) => t(tr.nameKey)).join(" · "));
    }

    // Deterministic E2E/dev hook (query param only — never in production play).
    // Exposes scripted progression/death/introspection WITHOUT touching balance.
    if (new URLSearchParams(window.location.search).has("e2e")) {
      (window as unknown as { __seedE2E?: unknown }).__seedE2E = {
        grant: (n: number) => {
          const ev: SimEvent[] = [];
          this.sim.gainKnowledge(n, "e2e", ev);
          this.handleEvents(ev);
        },
        kill: () => this.handleEvents(this.sim.e2eKillPlayer()),
        renderDiagnostics:()=>this.diagnostics?.snapshot()??null,
        preparedGroundReview:(enabled?:boolean)=>{if(enabled!==undefined)this.preparedGround.enabled=enabled;return this.preparedGround.review();},
        preparedGroundFixture:(enabled:boolean,dx=0,dy=0)=>{const c=this.cameras.main;this.paused=true;c.stopFollow();c.ignore(this.children.list.filter(child=>child!==this.ground));c.setScroll(c.scrollX+dx,c.scrollY+dy);this.preparedGround.enabled=enabled;return this.sim.hash();},
        groundReview:()=>({bounds:groundViewport(this.cameras.main.scrollX,this.cameras.main.scrollY,this.scale.width,this.scale.height,this.cameras.main.zoom,{x:this.sim.state.px,y:this.sim.state.py}),commands:this.ground.commandBuffer.length}),
        cameraGroundReview:()=>{const c=this.cameras.main,v=c.worldView;return {scroll:[c.scrollX,c.scrollY],zoom:c.zoom,viewport:[c.width,c.height],view:{left:v.x,top:v.y,right:v.right,bottom:v.bottom},corners:[[0,0],[c.width,c.height]].map(([x,y])=>{const p=c.getWorldPoint(x!,y!);return {x:p.x,y:p.y};}),bounds:this.submittedGroundBounds,actor:{x:this.sim.state.px,y:this.sim.state.py},hash:this.sim.hash()};},
        cameraReviewSet:(zoom:number,scroll?:[number,number])=>{const c=this.cameras.main;c.setZoom(zoom);if(scroll)c.setScroll(scroll[0],scroll[1]);this.refreshGround(true);},
        cameraGroundRaster:()=>{const s=this.sim.state,c=this.cameras.main,{cx,cy}=worldToChunk(s.px,s.py),civ=CIV_LAYER[AGES[s.ageIndex] as AgeId];return groundRasterReview(this,{getChunk:(x,y)=>this.sim.chunks.get(s.worldSeed,s.worldNonce,x,y),styleFor:b=>BIOME_STYLE[b],civColor:civ.color,civDensity:civ.density,age:AGES[s.ageIndex] as AgeId,cx,cy,radius:ACTIVE_RADIUS_CHUNKS+1,worldSeed:s.worldSeed,time:0,highContrast:true},c.worldView.x,c.worldView.y,c.width,c.height,c.zoom,this.submittedGroundBounds,this.submittedDetailBounds);},
        groundDetailReview:(enabled:boolean)=>{const s=this.sim.state,c=this.cameras.main,{cx,cy}=worldToChunk(s.px,s.py),civ=CIV_LAYER[AGES[s.ageIndex] as AgeId];
          this.groundProbe??=this.add.graphics().setDepth(100);this.groundProbe.clear();c.ignore(this.children.list.filter(child=>child!==this.groundProbe));
          drawGround(this.groundProbe,{getChunk:(x,y)=>this.sim.chunks.get(s.worldSeed,s.worldNonce,x,y),styleFor:b=>BIOME_STYLE[b],civColor:civ.color,civDensity:civ.density,age:AGES[s.ageIndex] as AgeId,cx,cy,radius:ACTIVE_RADIUS_CHUNKS+1,worldSeed:s.worldSeed,time:0,highContrast:true,
            bounds:this.submittedGroundBounds,detailBounds:enabled?this.submittedDetailBounds:undefined});return this.sim.hash();},
        actorBatchCounts:()=>this.enemyActors.batchCounts(),
        actorRasterFixture:(ordered:boolean,x=0,y=0,zoom=1)=>{
          this.paused=true;this.actorReviewCleanup?.();const before=this.children.list.slice();
          const c=this.cameras.main;c.stopFollow();c.setZoom(zoom);c.setScroll(x-c.width/2,y-c.height/2);
          this.add.rectangle(x,y,4000,4000,0x102030).setDepth(100);
          const actors=new ActorRenderer(this,650,101,ordered);actors.begin();
          const ids=["chaser","ranged","tank","swarm"] as const;
          // Overlap and alternating texture/tint runs deliberately preserve painter order.
          for(let i=0;i<96;i++)actors.draw(ids[i%4]!,x-350+i%16*44,y-150+Math.floor(i/16)*48,92,i%2?Math.PI:0,10,true,i%3===0?0xffbbbb:0xffffff,5,undefined,undefined,undefined,i%4);
          for(let i=0;i<3;i++){
            actors.draw("boss",x-120+i*90,y+180,240,0,10,false,0xffffff,5,undefined,undefined,i*2);
            actors.draw("chaser",x-100+i*90,y+190,92,Math.PI,10,true,0xffbbbb,5,undefined,undefined,undefined,3);
          }
          actors.end();this.reviewActors=actors;const owned=this.children.list.filter(child=>!before.includes(child));
          this.actorReviewCleanup=()=>{for(const child of owned)child.destroy();};
          return {actors:actors.review(),batch:actors.batchCounts(),hash:this.sim.hash()};
        },
        actorRasterState:()=>this.reviewActors?.review(),
        groundRasterReview:()=>{const s=this.sim.state,{cx,cy}=worldToChunk(s.px,s.py),civ=CIV_LAYER[AGES[s.ageIndex] as AgeId];return groundRasterReview(this,{getChunk:(x,y)=>this.sim.chunks.get(s.worldSeed,s.worldNonce,x,y),styleFor:b=>BIOME_STYLE[b],civColor:civ.color,civDensity:civ.density,age:AGES[s.ageIndex] as AgeId,cx,cy,radius:ACTIVE_RADIUS_CHUNKS+1,worldSeed:s.worldSeed,time:0,highContrast:true},s.px-320,s.py-180);},
        referenceAnimation:()=>this.allyActors.referenceReview(),
        hostileBatchCounts:()=>this.hostileBatch.counts(),
        friendlyBatchCounts:()=>this.friendlyBatch.counts(),
        numericFeedbackCounts:()=>this.numericFeedback?.counts()??null,
        resetRenderDiagnostics:()=>this.diagnostics?.reset(),
        resetPerformanceSamples:()=>{this.frameSamples=[];this.simSamples=[];this.renderSamples=[];this.lastFrameAt=0;},
        actorPresentation: () => this.allyActors.review(),
        streamingMove:(x:number,y:number)=>{
          const s=this.sim.state,dx=x-s.px,dy=y-s.py;this.paused=true;s.px=x;s.py=y;
          for(const e of s.enemies)if(e.active){e.x+=dx;e.y+=dy;}
          for(const p of s.projs)if(p.active){p.x+=dx;p.y+=dy;}
          this.playerArc.setPosition(x,y);this.cameras.main.centerOn(x,y);
          const begin=performance.now();this.refreshGround(true);
          return {refreshGroundMs:performance.now()-begin,chunkReadMs:this.chunkReadMs,terrain:this.terrainPainter.counts(),chunkCache:{hits:this.sim.chunks.hits,misses:this.sim.chunks.misses,size:this.sim.chunks.size}};
        },
        streamingFixture:(x:number,y:number,dense=false,reduced=false,contrast=false)=>{
          // Explicit benchmark fixture only, never a human playtest or gameplay input.
          const s=this.sim.state;this.paused=true;this.reducedEffects=reduced;
          s.px=x;s.py=y;this.playerArc.setPosition(x,y);this.cameras.main.centerOn(x,y);
          for(const e of s.enemies)e.active=false;for(const p of s.projs)p.active=false;
          if(dense){
            for(let i=0;i<500;i++){const e=this.sim.spawnEnemy("chaser",false,false,i*.618,100+i%300,[]);if(e){e.speed=0;e.dmg=0;}}
            for(let i=0;i<800;i++){const p=s.projs[i]!;Object.assign(p,{active:true,friendly:true,x:x+Math.cos(i*.618)*(100+i%500),y:y+Math.sin(i*.618)*(100+i%300),vx:120,vy:0,radius:4,color:0xffda76,src:"kinetic",visualTier:3});}
          }
          const save=loadSave(localStorage);save.settings.contrast=contrast?"high":"normal";storeSave(localStorage,save);
          const begin=performance.now();this.refreshGround(true);
          return {refreshGroundMs:performance.now()-begin,terrain:this.terrainPainter.counts(),hash:this.sim.hash()};
        },
        integratedReview:()=>({groundRefreshMs:this.groundRefreshMs,chunkReadMs:this.chunkReadMs,equipment:this.heroEquipment.review(),combatSprites:this.combatSprites.counts(),actors:this.allyActors.review(),enemies:this.enemyActors.review(),zoom:this.cameras.main.zoom,
          terrain:this.terrainPainter.counts(),logistics:this.sim.logisticsStatus(),raid:this.sim.raidReadiness(),age:this.sim.state.ageIndex,
          defenses:this.sim.state.raidsSurvived,landmarks:this.landmarkArt.filter(i=>i.visible).map(i=>({texture:i.texture.key,frame:i.frame.name,width:i.displayWidth,height:i.displayHeight}))}),
        stageRaidClosure:()=>{
          // Gate fixture only. Upgrade/dismantle/raid combat use real core paths.
          this.paused=true;const s=this.sim.state;s.raid=null;s.ageIndex=3;s.elapsed=100;s.lastRaidAt=100;s.raidReadySince=null;
          s.knowledgeTotal=5000;s.elitesAge=2;s.spawnT=s.eliteT=s.mineT=999;
          s.build.hp=s.build.maxHp=10000;
          for(const e of s.enemies)e.active=false;
          this.handleEvents(this.sim.dismantleOutpost("allocation-2"));
          this.handleEvents(this.sim.upgradeOutpost("allocation-0"));
          this.handleEvents(this.sim.step(SIM_DT,{moveX:0,moveY:0,dashPressed:false}));this.refreshHUD();
        },
        advanceRaidReview:(seconds:number)=>{for(let i=0;i<Math.floor(Math.min(95,Math.max(0,seconds))/SIM_DT);i++)this.handleEvents(this.sim.step(SIM_DT,{moveX:0,moveY:0,dashPressed:false}));this.refreshHUD();},
        stageEvolution: (origin:string,age:number,encounter='roster') => {
          const s=this.sim.state;this.paused=false;s.originId=origin;s.ageIndex=age;s.px=10000;s.py=10000;s.vx=s.vy=0;
          this.playerArc.setPosition(s.px,s.py);this.cameras.main.centerOn(s.px,s.py);
          s.build.hp=s.build.maxHp=1e8;s.spawnT=s.eliteT=s.mineT=999;s.pendingLevels=0;s.draftOpen=false;s.draftOffers=[];
          // Isolated combat fixture: mark local generated POIs discovered, so exploration drafts cannot freeze movement assertions.
          const {cx,cy}=worldToChunk(s.px,s.py);
          for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)for(const p of this.sim.chunks.get(s.worldSeed,s.worldNonce,cx+dx,cy+dy).poi)if(!s.poisWorld.includes(p.id))s.poisWorld.push(p.id);
          for(const f of ['kinetic','energy','defense','field'] as const){s.weaponStage[f]=age;s.weaponCd[f]=0;}
          for(const e of s.enemies)e.active=false;for(const p of s.projs)p.active=false;
          for(let i=0;i<s.squad.length;i++){const a=s.squad[i]!;a.active=i<2;a.x=s.px-60-i*25;a.y=s.py+60;a.inv=0;a.hp=a.maxHp;a.cd=0;}
          const families=encounter==='rush'?['chaser']:encounter==='burst'?['ranged']:eligibleFamilies(age,'ordinary');
          for(let i=0;i<families.length;i++){const e=this.sim.spawnEnemy(families[i] as 'chaser',false,false,i*Math.PI/2,encounter==='rush'?130:encounter==='burst'?290:150,[])!;e.hp=e.maxHp=1e8;if(encounter==='roster'){e.speed=0;e.dmg=0;e.evolution=undefined;e.shootT=999;}else e.evolution!.timer=0;}
          this.actorMotion.reset();
          if(encounter!=='roster'){for(const f of ['kinetic','energy','defense','field'] as const)s.weaponCd[f]=999;for(const a of s.squad)a.cd=999;this.handleEvents(this.sim.step(SIM_DT,{moveX:0,moveY:0,dashPressed:false}));this.paused=true;}
        },
        advanceEvolution: (seconds:number) => {for(let i=0;i<Math.floor(Math.max(0,Math.min(3,seconds))/SIM_DT);i++)this.handleEvents(this.sim.step(SIM_DT,{moveX:0,moveY:0,dashPressed:false}));},
        primeSignature: () => {
          // Isolated real combat, not a synthetic event injection. Call after stageEvolution.
          const s=this.sim.state;this.paused=true;this.combatFeedback.reset(s.worldNonce);
          for(const f of ['kinetic','energy','defense','field'] as const)s.weaponCd[f]=999;
          for(const a of s.squad)a.cd=999;
          s.weaponCd.energy=0.15;
          this.refreshHUD();
        },
        stageKnowledgeReview: () => {
          const s=this.sim.state;this.paused=true;
          for(const k of s.pickups)k.active=false;
          Object.assign(s.pickups[0]!,{active:true,x:s.px+100,y:s.py+40,value:5});
          return s.knowledgeTotal;
        },
        stageUnchartedNavigation: () => {
          const s=this.sim.state;this.paused=true;s.ageIndex=4;s.signalSecured=false;
          s.poisWorld=[];s.stronghold=null;s.raid=null;
          for(const e of s.enemies)e.active=false;
          this.updateFrontier();this.updateCompass();
          return {compass:this.hud.compass?.textContent,known:s.poisWorld.length};
        },
        lineUpSignatureTargets: () => {
          const s=this.sim.state;s.weaponStage.field=0;let i=0;
          for(const e of s.enemies)if(e.active){e.x=s.px+140+i++*80;e.y=s.py;e.shield=0;e.hp=e.maxHp=1000;e.affix="";}
        },
        offerSignatureUpgrade: () => {
          const s=this.sim.state,node=s.techNodes.find(n=>n.id==="conduction-lattice");
          if(!node)throw new Error("Signature technology absent from actual graph");
          s.pendingLevels=1;s.draftOpen=true;
          s.draftOffers=[{nodeId:node.id,quality:"COMMON",modifierIds:[],effectiveEffects:node.effects.map(e=>({...e}))}];
          this.paused=false; // Canonical draft now owns the pause and opens the real UI.
          this.syncDraftUI();
        },
        signatureFeedback: () => ({...this.combatFeedback.counts(this.sim.state.elapsed),charge:energyCharge(this.sim.state),
          arcs:this.arcs.filter(a=>a.until>this.sim.state.elapsed).length,
          elapsed:this.sim.state.elapsed,hp:this.sim.state.enemies.filter(e=>e.active).map(e=>e.hp),chain:this.sim.state.build.chainUnlocked,reduced:this.reducedEffects,hash:this.sim.hash()}),
        evolutionState: () => ({enemies:this.sim.state.enemies.filter(e=>e.active).map(e=>({family:e.family,x:e.x,y:e.y,evolution:e.evolution})),projs:this.sim.state.projs.filter(p=>p.active).map(p=>({src:p.src,visualTier:p.visualTier,vx:p.vx,vy:p.vy,dmg:p.dmg})),squadMode:this.sim.state.squadMode}),
        takeUniquePerformanceFrames:()=>{const rows=this.uniqueFrames;this.uniqueFrames=[];return rows;},
        performanceSamples: () => ({ frame: [...this.frameSamples], sim: [...this.simSamples], rendererCpuSubmit: [...this.renderSamples], rendererType: this.game.renderer.type, sceneObjects:this.children.length, pools:{mites:0,enemyActors:this.enemyActors.size,allyActors:this.allyActors.size,landmarks:this.landmarkArt.length,vfx:this.vfxPool.length,arcs:this.arcs.length}, viewport: [window.innerWidth, window.innerHeight], ascension: this.sim.state.ascension, age: this.sim.state.ageIndex }),
        readyAscend: () => {
          // Test-only shortcut for the boss-kill trigger; ascend() itself
          // (child world, fresh streams, stat separation) runs the real path.
          this.sim.state.ascendReady = true;
          this.refreshHUD();
        },
        readyExpansion: () => {
          // Test-only staging for the Industrial transition: satisfies the
          // CURRENT canonical gates (knowledge + mission + dominion) through
          // real paths — two genuine distinct claims + specializations plus
          // coherent breakthrough evidence — then the age-up, events, and
          // modal queue run real code. Returns self-diagnostics (Phase A A1).
          const s = this.sim.state;
          s.ageIndex = 2;
          s.elapsed = 400;
          s.ageElapsed = 130;
          s.knowledgeTotal = 2800;
          s.ageKills = 120;
          s.elitesAge = 1;
          for (const e of s.enemies) e.active = false;
          for (const t of ["fire", "tools"]) if (!s.ownedTags.includes(t)) s.ownedTags.push(t);
          if (!s.breakthroughs.includes("metallurgy")) s.breakthroughs.push("metallurgy");
          const { cx, cy } = worldToChunk(s.px, s.py);
          const claimed: string[] = [];
          outer: for (let r = 0; r < 6 && claimed.length < 2; r++) {
            for (let ox = -r; ox <= r && claimed.length < 2; ox++) {
              for (let oy = -r; oy <= r && claimed.length < 2; oy++) {
                const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
                for (const poi of desc.poi) {
                  if (s.poisWorld.includes(poi.id)) continue;
                  s.px = poi.wx;
                  s.py = poi.wy;
                  s.poisWorld.push(poi.id);
                  s.stats.poisTotal++;
                  this.handleEvents(this.sim.claimTerritory(poi.id));
                  this.handleEvents(this.sim.setOutpostSpec(poi.id, "research"));
                  claimed.push(poi.id);
                  if (claimed.length >= 2) break outer;
                }
              }
            }
          }
          this.refreshHUD();
          const gates = ageGates(3, s.knowledgeTotal, this.missionStateOf(s), this.dominionStateOf(s));
          const ds = this.dominionStateOf(s);
          return {
            ready: gates.every((g) => g.done),
            gates: gates.map((g) => ({ id: g.id, have: g.have, need: g.need, done: g.done })),
            activeOutposts: ds.active,
            specialized: ds.specialized,
            breakthroughs: s.breakthroughs.length,
          };
        },
        advance: (seconds: number) => {
          // Test-only deterministic fast-forward (E2E time travel): godmode
          // on, idle input, queued drafts auto-picked. Never in normal play.
          const s = this.sim.state;
          s.build.hp = 1e9;
          s.build.maxHp = 1e9;
          const steps = Math.max(0, Math.floor(seconds * 60));
          for (let i = 0; i < steps; i++) {
            const ev = this.sim.step(SIM_DT, { moveX: 0, moveY: 0, dashPressed: false });
            for (const e of ev) {
              if (e.type === "draft_opened") { while (s.draftOpen && !s.over) this.sim.chooseDraft(0); }
            }
            if (s.over) break;
          }
          while (s.draftOpen && !s.over) this.sim.chooseDraft(0);
          this.refreshHUD();
        },
        hash: () => this.sim.hash(),
        snapshot: () => this.sim.snapshot(),
        notificationBurst:(count:number,critical=false)=>{
          for(let i=0;i<Math.min(80,count);i++)toast(critical?"ui.raidIncoming":"ui.poiFound",`QA ${i}`,undefined,10000);
          return notificationCounts();
        },
        notificationReset:()=>clearNotifications(),
        notificationCounts:()=>notificationCounts(),
        draftFacts:()=>({offers:this.sim.state.draftOffers.map(o=>o.nodeId),taken:this.sim.state.stats.techsTaken}),
        canonicalStressStart:(boss=false)=>{
          // Staged stress, NOT a human/natural run: actual fixed-step combat
          // resumes. Entities retire/fire/move normally; no per-frame refill.
          const s=this.sim.state;this.paused=false;s.pendingLevels=0;s.draftOpen=false;s.draftOffers=[];
          s.build.hp=s.build.maxHp=1e8;s.spawnT=s.eliteT=999;
          for(const e of s.enemies)e.active=false;
          for(let i=0;i<500;i++){const e=this.sim.spawnEnemy(i%3===0?"ranged":"chaser",i%40===0,false,i*.618,200+i%280,[])!;e.hp=e.maxHp=1e8;e.dmg=0;}
          for(let i=0;i<800;i++){const p=s.projs[i]!;Object.assign(p,{active:true,friendly:true,x:s.px+Math.cos(i*.618)*(100+i%500),y:s.py+Math.sin(i*.618)*(100+i%300),vx:120,vy:0,radius:4,color:0xffda76,src:"kinetic",visualTier:s.ageIndex,dmg:0,life:2.2});}
          if(boss){const e=this.sim.spawnEnemy("tank",false,true,0,250,[])!;e.hp=e.maxHp=1e8;}
          this.frameSamples=[];this.simSamples=[];this.renderSamples=[];this.lastFrameAt=0;
          return {fixture:true,enemies:s.enemies.filter(e=>e.active).length,projectiles:s.projs.filter(p=>p.active).length};
        },
        canonicalStressState:()=>({elapsed:this.sim.state.elapsed,hash:this.sim.hash(),actors:this.enemyActors.batchCounts(),world:this.sim.state.ascension+1,draft:this.sim.state.draftOpen,paused:this.paused,enemies:this.sim.state.enemies.filter(e=>e.active).length,projectiles:this.sim.state.projs.filter(p=>p.active).length,boss:this.sim.state.enemies.find(e=>e.active&&e.boss)?.encounter,terrain:this.terrainPainter.counts()}),
        seed: () => this.masterSeed,
        cleanPresentation: () => {
          const s = this.sim.state;
          s.build.hp = 100;
          s.build.maxHp = 100;
          this.refreshHUD();
        },
        setLang: (code: "en" | "th") => this.applyLanguage(code),
        teleportToPOI: () => {
          // Test-only staging: move to the nearest undiscovered POI so
          // discovery/claim flows run without a 10-minute walk.
          const s = this.sim.state;
          const { cx, cy } = worldToChunk(s.px, s.py);
          let best: { x: number; y: number; d: number } | null = null;
          for (let ox = -3; ox <= 3; ox++) {
            for (let oy = -3; oy <= 3; oy++) {
              const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
              for (const poi of desc.poi) {
                if (s.poisWorld.includes(poi.id)) continue;
                const d = Math.hypot(poi.wx - s.px, poi.wy - s.py);
                if (!best || d < best.d) best = { x: poi.wx, y: poi.wy, d };
              }
            }
          }
          if (best) {
            s.px = best.x;
            s.py = best.y;
          }
          this.refreshHUD();
          return best !== null;
        },
        tryClaim: () => {
          // Mirrors the contextual CLAIM button exactly: nearest claimable
          // POI, real claimTerritory preconditions, zero staging/clearing.
          const list = this.sim.claimablePOIs();
          if (list.length === 0) return "";
          const c = list[0] as { poiId: string };
          const before = this.sim.state.territories.length;
          this.handleEvents(this.sim.claimTerritory(c.poiId));
          return this.sim.state.territories.length > before ? c.poiId : "";
        },
        claimFirst: () => {
          // Test-only staging: clear the field, then run the real
          // claim + specialization path on the first claimable POI.
          const s = this.sim.state;
          for (const e of s.enemies) e.active = false;
          const list = this.sim.claimablePOIs();
          const c = list.find((x) => x.clear) ?? list[0];
          if (!c) return "";
          this.handleEvents(this.sim.claimTerritory(c.poiId));
          this.handleEvents(this.sim.setOutpostSpec(c.poiId, "research"));
          this.refreshHUD();
          return c.poiId;
        },
        stageSpecRegression: (signal = false, full = true) => {
          const s = this.sim.state;
          s.ageIndex = 3;
          s.elapsed = s.runElapsed = 703;
          s.ageElapsed = 0;
          s.maxLogistics = 6;
          s.logistics = full ? 6 : 0;
          s.territories=full?Array.from({length:3},(_,i)=>({poiId:`reserved-regression-${i}`,poiType:"ruin" as const,
            x:s.px,y:s.py,spec:"military" as const,tier:1 as const,hp:OUTPOST_MAXHP,maxHp:OUTPOST_MAXHP,
            disabled:false,garrisoned:false,heldSince:0,repairT:0})):[];
          s.build.hp = s.build.maxHp = 1e9;
          for (const e of s.enemies) e.active = false;
          for (let ox = -8; ox <= 8; ox++) for (let oy = -8; oy <= 8; oy++) {
            const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, ox, oy);
            for (const poi of desc.poi) {
              if ((poi.type === "signal") !== signal || s.poisWorld.includes(poi.id)) continue;
              s.px = poi.wx;
              s.py = poi.wy;
              s.poisWorld.push(poi.id);
              this.refreshHUD();
              this.claimNearestSite();
              return poi.id;
            }
          }
          throw new Error("No regression site found");
        },
        specRegressionState: () => ({
          elapsed: this.sim.state.elapsed,
          ageIndex: this.sim.state.ageIndex,
          logistics: this.sim.state.logistics,
          maxLogistics: this.sim.state.maxLogistics,
          signalSecured: this.sim.state.signalSecured,
          territories: this.sim.state.territories,
        }),
        stageActorReview: (dense = false) => {
          const s=this.sim.state; s.ageIndex=3;s.ageElapsed=0;s.build.hp=s.build.maxHp=1e9;
          for(const e of s.enemies)e.active=false;
          const families=["chaser","ranged","tank","swarm"] as const;
          for(let i=0;i<(dense?120:5);i++){const e=s.enemies[i]!;const angle=i*2.399963;const distance=dense?90+(i%10)*22:130;Object.assign(e,{active:true,x:s.px+Math.cos(angle)*distance,y:s.py+Math.sin(angle)*distance,hp:300,maxHp:300,shield:0,family:families[i%4],speed:0,dmg:0,radius:i===4&&!dense?36:14,xp:0,elite:i%5===0,affix:i%5===0?"armored":"",flash:0,shootT:5,boss:i===4&&!dense,hitCd:0,siege:false,evolution:undefined});}
        },
        stageRepair: () => {
          const s=this.sim.state; for(const e of s.enemies)e.active=false; s.build.hp=s.build.maxHp=1e9; s.spawnT=s.eliteT=s.mineT=999;
          s.territories=[{poiId:"repair-test",poiType:"ruin",x:s.px+100,y:s.py,spec:"research",tier:1,hp:0,maxHp:300,disabled:true,garrisoned:false,heldSince:0,repairT:0}];
          this.refreshGround(true); return s.territories[0];
        },
        stageFamilyReview: (family:"kinetic"|"energy"|"defense"|"field") => {
          const s=this.sim.state;this.paused=true;this.combatFeedback.reset(s.worldNonce);
          s.originId=family==="kinetic"?"hunters":family==="energy"?"resonant":family==="defense"?"sentinels":"engineers";
          s.spawnT=s.eliteT=s.mineT=999;s.build.hp=s.build.maxHp=500;
          for(const p of s.projs)p.active=false;for(const m of s.mines)m.active=false;for(const e of s.enemies)e.active=false;
          for(const a of s.squad)a.cd=999;
          for(const f of ["kinetic","energy","defense","field"] as const){s.weaponCd[f]=999;s.weaponStage[f]=0;}
          s.weaponStage[family]=family==="energy"?4:family==="field"?0:3;s.weaponCd[family]=0;
          const e=this.sim.spawnEnemy("tank",false,false,0,100,[])!;e.speed=e.dmg=0;e.hp=e.maxHp=10000;
          if(family==="field")Object.assign(s.mines[0],{active:true,x:e.x,y:e.y,radius:60,dmg:40,life:3});
          this.refreshHUD();return e.hp;
        },
        stageBiomeReview: (biome:"verdant"|"arid"|"tundra"|"badlands") => {
          const s=this.sim.state;this.paused=true;
          s.build.hp=s.build.maxHp=500;
          for(let r=0;r<9;r++)for(let x=-r;x<=r;x++)for(let y=-r;y<=r;y++) {
            if(this.sim.chunks.get(s.worldSeed,s.worldNonce,x,y).biome!==biome)continue;
            s.px=x*CHUNK_SIZE+CHUNK_SIZE/2;s.py=y*CHUNK_SIZE+CHUNK_SIZE/2;
            let allyIndex=0;for(const ally of s.squad)if(ally.active){ally.x=s.px-65+allyIndex++*45;ally.y=s.py+65;}
            this.playerArc.setPosition(s.px,s.py);this.cameras.main.centerOn(s.px,s.py);this.refreshGround(true);return {biome:this.sim.siteBiome(s.px,s.py)};
          }
          throw new Error(`${biome} review site not found`);
        },
        stageBossReview: (pattern:"slam"|"fan"|"cross"="slam") => {
          const s=this.sim.state;this.paused=true;s.ageIndex=5;s.pendingLevels=0;s.draftOpen=false;s.draftOffers=[];
          for(const e of s.enemies)e.active=false;
          s.spawnT=s.eliteT=s.mineT=999;s.build.hp=s.build.maxHp=500;
          for(const f of ["kinetic","energy","defense","field"] as const)s.weaponCd[f]=999;
          for(const a of s.squad)a.cd=999;
          const e=this.sim.spawnEnemy("tank",false,true,0,250,[])!;
          e.encounter!.phase="warning";e.encounter!.timer=bossWarningDuration(pattern);e.encounter!.pattern=pattern;e.encounter!.aimX=s.px;e.encounter!.aimY=s.py;
          this.refreshHUD();return {hp:s.build.hp,x:s.px,y:s.py};
        },
        bossReviewState: () => ({hp:this.sim.state.build.hp,boss:this.sim.state.enemies.find(e=>e.active&&e.boss),projectiles:this.sim.state.projs.filter(p=>p.active&&p.src==="boss-fan").length,actors:this.bossRig.review()}),
        offscreenWarningFixture:(warning:boolean,layout="source-off",zoom?:number)=>{const s=this.sim.state,e=s.enemies.find(e=>e.active&&e.boss)!;const c=this.cameras.main;if(zoom)c.setZoom(zoom);
          e.x=layout==="hazard-off"?s.px:s.px+c.width/c.zoom;e.y=s.py;e.encounter!.aimX=s.px+(layout==="edge"?c.width/c.zoom/2-20:layout==="partial"?c.width/c.zoom/2+100:layout==="hazard-off"?c.width/c.zoom+600:0);e.encounter!.aimY=s.py;
          e.encounter!.phase=warning?"warning":"approach";e.encounter!.timer=.5;return {source:[e.x,e.y],aim:[e.encounter!.aimX,e.encounter!.aimY],zoom:c.zoom};},
        content153Review:()=>({hostiles:this.hostileBatch.counts(),terrain:this.terrainPainter.counts(),motion:this.allyActors.referenceReview(),heroSize:WORLD_SCALE.hero}),
        terrainArrivalReview:()=>this.terrainPainter.arrivals(),
        siteArrivalReview:()=>this.siteArrival.review(),
        equipmentMountReview:(mode:"hand"|"float")=>this.heroEquipment.setMount(mode),
        bossDefeatArtReview:()=>{const boss=this.sim.state.enemies.find(e=>e.active&&e.boss);if(boss){boss.hp=0;boss.active=false;}},
        siteArtVisibilityReview:(visible:boolean)=>{for(const a of this.landmarkArt)a.setVisible(visible);},
        stagePoiEdge:()=>{
          // Reproduction fixture only. Canonical discovery still comes from
          // step(); place the player just outside an unexplored POI chunk.
          const s=this.sim.state;this.paused=true;
          for(let cy=1;cy<40;cy++)for(let cx=1;cx<40;cx++){
            const d=this.sim.chunks.get(s.worldSeed,s.worldNonce,cx,cy);
            for(const p of d.poi){
              const edges=[{distance:p.lx,x:cx*CHUNK_SIZE-.25,y:p.wy},{distance:CHUNK_SIZE-p.lx,x:(cx+1)*CHUNK_SIZE+.25,y:p.wy},{distance:p.ly,x:p.wx,y:cy*CHUNK_SIZE-.25},{distance:CHUNK_SIZE-p.ly,x:p.wx,y:(cy+1)*CHUNK_SIZE+.25}];
              const edge=edges.find(e=>e.distance<69);
              if(!edge||s.poisWorld.includes(p.id)||s.chunksWorld.includes(`${cx},${cy}`))continue;
              s.px=edge.x;s.py=edge.y;s.build.hp=s.build.maxHp=10000;
              for(const e of s.enemies)e.active=false;
              this.playerArc.setPosition(s.px,s.py);this.cameras.main.centerOn(s.px,s.py);this.refreshGround(true);
              return {id:p.id,x:p.wx,y:p.wy,chunk:`${cx},${cy}`,known:s.poisWorld.includes(p.id)};
            }
          }throw Error("POI edge fixture unavailable");
        },
        terrainSourceParity:()=>this.terrainPainter.sourceParity(),
        siteArtReview:()=>this.landmarkArt.filter(a=>a.visible).map(a=>({texture:a.texture.key,frame:Number(a.frame.name),originY:a.originY,x:a.x,y:a.y,width:a.displayWidth,height:a.displayHeight})),
        content153HostileFixture:()=>{const s=this.sim.state;for(let i=0;i<800;i++){const p=s.projs[i]!;p.friendly=false;p.src=["enemy-burst","enemy","boss-fan"][i%3]!;p.radius=i%3===2?8:i%3===1?6:4;p.color=i%3===2?0xff736d:0xff5a5a;}return {enemies:s.enemies.filter(e=>e.active).length,projectiles:s.projs.filter(p=>p.active).length,hash:this.sim.hash()};},
        findTerrainBiome:(biome:string)=>{for(let x=-32;x<=32;x+=4)for(let y=-32;y<=32;y+=4)if(this.sim.chunks.get(this.sim.state.worldSeed,this.sim.state.worldNonce,x,y).biome===biome)return {x:x*512,y:y*512};throw Error("Biome absent in bounded visual probe");},
        startOrdinaryHostileCapture:()=>{
          const s=this.sim.state;if(s.elapsed>2)throw Error("Hostile capture requires fresh run");s.ageIndex=2;
          for(const e of s.enemies)e.active=false;for(const f of ["kinetic","energy","defense","field"] as const)s.weaponCd[f]=999;
          for(const a of s.squad)a.active=false;s.spawnT=s.eliteT=s.mineT=999;
          this.sim.spawnEnemy("ranged",false,false,0,350,[]);this.paused=false;
        },
        prepareNaturalBoss:(mode:"balanced"|"damage"|"survival"="balanced")=>{
          if(this.sim.state.elapsed>2)throw Error("Natural boss policy requires a fresh run");
          const report=naturalBossEvidence(this.sim,mode,true),s=this.sim.state;
          this.paused=false;this.actorMotion.reset();this.decisionInput.enter();this.playerArc.setPosition(s.px,s.py);this.cameras.main.centerOn(s.px,s.py);this.refreshGround(true);this.refreshHUD();return report;
        },
        startBossArena:(tier=5)=>{
          // Explicit isolated arena setup, not a natural progression claim.
          // After this call, HP/damage/phase advance only through real gameplay.
          const s=this.sim.state;if(s.elapsed>2||s.build.maxHp>=1000)throw Error("Boss arena requires fresh unmodified player HP");
          this.paused=false;s.ageIndex=5;s.elapsed=900;s.spawnT=s.eliteT=s.mineT=99999;s.px=s.py=0;
          for(const e of s.enemies)e.active=false;for(const p of s.projs)p.active=false;for(const a of s.squad)a.active=false;
          for(const f of ["kinetic","energy","defense","field"] as const){s.weaponStage[f]=tier;s.weaponCd[f]=0;}
          for(let x=-2;x<=2;x++)for(let y=-2;y<=2;y++)for(const p of this.sim.chunks.get(s.worldSeed,s.worldNonce,x,y).poi)if(!s.poisWorld.includes(p.id))s.poisWorld.push(p.id);
          this.sim.spawnEnemy("tank",false,true,0,300,[]);this.actorMotion.reset();this.decisionInput.enter();this.refreshHUD();
        },
        bossArenaState:()=>{const s=this.sim.state,e=s.enemies.find(e=>e.active&&e.boss);return {elapsed:s.elapsed,player:{x:s.px,y:s.py,hp:s.build.hp},boss:e?{x:e.x,y:e.y,hp:e.hp,maxHp:e.maxHp,...e.encounter}:null,killed:s.stats.bosses>0,over:s.over,draft:s.draftOpen};},
        bossPhaseReview:()=>{const e=this.sim.state.enemies.find(e=>e.active&&e.boss)!;e.hp=e.maxHp*.4;e.encounter!.phase="approach";e.encounter!.timer=0;this.handleEvents(this.sim.step(SIM_DT,{moveX:0,moveY:0,dashPressed:false}));},
        dodgeBossReview: () => {this.sim.state.py+=150;},
        heroActionReview: (kind:"attack"|"hurt"|"dash"|"special"|"death") => {
          // Presentation fixture only, never available in normal/QA builds.
          const s=this.sim.state;this.paused=true;s.dashT=0;
          this.heroActions=new HeroActions();this.heroActions.sync(s.worldNonce);
          if(kind==="dash")s.dashT=.18;
          else if(kind==="death")s.over=true;
          else this.heroActions.accept(kind==="attack"?{type:"weapon_fired",family:"energy",x:s.px,y:s.py,tx:s.px+100,ty:s.py}:kind==="hurt"?{type:"player_hurt",damage:1}:{type:"ability_used",id:"review"},s.elapsed,s.px,s.py);
        },
        stageCombinationRecovery: () => {
          const s=this.sim.state; this.paused=true;
          s.ageIndex=2; s.ageElapsed=0; s.draftOpen=false; s.pendingLevels=0;
          for(const e of s.enemies)e.active=false;
          s.spawnT=s.eliteT=999; s.build.hp=s.build.maxHp=1e9;
          this.refreshHUD();
        },
        requestCombinationReviewDraft: () => {
          this.paused=false;const ev:SimEvent[]=[];this.sim.gainKnowledge(5000,"review",ev);this.handleEvents(ev);
        },
        combinationReview: () => ({route:this.sim.combinationRoute(),offers:this.sim.state.draftOffers.map(o=>o.nodeId),breakthroughs:this.sim.state.breakthroughs,hash:this.sim.hash()}),
        actorAssetUrls: () => ACTOR_ASSETS,
        repairState: () => ({territories:this.sim.state.territories,label:this.repairLabel.text,visible:this.repairLabel.visible,px:this.sim.state.px,py:this.sim.state.py}),
        moveRepairOutside: () => {this.sim.state.px=this.sim.state.territories[0]!.x+CLAIM_REACH_RADIUS+20;},
        moveRepairInside: () => {this.sim.state.px=this.sim.state.territories[0]!.x;},
        stageAllocationRegression: () => {
          const s = this.sim.state;
          s.ageIndex = 3; s.elapsed = 703; s.maxLogistics = s.logistics = 6;
          s.knowledgeTotal = 1000;
          s.build.hp = s.build.maxHp = 1e9;
          s.territories = Array.from({ length: 3 }, (_, i) => ({
            poiId: `allocation-${i}`, poiType: "ruin" as const, x: s.px + i * 100, y: s.py,
            spec: "military" as const, tier: 1 as const, hp: 180, maxHp: OUTPOST_MAXHP,
            disabled: false, garrisoned: false, heldSince: 0, repairT: 0,
          }));
          for (const e of s.enemies) e.active = false;
          this.refreshHUD();
          this.toggleCivMap();
        },
        stageNoAlternativeDraft: () => {
          const s = this.sim.state;
          s.owned = this.sim.techGraph().map((n) => n.id);
          const ev: SimEvent[] = [];
          this.sim.gainKnowledge(100, "e2e", ev);
          this.handleEvents(ev);
        },
        queueSpecRegression: (poiId: string) => {
          this.showBlocking("spec-regression-beat", 60);
          this.showSpecPicker(poiId);
        },
        openSpecPicker: (poiId?: string) => {
          const s = this.sim.state;
          const id = poiId || s.territories[0]?.poiId || "e2e_outpost";
          this.showSpecPicker(id);
        },
        setOutpostSpec: (poiId: string, spec: "research" | "military" | "economy") => {
          const ev = this.sim.setOutpostSpec(poiId, spec);
          this.handleEvents(ev);
          this.refreshHUD();
          return ev; // return events array (empty if failed)
        },
        setAgeIndex: (i: number) => {
          // Test-only staging for capacity/frontier flows: jump the age
          // clock (same direct-field precedent as readyExpansion) so claims
          // run under a chosen capacity. No events, no gate bypass effects.
          const s = this.sim.state;
          s.ageIndex = Math.max(0, Math.min(i, AGES.length - 1));
          s.ageElapsed = 0;
          this.refreshHUD();
          return s.ageIndex;
        },
      };
    }


    // QA playtest harness: read-only observer, query-gated, zero gameplay effect.
    if (isQAMode(window.location.search)) this.startQa();
  }

  /** QA session bootstrap (?qa=1 only). Never runs in normal play. */
  private startQa(): void {
    const adapter = {
      frame: () => this.buildQaFrame(),
      snapshot: () => {
        try {
          return this.sim.snapshot();
        } catch {
          return "";
        }
      },
      lang: () => getLang(),
      versions: () => ({
        packageVersion: (pkg as { version: string }).version,
        worldgen: WORLDGEN_VERSION,
        content: CONTENT_VERSION,
        saveSchema: SAVE_SCHEMA_VERSION,
        buildSha: import.meta.env.SEED_BUILD_SHA,
        buildDirty: import.meta.env.SEED_BUILD_DIRTY,
      }),
      ageOrder: () => AGES as readonly string[],
    };
    this.qa = new QaSession(adapter);
    this.qa.start();
    // F4 diagnostics OFF by default (Phase 2): recording continues regardless.
    this.qaOverlay = false;
    this.qaGfx = this.add.graphics().setDepth(40);
    this.qaGfx.setVisible(false);
    this.qaText = this.add.text(10, 200, "", {
      fontSize: "12px", color: "#ffe08a", fontFamily: "monospace", backgroundColor: "rgba(0,0,0,0.65)",
    });
    this.qaText.setScrollFactor(0).setDepth(50).setVisible(false);
    const kb = this.input.keyboard;
    if (kb) {
      const toggle = (): void => {
        this.qaOverlay = !this.qaOverlay;
        this.qaGfx?.setVisible(this.qaOverlay);
        this.qaText?.setVisible(this.qaOverlay);
      };
      const handler=onceKeyboardEvent(toggle);
      kb.on("keydown-F4", handler);
      this.keyHandlers.push({ event: "keydown-F4", fn: handler });
    }
  }

  /** Map canonical sim state → plain QA frame data (observe, never mutate). */
  private buildQaFrame(): QaFrameData {
    const s = this.sim.state;
    let enemies = 0;
    for (const e of s.enemies) if (e.active) enemies++;
    let projs = 0;
    for (const p of s.projs) if (p.active) projs++;
    let pickups = 0;
    for (const k of s.pickups) if (k.active) pickups++;
    let mines = 0;
    for (const m of s.mines) if (m.active) mines++;
    let simSum = 0;
    for (const v of this.simSamples) simSum += v;
    const bossActive = s.bossIndex >= 0 && (s.enemies[s.bossIndex]?.active === true);
    const next = s.ageIndex + 1;
    const ageId = AGES[s.ageIndex] as AgeId;
    return {
      simTime: s.elapsed,
      runElapsed: s.runElapsed,
      age: ageId,
      ageIndex: s.ageIndex,
      ascension: s.ascension,
      masterSeed: s.masterSeed,
      worldSeed: s.worldSeed,
      px: s.px,
      py: s.py,
      over: s.over,
      draftOpen: s.draftOpen,
      enemies,
      projs,
      pickups,
      mines,
      enemyCap: MAX_ENEMIES,
      projCap: MAX_PROJ,
      pickupCap: MAX_PICKUP,
      bossSpawned: s.bossSpawned,
      bossIndex: s.bossIndex,
      bossActive,
      bossKills: s.stats.bosses,
      ascendReady: s.ascendReady,
      runKills: s.runKills,
      runHighestAge: s.runHighestAge,
      level: s.level,
      owned: [...s.owned],
      fps: this.fpsEMA,
      frameMs: this.frameSamples.length > 0 ? (this.frameSamples[this.frameSamples.length - 1] as number) : 0,
      simMsAvg: this.simSamples.length > 0 ? simSum / this.simSamples.length : 0,
      rendererCpuSubmitMs: this.renderSamples[this.renderSamples.length - 1],
      terrain:(()=>{const terrain=this.terrainPainter.counts();return {refreshMaxMs:this.groundMaxMs,chunkReadMaxMs:this.chunkReadMaxMs,
        uploadMaxMs:terrain.uploadMaxMs,workerPaintMaxMs:terrain.workerPaintMaxMs,uploads:terrain.uploads,uploadBytes:terrain.uploadBytes,misses:terrain.misses,pending:terrain.pending,workerFailed:terrain.workerFailed};})(),
      childCondition: childCondition(s.ascension),
      queries: this.sim.queryCount,
      buckets: this.sim.spatialBucketCount,
      chunkHits: this.sim.chunks.hits,
      chunkMisses: this.sim.chunks.misses,
      chunkCx: worldToChunk(s.px, s.py).cx,
      chunkCy: worldToChunk(s.px, s.py).cy,
      biome: this.qaBiome,
      objective: next < AGES.length
        ? (() => {
          const gates = ageGates(next, s.knowledgeTotal, this.missionStateOf(s), this.dominionStateOf(s));
          const kn = gates.find((g) => g.id === "knowledge");
          const dm = gates.find((g) => g.id === "dominion");
          const mi = gates.find((g) => g.id === "mission");
          return {
            killsHave: mi?.have ?? 0,
            killsNeed: mi?.need ?? 0,
            knowHave: kn?.have ?? 0,
            knowNeed: kn?.need ?? 0,
            elapsedHave: dm?.have ?? 0,
            elapsedNeed: dm?.need ?? 0,
          };
        })()
        : null,
      nearestPOI: this.qaPoi,
      buildSummary: `lv${s.level}+${s.stats.techsTaken}t[${s.breakthroughs.join("+") || "-"}]`,
      originId: s.originId,
      activeFamilies: activeFamilies(s.originId, s.expansionFamily),
      breakthroughs: [...s.breakthroughs],
      legacies: [...s.legacies],
      poiClaims: [...s.poiFamiliesClaimed],
      knowledgeTotal: Math.floor(s.knowledgeTotal),
      weaponStages: `k${s.weaponStage.kinetic}e${s.weaponStage.energy}d${s.weaponStage.defense}f${s.weaponStage.field}`,
      techsTaken: s.stats.techsTaken,
    };
  }

  /** Throttled world-context scan for the QA overlay (1 Hz — never per frame). */
  private scanQaWorld(): void {
    const s = this.sim.state;
    try {
      const { cx, cy } = worldToChunk(s.px, s.py);
      const here = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx, cy);
      this.qaBiome = here.biome;
      let best: QaPOIInfo | null = null;
      for (let ox = -2; ox <= 2; ox++) {
        for (let oy = -2; oy <= 2; oy++) {
          const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
          for (const poi of desc.poi) {
            const found = s.poisWorld.includes(poi.id);
            const dx = poi.wx - s.px;
            const dy = poi.wy - s.py;
            const dist = Math.hypot(dx, dy);
            const cand: QaPOIInfo = { dx, dy, dist, poiType: poi.type, found };
            if (!best) best = cand;
            else if (best.found && !found) best = cand; // undiscovered wins
            else if (best.found === found && dist < best.dist) best = cand;
          }
        }
      }
      // Prefer undiscovered POIs; fall back to nearest discovered.
      this.qaPoi = best;
    } catch {
      // QA must never break gameplay.
    }
  }

  /** Diagnostic readability overlay (F4, QA mode only): chunk + POI guidance. */
  private drawQaOverlay(): void {
    const g = this.qaGfx;
    const tx = this.qaText;
    const f = this.qa?.lastFrame;
    if (!g || !tx || !f) return;
    g.clear();
    const gx = f.chunkCx * CHUNK_SIZE;
    const gy = f.chunkCy * CHUNK_SIZE;
    g.lineStyle(2, 0xffe08a, 0.8);
    g.strokeRect(gx, gy, CHUNK_SIZE, CHUNK_SIZE);
    if (f.nearestPOI && !f.nearestPOI.found) {
      g.lineStyle(2, 0x53e0c8, 0.9);
      g.lineBetween(f.px, f.py, f.px + f.nearestPOI.dx, f.py + f.nearestPOI.dy);
      g.fillStyle(0x53e0c8, 1);
      g.fillCircle(f.px + f.nearestPOI.dx, f.py + f.nearestPOI.dy, 8);
    }
    const o = f.objective;
    tx.setText(
      `QA pos ${f.px.toFixed(0)},${f.py.toFixed(0)}  chunk ${f.chunkCx},${f.chunkCy}  biome ${f.biome}\n` +
      `POI ${f.nearestPOI ? `${f.nearestPOI.poiType} ${f.nearestPOI.dist.toFixed(0)}u${f.nearestPOI.found ? " (found)" : ""}` : "none nearby"}\n` +
      `obj ${o ? `☠${Math.min(o.killsHave, o.killsNeed)}/${o.killsNeed} kn${o.knowHave}/${o.knowNeed} t${o.elapsedHave}/${o.elapsedNeed}` : "max age"}\n` +
      `foes ${f.enemies}  boss ${f.bossSpawned ? (f.bossActive ? "FIGHT" : "down?") : "—"}  asc ${f.ascension}`,
    );
  }

  /** Language switch: DOM text only — sim/RNG/state untouched (tested). */
  private applyLanguage(code: "en" | "th"): void {
    const from = getLang();
    const qaBefore = this.qa ? this.qa.beforeLangSwitch() : "";
    const sv = loadSave(localStorage);
    sv.settings.lang = code;
    storeSave(localStorage, sv);
    setLang(code);
    document.getElementById("pause-screen")?.remove();
    this.buildHUD();
    if (this.paused) this.showPause();
    // New prose lengths change node footprints: re-layout the open map.
    if (this.techMapOpen && this.techMapView) this.techMapView.relayout();
    if (this.qa && qaBefore) this.qa.afterLangSwitch(qaBefore, from, code);
  }

  private unlockAudio = (): void => {
    sfx.unlock();
  };

  private onHidden = (): void => {
    const s = this.sim?.state;
    if (s && document.hidden && !this.paused && !s.over && !s.draftOpen) this.togglePause();
  };

  private onShutdown(): void {
    this.bossLaneObserver?.disconnect();this.bossLaneObserver=undefined;
    this.decisionInput.dispose();
    clearNotifications();
    this.game.events.off(Phaser.Core.Events.PRE_RENDER, this.onPreRender);
    this.game.events.off(Phaser.Core.Events.POST_RENDER, this.onPostRender);
    this.techMapView?.destroy();
    this.techMapView = null;
    this.tutorial?.dispose();
    this.tutorial = null;
    this.qa?.dispose();
    this.qa = null;
    this.qaGfx = null;
    this.qaText = null;
    this.bossGfx = null;
    document.removeEventListener("visibilitychange", this.onHidden);
    this.input.off("pointerdown", this.unlockAudio);
    const kb = this.input.keyboard;
    if (kb) for (const h of this.keyHandlers) kb.off(h.event, h.fn);
    this.keyHandlers = [];
  }

  // ------------------------------------------------------------- HUD (DOM)
  private buildHUD(): void {
    this.bossLaneObserver?.disconnect();
    clearUI();
    const root = uiRoot();
    const hud = el("div", "hud");
    // Top-left: ONE actionable macro objective + compass (§11/20).
    const topLeft = el("div", "hud-top-left");
    this.fpsHud = el("div", "hud-fps");
    this.fpsHud.id = "fps-hud";
    this.fpsHud.textContent = "FPS: —";
    topLeft.appendChild(this.fpsHud);
    this.fpsHudT = 0;
    const age = el("div", "hud-objective");
    topLeft.appendChild(age);
    const compass = el("div", "nav-compass");
    topLeft.appendChild(compass);
    hud.appendChild(topLeft);
    // Top strip secondary info (level/time/kills/seed; collapses at density).
    const top = el("div", "hud-top");
    const stats = el("div", "hud-stats");
    top.appendChild(stats);
    hud.appendChild(top);
    // Bottom-left: ONE player command dock (HP/origin/squad/ability/techmap).
    const dock = el("div", "hud-dock-bl");
    const status = el("div", "status-card");
    const hpLine = el("div", "status-hp");
    const hpBar = el("div", "mini-bar");
    const hpFill = document.createElement("div");
    hpFill.className = "mini-fill hp";
    hpBar.appendChild(hpFill);
    status.appendChild(hpLine);
    status.appendChild(hpBar);
    const identLine = el("div", "status-ident");
    status.appendChild(identLine);
    const squadLine = el("div", "status-squad");
    status.appendChild(squadLine);
    dock.appendChild(status);
    // Bottom-center knowledge progress (SECONDARY).
    const know = el("div", "knowledge-card");
    const knowLabel = el("div", "knowledge-label", "ui.knowledge");
    const codex=document.createElement("img");codex.src=KNOWLEDGE_ICON;codex.alt="";codex.width=24;codex.height=24;
    codex.className="knowledge-icon";
    const knowNums = el("div", "knowledge-nums");
    const knowValue=el("div","knowledge-value");knowValue.append(codex,knowNums);
    const knowBar = el("div", "mini-bar");
    const knowFill = document.createElement("div");
    knowFill.className = "mini-fill kn";
    knowBar.appendChild(knowFill);
    know.appendChild(knowLabel);
    know.appendChild(knowValue);
    know.appendChild(knowBar);
    hud.appendChild(know);
    // Top-right next-age checklist card (PRIMARY objective).
    const topRight = el("div", "hud-top-right");
    const ageCard = el("div", "age-card");
    topRight.appendChild(ageCard);
    // Build plan line (kept class for e2e; shows pinned target + goals).
    const goals = el("div", "hud-goals");
    topRight.appendChild(goals);
    // Persistent action container OUTSIDE wiped blocks (P1-01 class).
    const ascendWrap = el("div", "hud-ascend");
    topRight.appendChild(ascendWrap);
    hud.appendChild(topRight);
    const encounter=el("section","boss-encounter");encounter.id="boss-encounter";encounter.hidden=true;
    encounter.setAttribute("aria-live","polite");hud.appendChild(encounter);
    // Tech map button (T also works).
    const techBtn = document.createElement("button");
    techBtn.id = "techmap-btn";
    techBtn.className = "btn prompt-badge";
    const tIcon = document.createElement("img");
    tIcon.src = SEED_ASSETS.prompts.t;
    tIcon.className = "prompt-key-icon";
    tIcon.alt = "T";
    techBtn.appendChild(tIcon);
    const tText = document.createElement("span");
    tText.textContent = ` ${t("ui.techMap")} [T]`;
    techBtn.appendChild(tText);
    techBtn.addEventListener("click", () => this.toggleTechMap());
    dock.appendChild(techBtn);
    // Civilization map button (M also works): disclosed only once territory
    // management is relevant (first outpost claimed).
    const civBtn = document.createElement("button");
    civBtn.id = "civmap-btn";
    civBtn.className = "btn prompt-badge";
    civBtn.style.display = "none";
    const mIcon = document.createElement("img");
    mIcon.src = SEED_ASSETS.prompts.m;
    mIcon.className = "prompt-key-icon";
    mIcon.alt = "M";
    civBtn.appendChild(mIcon);
    const mText = document.createElement("span");
    mText.textContent = ` ${t("ui.civilizationMap")} [M]`;
    civBtn.appendChild(mText);
    civBtn.addEventListener("click", () => this.toggleCivMap());
    dock.appendChild(civBtn);
    hud.appendChild(dock);
    // Tactical minimap (bottom-right zone).
    const mmZone = el("div", "hud-bottom-right");
    const mm = document.createElement("canvas");
    mm.id = "minimap";
    mm.width = 148;
    mm.height = 148;
    mmZone.appendChild(mm);
    hud.appendChild(mmZone);
    const bossBar = el("div", "boss-bar");
    bossBar.setAttribute("role","progressbar");bossBar.setAttribute("aria-label",t("ui.boss"));
    bossBar.setAttribute("aria-valuemin","0");bossBar.setAttribute("aria-valuemax","100");
    bossBar.style.display = "none";
    const bossFill = document.createElement("div");
    bossFill.className = "boss-fill";
    bossBar.appendChild(bossFill);
    const bossLabel = el("div", "boss-label", "ui.boss");
    bossBar.appendChild(bossLabel);
    // A single flowing center lane reserves space for stats, HP and phase text.
    // Its measured bottom also keeps notifications clear at 200% TH wrapping.
    top.append(bossBar,encounter);
    this.bossLaneObserver=new ResizeObserver(()=>root.style.setProperty("--top-lane-bottom",`${top.getBoundingClientRect().bottom}px`));
    this.bossLaneObserver.observe(top);
    root.appendChild(hud);
    // Context stack (v0.23.1): ONE stacked container for contextual surfaces
    // (claim prompt, coachmark banner, interaction hints) in the left-center
    // lane — clear of the Knowledge bar, command dock, minimap, and Next Age
    // card. Bottom-left dock holds player commands ONLY.
    const stack = el("div", "");
    stack.id = "context-stack";
    const terrBar = el("div", "territory-bar");
    stack.appendChild(terrBar);
    const hint = el("div", "onboard-hint");
    hint.style.display = "none";
    stack.appendChild(hint);
    root.appendChild(stack);
    this.surfaces.bindContext(stack, () => this.updateTerritoryBar());
    this.hud = {
      stats, age, compass, status, hpLine, hpFill, identLine, squadLine,
      know, knowNums, knowFill, ageCard, goals, ascendWrap, terrBar, techBtn,
      civBtn, minimap: mm, bossBar, bossFill, hint,
    };
    this.loadout=new AbilityLoadout();hud.append(this.loadout.node);
    this.refreshHUD();
  }

  private refreshHUD(): void {
    const encounter=document.getElementById("boss-encounter");
    const boss=this.sim.state.enemies.find(e=>e.active&&e.boss);
    if(encounter){
      encounter.hidden=!boss;
      if(boss?.encounter){
        const a=boss.encounter,identity=`${a.enraged}:${a.phase}:${a.pattern}:${getLang()}`;
        if(encounter.dataset.identity!==identity){
          encounter.dataset.identity=identity;encounter.dataset.phase=a.phase;
          encounter.replaceChildren(el("strong","",a.enraged?"combat.boss.phase2":"combat.boss.phase1"),el("span","",`combat.boss.${a.phase}` as EnKeys));
          if(["warning","commit","attack"].includes(a.phase))encounter.appendChild(el("small","",`combat.boss.${a.pattern}` as EnKeys));
        }
      }
    }
    this.loadout?.update(this.sim.state);
    const s = this.sim.state;
    const { stats, age, hpLine, hpFill, identLine, squadLine, knowNums, knowFill, ageCard, goals } = this.hud;
    if (!stats || !age || !hpLine || !hpFill || !identLine || !squadLine || !knowNums || !knowFill || !ageCard || !goals) return;
    const ageId = AGES[s.ageIndex] as AgeId;
    const mm = Math.floor(s.runElapsed / 60);
    const ss = Math.floor(s.runElapsed % 60).toString().padStart(2, "0");
    // Top strip: level · time · kills · seed (secondary, compact).
    stats.innerHTML = "";
    const add = (txt: string, cls = ""): void => {
      const span = document.createElement("span");
      if (cls) span.className = cls;
      span.textContent = txt;
      stats.appendChild(span);
    };
    add(`${t("ui.level")} ${s.level}`);
    add(`${mm}:${ss}`);
    add(`☠ ${s.stats.kills}`);
    add(this.masterSeed, "hud-seed");
    // Status card: HP number + compact bar, origin · age, squad state.
    hpLine.textContent = `♥ ${Math.ceil(Math.max(0, s.build.hp))} / ${Math.ceil(s.build.maxHp)}`;
    hpFill.style.width = `${Math.max(0, (s.build.hp / s.build.maxHp) * 100)}%`;
    const origin = ORIGINS.find((o) => o.id === s.originId);
    const fams = activeFamilies(s.originId, s.expansionFamily)
      .map((f) => t(`family.${f}` as EnKeys)).join("+");
    identLine.textContent = `${origin ? t(origin.nameKey) : s.originId} (${fams}) · ${t(`age.${ageId}` as EnKeys)}`;
    const alive = s.squad.filter((a) => a.active).length;
    const abil = ORIGIN_ABILITY[originById(s.originId).id];
    const abilTxt = s.abilityCd > 0 ? `${t("ui.ability")} ${Math.ceil(s.abilityCd)}s` : `${t("ui.ability")}: ${t(abil.nameKey)} [F]`;
    squadLine.innerHTML = "";
    const squadTitle = document.createElement("span");
    squadTitle.textContent = `${t(ORIGIN_SQUAD_NAME[originById(s.originId).id])} ${alive}/${this.sim.mobileSquadLimit()} · `;
    squadLine.appendChild(squadTitle);

    const modeBadge = document.createElement("span");
    modeBadge.className = "prompt-badge";
    // Progressive disclosure: squad command keys (Q/E/R) appear only once
    // squad orders are actually relevant (first outpost claimed).
    if (s.territories.length === 0) modeBadge.style.display = "none";
    const modeIcon = document.createElement("img");
    modeIcon.className = "prompt-key-icon";
    const modeKey = s.squadMode === "focus" ? "e" : s.squadMode === "hold" ? "r" : "q";
    modeIcon.src = SEED_ASSETS.prompts[modeKey];
    modeIcon.alt = modeKey.toUpperCase();
    modeBadge.appendChild(modeIcon);
    const modeText = document.createElement("span");
    modeText.textContent = ` ${s.squadMode.toUpperCase()} · `;
    modeBadge.appendChild(modeText);
    squadLine.appendChild(modeBadge);

    const abilBadge = document.createElement("span");
    abilBadge.className = "prompt-badge";
    const abilIcon = document.createElement("img");
    abilIcon.className = "prompt-key-icon";
    abilIcon.src = SEED_ASSETS.prompts.f;
    abilIcon.alt = "F";
    abilBadge.appendChild(abilIcon);
    const abilSpan = document.createElement("span");
    abilSpan.textContent = ` ${abilTxt}`;
    abilBadge.appendChild(abilSpan);
    squadLine.appendChild(abilBadge);
    // Civilization Map button: disclosed once territory management matters.
    const civBtn = this.hud.civBtn as HTMLElement | undefined;
    if (civBtn) civBtn.style.display = s.territories.length > 0 ? "" : "none";
    // Knowledge card: progress toward the next age's threshold.
    const next = s.ageIndex + 1;
    const nextNeed = next < AGES.length ? (AGE_DEFS[next]?.knowledgeThreshold ?? 1) : 1;
    knowNums.textContent = `${Math.floor(s.knowledgeTotal)} / ${nextNeed}`;
    knowFill.style.width = `${Math.min(100, (s.knowledgeTotal / Math.max(1, nextNeed)) * 100)}%`;
    // Age card: one checklist row per gate (the SAME predicate as the sim).
    const ageCardKey=JSON.stringify([next,t("ui.nextAge"),s.ownedTags,s.breakthroughs,next<AGES.length?ageGates(next,s.knowledgeTotal,this.missionStateOf(s),this.dominionStateOf(s)):Math.floor(s.knowledgeTotal)]);
    if(ageCardKey!==this.lastAgeCardKey){
    this.lastAgeCardKey=ageCardKey;
    const recipeFocused=document.activeElement?.id==="combination-map";
    ageCard.innerHTML = "";
    if (next < AGES.length) {
      const title = document.createElement("div");
      title.className = "age-card-title";
      title.textContent = `${t("ui.nextAge")}: ${t(`age.${AGES[next] as AgeId}` as EnKeys)}`;
      ageCard.appendChild(title);
      const gates = ageGates(next, s.knowledgeTotal, this.missionStateOf(s), this.dominionStateOf(s));
      for (const g of gates) {
        const row = document.createElement("div");
        row.className = "gate-row" + (g.done ? " done" : "");
        const mark = document.createElement("span");
        mark.className = "gate-mark";
        mark.textContent = g.done ? "✓" : "✗";
        const lab = document.createElement("span");
        lab.className = "gate-label";
        lab.textContent = `${t(g.labelKey)} ${g.have}/${g.need}`;
        const bar = document.createElement("div");
        bar.className = "gate-bar";
        const fill = document.createElement("div");
        fill.className = "gate-fill";
        fill.style.width = `${g.need > 0 ? Math.min(100, (g.have / g.need) * 100) : 100}%`;
        bar.appendChild(fill);
        row.appendChild(mark);
        row.appendChild(lab);
        row.appendChild(bar);
        ageCard.appendChild(row);
        for (const mstep of g.mission) {
          const sub = document.createElement("div");
          sub.className = "gate-sub" + (mstep.done ? " done" : "");
          sub.textContent = `${mstep.done ? "✓" : "○"} ${t(mstep.labelKey)} ${mstep.have}/${mstep.need}`;
          ageCard.appendChild(sub);
          if (mstep.kind === "breakthrough" && !mstep.done) {
            const route = this.sim.combinationRoute();
            const help = el("div", "combination-route");
            help.appendChild(el("strong","combination-title",undefined,`${t(mstep.labelKey)} ${mstep.have}/${mstep.need}`));
            help.appendChild(el("p","", "ui.combinationRoute"));
            for (const item of route.ingredients) {
              const key = tagDisplayKey(item.tag);
              help.appendChild(el("div", "combination-ingredient", undefined,
                `${item.acquired ? "✓" : "○"} ${key ? t(key) : ""}`));
            }
            const go = button("ui.combinationMap", () => {
              if (this.blockingModal || s.draftOpen) return;
              this.sim.pinTarget(route.recipe.id);
              this.toggleTechMap();
            });
            go.id = "combination-map";
            help.appendChild(go);
            ageCard.appendChild(help);
            if(recipeFocused)go.focus({preventScroll:true});
          }
        }
        for (const dsub of g.sub) {
          const sub = document.createElement("div");
          sub.className = "gate-sub" + (dsub.done ? " done" : "");
          sub.textContent = `${dsub.done ? "✓" : "○"} ${t(dsub.labelKey)} ${dsub.have}/${dsub.need}`;
          ageCard.appendChild(sub);
        }
      }
    } else {
      ageCard.textContent = `${t(`age.${ageId}` as EnKeys)} · ${t("ui.progressKnowledge")} ${Math.floor(s.knowledgeTotal)}`;
    }
    }
    const readiness=this.sim.raidReadiness();
    let raidLine=ageCard.querySelector<HTMLElement>(".raid-readiness");
    if(!raidLine){raidLine=el("div","raid-readiness");ageCard.appendChild(raidLine);}
    raidLine.textContent=t(`raid.${readiness.status}` as EnKeys)+(readiness.seconds===null||readiness.status==="active"?"":` ${Math.ceil(readiness.seconds)}s`)+(readiness.gateBlocked?` · ${t("raid.gateReady")}`:"");
    const targetPost=s.territories.find(p=>p.poiId===readiness.targetId);
    if(targetPost){const dx=targetPost.x-s.px,dy=targetPost.y-s.py,d=Math.hypot(dx,dy);
      const bearing=d<40?"◉":["→","↘","↓","↙","←","↖","↑","↗"][(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8]!;
      raidLine.textContent+=` · ${t("raid.target")}: ${bearing} ${Math.round(d)}u`;
    }
    let logisticsLine=ageCard.querySelector<HTMLElement>(".logistics-status");
    if(!logisticsLine){logisticsLine=el("div","logistics-status");ageCard.appendChild(logisticsLine);}
    const ledger=this.sim.logisticsStatus();
    logisticsLine.textContent=`${t("ui.logisticsLine")} ${ledger.used}/${ledger.maximum}`+(ledger.overcommit?` · ${t("ui.signalReserve")}`:"");
    // Mission one-liner under the top strip (QA structural class retained).
    age.textContent = this.frontierObjectiveText();
    // Persistent Ascension entry (STAY dismisses the offer screen; this stays).
    const wrap = this.hud.ascendWrap;
    if (wrap) {
      const want = s.ascendReady && !s.over;
      let ab = wrap.querySelector("button");
      if (want && !ab) {
        ab = document.createElement("button");
        ab.className = "btn primary";
        ab.style.pointerEvents = "auto";
        ab.textContent = t("ui.ascend");
        ab.addEventListener("click", () => this.showLegacyPick());
        wrap.appendChild(ab);
      } else if (!want && ab) {
        ab.remove();
      }
    }
    // Build plan line: pinned target + nearest breakthrough goals.
    const pin = s.pinnedTarget !== "" ? `${t("ui.buildPlan")}: ${this.planLabel(s.pinnedTarget)} · ` : "";
    const near = nearestBreakthroughs([...s.ownedTags], [...s.breakthroughs], 2)
      .map((p) => `${t(p.titleKey)} ${p.have}/${p.need}`).join(" · ");
    goals.textContent = pin + near;
    this.refreshBossBar();
    this.navT -= 0.15;
    if (this.navT <= 0) {
      this.navT = 1;
      this.applyHudDensity();
      this.updateFrontier();
      this.updateCompass();
      this.updateTerritoryBar();
      this.drawMinimap();
    }
    this.updateOnboard();
  }

  /** Mission counters for the shared advancement contract (HUD == sim). */
  private missionStateOf(s: RunSimulation["state"]): import("../../core/progression/missions").MissionState {
    const active = activeTerritories(s.territories);
    return {
      ascension: s.ascension,
      ageKills: s.ageKills,
      territoriesClaimed: s.territories.length,
      elitesAge: s.elitesAge,
      outpostsTier2: active.filter((x) => x.tier >= 2).length,
      raidsSurvived: s.raidsSurvived,
      signalSecured: s.signalSecured,
      breakthroughs: s.breakthroughs.length,
    };
  }

  /** Dominion control state (disabled outposts never count). */
  private dominionStateOf(s: RunSimulation["state"]): import("../../core/progression/ages").DominionState {
    const active = activeTerritories(s.territories);
    return {
      active: active.length,
      specialized: active.filter((x) => x.spec !== "").length,
      tier2: active.filter((x) => x.tier >= 2).length,
      raidsSurvived: s.raidsSurvived,
    };
  }

  /** ONE actionable macro objective, top-left (§11/20). */
  private frontierObjectiveText(): string {
    const s = this.sim.state;
    const f = this.frontierFocus;
    const arrowFor = (dx: number, dy: number): string => {
      const arrows = ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"];
      const idx = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8;
      return arrows[idx] as string;
    };
    if (!f) return t(`age.${AGES[s.ageIndex] as AgeId}` as EnKeys);
    const site = f.site;
    const dist = site ? Math.hypot(site.x - s.px, site.y - s.py).toFixed(0) : "";
    const arrow = site ? arrowFor(site.x - s.px, site.y - s.py) : "";
    switch (f.kind) {
      case "raid": {
        const terr = s.territories.find((x) => x.poiId === site?.poiId);
        const nm = terr ? t(`poi.${terr.poiType}.name` as EnKeys) : "";
        const secs = s.raid ? Math.max(0, Math.ceil(s.raid.tMinus)) : 0;
        return `${t("ui.raidIncoming")}: ${nm} ${secs}s ${arrow} ${dist}u`;
      }
      case "stronghold": {
        const bossOn = s.bossIndex >= 0 && s.enemies[s.bossIndex]?.active === true;
        return bossOn
          ? `${t("ui.boss")} ${arrow} ${dist}u`
          : `${t("objective.assaultStronghold")} ${arrow} ${dist}u`;
      }
      case "claim": {
        const nm = site ? t(`poi.${site.poiType}.name` as EnKeys) : "";
        return `${t("ui.establishOutpost")}: ${nm} ${arrow} ${dist}u`;
      }
      case "clear": {
        const nm = site ? t(`poi.${site.poiType}.name` as EnKeys) : "";
        return `${nm}: ${t("ui.claimNeedClear")} (${site?.foes ?? 0}) ${arrow} ${dist}u`;
      }
      case "dominion":
        return `${t("gate.dominion")}: ${f.dominionHave ?? 0}/${f.dominionNeed ?? 0} ${arrow}`;
      case "site": {
        const nm = site ? t(`poi.${site.poiType}.name` as EnKeys) : "";
        return `◈ ${nm} ${arrow} ${dist}u`;
      }
    }
  }

  /** Human label for a pinned target (tech name or breakthrough title). */
  private planLabel(id: string): string {
    const s = this.sim.state;
    const node = this.sim.techGraph().find((n) => n.id === id);
    if (node) return t(node.titleKey as EnKeys);
    const b = BREAKTHROUGHS.find((x) => x.id === id);
    if (b) return t(b.titleKey);
    return t("path.invalid");
  }

  /** Squad order / origin ability entry points (Q/E/R/F). */
  private issueSquad(mode: "follow" | "focus" | "hold"): void {
    const s = this.sim.state;
    if (s.over || this.techMapOpen) return;
    this.handleEvents(this.sim.setSquadMode(mode));
  }

  private useAbility(): void {
    const s = this.sim.state;
    if (s.over || this.techMapOpen) return;
    this.handleEvents(this.sim.tryAbility());
  }

  /**
   * Contextual territory prompt (ONE action at a time, in #context-stack):
   * specialize the undecided claim, claim the nearest clear site, or upgrade
   * the eligible post. Never a permanent button wall in the command dock.
   */
  private updateTerritoryBar(): void {
    const bar = this.hud.terrBar;
    if (!bar) return;
    const s = this.sim.state;
    const previousPreview=bar.querySelector<HTMLDetailsElement>(".site-preview");
    const previewFocused=!!previousPreview?.contains(document.activeElement);
    bar.innerHTML = "";
    const purpose = (key: "ui.specPurpose" | "ui.claimPurpose"): void => {
      const p = document.createElement("div");
      p.className = "context-purpose";
      p.textContent = t(key);
      bar.appendChild(p);
    };
    const pending = s.territories.filter((x) => x.spec === "" && !x.disabled);
    // An unaffordable deferred claim must not hide an eligible first Signal.
    const unspecced = pending.find((x) => this.sim.canSetOutpostSpec(x.poiId, "research")) ?? pending[0];
    if (unspecced) {
      const b = document.createElement("button");
      b.className = "btn terr-spec-btn";
      b.textContent = `${t("ui.outpostSpec")} (${t(`poi.${unspecced.poiType}.name` as EnKeys)})`;
      b.addEventListener("click", () => this.showSpecPicker(unspecced.poiId));
      bar.appendChild(b);
      purpose("ui.specPurpose");
    }
    // Free claims remain available alongside deferred specialization.
    // Logistics is stated whenever the frontier is full and ANY unclaimed
    // site is near — contested or clear. Claiming itself has no cost.
    const nearby=this.sim.nearbyClaimSites()[0];
    if(nearby && nearby.reason!=="CLAIMABLE"){
      const message=el("p","claim-status",`claim.${nearby.reason}` as EnKeys);
      message.dataset.claimReason=nearby.reason;
      if(nearby.remainingDistance)message.append(` (${Math.ceil(nearby.remainingDistance)}u)`);
      bar.appendChild(message);
    }
    const anySite = this.sim.claimablePOIs()[0];
    if ((unspecced || anySite) && s.logistics >= s.maxLogistics) {
      this.appendLogisticsLine(bar, s);
    }
    const c = this.sim.claimablePOIs().find((x) => x.clear);
    const previewSite=c??anySite;
    if(previewSite){
      const facts=this.sim.outpostPreview(previewSite.x,previewSite.y,previewSite.poiType);
      if(facts){
        const details=el("details","site-preview") as HTMLDetailsElement;
        details.dataset.poiId=previewSite.poiId;details.open=previousPreview?.dataset.poiId===previewSite.poiId && previousPreview.open;details.appendChild(el("summary","",undefined,t("ui.sitePreview")));
        details.appendChild(el("p","",undefined,t(("biome."+facts.biome+".role") as EnKeys)));
        details.appendChild(el("p","",undefined,`${t("ui.hostiles")}: ${facts.hostiles} · ${t("ui.range")}: ${Math.round(facts.distance)}`));
        for(const option of facts.options) details.appendChild(el("p","",undefined,`${this.outpostBonusText(option.spec,1,previewSite.x,previewSite.y)} · ${t("ui.logisticsCost")}: ${option.cost}`));
        bar.appendChild(details);
        if(previewFocused && previousPreview?.dataset.poiId===previewSite.poiId)details.querySelector("summary")?.focus({preventScroll:true});
      }
    }
    if (c) {
      // No claim button while hostiles remain: the objective line + C key
      // carry the clear state instead (§9).
      const b = document.createElement("button");
      b.className = "btn terr-claim-btn";
      b.textContent = `${t("ui.claim")}: ${t(`poi.${c.poiType}.name` as EnKeys)} [C]`;
      b.addEventListener("click", () => {
        this.attemptClaim(c.poiId);
      });
      bar.appendChild(b);
      purpose("ui.claimPurpose");
      return;
    }
    const up = s.territories.find(
      (x) => !x.disabled && x.spec !== "" && x.tier === 1 && s.elapsed - x.heldSince >= TIER2_HOLD_SEC,
    );
    if (up && up.spec !== "") {
      // BEFORE confirmation: current tier → next, current bonus → new bonus,
      // exact Knowledge cost. Unaffordable stays visible but disabled.
      const cost = outpostUpgradeCost(s.ageIndex);
      const upgradeStatus = this.sim.outpostUpgradeStatus(up.poiId);
      const afford = upgradeStatus.allowed;
      const b = document.createElement("button");
      b.className = "btn terr-up-btn";
      b.disabled = !afford;
      b.textContent = `${t("ui.upgrade")} (${t(`poi.${up.poiType}.name` as EnKeys)})`;
      if (afford) b.addEventListener("click", () => {
        this.qa?.noteSimEvent("upgrade_attempt", up.poiId);
        this.handleEvents(this.sim.upgradeOutpost(up.poiId));
      });
      bar.appendChild(b);
      const line = document.createElement("div");
      line.className = "context-purpose";
      line.textContent = afford
        ? `T1 → T2 · ${this.outpostBonusText(up.spec, 1, up.x, up.y)} → ${this.outpostBonusText(up.spec, 2, up.x, up.y)} · ${t("ui.upgradeCost")}: ${cost} ${t("ui.knowledge")}`
        : upgradeStatus.reason === "logistics" ? `${t("ui.upgradeNeedLogistics")} (+${upgradeStatus.logisticsCost})`
        : `${t("ui.upgradeNeedKnowledge")} (${t("ui.upgradeCost")}: ${cost} ${t("ui.knowledge")})`;
      bar.appendChild(line);
    }
  }

  /** Logistics truth line shared by the full-logistics prompt states. */
  private appendLogisticsLine(bar: HTMLElement, s: RunSimulation["state"]): void {
    const full = document.createElement("div");
    full.className = "logistics-full";
    full.textContent = `${t("ui.logisticsFull")} — ${t("ui.logisticsLine")} ${s.logistics}/${s.maxLogistics}`;
    bar.appendChild(full);
  }

  /** REAL per-outpost mechanical bonus text (same derivation as the sim). */
  private outpostBonusText(spec: OutpostSpec, tier: 1 | 2, x?: number, y?: number): string {
    const multiplier = x === undefined || y === undefined ? 1 : this.sim.siteMultiplier(x, y, spec);
    if (spec === "research") return `+${Number((tier * 10 * multiplier * this.sim.researchBonusScale()).toFixed(2))}% ${t("ui.knowledge")}`;
    if (spec === "economy") return `+${(1.5 * tier * multiplier).toFixed(2)} HP/s`;
    return `+1 ${t("ui.squad")}`;
  }

  /**
   * Frontier site scan (1 Hz, shared by objective/compass/minimap/civmap).
   * Discovered, unclaimed POIs within 2000u with live foe counts + states.
   */
  private scanSites(): FrontierSite[] {
    const s = this.sim.state;
    const out: FrontierSite[] = [];
    if (s.over) return out;
    const claimed = new Set(s.territories.map((t) => t.poiId));
    const { cx, cy } = worldToChunk(s.px, s.py);
    for (let ox = -4; ox <= 4; ox++) {
      for (let oy = -4; oy <= 4; oy++) {
        const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
        for (const poi of desc.poi) {
          if (!s.poisWorld.includes(poi.id) || claimed.has(poi.id)) continue;
          const dist = Math.hypot(poi.wx - s.px, poi.wy - s.py);
          if (dist > 2000) continue;
          this.siteScratch.length = 0;
          const foes = this.sim.queryRadius(poi.wx, poi.wy, CLAIM_CLEAR_RADIUS, this.siteScratch);
          out.push({
            poiId: poi.id,
            poiType: poi.type,
            x: poi.wx,
            y: poi.wy,
            dist,
            foes: foes.length,
            state: classifySite({
              discovered: true, claimed: false, disabled: false, underAttack: false,
              foes: foes.length, inReach: dist <= CLAIM_REACH_RADIUS,
            }),
          });
        }
      }
    }
    out.sort((a, b) => a.dist - b.dist);
    return out;
  }

  /** Recompute the single shared frontier focus (§11/22). */
  private updateFrontier(): void {
    const s = this.sim.state;
    this.frontierSites = this.scanSites();
    let raid: { poiId: string; x: number; y: number; tMinus: number } | null = null;
    if (s.raid) {
      const terr = s.territories.find((x) => x.poiId === s.raid?.poiId);
      if (terr) raid = { poiId: terr.poiId, x: terr.x, y: terr.y, tMinus: s.raid.tMinus };
    }
    const next = s.ageIndex + 1;
    const req = next < AGES.length ? AGE_DEFS[next]?.dominion : undefined;
    const ds = this.dominionStateOf(s);
    this.frontierFocus = frontierObjective({
      raid,
      stronghold: s.stronghold,
      bossActive: s.bossIndex >= 0 && (s.enemies[s.bossIndex]?.active === true),
      openSites: this.frontierSites,
      dominionHave: ds.active,
      dominionNeed: req?.outposts ?? 0,
    });
    // Telemetry (§36): site states, focus changes, claim prompts, first claim,
    // and dominion progression. Read-only observation, never gameplay.
    const qa = this.qa;
    if (!qa) return;
    for (const site of this.frontierSites) {
      if (site.state === "CONTESTED" || site.state === "CLAIMABLE") {
        if (!this.claimPromptsSeen.has(site.poiId)) {
          this.claimPromptsSeen.add(site.poiId);
          qa.noteSimEvent("site_prompt", `${site.state}:${site.poiType}`);
        }
      }
    }
    const focusId = this.frontierFocus?.site?.poiId ?? this.frontierFocus?.kind ?? "";
    if (focusId !== this.prevFocusId) {
      this.prevFocusId = focusId;
      if (focusId) qa.noteSimEvent("focus", focusId);
    }
    if (!this.firstClaimLogged && s.territories.length > 0) {
      this.firstClaimLogged = true;
      qa.noteSimEvent("first_claim", `${s.elapsed.toFixed(1)}s`);
    }
    if (ds.active !== this.prevDominion) {
      this.prevDominion = ds.active;
      qa.noteSimEvent("dominion", `${ds.active}/${req?.outposts ?? 0}`);
    }
  }

  /** [C] claims the nearest valid, clear, in-reach, unclaimed site. */
  private attemptClaim(poiId:string):void {
    const status=this.sim.claimStatus(poiId);
    this.qa?.noteSimEvent("claim_attempt",poiId);
    if(status.reason!=="CLAIMABLE"){toast(`claim.${status.reason}` as EnKeys);return;}
    this.handleEvents(this.sim.claimTerritory(poiId));
    const terr=this.sim.state.territories.find(t=>t.poiId===poiId);
    if(terr&&terr.spec==="")this.showSpecPicker(poiId);
  }
  private claimNearestSite(): void {
    const s = this.sim.state;
    if (s.over || s.draftOpen || this.paused || this.techMapOpen || this.civMapOpen || this.blockingModal) return;
    const c = this.sim.claimablePOIs().find((x) => x.clear);
    if (!c) {
      const site=this.sim.nearbyClaimSites()[0];
      toast(site ? `claim.${site.reason}` as EnKeys : "claim.NO_SITE");
      return;
    }
    // v0.24: claim is free; Logistics only consumed when specializing (setOutpostSpec).
    this.attemptClaim(c.poiId);
  }

  /** Optional specialization: free claims can be specialized later. */
  private showSpecPicker(poiId: string): void {
    const specs: Array<{ id: OutpostSpec; name: EnKeys; desc: EnKeys }> = [
      { id: "research", name: "ui.specResearch", desc: "ui.specResearchDesc" },
      { id: "military", name: "ui.specMilitary", desc: "ui.specMilitaryDesc" },
      { id: "economy", name: "ui.specEconomy", desc: "ui.specEconomyDesc" },
    ];
    this.showBlocking("spec-screen", 0, (screen) => {
      const s = this.sim.state;
      const panel = el("div", "panel panel-md");
      panel.appendChild(el("h2", "", "ui.outpostSpec"));
      
      // Show current logistics
      const logisticsInfo = el("div", "logistics-info");
      logisticsInfo.textContent = `${t("ui.logisticsLine")} ${s.logistics}/${s.maxLogistics}`;
      panel.appendChild(logisticsInfo);
      panel.appendChild(el("p","logistics-contract","ui.neutralClaims"));
      if(this.sim.logisticsStatus().overcommit)panel.appendChild(el("p","logistics-overcommit","ui.signalOvercommit"));
      const site = s.territories.find((t) => t.poiId === poiId);
      if(site?.poiType==="signal"&&!s.signalSecured)panel.appendChild(el("p","signal-exemption","ui.firstSignalAvailable"));
      if (site) panel.appendChild(el("p", "site-biome", `biome.${this.sim.siteBiome(site.x, site.y)}.role` as EnKeys));
      
      const row = el("div", "btn-row");
      for (const sp of specs) {
        const cost = calculateLogisticsCost(sp.id, 1, s.ageIndex);
        const canAfford = this.sim.canSetOutpostSpec(poiId, sp.id);
        const b = document.createElement("button");
        b.className = "btn primary terr-spec-btn";
        if (!canAfford) b.disabled = true;
        const icon = document.createElement("img");
        icon.src = SEED_ASSETS.structures[sp.id];
        icon.className = "structure-preview-icon";
        icon.alt = sp.id;
        b.appendChild(icon);
        const txt = document.createElement("span");
        txt.textContent = `${t(sp.name)} — ${this.outpostBonusText(sp.id, 1, site?.x, site?.y)} — ${t("ui.logisticsCost")}: ${cost}`;
        b.appendChild(txt);
        if (!canAfford) {
          b.title = t("ui.insufficientLogistics");
        }
        b.addEventListener("click", () => {
          const events = this.sim.setOutpostSpec(poiId, sp.id);
          this.handleEvents(events);
          if (events.some((event) => event.type === "outpost_spec")) this.closeBlocking();
        });
        row.appendChild(b);
      }
      panel.appendChild(row);
      panel.appendChild(button("ui.specLater", () => this.closeBlocking(), "btn spec-later-btn"));
      const hint = el("p", "", "ui.specLaterHint");
      hint.id = "spec-later-hint";
      panel.appendChild(hint);
      screen.setAttribute("role", "dialog");
      screen.setAttribute("aria-modal", "true");
      screen.setAttribute("aria-label", t("ui.outpostSpec"));
      screen.setAttribute("aria-describedby", hint.id);
      screen.appendChild(panel);
      const controls = Array.from(panel.querySelectorAll<HTMLElement>("button:not(:disabled),input:not(:disabled),summary"));
      controls[0]?.focus();
      screen.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          this.closeBlocking();
        } else if (event.key === "Tab") {
          event.preventDefault();
          const index = controls.indexOf(document.activeElement as HTMLElement);
          controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
        }
      });
    });
  }

  /** Tech Map (T): the SAME deterministic graph the sim drafts, made visible with Dagre and Panzoom. */
  private toggleTechMap(fromDraft = false): void {
    const s = this.sim.state;
    if (s.over) return;
    if (this.civMapOpen) this.toggleCivMap();
    if (this.techMapOpen) {
      this.techMapView?.destroy();
      this.techMapView = null;
      document.getElementById("techmap-screen")?.remove();
      this.techMapOpen = false;
      if (s.draftOpen) { document.getElementById("draft-screen")?.remove(); this.openDraft(); }
      else this.surfaces.resumeContext();
      return;
    }
    if ((s.draftOpen && !fromDraft) || this.blockingModal) return;
    if (s.draftOpen) { const draft = document.getElementById("draft-screen"); if (draft) draft.hidden = true; }
    this.techMapOpen = true;
    this.decisionInput.enter();this.latch.setMove(0,0);this.latch.discardEdges();
    this.surfaces.suspendContext();
    this.techMapSel = s.pinnedTarget;
    this.qa?.noteSimEvent("techmap_open", "open");
    this.tutorial?.onTechMapOpened();
    this.renderTechMap();
  }

  private renderTechMap(): void {
    if (this.techMapView) {
      this.techMapView.destroy();
      this.techMapView = null;
    }
    document.getElementById("techmap-screen")?.remove();
    this.techMapView = new TechMapView({
      sim: this.sim,
      selectedId: this.techMapSel,
      onSelect: (id) => {
        this.techMapSel = id;
      },
      onPin: (id) => {
        this.handleEvents(this.sim.pinTarget(id));
      },
      onClose: () => {
        this.toggleTechMap();
      },
    });
    this.techMapView.mount(uiRoot());
  }

  /** Civilization map (M): large explored-world view + territory ledger. */
  private toggleCivMap(): void {
    const s = this.sim.state;
    if (s.over) return;
    if (this.techMapOpen) this.toggleTechMap();
    if (this.civMapOpen) {
      document.getElementById("civmap-screen")?.remove();
      this.civMapOpen = false;
      this.surfaces.resumeContext();
      return;
    }
    if (s.draftOpen || this.blockingModal) return;
    this.civMapOpen = true;
    this.decisionInput.enter();this.latch.setMove(0,0);this.latch.discardEdges();
    this.surfaces.suspendContext();
    this.qa?.noteSimEvent("civmap_open", "open");
    this.tutorial?.onCivMapOpened();
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = "civmap-screen";
    const panel = el("div", "panel panel-lg civmap-panel");
    panel.appendChild(el("h2", "", "ui.civilizationMap"));
    const cv = document.createElement("canvas");
    cv.width = 420;
    cv.height = 300;
    panel.appendChild(cv);
    const list = el("div", "civmap-list");
    panel.appendChild(list);
    // Selected-outpost management (v0.23.1): click the map to inspect;
    // only relevant actions, every button labeled with icon + purpose.
    const detail = el("div", "civmap-detail");
    detail.id = "civmap-detail";
    panel.appendChild(detail);
    panel.appendChild(button("ui.back", () => this.toggleCivMap(), "btn primary"));
    screen.appendChild(panel);
    root.appendChild(screen);
    const refresh = (): void => {
      this.renderCivMapLedger(list, detail);
      this.drawCivMap(cv);
    };
    cv.style.cursor = "pointer";
    cv.addEventListener("click", (ev2) => {
      const pick = this.pickCivMapSite(cv, ev2);
      this.trackedPoiId = pick && pick !== this.trackedPoiId ? pick : null;
      this.qa?.noteSimEvent("civmap_track", this.trackedPoiId ?? "none");
      refresh();
    });
    // Panel UPGRADE/TRACK actions re-render through this hook.
    (detail as unknown as { __refresh?: () => void }).__refresh = refresh;
    refresh();
  }

  /** Territory ledger + selected-site panel (shared by open + refresh). */
  private renderCivMapLedger(list: HTMLElement, detail: HTMLElement): void {
    const s = this.sim.state;
    list.innerHTML = "";
    if (s.territories.length === 0) {
      const d = document.createElement("div");
      d.textContent = `— ${t("ui.noOutposts")}`;
      list.appendChild(d);
    }
    for (const terr of s.territories) {
      const d = document.createElement("button");
      d.type = "button";
      const tracked = this.trackedPoiId === terr.poiId;
      d.className = "btn civmap-site" + (tracked ? " civmap-tracked" : "");
      d.addEventListener("click", () => {
        this.trackedPoiId = terr.poiId;
        const root = detail as unknown as { __refresh?: () => void };
        root.__refresh?.();
      });
      const specKey = terr.spec === "" ? null : (`ui.spec${terr.spec[0]?.toUpperCase()}${terr.spec.slice(1)}` as EnKeys);
      const raidMark = s.raid && s.raid.poiId === terr.poiId ? ` ⚠ ${t("ui.raidIncoming")} ${Math.ceil(s.raid.tMinus)}s` : "";
      d.textContent = `${tracked ? "◎ " : "◈ "}${t(`poi.${terr.poiType}.name` as EnKeys)} · ` +
        `${specKey ? t(specKey) : "—"} · T${terr.tier} · HP ${Math.ceil(terr.hp)}/${terr.maxHp}${terr.disabled ? " · ✗" : ""}${raidMark}`;
      list.appendChild(d);
    }
    if (s.stronghold?.revealed) {
      const d = document.createElement("div");
      const dx = s.stronghold.x - s.px;
      const dy = s.stronghold.y - s.py;
      d.textContent = `👑 ${t("ui.stronghold")} · ${Math.hypot(dx, dy).toFixed(0)}u`;
      list.appendChild(d);
    }
    const cap = document.createElement("div");
    cap.className = "civmap-logistics";
    cap.textContent = `${t("ui.logisticsLine")} ${s.logistics}/${s.maxLogistics}`;
    list.appendChild(cap);
    this.renderCivMapDetail(detail);
  }

  /** Selected outpost: image + name + state + REAL bonus + relevant actions. */
  private renderCivMapDetail(detail: HTMLElement): void {
    const s = this.sim.state;
    detail.innerHTML = "";
    const terr = s.territories.find((x) => x.poiId === this.trackedPoiId);
    if (!terr) return;
    const head = document.createElement("div");
    head.className = "civmap-detail-head";
    if (terr.spec !== "") {
      const img = document.createElement("img");
      img.src = SEED_ASSETS.structures[terr.spec];
      img.className = "structure-preview-icon";
      img.alt = terr.spec;
      head.appendChild(img);
    }
    const name = document.createElement("span");
    name.className = "civmap-detail-name";
    name.textContent = `◈ ${t(`poi.${terr.poiType}.name` as EnKeys)}`;
    head.appendChild(name);
    detail.appendChild(head);

    const raided = s.raid?.poiId === terr.poiId;
    const stateTxt = terr.disabled ? t("ui.siteDisabled") : raided ? t("ui.siteRaid") : t("ui.siteActive");
    const specTxt = terr.spec === ""
      ? t("ui.outpostSpec")
      : t(`ui.spec${terr.spec[0]?.toUpperCase()}${terr.spec.slice(1)}` as EnKeys);
    const rows: Array<[string, string]> = [
      [t("ui.siteState"), `${stateTxt}${raided && s.raid ? ` (${Math.ceil(s.raid.tMinus)}s)` : ""}`],
      [specTxt, `T${terr.tier} · HP ${Math.ceil(terr.hp)}/${terr.maxHp}`],
      [t("ui.siteBonus"), terr.spec === "" ? "—" : this.outpostBonusText(terr.spec, terr.tier, terr.x, terr.y)],
      [t("ui.siteBiome"), t(`biome.${this.sim.siteBiome(terr.x, terr.y)}.role` as EnKeys)],
      [t("ui.siteHeld"), this.fmtTime(Math.max(0, s.elapsed - terr.heldSince))],
    ];
    for (const [k, v] of rows) {
      const r = document.createElement("div");
      r.className = "civmap-detail-row";
      r.textContent = `${k}: ${v}`;
      detail.appendChild(r);
    }
    if (terr.disabled) {
      const rep = document.createElement("div");
      rep.className = "context-purpose";
      rep.textContent = terr.repairT > 0
        ? `${t("ui.repairing")} ${Math.floor(terr.repairT)}/${REPAIR_NEED}s`
        : t("ui.repairHint");
      detail.appendChild(rep);
    }
    const actions = el("div", "btn-row");
    if (terr.spec === "" && !terr.disabled) actions.appendChild(button("ui.outpostSpec", () => {
      this.toggleCivMap();
      this.showSpecPicker(terr.poiId);
    }));
    // UPGRADE only when eligible; cost + benefit stated before confirmation.
    const holdOk = s.elapsed - terr.heldSince >= TIER2_HOLD_SEC;
    if (!terr.disabled && terr.spec !== "" && terr.tier === 1) {
      const cost = outpostUpgradeCost(s.ageIndex);
      const upgradeStatus = this.sim.outpostUpgradeStatus(terr.poiId);
      const afford = upgradeStatus.allowed;
      const up = document.createElement("button");
      up.className = "btn";
      up.disabled = !afford;
      up.textContent = afford
        ? `⬆ ${t("ui.upgrade")}: T1 → T2 · ${t("ui.upgradeCost")} ${cost}`
        : upgradeStatus.reason === "logistics" ? `${t("ui.upgradeNeedLogistics")} (+${upgradeStatus.logisticsCost})`
        : `⬆ ${t("ui.upgradeNeedKnowledge")} (${cost})`;
      if (afford && holdOk) {
        up.addEventListener("click", () => {
          this.qa?.noteSimEvent("upgrade_attempt", terr.poiId);
          this.handleEvents(this.sim.upgradeOutpost(terr.poiId));
          const root = detail as unknown as { __refresh?: () => void };
          root.__refresh?.();
        });
      } else if (!holdOk) {
        up.disabled = true;
        up.textContent = `⬆ ${t("ui.upgradeNeedHold")}`;
      }
      actions.appendChild(up);
    }
    if (terr.spec !== "") {
      const dismantle = button("ui.dismantle", () => {
        if (!confirm(t("ui.dismantleConfirm"))) return;
        this.handleEvents(this.sim.dismantleOutpost(terr.poiId));
        const root = detail as unknown as { __refresh?: () => void };
        root.__refresh?.();
      });
      dismantle.id = "outpost-dismantle-btn";
      dismantle.disabled = s.raid?.poiId === terr.poiId;
      actions.appendChild(dismantle);
    }
    const track = document.createElement("button");
    track.className = "btn";
    track.textContent = `◎ ${t(this.trackedPoiId ? "ui.tracking" : "ui.track")}`;
    track.addEventListener("click", () => {
      this.trackedPoiId = this.trackedPoiId ? null : terr.poiId;
      const root = detail as unknown as { __refresh?: () => void };
      root.__refresh?.();
    });
    actions.appendChild(track);
    detail.appendChild(actions);
  }

  /** Map a canvas click to the nearest territory (world↔canvas is invertible). */
  private pickCivMapSite(cv: HTMLCanvasElement, ev: MouseEvent): string | null {
    const s = this.sim.state;
    const rect = cv.getBoundingClientRect();
    if (rect.width <= 0) return null;
    const W = cv.width;
    const H = cv.height;
    const RANGE = 12;
    const cellX = W / (RANGE * 2 + 1);
    const cellY = H / (RANGE * 2 + 1);
    const cxp = ((ev.clientX - rect.left) / rect.width) * W;
    const cyp = ((ev.clientY - rect.top) / rect.height) * H;
    let best: string | null = null;
    let bestD = 22; // canvas px grab radius
    for (const terr of s.territories) {
      const x = W / 2 + ((terr.x - s.px) / 512) * cellX;
      const y = H / 2 + ((terr.y - s.py) / 512) * cellY;
      const d = Math.hypot(x - cxp, y - cyp);
      if (d < bestD) {
        bestD = d;
        best = terr.poiId;
      }
    }
    return best;
  }

  private drawCivMap(cv: HTMLCanvasElement): void {
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const s = this.sim.state;
    const W = cv.width;
    const H = cv.height;
    const RANGE = 12;
    const { cx, cy } = worldToChunk(s.px, s.py);
    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(0, 0, W, H);
    const cellX = W / (RANGE * 2 + 1);
    const cellY = H / (RANGE * 2 + 1);
    for (const m of minimapCells(s.chunksWorld, cx, cy, RANGE)) {
      if (!m.seen) continue;
      ctx.fillStyle = "#1d2a3a";
      ctx.fillRect((m.ox + RANGE) * cellX + 1, (m.oy + RANGE) * cellY + 1, cellX - 2, cellY - 2);
    }
    const dot = (wx: number, wy: number, color: string, r = 3): void => {
      const dx = (wx - s.px) / 512;
      const dy = (wy - s.py) / 512;
      if (Math.abs(dx) > RANGE || Math.abs(dy) > RANGE) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(W / 2 + dx * cellX, H / 2 + dy * cellY, r, 0, Math.PI * 2);
      ctx.fill();
    };
    for (const terr of s.territories) dot(terr.x, terr.y, terr.disabled ? "#555555" : "#53e0c8", 4);
    // Frontier network (derived, never persisted): each active territory
    // links to its two nearest open frontier sites (§21).
    const open: Array<{ x: number; y: number }> = [];
    for (let ox = -RANGE; ox <= RANGE; ox++) {
      for (let oy = -RANGE; oy <= RANGE; oy++) {
        const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
        for (const poi of desc.poi) {
          if (s.poisWorld.includes(poi.id)) continue;
          dot(poi.wx, poi.wy, "#ffd166", 2);
          open.push({ x: poi.wx, y: poi.wy });
        }
      }
    }
    const toXY = (wx: number, wy: number): { x: number; y: number } => ({
      x: W / 2 + ((wx - s.px) / 512) * cellX,
      y: H / 2 + ((wy - s.py) / 512) * cellY,
    });
    ctx.strokeStyle = "rgba(83,224,200,0.4)";
    ctx.lineWidth = 1;
    for (const terr of s.territories) {
      if (terr.disabled) continue;
      const near = open
        .map((p) => ({ p, d: Math.hypot(p.x - terr.x, p.y - terr.y) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      const a = toXY(terr.x, terr.y);
      for (const { p } of near) {
        const b = toXY(p.x, p.y);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      // Raid front marker on the raided node.
      if (s.raid && s.raid.poiId === terr.poiId) {
        ctx.strokeStyle = "#ff2222";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(83,224,200,0.4)";
        ctx.lineWidth = 1;
      }
      // Tracked-outpost ring (presentation-only selection, never canonical).
      if (this.trackedPoiId === terr.poiId) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 11, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = "rgba(83,224,200,0.4)";
        ctx.lineWidth = 1;
      }
    }
    const boss = s.bossIndex >= 0 ? s.enemies[s.bossIndex] : undefined;
    if (boss?.active) dot(boss.x, boss.y, "#ff2222", 5);
    dot(s.px, s.py, "#ffffff", 4);
    // Shared focus identity on the civ map: stronghold ring + site.
    if (s.stronghold?.revealed) {
      const dx = (s.stronghold.x - s.px) / 512;
      const dy = (s.stronghold.y - s.py) / 512;
      if (Math.abs(dx) <= RANGE && Math.abs(dy) <= RANGE) {
        ctx.strokeStyle = "#ff8800";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2 + dx * cellX, H / 2 + dy * cellY, 8, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    const cf = this.frontierFocus?.site;
    if (cf && cf.poiId !== "stronghold") dot(cf.x, cf.y, "#ffffff", 3);
  }
  private drawMinimap(): void {
    const cv = this.hud.minimap as HTMLCanvasElement | undefined;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const s = this.sim.state;
    const W = cv.width;
    const H = cv.height;
    const RANGE = 4;
    const { cx, cy } = worldToChunk(s.px, s.py);
    ctx.fillStyle = "rgba(8,12,18,0.85)";
    ctx.fillRect(0, 0, W, H);
    const cell = W / (RANGE * 2 + 1);
    // Fog by construction: only visited chunk keys render (contract-tested).
    for (const m of minimapCells(s.chunksWorld, cx, cy, RANGE)) {
      if (!m.seen) continue;
      ctx.fillStyle = "#1d2a3a";
      ctx.fillRect((m.ox + RANGE) * cell + 1, (m.oy + RANGE) * cell + 1, cell - 2, cell - 2);
    }
    const dot = (wx: number, wy: number, color: string, r = 2.5): void => {
      const dx = (wx - s.px) / 512;
      const dy = (wy - s.py) / 512;
      if (Math.abs(dx) > RANGE || Math.abs(dy) > RANGE) return;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(W / 2 + dx * cell, H / 2 + dy * cell, r, 0, Math.PI * 2);
      ctx.fill();
    };
    for (const terr of s.territories) {
      dot(terr.x, terr.y, terr.disabled ? "#555555" : "#53e0c8", 3.5);
    }
    if (s.raid) {
      const terr = s.territories.find((x) => x.poiId === s.raid?.poiId);
      if (terr) {
        const pulse = 3 + 2 * Math.sin(performance.now() / 200);
        dot(terr.x, terr.y, "#ff2222", pulse);
      }
    }
    for (let ox = -RANGE; ox <= RANGE; ox++) {
      for (let oy = -RANGE; oy <= RANGE; oy++) {
        const desc = this.sim.chunks.get(s.worldSeed, s.worldNonce, cx + ox, cy + oy);
        for (const poi of desc.poi) {
          if (s.poisWorld.includes(poi.id)) continue;
          dot(poi.wx, poi.wy, "#ffd166", 2);
        }
      }
    }
    const boss = s.bossIndex >= 0 ? s.enemies[s.bossIndex] : undefined;
    if (boss?.active) dot(boss.x, boss.y, "#ff2222", 4);
    dot(s.px, s.py, "#ffffff", 3);
    // Shared focus identity on the minimap: stronghold + current site.
    if (s.stronghold?.revealed) {
      const dx = (s.stronghold.x - s.px) / 512;
      const dy = (s.stronghold.y - s.py) / 512;
      if (Math.abs(dx) <= RANGE && Math.abs(dy) <= RANGE) {
        ctx.strokeStyle = "#ff8800";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2 + dx * cell, H / 2 + dy * cell, 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    const cf = this.frontierFocus?.site;
    if (cf && cf.poiId !== "stronghold") dot(cf.x, cf.y, "#ffffff", 2);
  }

  private refreshBossBar(): void {
    const bar = this.hud.bossBar;
    const fill = this.hud.bossFill;
    if (!bar || !fill) return;
    const s = this.sim.state;
    const boss = s.bossIndex >= 0 ? s.enemies[s.bossIndex] : undefined;
    if (boss?.active) {
      bar.style.display = "block";
      const percent=Math.max(0,Math.min(100,Math.ceil(boss.hp/boss.maxHp*100)));
      fill.style.width = `${percent}%`;
      bar.setAttribute("aria-label",t("ui.boss"));bar.setAttribute("aria-valuenow",String(percent));
      const label=bar.querySelector(".boss-label");if(label)label.textContent=`${t("ui.boss")} ${percent}%`;
    } else {
      bar.style.display = "none";
    }
  }

  /** Compass strip: ONE shared focus identity (§22) — boss, raid, stronghold, site. */
  private updateCompass(): void {
    const c = this.hud.compass;
    if (!c) return;
    const s = this.sim.state;
    const arrowFor = (dx: number, dy: number): string => {
      const arrows = ["→", "↘", "↓", "↙", "←", "↖", "↑", "↗"];
      const idx = ((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8;
      return arrows[idx] as string;
    };
    const boss = s.bossIndex >= 0 ? s.enemies[s.bossIndex] : undefined;
    if (boss?.active) {
      const dx = boss.x - s.px;
      const dy = boss.y - s.py;
      c.textContent = `${arrowFor(dx, dy)} ${t("ui.boss")} ${Math.hypot(dx, dy).toFixed(0)}u`;
      return;
    }
    // Raid target first (defend-or-lose pressure).
    if (s.raid) {
      const terr = s.territories.find((x) => x.poiId === s.raid?.poiId);
      if (terr) {
        const dx = terr.x - s.px;
        const dy = terr.y - s.py;
        c.textContent = `⚠ ${t(`poi.${terr.poiType}.name` as EnKeys)} ${Math.hypot(dx, dy).toFixed(0)}u ${arrowFor(dx, dy)}`;
        return;
      }
    }
    // Revealed stronghold outranks routine navigation.
    if (s.stronghold?.revealed) {
      const dx = s.stronghold.x - s.px;
      const dy = s.stronghold.y - s.py;
      c.textContent = `👑 ${t("ui.stronghold")} ${Math.hypot(dx, dy).toFixed(0)}u ${arrowFor(dx, dy)}`;
      return;
    }
    // Frontier focus site (claim/clear/navigate share one identity).
    const f = this.frontierFocus?.site;
    if (f && this.frontierFocus && this.frontierFocus.kind !== "dominion") {
      const dx = f.x - s.px;
      const dy = f.y - s.py;
      const nm = f.poiId === "stronghold" ? t("ui.stronghold") : t(`poi.${f.poiType}.name` as EnKeys);
      c.textContent = `◈ ${nm} ${Math.hypot(dx, dy).toFixed(0)}u ${arrowFor(dx, dy)}`;
      return;
    }
    // No known destination: explain exploration without scanning hidden coordinates.
    c.textContent = t(s.ageIndex>=4 && !s.signalSecured ? "ui.signalExploreHint" : "ui.exploreHint");
  }

  /** Lightweight contextual teaching: one line at a time, auto-dismissed. */
  private updateOnboard(): void {
    const h = this.hud.hint;
    if (!h) return;
    const s = this.sim.state;
    const now = performance.now() / 1000;
    const moved = Math.hypot(s.px, s.py) > 60;
    if (this.onboard.active !== "") {
      if (now >= this.onboard.until || (this.onboard.active === "move" && moved)) {
        h.style.display = "none";
        this.onboard.active = "";
      } else {
        return;
      }
    }
    const show = (id: string, key: EnKeys, dur = 7): boolean => {
      if (this.onboard.done.has(id)) return false;
      this.onboard.done.add(id);
      this.onboard.active = id;
      this.onboard.until = now + dur;
      h.textContent = t(key);
      h.style.display = "block";
      return true;
    };
    if (show("move", "hint.move", 9)) return;
    if (!moved) return;
    let foes = 0;
    for (const e of s.enemies) if (e.active) foes++;
    if (foes > 0 && show("auto", "hint.auto")) return;
    if (s.knowledgeTotal > 0 && show("knowledge", "hint.knowledge")) return;
    if ((s.draftOpen || s.stats.techsTaken > 0) && show("draft", "hint.draft")) return;
    if (s.ageIndex < AGES.length - 1 && s.ageElapsed > 90 && show(`gated-${s.ageIndex}`, "hint.gated")) return;
    const c = this.hud.compass;
    if (c && c.textContent !== "" && show("poi", "hint.poi")) return;
  }

  // ------------------------------------------------------------- draft
  /** State-driven single draft surface (P1-01). Called every frame. */
  private syncDraftUI(): void {
    const open = this.sim.state.draftOpen && !this.sim.state.over && !this.paused;
    const el = document.getElementById("draft-screen");
    if(open&&el&&this.displayedOffers!==this.sim.state.draftOffers){el.remove();this.openDraft();this.surfaces.suspendContext();return;}
    if (open && !el) {
      this.openDraft();
      // Suspend AFTER open: drafts preempt map overlays (whose close path
      // resumes context), so the draft must win the final suspended state.
      this.surfaces.suspendContext();
    } else if (!open && el) {
      el.remove();
      this.surfaces.resumeContext();
    }
  }

  private openDraft(): void {
    const s = this.sim.state;
    if (document.getElementById("draft-screen")) return; // exactly-one guard
    this.decisionInput.enter();
    this.latch.discardEdges();
    this.tutorial?.onDraftOpened();
    this.displayedOffers=s.draftOffers;
    // Drafts take precedence over informational map overlays.
    if (this.techMapOpen) this.toggleTechMap();
    if (this.civMapOpen) this.toggleCivMap();
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = "draft-screen";
    screen.setAttribute("role", "dialog");
    screen.setAttribute("aria-modal", "true");
    screen.setAttribute("aria-labelledby", "draft-heading");
    const heading = el("h2", "", s.draftContext === "poi" ? "ui.poiFound" : "ui.chooseTech");
    heading.id = "draft-heading";
    heading.tabIndex = -1;
    heading.addEventListener("keydown", event => {
      // Preserve the existing fresh-Enter first-choice shortcut without
      // focusing a bottom button. Held/stale keys use the canonical UI guard.
      if(event.key==="Enter"&&this.decisionInput.allows(event)){
        event.preventDefault();event.stopPropagation();this.pickCard(0,screen);
      }
    });
    screen.appendChild(heading);
    const guidance = this.sim.pathGuidance();
    const recommended=recommendedCard(guidance,s.draftOffers);
    if (guidance.status !== "none") {
      const goal = el("section", "draft-goal");
      goal.appendChild(el("strong", "", undefined, `${t("path.goal")}: ${guidance.titleKey ? t(guidance.titleKey as EnKeys) : t("path.invalid")}`));
      if (guidance.status === "active") {
        goal.appendChild(el("p", "", undefined, `${t("path.progressLabel")}: ${guidance.have}/${guidance.need}`));
        goal.appendChild(el("p", "", undefined, guidance.next.length ? `${t("path.next")}: ${guidance.next.slice(0,3).map(id => this.planLabel(id)).join(" · ")}` : t("path.noneNext")));
        for (const blocker of guidance.blockers) goal.appendChild(el("p", "", `path.${blocker}` as EnKeys));
        if (!s.draftOffers.some(o => guidance.relations[o.nodeId] && guidance.relations[o.nodeId] !== "unrelated")) goal.appendChild(el("p", "goal-no-relevant", "path.noRelevant"));
      } else goal.appendChild(el("p", "", guidance.status === "complete" ? "path.completeStatus" : "path.invalid"));
      const mapBtn = button("path.openMap", () => this.toggleTechMap(true)); mapBtn.id = "draft-goal-map"; goal.appendChild(mapBtn); screen.appendChild(goal);
    }
    // Scrollable wrapper for cards to handle overflow at high UI scales
    const cardsWrapper = el("div", "cards-wrapper");
    const cards = el("div", "cards");
    cardsWrapper.appendChild(cards);
    screen.appendChild(cardsWrapper);
    const ownedTags = [...s.ownedTags];
    // Leads-to lookup (read-only graph walk): what each choice unlocks next.
    const childrenOf = new Map<string, string[]>();
    for (const g of this.sim.techGraph()) {
      for (const p of g.prerequisites) {
        const arr = childrenOf.get(p) ?? [];
        arr.push(g.id);
        childrenOf.set(p, arr);
      }
    }
    const graphById = new Map(this.sim.techGraph().map((g) => [g.id, g]));
    // Also include fallback cards (they're valid TechNodes but not in the graph)
    const fb = fallbackCards(s.level);
    for (const f of fb) graphById.set(f.id, f);
    const domainIcon = DOMAIN_ICONS;
    s.draftOffers.forEach((offer, i) => {
      // Get base TechNode for title/description/domain
      const n = graphById.get(offer.nodeId);
      if (!n) return;
      const c = el("div", "card");
      c.dataset.nodeId = n.id;
      c.appendChild(el("div", "key", undefined, `[${i + 1}]`));
      if (guidance.status === "active") { const relation = guidance.relations[n.id] ?? "unrelated"; c.dataset.pathRelation = relation; c.appendChild(el("p", "card-path-reason", `path.${relation}` as EnKeys)); }
      if(n.id===recommended){c.classList.add("card-recommended");c.dataset.recommended="true";c.appendChild(el("strong","card-recommendation","path.recommended"));}
      const h = document.createElement("h3");
      h.textContent = t(n.titleKey as EnKeys) + (n.web?.kind === "frontier" ? ` ${n.web.depth}.${n.web.slot + 1}` : "");
      const d = document.createElement("p");
      d.className = "card-effects";
      d.textContent = effectSummary(offer.effectiveEffects);
      const delta=el("p","card-delta",undefined,t("ui.beforeAfter")+": "+effectBeforeAfter(s.build,offer.effectiveEffects));
      const preview = document.createElement("div");
      preview.className = `card-preview domain-${n.domain}`;
      preview.setAttribute("aria-hidden", "true");
      const previewIcon = domainIcon[n.domain] ?? SEED_ASSETS.icons.research;
      const art = document.createElement("img");
      art.src = previewIcon;
      art.alt = "";
      preview.appendChild(art);
      preview.appendChild(document.createTextNode(n.domain === "warfare" ? "✦" : n.domain === "industry" ? "⚙" : n.domain === "culture" ? "◇" : "✧"));
      c.appendChild(preview);
      // Phase 4: legible plan — DOMAIN + synergy progress on every card.
      const dom = el("div", "card-domain", `domain.${n.domain}` as EnKeys);
      const iconSrc = domainIcon[n.domain];
      if (iconSrc) {
        const img = document.createElement("img");
        img.src = iconSrc;
        img.className = "card-domain-icon";
        img.alt = "";
        dom.prepend(img);
        dom.prepend(document.createTextNode(" "));
      }
      const syn = document.createElement("div");
      syn.className = "card-synergy";
      // Use base node tags for synergy (quality modifies values, not tags)
      const effTags = n.tags;
      const done = completingBreakthrough([...effTags], ownedTags, [...s.breakthroughs]);
      if (done) {
        syn.textContent = `${t("ui.completes")}: ${t(done.titleKey)}`;
        syn.classList.add("completes");
      } else {
        const lines: string[] = [];
        for (const p of breakthroughProgress([...ownedTags, ...effTags], [...s.breakthroughs])) {
          if (p.have === 0 || p.have >= p.need) continue;
          const names = p.missing.map((m) => {
            const k = tagDisplayKey(m);
            return k ? t(k) : null;
          }).filter((x): x is string => x !== null);
          lines.push(`${t("ui.synergy")}: ${t(p.titleKey)} ${p.have}/${p.need}${names.length > 0 ? ` (${names.join(" · ")})` : ""}`);
          if (lines.length >= 2) break;
        }
        syn.textContent = lines.join("  ");
      }
      // Quality badge (v0.24)
      const q = el("div", `quality quality-${offer.quality.toLowerCase()}`, undefined, t(`quality.${offer.quality.toLowerCase()}` as EnKeys));
      // Modifiers display
      if (offer.modifierIds.length > 0) {
        const m = document.createElement("div");
        m.className = "card-modifiers";
        m.textContent = offer.modifierIds.map((mid) => t(`modifier.${mid.toLowerCase()}` as EnKeys)).join(" · ");
        c.appendChild(m);
      }
      c.appendChild(h);
      c.appendChild(d);
      c.appendChild(delta);
      c.appendChild(dom);
      const plan = document.createElement("details");
      plan.className = "card-plan";
      const planTitle = document.createElement("summary");
      planTitle.textContent = t("ui.buildPlan");
      plan.appendChild(planTitle);
      if (syn.textContent !== "") plan.appendChild(syn);
      // Leads-to: the strategic consequence of this choice (names, not icons).
      const leads = (childrenOf.get(n.id) ?? [])
        .map((id) => graphById.get(id))
        .filter((g): g is NonNullable<typeof g> => !!g && !s.owned.includes(g.id))
        .slice(0, 2);
      if (leads.length > 0) {
        const l = document.createElement("div");
        l.className = "card-leads";
        l.textContent = `▸ ${t("ui.leadsTo")}: ${leads.map((g) => t(g.titleKey as EnKeys)).join(" · ")}`;
        plan.appendChild(l);
      }
      c.appendChild(plan);
      c.appendChild(q);
      // Reroll-changed marker: icon-adjacent text, never color-only.
      if (this.rerollNewIds.has(offer.nodeId)) {
        const badge = document.createElement("div");
        badge.className = "card-new";
        badge.textContent = `✦ ${t("draft.newBadge")}`;
        c.appendChild(badge);
      }
      // Explicit SELECT button (replaces role="button" on card)
      const selectBtn = document.createElement("button");
      selectBtn.type = "button";
      selectBtn.className = "btn card-select";
      selectBtn.dataset.testid = "card-select";
      try {
        selectBtn.textContent = t("ui.select");
        selectBtn.setAttribute("aria-label", t("ui.selectCard").replace("{0}", String(i + 1)));
      } catch {
        selectBtn.textContent = "SELECT";
        selectBtn.setAttribute("aria-label", `Select card ${i + 1}`);
      }
      selectBtn.addEventListener("click", () => this.pickCard(i,screen));
      c.appendChild(selectBtn);
      cards.appendChild(c);
      // Per-card RESERVE (one slot; fallback cards cannot be reserved).
      if (!offer.nodeId.startsWith("fb-")) {
        const rs = document.createElement("button");
        rs.type = "button";
        rs.className = "btn card-reserve";
        rs.textContent = `${t("ui.reserve")}${s.reservedTech === offer.nodeId ? " ✓" : ""}`;
        rs.addEventListener("click", (ev2) => {
          ev2.stopPropagation();
          if(!this.currentDraftSurface(screen))return;
          this.qa?.noteSimEvent("reserve_attempt", offer.nodeId);
          this.handleEvents(this.sim.reserveCard(i));
          this.refreshHUD();
        });
        c.appendChild(rs);
      }
    });
    const agency = el("div", "draft-agency");
    const reroll = document.createElement("button");
    reroll.id = "draft-reroll-btn";
    reroll.type = "button";
    reroll.className = "btn";
    reroll.disabled = !this.sim.canRerollDraft();
    reroll.textContent = s.rerolls > 0 && !this.sim.canRerollDraft()
      ? t("draft.rerollEmpty") : `${t("ui.reroll")} (${s.rerolls})`;
    reroll.addEventListener("click", () => {
      if(!this.currentDraftSurface(screen))return;
      // Capture visible ids first: NEW markers are computed presentation-side
      // from the before/after difference (never canonical state).
      const prev = new Set(s.draftOffers.map((o) => o.nodeId));
      // Attempt telemetry (v0.24): discovery != successful mutation.
      this.qa?.noteSimEvent("reroll_attempt", [...prev].join("+"));
      this.handleEvents(this.sim.rerollDraft());
      this.rerollNewIds = new Set(s.draftOffers.map((o) => o.nodeId).filter((id) => !prev.has(id)));
      // Choices changed: drop the stale surface so syncDraftUI rebuilds.
      document.getElementById("draft-screen")?.remove();
    });
    const skip = document.createElement("button");
    skip.id = "draft-skip-btn";
    skip.type = "button";
    skip.className = "btn";
    skip.textContent = t("ui.skip");
    skip.addEventListener("click", () => {
      if(!this.currentDraftSurface(screen))return;
      this.handleEvents(this.sim.skipDraft());
      document.getElementById("draft-screen")?.remove();
    });
    agency.appendChild(reroll);
    agency.appendChild(skip);
    screen.appendChild(agency);
    // Agency meaning, always visible (icon + text + one line, no hover-only).
    const hints = el("div", "draft-hints");
    const skipGain = Math.floor(scaleKnowledge(
      10 + s.level * 2,
      this.sim.knowledgeMult(),
    ));
    const hintLines: Array<[string, string]> = [
      ["◈", `${t("ui.reserve")}: ${t("draft.reserveHint")}`],
      ["⟳", `${t("ui.reroll")} (${s.rerolls}): ${t("draft.rerollHint")}`],
      ["▷", `${t("ui.skip")}: ${t("draft.skipHint")} (+${skipGain} ${t("ui.knowledge")})`],
    ];
    for (const [mark, line] of hintLines) {
      const h = document.createElement("div");
      h.className = "draft-hint";
      h.textContent = `${mark} ${line}`;
      hints.appendChild(h);
    }
    screen.appendChild(hints);
    this.rerollNewIds.clear();
    const stays = el("div", "draft-stays", "ui.ownedStays");
    screen.appendChild(stays);
    screen.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const controls = Array.from(screen.querySelectorAll<HTMLElement>("button:not([disabled]), summary"));
      const first = controls[0]; const last = controls[controls.length - 1];
      if (document.activeElement === heading) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    });
    root.appendChild(screen);
    // Focusing a bottom action scrolls the entire tall card row and hides all
    // technology names at200%. Start at the dialog title; Tab enters controls.
    heading.focus({preventScroll:true});
  }

  private currentDraftSurface(screen:HTMLElement):boolean {
    return screen.isConnected&&screen===document.getElementById("draft-screen")&&screen.dataset.committed!=="true"&&this.displayedOffers===this.sim.state.draftOffers;
  }
  private pickCard(i: number,expectedScreen?:HTMLElement): void {
    const s = this.sim.state;
    if (!s.draftOpen || s.over || this.techMapOpen || this.blockingModal) return;
    const screen=expectedScreen??document.getElementById("draft-screen");
    if(!screen||!this.currentDraftSurface(screen))return;
    const ev = this.sim.chooseDraft(i);
    if(!ev.some(e=>e.type==="tech_selected"))return;
    screen.dataset.committed="true";screen.remove();
    this.decisionInput.enter();
    this.latch.discardEdges();
    sfx.select();
    this.handleEvents(ev);
    this.syncDraftUI();
    // Next queued draft (if any) appears via syncDraftUI — exactly one surface.
  }

  // ------------------------------------------------------------- pause/death
  private togglePause(): void {
    this.paused = !this.paused;
    if (this.paused) this.showPause();
    else {
      document.getElementById("pause-screen")?.remove();
      this.surfaces.resumeContext();
    }
  }

  private showPause(): void {
    this.decisionInput.enter();
    this.latch.discardEdges();
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = "pause-screen";
    const panel = el("div", "panel panel-md pause-panel");
    panel.appendChild(el("h2", "", "ui.pause"));

    const section = (titleKey: EnKeys, cls = "pause-sec"): HTMLElement => {
      const sec = el("div", cls);
      sec.appendChild(el("h3", "", titleKey));
      panel.appendChild(sec);
      return sec;
    };

    // PRIMARY — the only way back into the run.
    const primary = section("ui.pausePrimary");
    primary.appendChild(button("ui.resume", () => this.togglePause(), "btn primary"));

    // IDENTITY & WORLD TRAITS — what makes this seed and origin distinct
    const identitySec = section("ui.chooseOrigin");
    const orig = originById(this.sim.state.originId);
    const origInfo = document.createElement("p");
    origInfo.style.margin = "4px 0";
    origInfo.textContent = `${t(orig.nameKey)} (${orig.families.map((f: WeaponFamily) => t(`family.${f}` as never)).join("+")}) · [F] ${t(orig.ability.nameKey)} (${orig.ability.cooldown}s) — ${t(orig.strategyKey)}`;
    identitySec.appendChild(origInfo);

    const traits = deriveWorldTraits(this.sim.state.worldLaws);
    if (traits.length > 0) {
      const traitDetails = document.createElement("details");
      const traitHeader = document.createElement("summary");
      traitHeader.style.fontWeight = "bold";
      traitHeader.style.marginTop = "6px";
      traitHeader.textContent = t("ui.worldTraits");
      traitDetails.appendChild(traitHeader);identitySec.appendChild(traitDetails);
      for (const tr of traits) {
        const trP = document.createElement("p");
        trP.style.margin = "2px 0";
        trP.textContent = `◈ ${t(tr.nameKey)}: ${t(tr.descKey)}`;
        traitDetails.appendChild(trP);
      }
    }

    // DISPLAY — look and language, no gameplay effect.
    const display = section("ui.pauseDisplay");display.classList.add("pause-display");
    const save = loadSave(localStorage);
    const scaleRow = el("div", "settings-row");
    scaleRow.appendChild(el("span", "", "ui.uiScale"));
    const scales = el("div", "lang-row");
    const scaleOpts: Array<{ label: string; scale: import("../../core/save/save").UiScale }> = [
      { label: "100%", scale: 1 },
      { label: "125%", scale: 1.25 },
      { label: "150%", scale: 1.5 },
      { label: "200%", scale: 2 },
    ];
    for (const opt of scaleOpts) {
      const b = document.createElement("button");
      b.className = "btn" + (save.settings.uiScale === opt.scale ? " active" : "");
      b.textContent = opt.label;
      b.addEventListener("click", () => {
        save.settings.uiScale = opt.scale;
        storeSave(localStorage, save);
        applyUiScale(opt.scale);
        scales.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
        b.classList.add("active");
      });
      scales.appendChild(b);
    }
    scaleRow.appendChild(scales);
    display.appendChild(scaleRow);

    for (const [key,label] of [["reducedEffects","settings.reduced"],["shake","ui.shake"]] as const) {
      const row=el("label","settings-row",undefined,t(label));
      const input=document.createElement("input");input.type="checkbox";input.id="pause-"+key;input.checked=save.settings[key];
      input.addEventListener("change",()=>{save.settings[key]=input.checked;if(key==="reducedEffects")this.reducedEffects=input.checked;storeSave(localStorage,save);});
      row.appendChild(input);display.appendChild(row);
    }
    // Language switch mid-run: rebuilds UI only, simulation untouched.
    const langRow = el("div", "settings-row");
    langRow.appendChild(el("span", "", "ui.language"));
    const langs = el("div", "lang-row");
    for (const [code, label] of [["en", "English"], ["th", "ไทย"]] as const) {
      const b = document.createElement("button");
      b.className = "btn" + (save.settings.lang === code ? " active" : "");
      b.textContent = label;
      b.addEventListener("click", () => this.applyLanguage(code));
      langs.appendChild(b);
    }
    langRow.appendChild(langs);
    display.appendChild(langRow);

    // HELP — safe reference first, destructive replay behind confirmation.
    const help = section("ui.pauseHelp");
    help.appendChild(button("ui.guide", () => this.showGuide()));
    // Stable automation contract (never text-dependent): the replay action
    // always carries #replay-tutorial-btn in every language/scale.
    const replayBtn = button("ui.resetTutorial", () => this.showReplayConfirm(screen));
    replayBtn.id = "replay-tutorial-btn";
    help.appendChild(replayBtn);

    // RUN — run-scoped navigation, away from both Resume and Danger.
    const run = section("ui.pauseRun");
    if (this.sim.state.stats.bosses>0) run.appendChild(button("ui.finishAttempt",()=>{document.getElementById("pause-screen")?.remove();this.handleEvents(this.sim.finishAttempt());}));
    const restartButton=button("ui.restart", () => this.restartRun());restartButton.id="pause-restart-btn";run.appendChild(restartButton);
    run.appendChild(button("ui.quitToTitle", () => this.scene.start("title")));

    // DANGER ZONE — visually separated; never beside Resume.
    const danger = section("ui.pauseDanger", "pause-sec danger-zone");
    danger.appendChild(button("ui.resetSave", () => {
      if (confirm(t("ui.confirmReset"))) {
        localStorage.removeItem("seed-game-save-v1");
        this.restartRun();
      }
    }, "btn danger"));
    screen.appendChild(panel);
    root.appendChild(screen);
    this.surfaces.suspendContext();
    primary.querySelector<HTMLButtonElement>("button")?.focus();
    screen.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const scope = screen.querySelector(".confirm-nested") ?? panel;
      const controls = Array.from(scope.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"));
      if (!controls.length) return;
      event.preventDefault();
      const index = controls.indexOf(document.activeElement as HTMLButtonElement);
      controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
    });
  }

  /**
   * Replay-tutorial confirmation (nested inside the pause screen — one
   * logical blocking surface, never a second simultaneous modal).
   * Cancel: zero canonical run mutation. Confirm: same-seed fresh run with
   * the tutorial starting immediately; language/settings/UI scale preserved.
   */
  private showReplayConfirm(pauseScreen: HTMLElement): void {
    if (document.getElementById("tutorial-replay-confirm")) return;
    const d = el("div", "confirm-nested");
    d.id = "tutorial-replay-confirm";
    d.appendChild(el("h3", "", "tutorial.replay.title"));
    const p = document.createElement("p");
    p.textContent = t("tutorial.replay.body");
    d.appendChild(p);
    const row = el("div", "btn-row");
    const cancel = document.createElement("button");
    cancel.className = "btn";
    cancel.id = "tutorial-replay-cancel-btn";
    cancel.textContent = t("ui.cancel");
    cancel.addEventListener("click", () => d.remove());
    const go = document.createElement("button");
    go.className = "btn primary";
    go.id = "tutorial-replay-confirm-btn";
    go.textContent = t("tutorial.replay.confirm");
    go.addEventListener("click", () => {
      d.remove();
      this.confirmReplayTutorial();
    });
    row.appendChild(cancel);
    row.appendChild(go);
    d.appendChild(row);
    pauseScreen.appendChild(d);
  }

  private confirmReplayTutorial(): void {
    const save = loadSave(localStorage);
    save.settings.tutorialCompleted = false;
    storeSave(localStorage, save);
    this.tutorial?.resetTutorial();
    document.getElementById("pause-screen")?.remove();
    this.paused = false;
    // restartRun resets surfaces and builds a fresh run on the SAME master
    // seed; the new TutorialDirector reads tutorialCompleted=false and the
    // intro begins immediately. Settings are never cleared here.
    this.restartRun();
  }

  private showGuide(): void {
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = "guide-screen";
    const panel = el("div", "panel panel-lg");
    panel.appendChild(el("h2", "", "guide.title"));
    const content = el("div", "guide-content");

    const addSection = (titleKey: EnKeys, textKey: EnKeys): void => {
      const sec = el("div", "guide-section");
      sec.appendChild(el("h3", "", titleKey));
      const p = document.createElement("p");
      p.textContent = t(textKey);
      sec.appendChild(p);
      content.appendChild(sec);
    };

    addSection("ui.nextAge", "guide.advancement");
    addSection("ui.squad", "guide.controls");
    addSection("guide.originAbilities", "guide.originAbilitiesDesc");
    addSection("guide.worldLaws", "guide.worldLawsDesc");
    addSection("ui.techMap", "guide.techStacking");
    addSection("ui.outpostSpec", "guide.territory");

    panel.appendChild(content);
    panel.appendChild(button("ui.back", () => screen.remove(), "btn primary"));
    screen.appendChild(panel);
    root.appendChild(screen);
  }

  private restartRun(): void {
    // P2-01: Restart = SAME master seed, clean simulation. (Play Again uses a
    // fresh random seed; Quit returns to title.) Origin choice is preserved.
    this.techMapView?.destroy();
    this.techMapView = null;
    this.surfaces.reset();
    this.blockingModal = null;
    this.modalT = 0;
    this.techMapOpen = false;
    this.civMapOpen = false;
    document.getElementById("pause-screen")?.remove();
    document.getElementById("draft-screen")?.remove();
    document.getElementById("ascend-screen")?.remove();
    document.getElementById("techmap-screen")?.remove();
    document.getElementById("civmap-screen")?.remove();
    sessionStorage.setItem(TITLE_SEED_KEY, this.masterSeed);
    sessionStorage.setItem(TITLE_ORIGIN_KEY, this.sim.state.originId);
    this.scene.restart();
  }

  private fmtTime(sec: number): string {
    return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`;
  }

  private persistRunEnd(): void {
    // P2-03: exactly-once terminal persistence (idempotent transition).
    if (this.deathPersisted) return;
    this.deathPersisted = true;
    const s = this.sim.state;
    const save = loadSave(localStorage);
    save.best.runs++;
    const isRecord = s.runElapsed >= save.best.bestTimeSec && s.runElapsed > 0;
    save.best.bestTimeSec = Math.max(save.best.bestTimeSec, Math.floor(s.runElapsed));
    save.best.bestKills = Math.max(save.best.bestKills, s.runKills);
    save.best.bestAscension = Math.max(save.best.bestAscension, s.ascension);
    if (isRecord) save.best.bestAge = s.runHighestAge;
    if (!save.history.includes(this.masterSeed)) save.history.unshift(this.masterSeed);
    save.history = save.history.slice(0, 50);
    if (this.attemptId && !new URLSearchParams(window.location.search).has("e2e")) {
      const terminal = settleAttempt(save.meta, this.attemptId, attemptReward(s.runElapsed, AGES.indexOf(s.runHighestAge), s.stats.bosses > 0));
      save.meta = terminal.ledger; this.archiveEarned = terminal.earned;
    }
    this.archiveStorageOK = storeSave(localStorage, save);
    if (!this.archiveStorageOK) this.archiveEarned = 0;
  }

  private showChronicle(): void {
    const s = this.sim.state;
    this.persistRunEnd(); // idempotent — safe even if the event path already ran
    document.getElementById("draft-screen")?.remove();
    const root = uiRoot();
    const screen = el("div", "screen");
    const panel = el("div", "panel panel-lg");
    panel.appendChild(el("h2", "", s.build.hp>0 ? "ui.victory" : "ui.died"));
    panel.appendChild(el("p", "archive-result", undefined, `${t("meta.attempt")} ${this.attemptId || "—"} · ${t("meta.world")} ${s.ascension+1} · ${t("meta.earned")}: +${this.archiveEarned}`));
    if (!this.archiveStorageOK) panel.appendChild(el("p", "", "meta.storage"));
    panel.appendChild(el("div", "", "ui.runChronicle"));
    const dl = document.createElement("dl");
    dl.className = "chron";
    const famKey = (["kinetic", "energy", "defense", "field"] as string[]).includes(s.topDamageSource)
      ? t(`family.${s.topDamageSource}` as EnKeys)
      : s.topDamageSource || "-";
    const origin = ORIGINS.find((o) => o.id === s.originId);
    const legacyNames = s.legacies
      .map((id) => {
        const def = legacyDefById(id);
        return def ? t(def.nameKey) : null;
      })
      .filter((x): x is string => x !== null);
    const rows: [string, string][] = [
      [t("chronicle.seed"), `${this.masterSeed} · w${WORLDGEN_VERSION} · A${s.ascension}`],
      [t("chronicle.time"), this.fmtTime(s.runElapsed)],
      [t("chronicle.age"), t(`age.${s.runHighestAge}` as EnKeys)],
      [t("chronicle.kills"), String(s.runKills)],
      [t("chronicle.elites"), String(s.stats.elites)],
      [t("chronicle.bosses"), String(s.stats.bosses)],
      [t("chronicle.techs"), String(s.stats.techsTaken)],
      [t("chronicle.chunks"), String(s.stats.chunksTotal)],
      [t("chronicle.poi"), String(s.stats.poisTotal)],
      [t("chronicle.origin"), origin ? t(origin.nameKey) : s.originId],
      [t("chronicle.traits"), deriveWorldTraits(s.worldLaws).map((tr) => t(tr.nameKey)).join(" · ") || "-"],
      [t("chronicle.legacy"), legacyNames.length > 0 ? legacyNames.join(" · ") : "-"],
      [t("ui.topDamage"), `${famKey} · v${CONTENT_VERSION}`],
    ];
    for (const [k, v] of rows) {
      const dt = document.createElement("dt");
      dt.textContent = k;
      const dd = document.createElement("dd");
      dd.textContent = v;
      dl.appendChild(dt);
      dl.appendChild(dd);
    }
    panel.appendChild(dl);
    // Build history: decision timings for build-order mastery (Phase 20).
    if (s.history.length > 0) {
      panel.appendChild(el("h2", "", "ui.buildHistory"));
      const hist = document.createElement("div");
      hist.className = "chron-history";
      const currentStart = currentWorldHistoryStart(s.history);
      for (let i = Math.max(0, s.history.length - 14); i < s.history.length; i++) {
        const h = s.history[i]!;
        const line = document.createElement("div");
        const historyKind = ('history.' + h.kind) as EnKeys;
        let label = '';
        if (h.kind === 'tech') label = historyTechName(h.label, this.sim.techGraph(), i < currentStart);
        else if (h.kind === 'age') label = t(('age.' + h.label) as EnKeys);
        else if (h.kind === 'breakthrough') { const b = BREAKTHROUGHS.find(b => b.id === h.label); if (b) label = t(b.titleKey); }
        else if (h.kind === 'expansion') label = t(('family.' + h.label) as EnKeys);
        else if (['claim','outpost-lost','outpost-repaired'].includes(h.kind)) label = t(('poi.' + h.label + '.name') as EnKeys);
        else if (['outpost','upgrade','dismantle','garrison'].includes(h.kind)) { const site = h.label.split('@')[1]; if (site) label = t(('poi.' + site + '.name') as EnKeys); }
        else if (h.kind === 'ascension') label = '#' + ((Number(h.label.replace('world-','')) || 0) + 1);
        const kindText = h.kind === 'tech' ? t('chronicle.techs') : t(historyKind);
        line.textContent = this.fmtTime(h.t) + ' · ' + (kindText === historyKind ? t('history.event') : kindText) + (label ? ' · ' + label : '');
        hist.appendChild(line);
      }
      panel.appendChild(hist);
    }
    const rowBtn = el("div", "btn-row");
    const copy = button("ui.copySeed", () => undefined);
    copy.addEventListener("click", () => void this.copySeed(copy));
    rowBtn.appendChild(copy);
    rowBtn.appendChild(button("ui.playAgain", () => {
      sessionStorage.setItem(TITLE_SEED_KEY, generateRandomSeed());
      sessionStorage.setItem(TITLE_ORIGIN_KEY, this.sim.state.originId);
      this.scene.restart();
    }, "btn primary"));
    rowBtn.appendChild(button("ui.archiveReturn", () => this.scene.start("title")));
    panel.appendChild(rowBtn);
    screen.appendChild(panel);
    root.appendChild(screen);
  }

  /** Clipboard truthfulness: success UI only after the promise resolves. */
  private async copySeed(btn: HTMLButtonElement): Promise<void> {
    try {
      if (!navigator.clipboard) throw new Error("no clipboard");
      await navigator.clipboard.writeText(this.masterSeed);
      btn.textContent = t("ui.copied");
    } catch {
      // Manual-copy fallback: selectable seed + accurate message.
      btn.textContent = t("ui.copySeed");
      const root = uiRoot();
      const d = document.createElement("div");
      d.className = "toast show";
      const inp = document.createElement("input");
      inp.value = this.masterSeed;
      inp.readOnly = true;
      inp.style.pointerEvents = "auto";
      inp.addEventListener("focus", () => inp.select());
      const msg = document.createElement("div");
      msg.className = "toast-sub";
      msg.textContent = t("ui.copyFail");
      d.appendChild(inp);
      d.appendChild(msg);
      root.appendChild(d);
      inp.focus();
      inp.select();
      setTimeout(() => d.remove(), 6000);
    }
  }

  /**
   * Blocking modal shell (choice or timed beat). Pauses stepping while up.
   * Exactly-one invariant + FIFO drain live in the SurfaceCoordinator;
   * context surfaces suspend while any BLOCKING is up and re-evaluate after.
   */
  private showBlocking(id: string, dur = 0, build?: (screen: HTMLElement) => void): void {
    this.surfaces.requestBlocking(id, () => this.showBlockingFresh(id, dur, build));
  }

  private showBlockingFresh(id: string, dur: number, build?: (screen: HTMLElement) => void): void {
    this.decisionInput.enter();
    this.latch.discardEdges();
    // Caller (or queue drain) guarantees no live modal; never re-enter drain.
    this.blockingModal?.remove();
    // Dismiss any active toasts to prevent overlapping presentation text
    // Notifications remain queued; a blocking choice must not erase warnings.
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = id;
    root.appendChild(screen);
    this.blockingModal = screen;
    this.modalT = dur;
    if (dur > 0) {
      screen.addEventListener("click", () => this.closeBlocking());
    }
    if (build) build(screen);
    if (id !== "spec-screen") {
      screen.setAttribute("role", "dialog"); screen.setAttribute("aria-modal", "true");
      const heading = screen.querySelector("h2"); if (heading) { heading.id = `${id}-heading`; screen.setAttribute("aria-labelledby", heading.id); }
      const controls = () => Array.from(screen.querySelectorAll<HTMLElement>("button:not(:disabled),[role=button][tabindex]"));
      controls()[0]?.focus();
      screen.addEventListener("keydown", e => { if (e.key !== "Tab") return; const c = controls(); if (!c.length) return; const i = c.indexOf(document.activeElement as HTMLElement); if ((e.shiftKey && i <= 0) || (!e.shiftKey && i === c.length - 1)) { e.preventDefault(); c[e.shiftKey ? c.length - 1 : 0]?.focus(); } });
    }
  }

  private closeBlocking(): void {
    const id = this.blockingModal?.id;
    this.blockingModal?.remove();
    this.blockingModal = null;
    this.modalT = 0;
    // Drain exactly one queued modal (FIFO) via the coordinator; context
    // resumes only when nothing blocking remains. showBlockingFresh never
    // drains, so no cascade: at most one new surface per close.
    if (id) this.surfaces.releaseBlocking(id);
    else this.surfaces.resumeContext();
  }

  /** Short reward beat: breakthrough title + effects, distinct sting. */
  private showBreakthroughBeat(id: string): void {
    const b = BREAKTHROUGHS.find((x) => x.id === id);
    if (!b) return;
    this.showBlocking("beat-screen", 1.1, (screen) => {
      const panel = el("div", "panel panel-md");
      panel.appendChild(el("h2", "", b.titleKey as EnKeys));
      const d = document.createElement("p");
      d.textContent = t(b.descriptionKey as EnKeys);
      panel.appendChild(d);
      screen.appendChild(panel);
    });
    sfx.breakthrough();
  }

  /** Age transition payoff: name + granted spine + active weapon forms. */
  private showAgeTransition(age: AgeId): void {
    const s = this.sim.state;
    const idx = AGES.indexOf(age);
    this.showBlocking("age-screen", 1.1, (screen) => {
      const panel = el("div", "panel panel-md");
      panel.appendChild(el("h1", "logo", `age.${age}` as EnKeys));
      const spine = CRITICAL_SPINE.find((c) => c.age === age);
      if (spine) {
        const g = document.createElement("p");
        g.textContent = `${t(`tech.${spine.id}.name` as EnKeys)} — ${t(`tech.${spine.id}.description` as EnKeys)}`;
        panel.appendChild(g);
      }
      const forms = activeFamilies(s.originId, s.expansionFamily)
        .map((f) => t(getWeaponStage(f, idx).nameKey as EnKeys)).join(" · ");
      const w = document.createElement("div");
      w.className = "toast-sub";
      w.textContent = forms;
      panel.appendChild(w);
      // One-line purpose: what this age asks of the civilization next.
      const goal = AGE_DEFS[idx];
      if (goal) {
        const o = document.createElement("div");
        o.className = "age-purpose";
        o.textContent = `◈ ${t(goal.objectiveKey as EnKeys)}`;
        panel.appendChild(o);
      }
      const cont = button("ui.ageContinue", () => this.closeBlocking(), "btn primary");
      panel.appendChild(cont);
      screen.appendChild(panel);
    });
    sfx.ageSting();
  }

  private offerAscend(): void {
    const s = this.sim.state;
    if (s.over || !s.ascendReady) return;
    sfx.ascend();
    const root = uiRoot();
    const screen = el("div", "screen");
    screen.id = "ascend-screen";
    const panel = el("div", "panel panel-md");
    panel.appendChild(el("h1", "logo", "ui.ascendTitle"));
    panel.appendChild(el("div", "", undefined, `#${s.ascension + 1} → #${s.ascension + 2}`));
    const row = el("div", "btn-row");
    row.appendChild(button("ui.ascend", () => this.showLegacyPick(), "btn primary"));
    const stay = button("ui.resume", () => document.getElementById("ascend-screen")?.remove());
    row.appendChild(stay);
    panel.appendChild(row);
    screen.appendChild(panel);
    root.appendChild(screen);
  }

  /** Legacy choice modal (blocking): 1 of 3 deterministic candidates. */
  private showLegacyPick(): void {
    document.getElementById("ascend-screen")?.remove();
    const offers = this.sim.legacyOffers();
    if (offers.length === 0) return;
    this.showBlocking("legacy-screen", 0, (screen) => {
      const panel = el("div", "panel panel-lg");
      panel.appendChild(el("h2", "", "ui.legacyTitle"));
      panel.appendChild(el("div", "logo-sub", "ui.legacySub"));
      const cards = el("div", "cards");
      for (const o of offers) {
        const c = el("div", "card");
        c.setAttribute("role", "button");
        c.tabIndex = 0;
        c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); c.click(); } });
        const h = document.createElement("h3");
        h.textContent = t(o.nameKey);
        const d = document.createElement("p");
        const reqTxt = o.requiredFamily
          ? ` ${t("ui.legacyRequires")} ${t(`family.${o.requiredFamily}` as EnKeys)}.`
          : "";
        d.textContent = effectSummary(o.effects) + reqTxt;
        c.appendChild(h);
        c.appendChild(d);
        // Close-then-show: navigating modals must not queue behind themselves.
        c.addEventListener("click", () => {
          this.closeBlocking();
          this.showOriginPick(o.id);
        });
        cards.appendChild(c);
      }
      panel.appendChild(cards);
      screen.appendChild(panel);
    });
  }

  /** Origin choice modal for the child world (blocking). */
  private showOriginPick(legacyId: string): void {
    // P1-05: only Origins where the chosen Legacy functions are selectable,
    // with the requirement stated — never a dead pick.
    const req = this.sim.legacyOffers().find((d) => d.id === legacyId)?.requiredFamily;
    const choices = req
      ? ORIGINS.filter((o) => (o.families as readonly string[]).includes(req))
      : [...ORIGINS];
    if (choices.length === 0) return;
    this.showBlocking("origin-screen", 0, (screen) => {
      const panel = el("div", "panel panel-lg");
      panel.appendChild(el("h2", "", "ui.chooseOrigin"));
      if (req) {
        const note = document.createElement("div");
        note.className = "logo-sub";
        note.textContent = `${t("ui.legacyRequires")} ${t(`family.${req}` as EnKeys)}`;
        panel.appendChild(note);
      }
      const cards = el("div", "cards");
      for (const o of choices) {
        const c = el("div", "card");
        c.setAttribute("role", "button");
        c.tabIndex = 0;
        c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); c.click(); } });
        const h = document.createElement("h3");
        h.textContent = t(o.nameKey);
        const portrait = heroPortrait(o.id);
        const crop=el("span","origin-portrait-crop"); crop.append(portrait); c.append(crop);
        const d = document.createElement("p");
        d.textContent = `${t(o.descKey)} (${o.families.map((f) => t(`family.${f}` as EnKeys)).join("+")})`;
        c.appendChild(h);
        c.appendChild(d);
        c.addEventListener("click", () => this.doAscend(legacyId, o.id));
        cards.appendChild(c);
      }
      panel.appendChild(cards);
      screen.appendChild(panel);
    });
  }

  /** Expansion choice modal at Industrial (blocking until decided). */
  private showExpansionPick(families: [WeaponFamily, WeaponFamily]): void {
    const s = this.sim.state;
    this.showBlocking("expansion-screen", 0, (screen) => {
      const panel = el("div", "panel panel-lg");
      panel.appendChild(el("h2", "", "ui.expansionTitle"));
      panel.appendChild(el("div", "logo-sub", "ui.expansionSub"));
      const cards = el("div", "cards");
      for (const f of families) {
        const c = el("div", "card");
        c.setAttribute("role", "button");
        c.tabIndex = 0;
        c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); c.click(); } });
        const h = document.createElement("h3");
        h.textContent = t(`family.${f}` as EnKeys);
        const d = document.createElement("p");
        d.textContent = t(getWeaponStage(f, s.ageIndex).nameKey as EnKeys);
        c.appendChild(h);
        c.appendChild(d);
        c.addEventListener("click", () => {
          const ev = this.sim.chooseExpansion(f);
          this.closeBlocking();
          this.handleEvents(ev);
          this.refreshHUD();
        });
        cards.appendChild(c);
      }
      panel.appendChild(cards);
      screen.appendChild(panel);
    });
    sfx.levelup();
  }

  private doAscend(legacyId: string, originId: string): void {
    document.getElementById("ascend-screen")?.remove();
    this.closeBlocking();
    const ev = this.sim.ascend(legacyId, originId);
    this.handleEvents(ev);
    this.lastGroundKey = "";
    this.refreshGround(true);
    this.refreshHUD();
    if (ev.some(e => e.type === "ascended")) { this.frameSamples = []; this.lastFrameAt = 0; this.simSamples = []; this.renderSamples = []; this.showChildIntro(); }
  }

  private showChildIntro(): void {
    const s = this.sim.state;
    const condition = childCondition(s.ascension);
    if (condition === "none") return;
    this.showBlocking("child-intro-screen", 0, screen => {
      const panel = el("div", "panel panel-lg child-intro");
      const body = el("div", "child-intro-body"); panel.appendChild(body);
      body.appendChild(el("h2", "", "child.title"));
      body.appendChild(el("p", "", "child.reset"));
      body.appendChild(el("h3", "", "child.inherited"));
      for (const id of s.legacies) { const def = legacyDefById(id); if (def) body.appendChild(el("p", "", undefined, `${t(def.nameKey)}: ${effectSummary(def.effects)}`)); }
      body.appendChild(el("h3", "", `child.${condition}.title` as EnKeys));
      body.appendChild(el("p", "", `child.${condition}.desc` as EnKeys));
      body.appendChild(el("p", "", "child.objective"));
      panel.appendChild(button("child.begin", () => this.closeBlocking(), "btn primary"));
      screen.appendChild(panel);
    });
  }

  // ------------------------------------------------------------- events→fx
  private handleEvents(ev: SimEvent[]): void {
    const s = this.sim.state;
    this.combatFeedback.syncWorld(s.worldNonce);
    this.tutorial?.onSimEvents(ev);
    let killsThisFrame = 0;
    let knowledgeCollected=0;
    const save = loadSave(localStorage);
    for (const e of ev) {
      this.combatFeedback.accept(e, s.elapsed, this.reducedEffects,s.originId);
      if(e.type==="weapon_fired"&&Math.hypot(e.x-s.px,e.y-s.py)<40)this.heroEquipment.fire(s.worldNonce,s.elapsed,e.x,e.y,e.tx,e.ty,e.family);
      if(e.type==="ability_used")this.heroEquipment.activate(s.worldNonce,s.elapsed,e.id,s.px,s.py);
      if(e.type==="enemy_killed")this.deathResponse.accept(e,s.elapsed,s.worldNonce,this.reducedEffects);
      this.heroActions.sync(s.worldNonce);
      this.heroActions.accept(e,s.elapsed,s.px,s.py);
      switch (e.type) {
        case "boss_attack_warning": toast(`combat.boss.${e.pattern}` as EnKeys);sfx.boss();break;
        case "boss_phase_changed":toast("combat.boss.phaseTransition");sfx.boss();break;
        case "boss_attack_fired": sfx.weapon("field");break;
        case "weapon_fired": sfx.weapon(e.family,s.originId); break;
        case "mine_detonated": sfx.weapon("field"); break;
        case "draft_opened":
          // UI appears via syncDraftUI (state-driven, exactly-one). Sound here.
          sfx.levelup();
          break;
        case "tech_selected": {
          const node=this.sim.techGraph().find(n=>n.id===e.techId)??fallbackCards(s.level).find(n=>n.id===e.techId);
          if(node)toast("ui.techAcquired",t(node.titleKey as EnKeys),effectSummary(e.effectiveEffects??node.effects));
          sfx.select();
          this.qa?.noteSimEvent("tech", e.techId);
          break;
        }
        case "draft_reserved":
          sfx.select();
          this.qa?.noteSimEvent("draft_reserve", e.techId);
          break;
        case "draft_rerolled":
          sfx.select();
          this.qa?.noteSimEvent("draft_reroll", `${e.rerollsLeft} left: ${e.prevIds.join("+")} → ${e.newIds.join("+")} (${e.changed} new)`);
          break;
        case "draft_reroll_unavailable":
          toast("draft.rerollEmpty");
          sfx.select();
          // Attempt without mutation (v0.24): distinct from success.
          this.qa?.noteSimEvent("reroll_unavailable", "none");
          break;
        case "draft_skipped":
          sfx.select();
          this.qa?.noteSimEvent("draft_skip", "skip");
          break;
        case "pin_set":
          sfx.select();
          this.qa?.noteSimEvent("pin", e.target);
          break;
        case "mission_complete":
          toast("ui.missionComplete", t(`age.${e.age}` as EnKeys));
          sfx.age();
          this.qa?.noteSimEvent("mission_complete", e.age);
          break;
        case "territory_claimed":
          toast("ui.poiFound", t(`poi.${e.poiType}.name` as EnKeys));
          sfx.select();
          this.spawnVfx("seed_claim_glow", s.px, s.py, 1.0, 0x53e0c8, 450, Phaser.BlendModes.ADD);
          this.qa?.noteSimEvent("territory_claimed", `${e.poiId}:${e.poiType}`);
          break;
        case "outpost_spec":
          toast(e.spec === "research" ? "ui.specResearch" : e.spec === "military" ? "ui.specMilitary" : "ui.specEconomy");
          sfx.select();
          this.qa?.noteSimEvent("outpost_spec", `${e.poiId}:${e.spec}`);
          break;
        case "outpost_upgraded":
          toast("ui.upgrade");
          sfx.age();
          this.qa?.noteSimEvent("outpost_upgraded", e.poiId);
          break;
        case "outpost_dismantled":
          this.qa?.noteSimEvent("outpost_dismantled", `${e.poiId}:${e.released}`);
          break;
        case "outpost_lost":
          toast("ui.outpostLost");
          sfx.hurt();
          this.qa?.noteSimEvent("outpost_lost", e.poiId);
          break;
        case "outpost_repaired":
          { const restored=s.territories.find(t=>t.poiId===e.poiId); if(restored)this.floatTextAt(restored.x,restored.y,t("ui.outpostRepaired"),"#53E0C8"); }
          toast("ui.outpostRepaired");
          sfx.select();
          this.qa?.noteSimEvent("outpost_repaired", e.poiId);
          break;
        case "raid_incoming": {
          const terr = this.sim.state.territories.find((x) => x.poiId === e.poiId);
          const nm = terr ? t(`poi.${terr.poiType}.name` as EnKeys) : e.poiId;
          toast("ui.raidIncoming", `${nm} · ${Math.ceil(e.seconds)}s`);
          sfx.boss();
          this.spawnVfx("seed_raid_alert", s.px, s.py, 1.1, 0xff5533, 600, Phaser.BlendModes.ADD);
          this.qa?.noteSimEvent("raid_incoming", `${e.poiId}:${Math.ceil(e.seconds)}s`);
          break;
        }
        case "raid_repelled":
          toast("ui.raidRepelled");
          sfx.age();
          this.qa?.noteSimEvent("raid_repelled", e.poiId);
          break;
        case "squad_command":
          this.qa?.noteSimEvent("squad_command", e.mode);
          break;
        case "enemy_attack_fired": sfx.enemyAttack(e.kind);break;
        case "enemy_attack_warning": {
          const now=this.sim.state.runElapsed;
          if(now-this.enemyWarningT[e.kind]>=3){toast(e.kind==="rush"?"combat.rushWarning":"combat.burstWarning");this.enemyWarningT[e.kind]=now;}
          sfx.enemyWarning(e.kind);break;
        }
        case "ability_used": {
          this.lastAbilityArtT = performance.now()/1000;
          const abil = ORIGIN_ABILITY[originById(this.sim.state.originId).id];
          toast("ui.ability", t(abil.nameKey));
          sfx.select();
          this.qa?.noteSimEvent("ability_used", abil.id);
          break;
        }
        case "breakthrough": {
          this.showBreakthroughBeat(e.id);
          this.qa?.noteSimEvent("breakthrough", e.id);
          this.spawnVfx("seed_breakthrough_spark", s.px, s.py, 1.2, 0xd884ff, 500, Phaser.BlendModes.ADD);
          break;
        }
        case "age_reached":
          sfx.age();
          toast("ui.ageReached", t(`age.${e.age}` as EnKeys));
          if (save.settings.shake && !this.reducedEffects) this.cameras.main.shake(250, 0.008);
          this.lastGroundKey = "";
          this.showAgeTransition(e.age);
          this.qa?.noteSimEvent("age_reached", e.age);
          break;
        case "poi_discovered":
          this.siteArrival.discover(s.worldNonce,s.poisWorld,s.elapsed,performance.now());
          sfx.age();
          toast("ui.poiFound", t(`poi.${e.poiType}.name` as EnKeys), `+${Math.floor(e.knowledge)} ${t("ui.knowledge")}`);
          this.qa?.noteSimEvent("poi_discovered", `${e.poiType}:+${Math.floor(e.knowledge)}`);
          break;
        case "poi_major":
          toast("ui.poiFound", t(`poi.${e.poiType}.name` as EnKeys));
          sfx.levelup();
          this.qa?.noteSimEvent("poi-major", e.poiType);
          break;
        case "expansion_offered":
          this.showExpansionPick(e.families);
          break;
        case "expansion_unlocked":
          toast("ui.expansionTitle", t(`family.${e.family}` as EnKeys));
          sfx.select();
          this.qa?.noteSimEvent("expansion", e.family);
          break;
        case "boss_warning":
          sfx.boss();
          toast("ui.bossWarning");
          this.qa?.noteSimEvent("boss_spawn", "");
          if (save.settings.shake) this.cameras.main.shake(400, 0.01);
          break;
        case "stronghold_revealed":
          sfx.boss();
          toast("ui.stronghold");
          this.qa?.noteSimEvent("stronghold", `${e.x},${e.y}`);
          break;
        case "boss_killed":
          sfx.ascend();
          this.qa?.noteSimEvent("boss_killed", "");
          break;
        case "ascension_ready":
          this.offerAscend();
          break;
        case "legacy_granted": {
          const def = legacyDefById(e.id);
          if (def) toast("ui.legacyTitle", t(def.nameKey));
          this.qa?.noteSimEvent("legacy", e.id);
          break;
        }
        case "ascended":
          clearNotifications();
          this.arcs=[];
          this.knowledgeCollectUntil=-Infinity;
          toast("ui.ascendTitle", `#${e.ascension} · ${e.worldSeed}`);
          break;
        case "player_hurt":
          sfx.hurt();
          this.lastHurtT = performance.now() / 1000;
          this.dmgNums.push({ x: s.px, y: s.py - 24, txt: `-${Math.ceil(e.damage)}`, t: 0.9 });
          if (this.dmgNums.length > 12) this.dmgNums.shift();
          break;
        case "enemy_killed":
          killsThisFrame++;
          this.bursts.push({ x: e.x, y: e.y, t: e.boss ? 0.5 : 0.3, max: e.boss ? 0.5 : 0.3, big: e.boss });
          if (this.bursts.length > 24) this.bursts.shift();
          // Section 15: ordinary death uses procedural ring + sparks; reserve raster flash for boss/elite
          if (e.boss || e.elite) {
            this.spawnVfx("seed_hit_impact", e.x, e.y, e.boss ? 0.8 : 0.45, 0xffe08a, 220, Phaser.BlendModes.ADD);
          }
          if (e.boss && save.settings.shake && !this.reducedEffects) this.cameras.main.shake(400, 0.012);
          break;
        case "energy_arc": {
          if (this.arcs.length<24) this.arcs.push({...e,until:s.elapsed+.12,relay:e.source==="relay"});
          break;
        }
        case "beam_fired":
          sfx.beam(e.family === "energy");
          break;
        case "knowledge_collected":
          knowledgeCollected+=e.gained;
          break;
        case "energy_impact":
          // Existing 12-text pool bounds genuine resolved damage feedback.
          if (!this.reducedEffects && e.hpDamage > 0 && this.cameras.main.worldView.contains(e.x,e.y))
            this.floatTextAt(e.x,e.y,String(Math.ceil(e.hpDamage)),"#85ecff");
          break;
        case "run_completed":
          this.qa?.end("victory-finished");
          this.persistRunEnd();this.showChronicle();break;
        case "player_died":
          this.qa?.onPlayerDied();
          this.persistRunEnd();
          this.showChronicle();
          break;
      }
    }
    if (ev.some(e=>e.type==="energy_arc")) sfx.energy();
    if (killsThisFrame > 0) sfx.kill();
    if(knowledgeCollected>0){
      sfx.pickup();this.knowledgeCollectUntil=s.elapsed+.25;
      if(!this.reducedEffects)this.floatTextAt(s.px,s.py-28,"+"+Number(knowledgeCollected.toFixed(1)),"#85ecff");
      if(!this.knowledgeHintShown){this.knowledgeHintShown=true;toast("ui.knowledgePickupHint");}
    }
    void s;
  }

  // ------------------------------------------------------------- frame
  private sampleMove(): void {
    let ix = 0;
    let iy = 0;
    if (this.decisionInput.moving("KeyA") || this.decisionInput.moving("ArrowLeft")) ix -= 1;
    if (this.decisionInput.moving("KeyD") || this.decisionInput.moving("ArrowRight")) ix += 1;
    if (this.decisionInput.moving("KeyW") || this.decisionInput.moving("ArrowUp")) iy -= 1;
    if (this.decisionInput.moving("KeyS") || this.decisionInput.moving("ArrowDown")) iy += 1;
    if (ix !== 0 || iy !== 0) this.playerFacing = Math.atan2(iy, ix);
    this.latch.setMove(ix, iy);
  }

  /** Density mode from UI scale + viewport (compact collapses secondary). */
  private applyHudDensity(): void {
    const root = document.getElementById("ui");
    if (!root) return;
    let scale = 1;
    try {
      scale = loadSave(localStorage).settings.uiScale ?? 1;
    } catch {
      scale = 1;
    }
    const narrow = window.innerWidth < 1400;
    const mode = scale >= 1.5 || narrow ? "compact" : "full";
    if (root.dataset.density !== mode) root.dataset.density = mode;
  }

  /** Presentation-only contrast preference (settings, never gameplay). */
  private highContrast(): boolean {
    try {
      return loadSave(localStorage).settings.contrast === "high";
    } catch {
      return false;
    }
  }

  private pushSample(arr: number[], v: number, cap = 240): void {
    arr.push(v);
    if (arr.length > cap) arr.shift();
  }

  update(_time: number, deltaMs: number): void {
    const dt = Math.min(Math.max(deltaMs / 1000, 0), 0.25);
    const frameT0 = performance.now();
    // Phaser delta may be smoothed; performance evidence uses wall-clock frames.
    // Canonical stepping below continues to use the engine delta unchanged.
    const frameAt = performance.now();
    if (this.lastFrameAt > 0) {
      const frameMs = frameAt - this.lastFrameAt;
      this.pushSample(this.frameSamples, frameMs);
      this.fpsEMA += (1000 / Math.max(frameMs, 0.1) - this.fpsEMA) * 0.05;
    }
    this.lastFrameAt = frameAt;
    this.fpsHudT -= dt;
    if (this.fpsHudT <= 0 && this.fpsHud) {
      this.fpsHudT = 0.5;
      const recent = [...this.frameSamples].sort((a,b)=>a-b);
      this.fpsHud.textContent = `FPS: ${recent.length ? Math.round(1000 / Math.max(0.1, percentile(recent, 50))) : "—"} · ${t("meta.attempt")} ${this.attemptId || "—"} · ${t("meta.world")} ${this.sim.state.ascension+1}`;
    }

    const s = this.sim.state;
    // Map overlays pause stepping (informational screens, not decisions).
    const stepping = !this.paused && !s.over && !s.draftOpen && !this.blockingModal && !this.techMapOpen && !this.civMapOpen;
    if (stepping) {
      this.sampleMove();
      const steps = this.acc.steps(dt);
      for (let i = 0; i < steps; i++) {
        // Edge-triggered dash only on the first consumed step; a zero-step
        // frame leaves the latch untouched (P1-02).
        const t0 = performance.now();
        const ev = this.sim.step(SIM_DT, this.latch.frameForStep(i));
        const simMs=performance.now()-t0;this.pushSample(this.simSamples,simMs);if(this.uniqueTiming)this.uniqueSim.push(simMs); // step-only
        if (ev.length > 0) this.handleEvents(ev);
        if (this.sim.state.over || this.sim.state.draftOpen) break;
      }
    }
    if (!stepping) { this.latch.setMove(0,0);this.latch.discardEdges(); }
    // P1-01: draft UI is a pure function of canonical sim state — exactly one
    // surface while draftOpen, zero otherwise. Never recursive ownership.
    this.syncDraftUI();
    this.tutorial?.update(dt, this.sim.state);
    // Timed beats auto-dismiss; choice modals wait for a decision.
    if (this.modalT > 0) {
      this.modalT -= dt;
      if (this.modalT <= 0) this.closeBlocking();
    }
    // Transient impact timers (presentation only).
    if (this.bursts.length > 0) {
      for (const burst of this.bursts) burst.t -= dt;
      this.bursts = this.bursts.filter((burst) => burst.t > 0);
    }

    this.drawFrame();
    this.hudT -= dt;
    if (this.hudT <= 0) {
      this.hudT = 0.15;
      this.refreshHUD();
    }
    // Ground follows chunk/age/POI discovery; CAMERA moves every frame (R4).
    const { cx, cy } = worldToChunk(s.px, s.py);
    const terrSig = s.territories.map((t) => `${t.poiId}:${t.spec}:${t.tier}:${t.disabled ? 0 : 1}:${t.disabled && t.repairT>0 ? 1 : 0}`).join("|");
    const camera=this.cameras.main;
    const viewKey=this.highContrast()?groundBoundsKey(groundDetailViewport(camera.scrollX,camera.scrollY,this.scale.width,this.scale.height,camera.zoom,{x:s.px,y:s.py})):"painted";
    const gk = `${s.worldNonce}:${cx},${cy}:a${s.ageIndex}:p${s.poisWorld.length}:t${terrSig}:v${viewKey}`;
    if (gk !== this.lastGroundKey) {
      this.lastGroundKey = gk;
      this.refreshGround(false);
    }
    this.terrainPainter.update();
    if (this.showDebug) this.refreshDebug();
    // QA harness tick (no-op unless ?qa=1 session exists).
    if (this.qa) {
      this.qaScanT -= dt;
      if (this.qaScanT <= 0) {
        this.qaScanT = 1;
        this.scanQaWorld();
      }
      this.qa.tick();
      if (this.qaOverlay) this.drawQaOverlay();
    }
  }

  private refreshDebug(): void {
    const s = this.sim.state;
    let activeE = 0;
    for (const e of s.enemies) if (e.active) activeE++;
    let activeP = 0;
    for (const p of s.projs) if (p.active) activeP++;
    let activeK = 0;
    for (const k of s.pickups) if (k.active) activeK++;
    const simSorted = [...this.simSamples].sort((a, b) => a - b);
    const frameSorted = [...this.frameSamples].sort((a, b) => a - b);
    const budget = threatBudget(s.elapsed, s.ageIndex, s.ascension, s.difficultyMul);
    const { cx, cy } = worldToChunk(s.px, s.py);
    this.debugText.setText(
      `FPS ${this.fpsEMA.toFixed(0)}  sim-step p50 ${percentile(simSorted, 50).toFixed(2)}ms p95 ${percentile(simSorted, 95).toFixed(2)}ms\n` +
      `frame p95 ${percentile(frameSorted, 95).toFixed(2)}ms  enemies ${activeE}  proj ${activeP}  pickups ${activeK}/${s.pickups.length}\n` +
      `queries ${this.sim.queryCount}  buckets ${this.sim.spatialBucketCount}  chunk ${cx},${cy}  cache ${(this.sim.chunks.hitRate * 100).toFixed(0)}%\n` +
      `seed ${this.masterSeed}  wv${WORLDGEN_VERSION}  age ${AGES[s.ageIndex]}  budget ${budget.toFixed(1)}  asc ${s.ascension}`,
    );
  }

  // ------------------------------------------------------------- render (world space)
  private refreshGround(_full: boolean): void {
    const refreshBegin=performance.now();this.chunkReadMs=0;
    const s = this.sim.state;
    const g = this.ground;
    if (!g) return;
    this.siteArrival.discover(s.worldNonce,s.poisWorld,s.elapsed,performance.now());
    this.preparedGround.enabled=this.highContrast()&&new URLSearchParams(location.search).get('groundGeometry')!=='legacy';
    this.preparedGround.invalidate();
    g.clear();
    const { cx, cy } = worldToChunk(s.px, s.py);
    // Visual radius extends one chunk beyond the simulated active radius.
    const R = ACTIVE_RADIUS_CHUNKS + 1;
    const civ = CIV_LAYER[AGES[s.ageIndex] as AgeId];
    const now = performance.now() / 1000;
    const getChunk=(x:number,y:number)=>{const begin=performance.now();const result=this.sim.chunks.get(s.worldSeed,s.worldNonce,x,y);this.chunkReadMs+=performance.now()-begin;return result;};
    this.submittedGroundBounds=new URLSearchParams(location.search).get("ground")==="unculled"?undefined:groundViewport(this.cameras.main.scrollX,this.cameras.main.scrollY,this.scale.width,this.scale.height,this.cameras.main.zoom,{x:s.px,y:s.py});
    this.submittedDetailBounds=new URLSearchParams(location.search).get("decor")==="all"||!this.submittedGroundBounds?undefined:groundDetailViewport(this.cameras.main.scrollX,this.cameras.main.scrollY,this.scale.width,this.scale.height,this.cameras.main.zoom,{x:s.px,y:s.py});
    drawGround(g, {
      detailBounds:this.submittedDetailBounds,
      texturedGround:true,
      bounds:this.submittedGroundBounds,
      getChunk,
      styleFor: (biome) => BIOME_STYLE[biome],
      civColor: civ.color,
      civDensity: civ.density,
      age: AGES[s.ageIndex] as AgeId,
      cx,
      cy,
      radius: R,
      worldSeed: s.worldSeed,
      time: now,
      highContrast: this.highContrast(),
    });
    this.terrainPainter.refresh(cx,cy,R,getChunk,this.highContrast(),s.worldNonce,s.elapsed);
    // POI markers live in the ground pass (rebuilt on chunk/age/discovery change).
    // Claimed territories get age-dressing: the map grows a civilization.
    const terrByPoi = new Map(s.territories.map((t) => [t.poiId, t]));
    let landmarkCount = 0;
    for (let ox = -R; ox <= R; ox++) {
      for (let oy = -R; oy <= R; oy++) {
        const desc = getChunk(cx+ox,cy+oy);
        for (const poi of desc.poi) {
          // Canonical discovery can cross a chunk edge before that chunk is
          // explored. Show that known site, without revealing unknown neighbors.
          if(!(desc.x===cx&&desc.y===cy)&&!s.chunksWorld.includes(`${desc.x},${desc.y}`)&&!s.poisWorld.includes(poi.id))continue;
          this.siteArrival.drawn(poi.id,poi.wx,poi.wy);

          drawPoi(g, {
            painted:!this.highContrast(),
            wx: poi.wx,
            wy: poi.wy,
            type: poi.type,
            found: s.poisWorld.includes(poi.id),
            time: now,
            highContrast: this.highContrast(),
          });
          const terr = terrByPoi.get(poi.id);
          if(!terr&&!this.highContrast()&&landmarkCount<48){
            let art = this.landmarkArt[landmarkCount++];
            if (!art) { art = this.add.image(0,0,"world-props",0).setDepth(-5); this.landmarkArt.push(art); }
            const frame=["ruin","meteor","vault","signal","megasite","worldtree"].indexOf(poi.type);
            const size=poi.type==="signal"||poi.type==="megasite"?144:112;
            art.setTexture("world-props",Math.max(0,frame)).setOrigin(.5,siteOriginY('world-props',Math.max(0,frame))).setVisible(true).setPosition(poi.wx,poi.wy+8).setDisplaySize(size,size).setAlpha(s.poisWorld.includes(poi.id)?.7:1);
          }
          if (terr) {
            if(terr.spec && landmarkCount<48) {
              let art=this.landmarkArt[landmarkCount++];
              if(!art){art=this.add.image(0,0,"outposts-v2").setDepth(-5);this.landmarkArt.push(art);}
              const row=terr.spec==="research"?0:terr.spec==="military"?1:2;
              const state=terr.disabled?(terr.repairT>0?3:2):terr.tier>=2?1:0;
              const size=terr.tier>=2?WORLD_SCALE.outpost2:WORLD_SCALE.outpost1;
              art.setTexture("outposts-v2",row*4+state).setOrigin(.5,siteOriginY('outposts-v2',row*4+state)).setVisible(true).setPosition(poi.wx,poi.wy+8).setDisplaySize(size,size).setAlpha(1);
            }
            drawTerritoryDressing(g, {
              x: poi.wx, y: poi.wy,
              ageIndex: s.ageIndex, tier: terr.tier, disabled: terr.disabled,
              spec:terr.spec,repairing:terr.disabled && terr.repairT>0,
              painted:!this.highContrast(),
            });
          }
        }
      }
    }
    for (let i=landmarkCount;i<this.landmarkArt.length;i++) this.landmarkArt[i]!.setVisible(false);
    this.groundRefreshMs=performance.now()-refreshBegin;
    this.groundMaxMs=Math.max(this.groundMaxMs,this.groundRefreshMs);this.chunkReadMaxMs=Math.max(this.chunkReadMaxMs,this.chunkReadMs);
  }

  private drawFrame(): void {
    this.combatSprites.begin();
    this.hostileBatch.begin();
    this.friendlyBatch.begin();
    const s = this.sim.state;
    const g = this.gfx;
    g.clear();
    const cam = this.cameras.main;
    const vx0 = cam.worldView.x - 128;
    const vy0 = cam.worldView.y - 128;
    const vx1 = cam.worldView.right + 128;
    const vy1 = cam.worldView.bottom + 128;
    const vis = (x: number, y: number): boolean => x >= vx0 && y >= vy0 && x <= vx1 && y <= vy1;
    const now = performance.now() / 1000;
    const hc = this.highContrast();
    const wopts = { time: now, highContrast: hc, reducedEffects:this.reducedEffects,origin:s.originId };
    this.arcs=this.arcs.filter(a=>a.until>s.elapsed);
    for(const arc of this.arcs){g.lineStyle(3,arc.relay?0xffda76:0x85ecff,0.9);g.lineBetween(arc.x1,arc.y1,arc.x2,arc.y2);}
    // Focused target = nearest foe to the player (HP bar while focused).
    let focus: (typeof s.enemies)[number] | null = null;
    let focusDist = 420;

    for (const k of s.pickups) {
      if (!k.active || !vis(k.x, k.y)) continue;
      if(hc)drawKnowledge(g,k,s.elapsed,this.reducedEffects);else this.combatSprites.knowledge(k,s.elapsed,this.reducedEffects);
    }
    for (const m of s.mines) {
      if (!m.active || !vis(m.x, m.y)) continue;
      if(hc)drawMine(g,m,wopts);else {
        this.combatSprites.mine(m,s.originId);
        g.lineStyle(1,0xc9b458,0.22);g.strokeCircle(m.x,m.y,m.radius);
      }
    }
    for (const e of s.enemies) {
      if (!e.active || !vis(e.x, e.y)) continue;
      // Focused target = nearest foe to the player (HP bar while focused).
      const fd = Math.hypot(e.x - s.px, e.y - s.py);
      if (fd < focusDist) {
        focusDist = fd;
        focus = e;
      }
    }
    if(this.artWorld!==s.worldNonce){this.actorMotion.reset();this.artWorld=s.worldNonce;this.enemyWarningT.rush=this.enemyWarningT.burst=-Infinity;}
    this.enemyActors.begin();
    this.bossRig.begin(s.worldNonce,s.elapsed,s.enemies.find(e=>e.active&&e.boss));
    this.allyActors.begin();
    for (const e of s.enemies) {
      if (!e.active) continue;
      // A body outside the viewport can still aim a slam/cross or a long rush
      // into it. Body culling must never suppress the locked danger geometry.
      if (!vis(e.x,e.y)) {drawEnemyTelegraph(g,e,hc);drawBossTelegraph(g,e);continue;}
      const facing=enemyDisplayHeading(e,s.px,s.py);
      drawEnemy(g, e, {
        bodyColor: ENEMY_LINEAGE[e.family].color[AGES[s.ageIndex] as AgeId],
        facing,
        time: now,
        highContrast: hc,
        hpBar: e.elite || e.boss || e.flash > 0 || e === focus,
        ageIndex: s.ageIndex,
        spriteBody: true,
        visualSize:enemyArtSize(e.family,e.radius,e.elite,e.boss),
      });
      drawEnemyTelegraph(g,e,hc);
      drawBossTelegraph(g,e);
      const enemyPose=["warning","attack"].includes(e.evolution?.phase??"")?3:enemyDisplayMoving(e)?1+Math.floor(s.elapsed*8)%2:0;
      if(e.boss)this.bossRig.draw(e,s.elapsed,enemyArtSize(e.family,e.radius,e.elite,true),enemyDisplayMoving(e),hc,this.reducedEffects);
      else this.enemyActors.draw(e.family,e.x,e.y,enemyArtSize(e.family,e.radius,e.elite,false),facing,s.elapsed,enemyDisplayMoving(e),e.flash>0?0xffbbbb:0xffffff,s.ageIndex,undefined,undefined,undefined,enemyPose);
    }
    this.enemyActors.end();
    this.bossRig.end(s.elapsed,hc,this.reducedEffects);
    this.deathResponse.draw(s.elapsed,s.worldNonce,this.reducedEffects);
    const heroPose=this.actorMotion.sample(s,s.px,s.py,s.elapsed);
    const moving = heroPose.moving;
    this.artLastX=s.px; this.artLastY=s.py;
    this.heroActions.sync(s.worldNonce);
    this.allyActors.draw(actorFor(s.originId),s.px,s.py,WORLD_SCALE.hero,this.playerFacing,s.elapsed,moving || s.dashT>0,s.iframe>0?0x9fd8ff:0xffffff,s.ageIndex,heroPose,this.heroActions.pose(s.elapsed,moving,s.dashT>0,s.over),undefined,undefined,true,this.heroActions.revision);
    const reference=this.allyActors.referenceReview();
    this.heroEquipment.socket(reference?(reference.socket[0]!-64)*WORLD_SCALE.hero/128*(heroPose.flip?-1:1):0,reference?(reference.socket[1]!-83.2)*WORLD_SCALE.hero/128:-16);
    this.equipmentGraphics.clear();this.heroEquipment.draw(this.equipmentGraphics,s,this.playerFacing,this.reducedEffects,hc);
    for (const p of s.projs) {
      if (!p.active || !vis(p.x, p.y)) continue;
      if (p.friendly) {if(hc){if(!this.friendlyBatch.draw(p,wopts))drawFriendlyProj(g,p,wopts);}else this.combatSprites.projectile(p,s.originId);}
      else if(this.vectorHostiles||!this.hostileBatch.draw(p,hc))drawHostileProj(g, p, wopts);
    }
    const b = s.build;
    const enabled=activeFamilies(s.originId,s.expansionFamily);
    const est = getWeaponStage("energy", s.weaponStage.energy);
    if (enabled.includes("energy") && (est.archetype === "aura" || b.bonusAura > 0)) {
      drawAura(g, s.px, s.py, est.radius + b.bonusAura * 30, 0xffb03c);
    }
    const fst = getWeaponStage("field", s.weaponStage.field);
    if(enabled.includes("field") && fst.archetype==="aura")drawAura(g,s.px,s.py,fst.radius,phaserColors.legacy);
    if (enabled.includes("field") && (fst.archetype === "orbit" || b.bonusOrbit > 0)) {
      const blades = 2 + b.bonusOrbit;
      for (let i = 0; i < blades; i++) {
        const a = s.orbitAng + (i * Math.PI * 2) / Math.max(1, blades);
        if(hc)drawOrbit(g, s.px, s.py, fst.radius || 110, 1, a, 0xb48cff, 8);
        else this.combatSprites.orbit(s.px+Math.cos(a)*(fst.radius||110),s.py+Math.sin(a)*(fst.radius||110),a+Math.PI/2,s.originId,"field");
      }
    }
    const dst = getWeaponStage("defense", s.weaponStage.defense);
    if (enabled.includes("defense") && dst.archetype === "orbit") {
      const blades = Math.max(1, dst.count + b.bonusOrbit);
      if(hc)drawOrbit(g, s.px, s.py, dst.radius, blades, s.orbitAng, dst.color, 7);
      else for(let i=0;i<blades;i++){const a=s.orbitAng+i*Math.PI*2/blades;this.combatSprites.orbit(s.px+Math.cos(a)*dst.radius,s.py+Math.sin(a)*dst.radius,a+Math.PI/2,s.originId,"defense");}
    }
    const guardians = guardianCount(s);
    if (guardians > 0) {
      for (let i = 0; i < guardians; i++) {
        const a = s.guardianAng + (i * Math.PI * 2) / Math.max(1, guardians);
        if(hc)this.allyActors.draw("guardian",s.px+Math.cos(a)*80,s.py+Math.sin(a)*80,WORLD_SCALE.guardian,a+Math.PI/2,s.elapsed,true,0xffffff,s.ageIndex);
        else this.allyActors.guardian(s.originId,s.px+Math.cos(a)*80,s.py+Math.sin(a)*80,WORLD_SCALE.guardian,a+Math.PI/2);
      }
    }
    this.combatSprites.end();
    this.hostileBatch.end();
    this.friendlyBatch.end();
    this.combatFeedback.syncWorld(s.worldNonce);
    this.combatFeedback.draw(g,s.elapsed,this.reducedEffects,vis);
    if(!this.reducedEffects && this.knowledgeCollectUntil>s.elapsed){
      const f=(this.knowledgeCollectUntil-s.elapsed)/.25;g.lineStyle(2,phaserColors.research,f*.5);g.strokeCircle(s.px,s.py,12+(1-f)*14);
    }
    const charge=this.reducedEffects ? 0 : energyCharge(s);
    if(charge>0) {
      const color=est.color;
      g.lineStyle(2,color,charge*0.7);g.strokeCircle(s.px,s.py,7+charge*6);
      g.fillStyle(color,charge*0.8);g.fillCircle(s.px,s.py,2+charge*2);
    }
    // Player: unique silhouette (camera still follows the invisible anchor).
    this.playerArc.setPosition(s.px, s.py);
    drawPlayer(g, s.px, s.py, 16, {
      facing: this.playerFacing,
      dashing: s.dashT > 0,
      iframe: s.iframe > 0,
      hurtFlash: now - this.lastHurtT < 0.25,
      time: now,
      highContrast: hc,
      originId: s.originId,
      ageIndex: s.ageIndex,
      spriteBody: true,
    });
    // Command squad renders as origin-identified allies with mode glyph.
    for (const a of s.squad) {
      if (!a.active || !vis(a.x, a.y)) continue;
      const pose=this.actorMotion.sample(a,a.x,a.y,s.elapsed);
      this.allyActors.draw(actorFor(s.originId),a.x,a.y,WORLD_SCALE.squad,pose.heading,s.elapsed,pose.moving,a.inv>0?0xffbbbb:0xffffff,s.ageIndex,pose,a.inv>0?"hurt":pose.moving?"walk":"idle");
    }
    this.allyActors.end();
    for (const site of s.territories) {
      if (!site.disabled || !vis(site.x,site.y)) continue;
      g.lineStyle(hc?4:3,phaserColors.damaged,1);
      g.lineBetween(site.x-14,site.y-14,site.x+14,site.y+14);
      g.lineBetween(site.x+14,site.y-14,site.x-14,site.y+14);
    }
    const repair = repairPresentation(s.territories,s.px,s.py,vis);
    this.repairLabel.setVisible(!!repair);
    if (repair) {
      const {site,inRange,progress,percent,remaining}=repair;
      g.lineStyle(hc?3:2,phaserColors.damaged,0.8);g.strokeCircle(site.x,site.y,32);
      if(inRange) {g.lineStyle(2,phaserColors.repairing,0.25);g.strokeCircle(site.x,site.y,CLAIM_REACH_RADIUS);}
      g.fillStyle(phaserColors.canvas,1);g.fillRect(site.x-64,site.y+40,128,10);
      g.fillStyle(phaserColors.repairing,1);g.fillRect(site.x-62,site.y+42,124*progress,6);
      const label=inRange ? t("repair.progress")+" — "+percent+"%\n"+t("repair.remaining").replace("{seconds}",remaining.toFixed(1)) : t("ui.repairHint");
      if(this.repairLabel.text!==label)this.repairLabel.setText(label);
      const labelX=Math.max(cam.scrollX+this.repairLabel.width/2+12,Math.min(cam.scrollX+cam.width-this.repairLabel.width/2-12,site.x));
      const labelY=Math.max(cam.scrollY+12,Math.min(cam.scrollY+cam.height-this.repairLabel.height-12,site.y+55));
      this.repairLabel.setPosition(labelX,labelY);
    }
    // Transient impact: death rings + floating damage numbers.
    for (const burst of this.reducedEffects ? [] : this.bursts) {
      const f = burst.t / burst.max;
      g.lineStyle(burst.big ? 4 : 2, burst.big ? 0xff5533 : 0xffe08a, f);
      g.strokeCircle(burst.x, burst.y, (1 - f) * (burst.big ? 90 : 34) + 6);
    }
    for (const dn of this.dmgNums) {
      this.floatTextAt(dn.x, dn.y, dn.txt, "#ff6b6b");
    }
    this.dmgNums.length = 0;
    this.drawBossIndicator();
  }

  /** Pooled floating combat text (transient presentation, zero per-frame allocs). */
  private floatTextAt(x: number, y: number, txt: string, color: string): void {
    if(this.numericFeedback?.show(x,y,txt,color))return;
    let t = this.floatText.find((o) => !o.visible);
    if (!t) {
      if (this.floatText.length >= 12) return;
      const created = this.add.text(0, 0, "", {
        fontSize: "14px", color, fontFamily: "monospace", backgroundColor: "rgba(0,0,0,0.55)",
      });
      created.setDepth(44);
      this.floatText.push(created);
      t = created;
    }
    t.setText(txt);
    t.setColor(color);
    t.setPosition(x - 18, y - 10);
    t.setAlpha(1);
    t.setVisible(true);
    const ref = t;
    this.time.delayedCall(700, () => ref.setVisible(false));
  }

  private drawBossIndicator(): void {
    const g = this.bossGfx;
    if (!g) return;
    const cam = this.cameras.main,z=cam.zoom;
    const ox=cam.width*.5*(1-1/z),oy=cam.height*.5*(1-1/z);
    g.setScale(1/z).setPosition(ox,oy);
    this.debugText?.setScale(1/z).setPosition(ox+10/z,oy+110/z);
    g.clear();
    const s = this.sim.state;
    if (s.bossIndex < 0) return;
    const boss = s.enemies[s.bossIndex];
    if (!boss?.active) return;
    drawOffscreenIndicator(g, {
      scrollX: cam.worldView.x,
      scrollY: cam.worldView.y,
      width: cam.width,
      height: cam.height,
      zoom:z,
    }, boss.x, boss.y, 0xff2222, 12);
  }
}
