// The smallest DOCX writer and reader the copy document needs: a title, a few
// paragraphs, Heading 1 / Heading 2, and two-column tables. Word, Pages and
// LibreOffice all open the result; the reader takes back whatever they saved.
import JSZip from "jszip";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const unesc = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(x?)([0-9a-fA-F]+);/g, (m, x, n) => String.fromCodePoint(parseInt(n, x ? 16 : 10))).replace(/&amp;/g, "&");

/* ---------------------------------------------------------------- writer */

/** One run. `props` is raw <w:rPr> content. */
const run = (text, props = "") => `<w:r>${props ? `<w:rPr>${props}</w:rPr>` : ""}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
const GREY = '<w:color w:val="808080"/>';
const MONO = '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas"/>';

/** A paragraph. `style` is a style id (Title, Heading1, Heading2, Normal). Text may hold "\n" for line breaks. */
export function paragraph(text, style = null, props = "") {
  const lines = String(text).split("\n");
  const runs = lines.map((l, i) => (i ? "<w:r><w:br/></w:r>" : "") + run(l, props)).join("");
  return `<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ""}${runs}</w:p>`;
}

/** The code cell: one 8pt grey monospace line per code, then an optional tiny italic tag. */
const codeCell = (codes, tag) =>
  codes.map((c) => paragraph(c, null, `${MONO}${GREY}<w:sz w:val="16"/>`)).join("") +
  (tag ? paragraph(tag, null, `${GREY}<w:i/><w:sz w:val="14"/>`) : "");

/** The text cell: 11pt, one paragraph per line of text. */
const textCell = (text) => String(text).split("\n").map((l) => paragraph(l, null, '<w:sz w:val="22"/>')).join("");

/**
 * A two-column table. rows: [{ codes: [..], tag?, text }]. Column 1 is a
 * fixed narrow width (in twentieths of a point; 2000 = 1.39in), column 2
 * takes the rest of a Letter/A4 text width.
 */
export function table(rows) {
  const W1 = 2000, W2 = 7300;
  const cell = (w, inner) => `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/></w:tcPr>${inner}</w:tc>`;
  const trs = rows.map((r) => `<w:tr><w:trPr><w:cantSplit/></w:trPr>${cell(W1, codeCell(r.codes, r.tag))}${cell(W2, textCell(r.text))}</w:tr>`).join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="${W1 + W2}" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders>${["top", "left", "bottom", "right", "insideH", "insideV"].map((s) => `<w:${s} w:val="single" w:sz="4" w:space="0" w:color="C8C8C8"/>`).join("")}</w:tblBorders><w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="${W1}"/><w:gridCol w:w="${W2}"/></w:tblGrid>${trs}</w:tbl><w:p/>`;
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:lang w:val="en-GB"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="80" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="200"/></w:pPr><w:rPr><w:b/><w:sz w:val="40"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:pageBreakBefore/><w:spacing w:before="360" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:color w:val="0F5E97"/><w:sz w:val="32"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="280" w:after="100"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style>
</w:styles>`;

/** Writes a .docx whose body is the given XML (paragraphs and tables). */
export async function writeDocx(bodyXml) {
  const zip = new JSZip();
  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`);
  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`);
  zip.file("word/styles.xml", STYLES);
  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${bodyXml}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1200" w:right="1300" w:bottom="1200" w:left="1300" w:header="600" w:footer="600"/></w:sectPr></w:body></w:document>`);
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}

/* ---------------------------------------------------------------- reader */

/** Text of one <w:p>: runs joined, <w:br/> and <w:tab/> kept, tracked deletions dropped. */
function paragraphText(pXml) {
  let x = pXml.replace(/<w:del\b[\s\S]*?<\/w:del>/g, "").replace(/<w:delText\b[\s\S]*?<\/w:delText>/g, "");
  let out = "";
  for (const m of x.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:t\/>|<w:br\b[^>]*\/>|<w:tab\/>|<w:noBreakHyphen\/>|<w:sym\b[^>]*\/>/g)) {
    const tag = m[0];
    if (tag.startsWith("<w:t/")) continue;
    if (tag.startsWith("<w:t")) out += unesc(m[1]);
    else if (tag.startsWith("<w:br")) out += "\n";
    else if (tag.startsWith("<w:tab")) out += "\t";
    else if (tag.startsWith("<w:noBreakHyphen")) out += "‑";
  }
  return out;
}

/** Every table in a .docx as rows of cell strings (paragraphs joined with "\n"). */
export async function readDocxTables(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const xml = await zip.file("word/document.xml").async("string");
  const tables = [];
  for (const t of xml.matchAll(/<w:tbl>([\s\S]*?)<\/w:tbl>/g)) {
    const rows = [];
    for (const tr of t[1].matchAll(/<w:tr\b[^>]*>([\s\S]*?)<\/w:tr>/g)) {
      const cells = [];
      for (const tc of tr[1].matchAll(/<w:tc\b[^>]*>([\s\S]*?)<\/w:tc>/g)) {
        const paras = [...tc[1].matchAll(/<w:p\b[^>]*>([\s\S]*?)<\/w:p>|<w:p\b[^>]*\/>/g)].map((p) => (p[1] === undefined ? "" : paragraphText(p[1])));
        cells.push(paras.join("\n"));
      }
      rows.push(cells);
    }
    tables.push(rows);
  }
  return tables;
}
