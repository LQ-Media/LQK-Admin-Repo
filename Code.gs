/**
 * ============================================================
 *  LQK CONTENT ENGINE  —  v2.0
 *  Theme-driven TikTok/Instagram content system for
 *  Little Quran Kids
 * ============================================================
 *  WHAT'S NEW IN v2 (vs v1)
 *  - Setup now ASKS you (pop-ups) for:
 *        1) the EVENT / THEME / IDEA this batch is built around
 *        2) HOW MANY DAYS of content to plan (1–60)
 *        3) the START DATE (defaults to the next Monday)
 *  - The theme "flavours everything": it is woven into every
 *    planned topic AND sent to Claude with every generation, so
 *    hooks, scripts and captions all lean into your event/idea.
 *  - Each Setup builds a NEW, auto-named tab (e.g.
 *    "Ramadan Prep — 13 Jul 2026"), so old calendars are kept
 *    and nothing gets overwritten.
 *  - The API key now lives in Script Properties, NOT in the code.
 *
 *  ONE-TIME SETUP
 *  a. LQK Content menu → "Set / update API key" → paste your
 *     Anthropic API key (console.anthropic.com → API Keys).
 *  b. Use "1. Setup Sheet" and answer the prompts.
 *  c. Then "2. Generate All PLANNED rows".
 * ============================================================
 */

// ─────────────────────────  CONFIG  ─────────────────────────
const CONFIG = {
  MODEL: 'claude-sonnet-4-6',
  DEFAULT_DAYS: 30,
  MAX_DAYS: 60,
  DELAY_MS: 3000,                // Pause between API calls
  BRAND_COLOR: '#B4571C',
  API_KEY_PROP: 'ANTHROPIC_API_KEY'   // key name in Script Properties
};

// ───────────────────────  BRAND BRIEF  ──────────────────────
// This is sent to Claude with every generation request.
const BRAND = `
BUSINESS: Little Quran Kids (LQK), littlequrankids.sg — Islamic enrichment
centre in Singapore. Core promise: children memorize Juz Amma through PLAY,
not rote drilling. Method blends Quran memorization, Sirah storytelling,
and percussion (Daff, Darbuka) and songs. Branches: Woods Square, Primz
Bizhub, Tampines Blk 462, Tampines Junction. Ages roughly 4–12.
AUDIENCE: Muslim parents in Singapore (mums especially), 28–45, busy,
want their kids to love the Quran, wary of harsh/boring madrasah styles.
VOICE: Warm, confident, practical. Never preachy. Singapore-flavoured but
understandable globally. No dancing-trend references.
GOAL OF ACCOUNT: grow to 100K followers and fill 2027 class registration.
Every post must serve GROWTH, TRUST, or CONVERSION.
CTA CONVENTIONS: growth posts end with a save/share nudge or a question;
Playbook and Doors posts end with: Comment TRACKER for the free
"Juz Amma at Home Tracker" (WhatsApp delivery). Never more than one CTA.
`;

// ─────────────────────  PILLAR DEFINITIONS  ─────────────────
const PILLARS = {
  P1: {
    name: 'P1 Kid Proof', job: 'GROWTH', filming: 'YES',
    format: '15–30s video (real child footage)',
    brief: 'A real LQK student reciting / before-vs-after memorization proof. ' +
      'Claude writes: text-overlay hook, a SHOT LIST for filming or cutting ' +
      'existing class footage, and the caption. Hook patterns: ' +
      '"She\'s [age]. She memorized [surah] in [timeframe]..." / ' +
      '"No one believed a [age]-year-old could recite this. Watch." / ' +
      '"POV: your child asks to practice Quran instead of watching TV."'
  },
  P2: {
    name: 'P2 Parent Playbook', job: 'GROWTH', filming: 'NO',
    format: '8-slide carousel (text slides, LQK brand style)',
    brief: 'How-to memorization tips parents can use tonight. One surah per ' +
      'week. Claude writes: hook slide + full slide-by-slide text (8 slides), ' +
      'caption with TRACKER CTA. Hook patterns: ' +
      '"Your child can memorize [surah] in 7 days. Day 1:..." / ' +
      '"Stop making your kid repeat ayat 20 times. Do this instead." / ' +
      '"The 5-minute bedtime routine that finished our students\' Juz Amma."'
  },
  P2S: {
    name: 'P2 Shareable (Jumu\'ah)', job: 'GROWTH', filming: 'NO',
    format: 'Single shareable graphic or 4-slide mini-carousel',
    brief: 'Friday save/share asset for Muslim families: checklist, tracker ' +
      'preview, dua card, "Surah Al-Kahf with your kids" style. Optimize for ' +
      'SHARES to family WhatsApp groups. Keep text minimal and beautiful.'
  },
  P3: {
    name: 'P3 Inside LQK', job: 'TRUST', filming: 'YES',
    format: '20–30s BTS video (class footage / teacher to camera)',
    brief: 'Behind the scenes: percussion in class, teacher explaining one ' +
      'method element, kids running IN to class. Claude writes: hook overlay, ' +
      'shot list, 1–2 short teacher lines to say on camera, caption. ' +
      'Hook patterns: "This is what Quran class looks like when nobody\'s ' +
      'forced to sit still." / "Why there\'s a Daff drum in our memorization class."'
  },
  P4: {
    name: 'P4 Hot Take', job: 'GROWTH', filming: 'NO',
    format: 'Text-over-b-roll video (reuse Wednesday footage)',
    brief: 'Contrarian but defensible education take. Claude writes: bold ' +
      'on-screen hook, 60–90 word voiceover/text script that lands the ' +
      'argument and pivots to the LQK method, caption inviting discussion. ' +
      'Hook patterns: "Unpopular opinion: [common practice] is why kids hate ' +
      'madrasah." / "If your child memorized Juz Amma but dreads class, ' +
      'something\'s wrong." Never attack named schools or teachers.'
  },
  P5S: {
    name: 'P5 Doors (Soft)', job: 'CONVERSION', filming: 'OPTIONAL',
    format: 'Testimonial clip or result recap',
    brief: 'Soft-sell Sunday: parent testimonial or student result story. ' +
      'Claude writes: hook, structure/shot list, caption ending with the ' +
      'TRACKER comment CTA (not a hard registration push).'
  },
  P5H: {
    name: 'P5 Doors (Hard)', job: 'CONVERSION', filming: 'OPTIONAL',
    format: 'Offer post (video or carousel)',
    brief: 'Hard-sell (final week): waitlist/workshop offer with real ' +
      'scarcity (class caps per branch). Claude writes: hook, script, caption ' +
      'with clear next step: "Waitlist in bio" or "Comment TRACKER".'
  }
};

// Weekly rhythm: index 0 = Monday ... 6 = Sunday
// Saturday alternates P1/P3 by week; Sunday is P5 soft, going HARD only
// in the final week of the batch.
function pillarForDay_(dayIdx, weekNum, totalWeeks) {
  switch (dayIdx) {
    case 0: return 'P1';
    case 1: return 'P2';
    case 2: return 'P3';
    case 3: return 'P4';
    case 4: return 'P2S';
    case 5: return (weekNum % 2 === 1) ? 'P3' : 'P1';
    case 6: return (weekNum === totalWeeks) ? 'P5H' : 'P5S';
  }
}

// ─────────────────────  TOPIC SEEDS  ────────────────────────
// One surah per week drives P2; other pillars rotate through seed lists.
const WEEK_SURAHS = ['An-Nas', 'Al-Falaq', 'Al-Ikhlas', 'Al-Kafirun', 'Al-Masad'];

const SEEDS = {
  P1: ['Day 1 vs today recitation of this week\'s surah',
       'Youngest student reciting confidently',
       'Child correcting their own tajweed mid-recitation',
       'Sibling pair reciting together',
       'Child leading the class recitation'],
  P3: ['Why the Daff drum is in our memorization class',
       'The 60-second warm-up before every class',
       'Teacher explains how play beats rote drilling',
       'Kids arriving early and excited — what we do differently',
       'How we track each child\'s Juz Amma progress'],
  P4: ['Rote repetition is why kids forget Juz Amma by 12',
       'Longer madrasah hours do not equal better memorization',
       'Rewarding kids with screen time for Quran practice backfires',
       'A child who dreads class has a method problem, not a discipline problem',
       'Testing kids in front of the class kills love of Quran'],
  P5S: ['Parent testimonial: shy child now recites for guests',
        'Result story: finished 5 surahs in one term',
        'Workshop recap: Sirah + percussion weekend'],
  P5H: ['Registration waitlist — early access + class caps per branch']
};

// ───────────────────────  MENU  ─────────────────────────────
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('LQK Content')
      .addItem('1. Setup Sheet (asks theme + number of days)', 'setupSheet')
      .addItem('2. Generate All PLANNED rows', 'generateAll')
      .addItem('3. Generate This Row only', 'generateSelected')
      .addSeparator()
      .addItem('Mark selected row POSTED', 'markPosted')
      .addSeparator()
      .addItem('Set / update API key', 'setApiKey')
      .addToUi();
  } catch (e) { Logger.log('onOpen: ' + e); }
}

// Graceful notifier — never crashes when no UI is available.
function notify_(msg) {
  try { SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'LQK Content', 8); }
  catch (e) { Logger.log('NOTIFY: ' + msg); }
}

// ───────────────────  API KEY (Script Properties)  ──────────
function setApiKey() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.prompt(
    'Set Anthropic API key',
    'Paste your API key (starts with "sk-ant-"). It is stored privately in ' +
    'this project\'s Script Properties — not in the code or the sheet.',
    ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  const key = resp.getResponseText().trim();
  if (key.indexOf('sk-ant-') !== 0) {
    ui.alert('That does not look like an Anthropic key (expected it to start ' +
      'with "sk-ant-"). Nothing was saved.');
    return;
  }
  PropertiesService.getScriptProperties().setProperty(CONFIG.API_KEY_PROP, key);
  notify_('API key saved.');
}

function getApiKey_() {
  const key = PropertiesService.getScriptProperties().getProperty(CONFIG.API_KEY_PROP);
  if (!key) {
    throw new Error('No API key set. Use the "LQK Content → Set / update API key" ' +
      'menu item first.');
  }
  return key;
}

// ───────────────────  1. SETUP SHEET  ───────────────────────
const HEADERS = ['Day', 'Date', 'Weekday', 'Pillar', 'Job', 'Format',
  'Filming?', 'Topic', 'Hook', 'Script / Shot List / Slides',
  'Caption', 'Hashtags', 'Status', 'Posted Link / Notes'];

const THEME_META_KEY = 'lqk_theme';

function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  // ── Prompt 1: theme / event / idea ──
  const themeResp = ui.prompt(
    'Step 1 of 3 — Theme / Event / Idea',
    'What is this batch built around? Examples: "Ramadan 2027 prep", ' +
    '"Open house at Tampines", "Muharram / new hijri year", "Back to school".\n\n' +
    'Leave blank for a general evergreen batch.',
    ui.ButtonSet.OK_CANCEL);
  if (themeResp.getSelectedButton() !== ui.Button.OK) { notify_('Setup cancelled.'); return; }
  const theme = themeResp.getResponseText().trim();

  // ── Prompt 2: number of days ──
  const daysResp = ui.prompt(
    'Step 2 of 3 — How many days?',
    'How many days of content should I plan? (1–' + CONFIG.MAX_DAYS + ')\n\n' +
    'Leave blank for ' + CONFIG.DEFAULT_DAYS + '.',
    ui.ButtonSet.OK_CANCEL);
  if (daysResp.getSelectedButton() !== ui.Button.OK) { notify_('Setup cancelled.'); return; }
  let days = parseInt(daysResp.getResponseText().trim(), 10);
  if (isNaN(days)) days = CONFIG.DEFAULT_DAYS;
  days = Math.max(1, Math.min(CONFIG.MAX_DAYS, days));

  // ── Prompt 3: start date ──
  const defaultStart = nextMonday_();
  const tz = ss.getSpreadsheetTimeZone();
  const startResp = ui.prompt(
    'Step 3 of 3 — Start date',
    'Day 1 date as YYYY-MM-DD.\n\n' +
    'Leave blank to use the next Monday (' +
    Utilities.formatDate(defaultStart, tz, 'dd MMM yyyy') + ').',
    ui.ButtonSet.OK_CANCEL);
  if (startResp.getSelectedButton() !== ui.Button.OK) { notify_('Setup cancelled.'); return; }
  let start;
  const startText = startResp.getResponseText().trim();
  if (!startText) {
    start = defaultStart;
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(startText)) {
    start = new Date(startText + 'T00:00:00');
    if (isNaN(start.getTime())) { ui.alert('Could not read that date. Setup cancelled.'); return; }
  } else {
    ui.alert('Date must look like YYYY-MM-DD (e.g. 2026-07-13). Setup cancelled.');
    return;
  }
  if (start.getDay() !== 1) {
    notify_('Heads up: start date is not a Monday. The weekly rhythm assumes Day 1 = Monday.');
  }

  // ── Build the versioned tab ──
  const sheetName = uniqueSheetName_(ss, theme, start, tz);
  const sh = ss.insertSheet(sheetName);

  // Remember the theme on the sheet so generation can read it later.
  sh.addDeveloperMetadata(THEME_META_KEY, theme);

  // Header row
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setFontColor('#FFFFFF')
    .setBackground(CONFIG.BRAND_COLOR);
  sh.setFrozenRows(1);

  const totalWeeks = Math.ceil(days / 7);
  const rows = [];
  const seedCount = { P1: 0, P3: 0, P4: 0, P5S: 0, P5H: 0 };

  for (let d = 0; d < days; d++) {
    const date = new Date(start.getTime() + d * 86400000);
    const dayIdx = (date.getDay() + 6) % 7;          // 0=Mon..6=Sun
    const weekNum = Math.floor(d / 7) + 1;
    const key = pillarForDay_(dayIdx, weekNum, totalWeeks);
    const p = PILLARS[key];
    const surah = WEEK_SURAHS[Math.min(weekNum - 1, WEEK_SURAHS.length - 1)];

    let topic;
    if (key === 'P2')      topic = 'How to memorize Surah ' + surah + ' in 7 days (this week\'s surah)';
    else if (key === 'P2S') topic = 'Jumu\'ah shareable tied to Surah ' + surah + ' / family Friday habit';
    else {
      const list = SEEDS[key];
      topic = list[seedCount[key] % list.length];
      seedCount[key]++;
      if (key === 'P1') topic += ' (Surah ' + surah + ')';
    }
    if (theme) topic = topic + '  —  [theme: ' + theme + ']';

    rows.push([
      d + 1,
      Utilities.formatDate(date, tz, 'dd MMM yyyy'),
      Utilities.formatDate(date, tz, 'EEE'),
      p.name, p.job, p.format, p.filming, topic,
      '', '', '', '', 'PLANNED', ''
    ]);
  }

  sh.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);

  // Readability
  sh.setColumnWidths(1, 3, 70);
  sh.setColumnWidth(4, 150); sh.setColumnWidth(8, 260);
  sh.setColumnWidth(9, 260); sh.setColumnWidth(10, 380);
  sh.setColumnWidth(11, 300); sh.setColumnWidth(12, 200);
  sh.getRange(2, 1, rows.length, HEADERS.length).setWrap(true).setVerticalAlignment('top');

  // Status dropdown
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['PLANNED', 'GENERATED', 'APPROVED', 'POSTED', 'SKIP'], true).build();
  sh.getRange(2, 13, rows.length, 1).setDataValidation(rule);

  sh.activate();
  notify_(days + '-day calendar "' + sheetName + '" built' +
    (theme ? ' around "' + theme + '"' : '') +
    '. Now run "Generate All PLANNED rows".');
}

// Next Monday on/after today.
function nextMonday_() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const add = (8 - today.getDay()) % 7 || 7;   // days until the next Monday
  return new Date(today.getTime() + add * 86400000);
}

// Build a safe, unique tab name from theme + start date.
function uniqueSheetName_(ss, theme, start, tz) {
  let base = (theme ? theme : 'Content') + ' — ' + Utilities.formatDate(start, tz, 'dd MMM yyyy');
  base = base.replace(/[:\\\/\?\*\[\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90);
  let name = base, n = 2;
  while (ss.getSheetByName(name)) { name = base + ' (' + n + ')'; n++; }
  return name;
}

// ───────────────  2. GENERATE (Claude API)  ─────────────────
function generateAll() {
  const sh = activeCalendar_(); if (!sh) return;
  const theme = getSheetTheme_(sh);
  const data = sh.getDataRange().getValues();
  let done = 0, failed = 0;

  for (let r = 1; r < data.length; r++) {
    if (String(data[r][12]).trim() !== 'PLANNED') continue;
    const ok = generateRow_(sh, r + 1, data[r], theme);
    ok ? done++ : failed++;
    Utilities.sleep(CONFIG.DELAY_MS);
  }
  notify_('Generation finished. Success: ' + done + ', failed: ' + failed +
    (failed ? ' (see Posted Link / Notes column for errors)' : ''));
}

function generateSelected() {
  const sh = activeCalendar_(); if (!sh) return;
  const row = sh.getActiveCell().getRow();
  if (row < 2) { notify_('Select a content row first (row 2 or below).'); return; }
  const vals = sh.getRange(row, 1, 1, HEADERS.length).getValues()[0];
  const ok = generateRow_(sh, row, vals, getSheetTheme_(sh));
  notify_(ok ? 'Row ' + row + ' generated.' : 'Row ' + row + ' failed — see Notes column.');
}

function generateRow_(sh, rowNum, vals, theme) {
  const [dayNo, date, weekday, pillarName, job, format, filming, topic] = vals;
  const key = Object.keys(PILLARS).find(k => PILLARS[k].name === pillarName);
  const p = PILLARS[key] || PILLARS.P2;

  const themeLine = theme
    ? '\nOVERARCHING THEME / EVENT FOR THIS WHOLE BATCH: ' + theme +
      '\nWeave this theme naturally into the hook, script and caption where it fits — ' +
      'without breaking the pillar\'s job or forcing it where it feels unnatural.'
    : '';

  const prompt =
    BRAND +
    themeLine +
    '\nPILLAR: ' + p.name + '  |  JOB: ' + p.job + '  |  FORMAT: ' + p.format +
    '\nPILLAR BRIEF: ' + p.brief +
    '\nTOPIC FOR THIS POST (Day ' + dayNo + ', ' + weekday + ' ' + date + '): ' + topic +
    '\n\nWrite this single post for TikTok AND Instagram (one version works for both).' +
    '\nRespond with ONLY a JSON object, no markdown fences, no preamble, exactly these keys:' +
    '\n{"hook": "on-screen hook text, max 12 words",' +
    '\n "script": "For video: numbered shot list + any spoken/overlay lines. For carousel: Slide 1..8 with exact text per slide. Be specific enough to execute today.",' +
    '\n "caption": "80-150 words, ends with exactly ONE CTA per the brand CTA conventions",' +
    '\n "hashtags": "8-12 hashtags mixing Singapore-local (e.g. #sgmuslimparents #sgmums #islamicclasssg) and global reach (e.g. #juzamma #quranforkids #muslimparenting), space-separated"}';

  try {
    const text = callClaude_(prompt);
    const obj = parseJson_(text);
    sh.getRange(rowNum, 9, 1, 4).setValues([[
      obj.hook || '', obj.script || '', obj.caption || '', obj.hashtags || ''
    ]]);
    sh.getRange(rowNum, 13).setValue('GENERATED');
    return true;
  } catch (e) {
    sh.getRange(rowNum, 14).setValue('ERROR: ' + String(e).slice(0, 400));
    return false;
  }
}

function callClaude_(prompt) {
  const apiKey = getApiKey_();
  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify({
      model: CONFIG.MODEL,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    }),
    muteHttpExceptions: true
  });
  const code = res.getResponseCode();
  const body = res.getContentText();
  if (code !== 200) throw new Error('API ' + code + ': ' + body.slice(0, 300));
  const data = JSON.parse(body);
  return (data.content || []).map(b => b.text || '').join('\n');
}

function parseJson_(text) {
  const clean = text.replace(/```json|```/g, '').trim();
  const start = clean.indexOf('{'), end = clean.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON in response: ' + clean.slice(0, 200));
  return JSON.parse(clean.slice(start, end + 1));
}

// ───────────────────  UTILITIES  ────────────────────────────
// Returns the active sheet if it looks like an LQK calendar, else notifies.
function activeCalendar_() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const firstCell = sh.getRange(1, 1).getValue();
  const lastHeader = sh.getRange(1, HEADERS.length).getValue();
  if (firstCell !== HEADERS[0] || lastHeader !== HEADERS[HEADERS.length - 1]) {
    notify_('Open one of your LQK content tabs first (build one with "Setup Sheet").');
    return null;
  }
  return sh;
}

function getSheetTheme_(sh) {
  try {
    const md = sh.createDeveloperMetadataFinder().withKey(THEME_META_KEY).find();
    return (md && md.length) ? String(md[0].getValue()) : '';
  } catch (e) { return ''; }
}

function markPosted() {
  const sh = activeCalendar_(); if (!sh) return;
  const row = sh.getActiveCell().getRow();
  if (row < 2) { notify_('Select a content row first.'); return; }
  sh.getRange(row, 13).setValue('POSTED');
  notify_('Row ' + row + ' marked POSTED.');
}
