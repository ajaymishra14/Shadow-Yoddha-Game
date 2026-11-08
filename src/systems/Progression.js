(() => {
  "use strict";

  const MAX_LEVEL = 8000;
  const ENEMIES_PER_LEVEL = 3;
  const STORAGE_KEY = "shadowYoddhaCampaignV1";

  const worlds = [
    { name: "AGNI LOK", start: 1, end: 1000, theme: "Fire Kingdom", boss: "AGNI ASURA" },
    { name: "VANA LOK", start: 1001, end: 2000, theme: "Living Forest", boss: "VANA RAKSHAK" },
    { name: "NAG LOK", start: 2001, end: 3000, theme: "Serpent Kingdom", boss: "NAGRAJ" },
    { name: "HIM LOK", start: 3001, end: 4000, theme: "Frozen Kingdom", boss: "HIM ASURA" },
    { name: "VAJRA LOK", start: 4001, end: 5000, theme: "Thunder Kingdom", boss: "VAJRA DEV" },
    { name: "PATAL LOK", start: 5001, end: 6000, theme: "Demon Kingdom", boss: "PATAL RAKSHAS" },
    { name: "MAYA LOK", start: 6001, end: 7000, theme: "Illusion Kingdom", boss: "MAYA SAMRAT" },
    { name: "SHADOW LOK", start: 7001, end: 8000, theme: "Shadow Dimension", boss: "SHADOW EMPEROR" }
  ];

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Number.isFinite(saved.level)) {
        return {
          level: Math.max(1, Math.min(MAX_LEVEL, Math.floor(saved.level))),
          defeated: Math.max(0, Math.floor(saved.defeated || 0)),
          totalKills: Math.max(0, Math.floor(saved.totalKills || 0)),
          completed: !!saved.completed
        };
      }
    } catch (_) {}

    return { level: 1, defeated: 0, totalKills: 0, completed: false };
  }

  const progress = load();
  let transitioning = false;
  let transitionTimer = null;
  let overlay;
  let hud;
  let message;
  let countdown;
  let reward = 0;

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (_) {}
  }

  function worldFor(level) {
    return worlds.find(w => level >= w.start && level <= w.end) || worlds[7];
  }

  function difficulty() {
    return Math.min(100, Math.floor(progress.level / 80) + 1);
  }

  function createUI() {
    if (document.getElementById("shadowCampaignUI")) return;

    const style = document.createElement("style");
    style.textContent = `
      #shadowCampaignUI {
        position:fixed;
        top:12px;
        left:12px;
        right:auto;
        width:128px;
        max-width:calc(100vw - 24px);
        box-sizing:border-box;
        z-index:9000;
        color:#f8e7bd;
        font: bold 10px Arial,sans-serif;
        line-height:1.35;
        background:rgba(8,8,13,.94);
        border:1px solid #a77b36;
        border-radius:9px;
        padding:8px 9px;
        box-shadow:0 0 18px #000;
        pointer-events:none;
        letter-spacing:.4px;
      }
      #shadowCampaignUI .gold {color:#ffd36b;font-size:12px;white-space:nowrap}
      @media (max-width:650px) {
        #shadowCampaignUI {
          top:8px !important;
          left:8px !important;
          right:auto !important;
          width:126px;
          max-width:calc(100vw - 16px);
          padding:7px 8px;
          font-size:9px;
        }
        #shadowCampaignUI .gold {font-size:11px}
      }

      #shadowCampaignOverlay {
        position:fixed; inset:0; z-index:10000;
        display:none; align-items:center; justify-content:center;
        background:rgba(3,3,9,.88); color:#fff1cc;
        font-family:Arial,sans-serif; text-align:center;
        pointer-events:none;
      }
      #shadowCampaignOverlay.active {display:flex}
      #shadowCampaignOverlay .panel {
        width:min(88vw,500px); padding:35px 22px;
        border:2px solid #bd9149; border-radius:16px;
        background:linear-gradient(145deg,#17131a,#08080d);
        box-shadow:0 0 55px rgba(200,145,54,.25);
        animation:shadowVictory .6s ease-out;
      }
      #shadowCampaignOverlay h1 {
        color:#ffd36b; font-size:clamp(28px,7vw,48px);
        letter-spacing:4px; margin:0 0 12px;
        text-shadow:0 0 20px #b77a28;
      }
      #shadowCampaignOverlay p {color:#ddd0b5;line-height:1.6}
      #shadowCampaignOverlay .next {
        color:#ffd36b;font-size:24px;font-weight:bold;
        margin-top:20px;
      }
      @keyframes shadowVictory {
        from {opacity:0;transform:scale(.82)}
        to {opacity:1;transform:scale(1)}
      }
    `;
    document.head.appendChild(style);

    hud = document.createElement("div");
    hud.id = "shadowCampaignUI";
    document.body.appendChild(hud);

    overlay = document.createElement("div");
    overlay.id = "shadowCampaignOverlay";
    overlay.innerHTML = `
      <div class="panel">
        <h1 id="shadowCampaignTitle">LEVEL COMPLETE</h1>
        <p id="shadowCampaignMessage"></p>
        <div class="next" id="shadowCampaignCountdown">NEXT LEVEL</div>
      </div>
    `;
    document.body.appendChild(overlay);

    message = overlay.querySelector("#shadowCampaignMessage");
    countdown = overlay.querySelector("#shadowCampaignCountdown");
  }

  function updateHUD() {
    if (!hud) return;

    const world = worldFor(progress.level);

    hud.innerHTML = `
      <div class="gold">SHADOW YODDHA</div>
      LEVEL ${progress.level.toLocaleString("en-IN")} / 8,000
      <br>${world.name}
      <br>ENEMIES: ${progress.defeated}/${ENEMIES_PER_LEVEL}
      <br>DIFFICULTY: ${difficulty()} / 100
    `;
  }

  function isTransitioning() {
    return transitioning;
  }

  function enemyDefeated() {
    if (transitioning || progress.completed) return;

    progress.totalKills++;
    progress.defeated++;

    save();
    updateHUD();

    window.dispatchEvent(new CustomEvent("shadow:enemy-defeated", {
      detail: { ...progress }
    }));

    if (progress.defeated >= ENEMIES_PER_LEVEL) {
      completeLevel();
    }
  }

  function completeLevel() {
    if (transitioning || progress.completed) return;

    transitioning = true;
    reward = 100 + progress.level * 5;

    const finishedLevel = progress.level;
    const oldWorld = worldFor(finishedLevel);
    const newLevel = Math.min(MAX_LEVEL, finishedLevel + 1);
    const newWorld = worldFor(newLevel);

    createUI();

    overlay.classList.add("active");
    document.getElementById("shadowCampaignTitle").textContent =
      finishedLevel === MAX_LEVEL ? "CAMPAIGN COMPLETE" : "LEVEL COMPLETE!";

    message.innerHTML = `
      LEVEL ${finishedLevel.toLocaleString("en-IN")} CLEARED
      <br>${oldWorld.name}
      <br>ENEMIES DEFEATED: ${ENEMIES_PER_LEVEL}
      <br>SHADOW REWARD: ${reward}
      ${newWorld.name !== oldWorld.name ? `<br><br>NEW WORLD UNLOCKED: ${newWorld.name}` : ""}
    `;

    countdown.textContent =
      finishedLevel === MAX_LEVEL ? "THE SHADOW EMPEROR FALLS" : "NEXT LEVEL IN 3 SECONDS";

    window.dispatchEvent(new CustomEvent("shadow:level-complete", {
      detail: {
        level: finishedLevel,
        nextLevel: newLevel,
        world: oldWorld.name,
        reward
      }
    }));

    transitionTimer = setTimeout(() => {
      if (finishedLevel >= MAX_LEVEL) {
        progress.completed = true;
        save();
        countdown.textContent = "YOU ARE THE ULTIMATE YODDHA";
        return;
      }

      progress.level = newLevel;
      progress.defeated = 0;
      progress.completed = false;

      save();
      updateHUD();

      overlay.classList.remove("active");
      transitioning = false;
      transitionTimer = null;

      window.dispatchEvent(new CustomEvent("shadow:level-start", {
        detail: {
          level: progress.level,
          world: newWorld.name,
          difficulty: difficulty()
        }
      }));
    }, 3000);
  }

  function getProgress() {
    return {
      ...progress,
      maxLevel: MAX_LEVEL,
      enemiesPerLevel: ENEMIES_PER_LEVEL,
      world: worldFor(progress.level),
      difficulty: difficulty(),
      transitioning
    };
  }

  function resetCampaign() {
    if (transitionTimer) clearTimeout(transitionTimer);
    transitioning = false;
    progress.level = 1;
    progress.defeated = 0;
    progress.totalKills = 0;
    progress.completed = false;
    save();
    if (overlay) overlay.classList.remove("active");
    updateHUD();
  }

  window.shadowProgression = {
    enemyDefeated,
    isTransitioning,
    getProgress,
    resetCampaign,
    worlds
  };

  function boot() {
    createUI();
    updateHUD();
    console.log("[Shadow Yoddha] 8,000-level campaign loaded.", getProgress());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
