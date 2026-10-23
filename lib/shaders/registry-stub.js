/* Stands in for the `shaders` package's registry of every effect it ships
   (~200 of them, ~1MB of the hero's chunk). See next.config.mjs for why the
   swap is safe and which version it is pinned to. The single-letter names are
   the package's own minified export names for that version. */
const registry = {};
const none = () => [];
/* getShaderByName. The renderer's only call is a lookup of `naturalSizeKey`,
   which only the image, video and webcam textures declare — for the hero's
   Swirl, ChromaFlow, FlutedGlass and FilmGrain the real registry answers
   "none" too. */
const byName = () => undefined;

export { registry as a, none as i, byName as n, none as r, none as t };
