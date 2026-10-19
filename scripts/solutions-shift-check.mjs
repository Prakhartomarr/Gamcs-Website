// The one runnable check for the Solutions accordion's layout-shift contract:
//   the pillars may only auto-advance at widths where switching pillar leaves
//   #solutions exactly as tall as it was.
//
// The two halves live apart — the height floors are in app/globals.css, the
// 768px gate is AUTOPLAY in components/sections/ServiceAccordion.tsx — so
// either can be changed without the other and nothing complains until the page
// is walking #impact down the screen again. This fails instead.
//
// usage: node scripts/solutions-shift-check.mjs [origin]   (default :3001)
import { spawn } from "node:child_process";

const ORIGIN = process.argv[2] || "http://localhost:3001";
const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
/* Either side of the breakpoint, plus a laptop. 767/768 are the pair that
   catches the gate and the floors drifting apart from each other. */
const WIDTHS = [390, 767, 768, 1440];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failed = 0;
const step = (name, ok, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

async function probe(width, port) {
  const chrome = spawn(
    CHROME,
    [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", "--mute-audio",
      "--no-first-run", "--no-default-browser-check",
      `--user-data-dir=${process.env.TMPDIR || "/tmp"}/svca-check-${port}`,
      `--remote-debugging-port=${port}`, `--window-size=${width},900`,
      "about:blank",
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );
  /* Both streams must be drained; 'ignore' leaves the launch wedged. */
  chrome.stdout.resume();
  chrome.stderr.resume();

  let version;
  for (let i = 0; i < 100 && !version; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (r.ok) version = await r.json();
    } catch {}
    if (!version) await sleep(200);
  }
  if (!version) throw new Error("devtools never came up");

  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const waiting = new Map();
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && waiting.has(d.id)) {
      waiting.get(d.id)(d);
      waiting.delete(d.id);
    }
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((res, rej) => {
      const i = ++id;
      waiting.set(i, (d) =>
        d.error ? rej(new Error(`${method}: ${d.error.message}`)) : res(d.result)
      );
      ws.send(JSON.stringify({ id: i, method, params, sessionId }));
    });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });
  const S = (m, p) => send(m, p, sessionId);
  await S("Page.enable");
  await S("Runtime.enable");
  await S("Emulation.setDeviceMetricsOverride", {
    width, height: 900, deviceScaleFactor: 1, mobile: false,
  });
  /* A background tab pauses rAF, and the preloader never lifts. */
  await S("Page.bringToFront");
  const js = async (expression) => {
    const r = await S("Runtime.evaluate", {
      expression, awaitPromise: true, returnByValue: true,
    });
    if (r.exceptionDetails)
      throw new Error(JSON.stringify(r.exceptionDetails.exception));
    return r.result.value;
  };

  await S("Page.navigate", { url: `${ORIGIN}/` });
  /* While .preloader is mounted html is overflow:hidden and scrollTo no-ops. */
  await js(`new Promise((res, rej) => { const t = Date.now();
    const i = setInterval(() => {
      if (!document.querySelector('.preloader')) { clearInterval(i); res(1); }
      else if (Date.now() - t > 25000) { clearInterval(i); rej(new Error('preloader stuck')); }
    }, 100); })`);
  await js(`(() => { const s = document.querySelector('#solutions');
    window.scrollTo({ top: s.getBoundingClientRect().top + scrollY - 40, behavior: 'instant' });
    return 1; })()`);
  await sleep(1500);

  /* aria-live is 'off' only while the rotation is running — the component's
     own read of it, so this never drifts from what the timer actually does. */
  const autoplays = await js(
    `document.querySelector('.svca [aria-live]')?.getAttribute('aria-live') === 'off'`
  );

  const heights = [];
  const n = await js(`document.querySelectorAll('.svca-head').length`);
  for (let i = 0; i < n; i++) {
    await js(`document.querySelectorAll('.svca-head')[${i}].click()`);
    /* past the .42s body transition and the .5s panel swap */
    await sleep(900);
    heights.push(
      await js(
        `Math.round(document.querySelector('#solutions').getBoundingClientRect().height)`
      )
    );
  }

  await send("Browser.close").catch(() => {});
  chrome.kill("SIGKILL");
  return { autoplays, heights, n };
}

for (const [i, width] of WIDTHS.entries()) {
  const { autoplays, heights, n } = await probe(width, 9550 + i);
  const span = Math.max(...heights) - Math.min(...heights);
  step(
    `${width}px — ${n} pillars, #solutions ${heights.join("/")}`,
    n === 5 && (!autoplays || span === 0),
    autoplays
      ? `autoplaying, span ${span}px (must be 0)`
      : `manual, span ${span}px (unconstrained)`
  );
}

console.log(failed ? `\n${failed} failed` : "\nall ok");
process.exit(failed ? 1 : 0);
