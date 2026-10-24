// Physics audit: plays every sign frame by frame (60 fps) in the sign studio and reports hand flips
// (rotation speed), elbow jumps, hand–body overlap and forearms passing through each other.
// Usage: start `npm run dev`, then `npm run audit:signs -- [topic,topic,...] [report.json]`.
// Env: BASE_URL (default http://localhost:3000), CHROME (path to a local Chrome/Edge).
import { chromium } from "playwright-core";
import fs from "node:fs";

const topics = (process.argv[2] || "abc,num,greet,basic,time,family,food,clothes,color").split(",");
const out = process.argv[3] || "sign-audit.json";
const BASE = process.env.BASE_URL || "http://localhost:3000";
const browser = await chromium.launch({ executablePath: process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage({ viewport: { width: 500, height: 400 } });
page.setDefaultTimeout(600000);
await page.goto(`${BASE}/studio/signs`, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__studio?.player?.(), null, { timeout: 300000 });

// Collect ids per topic through the studio's topic buttons (the list renders sign ids).
const allIds = [];
for (const t of topics) {
  await page.evaluate(t => [...document.querySelectorAll("button")].find(b => b.textContent === t)?.click(), t);
  const prefix = t === "clothes" || t === "color" ? "clothes." : t + ".";
  await page.waitForFunction(pre => { const el = document.querySelector("ul li small"); return el && el.textContent.startsWith(pre); }, prefix, { timeout: 120000 });
  const ids = await page.$$eval("ul li small", els => els.map(e => e.textContent.split(" ")[0]));
  for (const id of ids) if (id.startsWith(t === "color" ? "color." : t + ".") || (t === "clothes" && id.startsWith("clothes."))) allIds.push(id);
}
const uniq = [...new Set(allIds)];
console.log("auditing", uniq.length, "signs");

const report = [];
for (const id of uniq) {
  const r = await page.evaluate(async (id) => {
    const p = window.__studio.player();
    p.renderer.setAnimationLoop(null);
    p.paused = true;
    p.timeline = null;
    p.play([id]);
    for (let i = 0; i < 400 && !p.timeline; i++) await new Promise(r => setTimeout(r, 10));
    if (!p.timeline) return { id, error: "no timeline" };
    const T = p.timeline.duration, dt = 1 / 60;
    const arms = [p.hands.non, p.hands.dom];
    const qPrev = [null, null], ePrev = [null, null];
    let forearmAt = 0, maxTurn = 0, maxTurnAt = 0, maxElbow = 0, maxDepth = 0, depthAt = 0, depthWhat = "", minForearm = 9, maxViolation = 0;
    const q = arms.map(() => p.chestQ.clone());
    const probe = p.probe.clone(), push = p.push.clone();
    p.playTime = 0;
    for (let t = 0; t <= T; t += dt) {
      p.playTime = t - dt;
      p.update(dt);
      for (let i = 0; i < 2; i++) {
        arms[i].hand.getWorldQuaternion(q[i]);
        if (qPrev[i]) { const w = qPrev[i].angleTo(q[i]) / dt * 57.3; if (w > maxTurn) { maxTurn = w; maxTurnAt = t; } }
        qPrev[i] = q[i].clone();
        const E = p.plans[i].E;
        if (ePrev[i]) maxElbow = Math.max(maxElbow, ePrev[i].distanceTo(E) / dt);
        ePrev[i] = E.clone();
        maxViolation = Math.max(maxViolation, p.plans[i].violation);
        // Final hand points against the body.
        for (const [site, rad] of [["palm", 0.028], ["back", 0.02], ["wrist", 0.028], ["fingers", 0.011], ["thumb", 0.011], ["index", 0.009]]) {
          arms[i].hand.updateMatrixWorld(true);
          probe.copy(window.__siteLocal(arms[i], p.current[i ? "dom" : "non"].shape, site)).applyQuaternion(q[i]).add(arms[i].hand.getWorldPosition(push.clone()));
          const d = window.__bodyPush(p.body.live, probe, rad * 0.6, push);
          if (d > maxDepth) { maxDepth = d; depthAt = t; depthWhat = `${i ? "dominant" : "other"} ${site}`; }
        }
      }
      const c0 = probe.clone(), c1 = probe.clone();
      { const g = window.__segmentClosest(p.plans[0].E, p.plans[0].W, p.plans[1].E, p.plans[1].W, c0, c1); if (g < minForearm) { minForearm = g; forearmAt = t; } }
    }
    p.timeline = null;
    return { id, duration: +T.toFixed(2), maxTurn: Math.round(maxTurn), maxTurnAt: +maxTurnAt.toFixed(2), maxElbow: +maxElbow.toFixed(2), maxDepthMm: +(maxDepth * 1000).toFixed(1), depthAt: +depthAt.toFixed(2), depthWhat, minForearmMm: Math.round(minForearm * 1000), forearmAt: +forearmAt.toFixed(2), maxViolation: +maxViolation.toFixed(1) };
  }, id);
  report.push(r);
}
fs.writeFileSync(out, JSON.stringify(report, null, 1));
const bad = report.filter(r => r.error || r.maxTurn > 1200 || r.maxElbow > 4 || r.maxDepthMm > 8 || r.minForearmMm < 42);
console.log("problems:", bad.length);
for (const r of bad) console.log(JSON.stringify(r));
await browser.close();
