// The one runnable check for the "#maturity-curve fits one laptop screen"
// constraint. It is a LAYOUT fact, so it can only be checked in a browser:
//   every stage, selected through its real tab -> section height <= 804px
//   (a 900px viewport less the 96px sticky header) at 1470x900
//   nothing in the section overflows its box, and the page never scrolls
//   sideways, at every width the brief named
//   each rail node still sits over the centre of its own card
// usage: npm run dev   (port 3001), then: node scripts/maturity-fit-check.mjs
//
// Four things this has to do or it measures the wrong page — all learned the
// hard way on this site:
//   * wait for .preloader to UNMOUNT; while it is up the page cannot scroll
//   * scroll the section into view, or its entrance never fires and every
//     card is left at the inline `opacity:0; y:16` the timeline starts from,
//     which moves every rect read from it by 16px
//   * never pipe this script's output anywhere; a pipe stops Chrome launching
//     here. Redirect with > instead.
//   * spawn with stdio:['ignore','pipe','pipe'] and resume both streams
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ORIGIN = process.env.MC_ORIGIN || "http://localhost:3001";
const PORT = Number(process.env.MC_CDP_PORT || 9344);
/** 900 viewport less the 96px sticky header. */
const BUDGET = 804;
/** Where the whole section must fit one screen, and where it only must not break. */
const FIT = [1470, 1453, 1366, 1300, 1280];
const SWEEP = [...FIT, 1024, 1023, 900, 768, 767, 414, 390, 375, 320];
const CHROME = process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

let failed = 0;
const step = (name, ok, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const json = async (u) => { try { return await (await fetch(u)).json(); } catch { return null; } };

const profile = mkdtempSync(join(tmpdir(), "gamcs-mcfit-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`, "--no-first-run", "--disable-gpu", "--hide-scrollbars",
  "--disable-extensions", "--window-size=1470,900", "about:blank"],
  { stdio: ["ignore", "pipe", "pipe"] });
chrome.stdout.resume(); chrome.stderr.resume();

let target = null;
for (let i = 0; i < 240 && !target; i++) {
  if (await json(`http://127.0.0.1:${PORT}/json/version`)) {
    const list = await json(`http://127.0.0.1:${PORT}/json/list`);
    target = (list || []).find((t) => t.type === "page" && t.webSocketDebuggerUrl);
  }
  if (!target) await sleep(250);
}
if (!target) { console.error("chrome devtools never came up"); process.exit(2); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => { ws.onopen = r; });
let id = 0; const pending = new Map();
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { id++; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 500));
  return r.result?.result?.value;
};
await send("Page.enable"); await send("Runtime.enable");
await send("Page.bringToFront");

const MEASURE = `(() => {
  const sec = document.getElementById('maturity-curve');
  const box = sec.getBoundingClientRect();
  const clipped = [];
  for (const el of sec.querySelectorAll('*')) {
    const b = el.getBoundingClientRect();
    if (!b.width && !b.height) continue;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden') continue;
    const out = Math.max(0, b.right - box.right, box.left - b.left, b.bottom - box.bottom);
    if (out > 1.5 || el.scrollWidth - el.clientWidth > 1) clipped.push(el.className.toString().slice(0, 40));
  }
  const svg = document.querySelector('.mc-railsvg');
  const drawn = svg && getComputedStyle(svg).display !== 'none';
  const cards = [...document.querySelectorAll('.mc-stage-btn')].map(c => c.getBoundingClientRect());
  return {
    height: Math.round(box.height * 100) / 100,
    sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    clipped,
    drift: drawn ? [...svg.querySelectorAll('.mc-node')].map((n, i) => {
      const b = n.getBoundingClientRect();
      return Math.round(((b.left + b.width / 2) - (cards[i].left + cards[i].width / 2)) * 10) / 10;
    }) : null,
  };
})()`;

for (const width of SWEEP) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await send("Page.navigate", { url: `${ORIGIN}/` });
  for (let i = 0; i < 200; i++) {
    if (await ev(`!document.querySelector('.preloader') && !!document.querySelector('.mc-stage-btn')`)) break;
    await sleep(250);
  }
  await ev(`document.querySelector('.cookie-banner')?.remove(); 1`);
  await ev(`(() => { const s = document.getElementById('maturity-curve');
    window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - 96, behavior: 'instant' }); })()`);
  await sleep(2600);

  const heights = [];
  let clipped = [];
  let sideways = 0;
  let drift = null;
  for (let i = 1; i <= 5; i++) {
    const n = String(i).padStart(2, "0");
    await ev(`document.getElementById('mc-tab-${n}').click()`);
    await sleep(380);
    const m = await ev(MEASURE);
    heights.push(m.height);
    clipped = clipped.concat(m.clipped.map((c) => `${n}:${c}`));
    sideways = Math.max(sideways, m.sideways);
    if (m.drift) drift = m.drift;
  }
  const tallest = Math.max(...heights);
  const label = `${width}px`;
  if (FIT.includes(width)) {
    step(`${label}: the whole section fits one screen on all five stages`,
      tallest <= BUDGET, `tallest ${tallest} of ${BUDGET} (${heights.join(", ")})`);
  }
  step(`${label}: nothing clips and the page does not scroll sideways`,
    clipped.length === 0 && sideways === 0,
    clipped.length ? clipped.join(", ") : `sideways ${sideways}px`);
  if (drift) {
    step(`${label}: every rail node sits over its own card`,
      drift.every((d) => Math.abs(d) < 2), `drift ${drift.join(", ")}px`);
  }
}

/* The tablist uses automatic activation, so focus IS selection: the handler
   moves from the selected index and only the selected tab is in the tab
   order. Start from a real click, or this asserts a state no keyboard user
   can reach and reads as a bug that is not there. */
await send("Emulation.setDeviceMetricsOverride", { width: 1470, height: 900, deviceScaleFactor: 1, mobile: false });
await ev(`document.getElementById('mc-tab-01').click()`);
await sleep(250);
await ev(`document.getElementById('mc-tab-01').focus()`);
const press = async (key) => {
  const code = { ArrowRight: 39, ArrowLeft: 37, Home: 36, End: 35 }[key];
  for (const type of ["keyDown", "keyUp"]) {
    await send("Input.dispatchKeyEvent", { type, key, code: key, windowsVirtualKeyCode: code, nativeVirtualKeyCode: code });
  }
  await sleep(220);
  return ev(`(() => {
    const tabs = [...document.querySelectorAll('.mc-stage-btn')];
    const panel = document.getElementById('mc-panel');
    return { sel: tabs.findIndex(t => t.getAttribute('aria-selected') === 'true'),
      focus: document.activeElement?.id,
      labelledby: panel.getAttribute('aria-labelledby'),
      stops: tabs.filter(t => t.tabIndex === 0).length };
  })()`);
};
const right = await press("ArrowRight");
step("ArrowRight moves selection, focus and the panel together",
  right.sel === 1 && right.focus === "mc-tab-02" && right.labelledby === "mc-tab-02" && right.stops === 1,
  JSON.stringify(right));
const left = await press("ArrowLeft");
step("ArrowLeft moves back", left.sel === 0 && left.focus === "mc-tab-01", JSON.stringify(left));
const end = await press("End");
step("End selects the last stage", end.sel === 4 && end.focus === "mc-tab-05", JSON.stringify(end));
const home = await press("Home");
step("Home selects the first", home.sel === 0 && home.focus === "mc-tab-01", JSON.stringify(home));

ws.close(); chrome.kill(); rmSync(profile, { recursive: true, force: true });
console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
