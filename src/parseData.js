import Papa from "papaparse";

// ── Number cleaning helpers ──
// "75 675" or "75 675" → 75675
// "70,0 €" → 70.0
// "1 234,56" → 1234.56
const cleanNum = (v) => {
  if (v == null || v === "") return 0;
  const s = String(v)
    .replace(/[ \s€$]/g, "") // strip spaces (incl nbsp), currency
    .replace(/,/g, "."); // FR decimal → US
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

// "25/01" → "2026-01-25" (assume target year)
// "2026-01-01" → "2026-01-01"
const cleanDate = (v, fallbackYear = 2026) => {
  if (!v) return null;
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (m) {
    const dd = m[1].padStart(2, "0");
    const mm = m[2].padStart(2, "0");
    let yy = m[3] || String(fallbackYear);
    if (yy.length === 2) yy = "20" + yy;
    return `${yy}-${mm}-${dd}`;
  }
  return null;
};

const daysBetween = (a, b) => {
  if (!a || !b) return 0;
  return Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
};

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

// ── Parse nomenclature CSV ──
// Skips the junk row 1 (super-headers), uses row 2 as header
export function parseNomenclature(text) {
  // Strip BOM
  const clean = text.replace(/^﻿/, "");
  // Drop first junk line
  const lines = clean.split(/\r?\n/);
  const trimmed = lines.slice(1).join("\n");

  const { data } = Papa.parse(trimmed, {
    header: true,
    skipEmptyLines: true,
  });

  const map = {};
  for (const row of data) {
    const name = (row["Ad name"] || "").trim();
    if (!name) continue;
    map[name] = {
      p: (row["Produit"] || "N/A").trim() || "N/A",
      r: (row["Realisation"] || "N/A").trim() || "N/A",
      f: (row["Format"] || "N/A").trim() || "N/A",
      co: (row["Concept"] || "N/A").trim() || "N/A",
      an: (row["Angle"] || "N/A").trim() || "N/A",
      ad2: (row["Sous-angle"] || "N/A").trim() || "N/A",
      v: (row["Version"] || "").trim(),
      url: (row["URL Apercu"] || "").trim(),
    };
  }
  return map;
}

// ── Parse perf CSV ──
// Skip 3 junk rows, line 4 is the header
export function parsePerf(text) {
  const clean = text.replace(/^﻿/, "");
  const lines = clean.split(/\r?\n/);
  // Find header line: first line containing "Ad Name"
  const headerIdx = lines.findIndex((l) => /Ad Name/i.test(l));
  const trimmed = lines.slice(headerIdx).join("\n");

  const { data } = Papa.parse(trimmed, {
    header: true,
    skipEmptyLines: true,
  });

  return data
    .map((row) => {
      const date = cleanDate(row["Date"]);
      const ad = (row["Ad Name"] || "").trim();
      if (!date || !ad) return null;
      return {
        date,
        ad,
        dp: cleanDate(row["Date première diffusion"]),
        dd: cleanDate(row["Date dernière diffusion"]),
        du: cleanNum(row["Durée (jour)"]),
        im: cleanNum(row["SUM de Impr"]),
        ct: cleanNum(row["SUM de Cost"]),
        cl: cleanNum(row["SUM de Clic"]),
        v2: cleanNum(row["Total 2-sec views"]),
        ins: cleanNum(row["Total Install"]),
        su: cleanNum(row["Total Signup"] || row["Signup"]),
      };
    })
    .filter(Boolean);
}

// ── Build the DAILY + ADS shapes the Dashboard expects ──
export function buildDataset(perfRows, nomenMap) {
  if (!perfRows.length) return { DAILY: [], ADS: [], TODAY: null };

  // Anchor date = max date in the perf data
  const allDates = perfRows.map((r) => r.date).sort();
  const TODAY = allDates[allDates.length - 1];

  // Period definitions anchored to TODAY
  const PERIODS = [
    { key: "7", days: 7 },
    { key: "15", days: 15 },
    { key: "30", days: 30 },
    { key: "90", days: 90 },
    { key: "all", days: null },
  ];

  const ranges = {};
  for (const p of PERIODS) {
    if (p.days === null) {
      ranges[p.key] = { start: allDates[0], end: TODAY };
    } else {
      ranges[p.key] = { start: addDays(TODAY, -(p.days - 1)), end: TODAY };
    }
  }
  // Previous period ranges
  const prevRanges = {};
  for (const p of PERIODS) {
    if (p.days === null || p.days > 30) continue;
    const start = addDays(TODAY, -(p.days * 2 - 1));
    const end = addDays(TODAY, -p.days);
    prevRanges[p.key] = { start, end };
  }

  // ── DAILY: aggregate all ads per date ──
  const dailyAgg = {};
  for (const r of perfRows) {
    if (!dailyAgg[r.date]) {
      dailyAgg[r.date] = { im: 0, ct: 0, cl: 0, v2: 0, ins: 0, su: 0 };
    }
    const d = dailyAgg[r.date];
    d.im += r.im;
    d.ct += r.ct;
    d.cl += r.cl;
    d.v2 += r.v2;
    d.ins += r.ins;
    d.su += r.su;
  }
  const DAILY = Object.keys(dailyAgg)
    .sort()
    .map((d) => {
      const x = dailyAgg[d];
      return [d, x.im, x.ct, x.cl, x.v2, x.ins, x.su];
    });

  // ── ADS: group perf rows by ad name, aggregate per period ──
  const byAd = {};
  for (const r of perfRows) {
    if (!byAd[r.ad]) {
      byAd[r.ad] = { rows: [], dp: r.dp, dd: r.dd, du: r.du };
    }
    byAd[r.ad].rows.push(r);
    if (r.dp && (!byAd[r.ad].dp || r.dp < byAd[r.ad].dp)) byAd[r.ad].dp = r.dp;
    if (r.dd && (!byAd[r.ad].dd || r.dd > byAd[r.ad].dd)) byAd[r.ad].dd = r.dd;
    if (r.du > byAd[r.ad].du) byAd[r.ad].du = r.du;
  }

  const aggregatePeriod = (rows, start, end) => {
    const out = [0, 0, 0, 0, 0, 0]; // im, ct, cl, v2, ins, su
    for (const r of rows) {
      if (r.date < start || r.date > end) continue;
      out[0] += r.im;
      out[1] += r.ct;
      out[2] += r.cl;
      out[3] += r.v2;
      out[4] += r.ins;
      out[5] += r.su;
    }
    return out;
  };

  const ADS = Object.entries(byAd).map(([ad, info]) => {
    const nomen = nomenMap[ad] || {};
    const pd = {};
    for (const p of PERIODS) {
      const arr = aggregatePeriod(info.rows, ranges[p.key].start, ranges[p.key].end);
      if (arr.some((x) => x > 0)) pd[p.key] = arr;
    }
    const pp = {};
    for (const k of Object.keys(prevRanges)) {
      const arr = aggregatePeriod(info.rows, prevRanges[k].start, prevRanges[k].end);
      if (arr.some((x) => x > 0)) pp[k] = arr;
    }
    return {
      ad,
      p: nomen.p || "N/A",
      r: nomen.r || "N/A",
      f: nomen.f || "N/A",
      co: nomen.co || "N/A",
      an: nomen.an || "N/A",
      ad2: nomen.ad2 || "N/A",
      v: nomen.v || "",
      url: nomen.url || "",
      thumb: "",
      dp: info.dp,
      dd: info.dd,
      du: info.du,
      pd,
      pp,
    };
  });

  return { DAILY, ADS, TODAY };
}

// ── Top-level: parse both CSVs and return { DAILY, ADS, TODAY } ──
export async function parseFiles(nomenFile, perfFile) {
  const nomenText = await nomenFile.text();
  const perfText = await perfFile.text();
  const nomenMap = parseNomenclature(nomenText);
  const perfRows = parsePerf(perfText);
  return buildDataset(perfRows, nomenMap);
}
