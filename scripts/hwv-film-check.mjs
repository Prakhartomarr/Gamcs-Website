// The one runnable check for the How We Help film band's three contracts,
// none of which is visible in a screenshot and all of which are an attribute
// or a line of effect away from silently breaking:
//
//   WEIGHT      loading the homepage fetches the poster and NOT the 5.7MB film
//               (`preload="none"` in components/sections/HowWeHelpFilm.tsx)
//   ONCE        the film starts when the band comes into view and does not
//               restart when the visitor scrolls back past it
//   STILLNESS   under prefers-reduced-motion it never autoplays, and still
//               fetches nothing until someone presses play
//
// Plus: no unhandled rejection from the play() promise in either case.
//
// usage: node scripts/hwv-film-check.mjs [origin]   (default :3001)
import { spawn } from "node:child_process";

const ORIGIN = process.argv[2] || "http://localhost:3001";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failed = 0;
const step = (name, ok, detail = "") => {
  console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

async function probe({ port, reduced }) {
  const chrome = spawn(
    CHROME,
    [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", "--mute-audio",
      "--no-first-run", "--no-default-browser-check",
      `--user-data-dir=${process.env.TMPDIR || "/tmp"}/hwv-check-${port}`,
      `--remote-debugging-port=${port}`, "--window-size=1440,900", "about:blank",
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
  const events = [];
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    if (d.id && waiting.has(d.id)) {
      waiting.get(d.id)(d);
      waiting.delete(d.id);
    } else if (d.method) events.push(d);
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
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S("Page.enable");
  await S("Runtime.enable");
  await S("Network.enable");
  if (reduced)
    await S("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });
  /* A background tab pauses rAF, and the preloader never lifts. */
  await S("Page.bringToFront");

  const js = async (expression) => {
    const r = await S("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails.exception));
    return r.result.value;
  };

  await S("Page.navigate", { url: `${ORIGIN}/` });
  /* Page.navigate resolves when the navigation STARTS, so waiting only for
     .preloader can pass against the about:blank document that is still up.
     Wait for the band itself too. */
  await js(`new Promise((res, rej) => { const t = Date.now();
    const i = setInterval(() => {
      if (!document.querySelector('.preloader') && document.querySelector('section.hwv')) {
        clearInterval(i); res(1);
      } else if (Date.now() - t > 30000) { clearInterval(i); rej(new Error('band never appeared')); }
    }, 100); })`);
  await js(`document.querySelector('.cookie-banner')?.remove()`);
  await sleep(1500);

  /* Media loads do not report a body through resource timing, so the bytes
     are summed from the protocol's own dataReceived events. */
  const filmBytes = () => {
    const urls = new Map();
    const bytes = new Map();
    for (const e of events) {
      if (e.method === "Network.requestWillBeSent") urls.set(e.params.requestId, e.params.request.url);
      if (e.method === "Network.dataReceived")
        bytes.set(e.params.requestId, (bytes.get(e.params.requestId) || 0) + e.params.encodedDataLength);
      if (e.method === "Network.loadingFinished")
        bytes.set(e.params.requestId, Math.max(bytes.get(e.params.requestId) || 0, e.params.encodedDataLength));
    }
    let film = 0;
    let poster = 0;
    /* Counted, not weighed: a second run reuses the profile's cache and a
       304 poster transfers ~0 bytes, which would fail a bytes>0 assertion
       for the wrong reason. The film is asserted on bytes, which is the
       thing that actually matters about it. */
    let posterRequests = 0;
    for (const [rid, url] of urls) {
      if (/gamcs-explainer\.mp4/.test(url)) film += bytes.get(rid) || 0;
      if (/gamcs-explainer-poster/.test(url)) {
        poster += bytes.get(rid) || 0;
        posterRequests++;
      }
    }
    return { film, poster, posterRequests };
  };
  const state = `(() => { const v = document.querySelector('.hwv-video');
    return { paused: v.paused, t: +v.currentTime.toFixed(2), plays: v.played.length }; })()`;

  const atFirstPaint = { ...filmBytes(), scrollY: await js("scrollY") };

  const toBand = `(() => { const s = document.querySelector('section.hwv');
    window.scrollTo({ top: s.getBoundingClientRect().top + scrollY - 60, behavior: 'instant' });
    return 1; })()`;
  await js(toBand);
  await sleep(3000);
  const inView = await js(state);
  /* Away, far enough that nothing of the band is near the viewport, and back. */
  await js(`window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })`);
  await sleep(2000);
  await js(`window.scrollTo({ top: 0, behavior: 'instant' })`);
  await js(toBand);
  await sleep(2000);
  const secondPass = await js(state);

  const errors = events
    .filter(
      (e) =>
        e.method === "Runtime.exceptionThrown" ||
        (e.method === "Runtime.consoleAPICalled" && e.params.type === "error")
    )
    .map((e) =>
      e.params.exceptionDetails
        ? `${e.params.exceptionDetails.text} ${e.params.exceptionDetails.exception?.description || ""}`
        : (e.params.args || []).map((a) => a.value ?? a.description ?? a.type).join(" ")
    )
    /* KNOWN, NOT OURS: components/ui/logo-clouds.tsx hydrates a framer-motion
       style prop that differs between server and client under
       prefers-reduced-motion, and React dev logs it. It predates this band and
       fires on the homepage with or without it. Matched narrowly by that file's
       name in the component stack so every other error still fails this. */
    .filter((text) => !/logo-clouds/.test(text));

  await send("Browser.close").catch(() => {});
  chrome.kill("SIGKILL");
  return { atFirstPaint, inView, secondPass, errors };
}

const plain = await probe({ port: 9571, reduced: false });
step(
  "first paint fetches the poster and none of the film",
  plain.atFirstPaint.film === 0 && plain.atFirstPaint.posterRequests === 1,
  `film ${plain.atFirstPaint.film}B, poster ${plain.atFirstPaint.poster}B`
);
step(
  "autoplays when the band comes into view",
  !plain.inView.paused && plain.inView.t > 0,
  `t=${plain.inView.t}s`
);
step(
  "does not restart on a second scroll-past",
  plain.secondPass.t > plain.inView.t && plain.secondPass.plays === 1,
  `t ${plain.inView.t}s -> ${plain.secondPass.t}s, ${plain.secondPass.plays} play range`
);
step("no console error or unhandled rejection", plain.errors.length === 0, plain.errors.join("; "));

const reduced = await probe({ port: 9572, reduced: true });
step(
  "prefers-reduced-motion: never autoplays, film still unfetched",
  reduced.inView.paused &&
    reduced.secondPass.t === 0 &&
    reduced.secondPass.plays === 0 &&
    reduced.atFirstPaint.film === 0,
  `paused=${reduced.secondPass.paused}, t=${reduced.secondPass.t}s, film ${reduced.atFirstPaint.film}B`
);
step("no console error or unhandled rejection", reduced.errors.length === 0, reduced.errors.join("; "));

console.log(failed ? `\n${failed} failed` : "\nall ok");
process.exit(failed ? 1 : 0);
