/**
 * LQK BRAND IMAGE GENERATOR — v7 (Structured Brief System)
 * -----------------------------------------------------------------------------------------
 * WHAT'S NEW vs v6:
 *   - Structured columns (B–J) replace the single free-text prompt. Staff fill in a
 *     "creative brief" per row and the script assembles a consistent, branded prompt.
 *   - Per-row Quality column: Draft = Nano Banana (gemini-2.5-flash-image, cheap),
 *     Final = Nano Banana Pro (gemini-3-pro-image-preview, best text rendering).
 *   - Content Type presets auto-set the aspect ratio (IG Post, Story/Reel, Poster, ...).
 *   - Characters dropdown controls which reference images are sent — only the refs the
 *     scene needs are attached (cheaper calls, less character confusion).
 *   - Text Overlay column for poster headlines/dates/CTAs (English allowed for marketing
 *     text; the Arabic-only rule still applies to in-scene wall art and boards).
 *   - API key lives in Script Properties (menu: Set API Key), not in the code.
 *   - "Setup / Repair Sheet" menu builds the headers, dropdowns and an Instructions tab.
 *
 * SHEET LAYOUT (row 1 = headers, data starts at row 2):
 *   A = Image Title              (used as the file name)
 *   B = Content Type             (dropdown — sets the aspect ratio)
 *   C = Scene & Action           (REQUIRED — what is happening)
 *   D = Characters               (dropdown — which cast members appear)
 *   E = Location & Setting       (where the scene takes place)
 *   F = Camera Angle & Framing   (dropdown, free text allowed)
 *   G = Logo Placement           (where the LQK logo appears)
 *   H = Text Overlay             (EXACT text to render on the image, optional)
 *   I = Mood & Lighting          (dropdown, free text allowed)
 *   J = Quality                  (Draft = cheap model, Final = pro model)
 *   K = Status                   (script fills in: DONE / ERROR)
 *   L = Image Link               (script fills in)
 */

// ================= CONFIG =================
const SHEET_NAME = 'Prompts';
const INSTRUCTIONS_SHEET_NAME = 'Instructions';
const FOLDER_NAME = 'LQK Generated Images';
const DELAY_MS = 5000;
const MAX_RUN_MS = 4.5 * 60 * 1000; // stop before the 6-min Apps Script limit

// Models ("Nano Banana" family)
const MODEL_DRAFT = 'gemini-2.5-flash-image';      // Nano Banana — cheap, fast drafts
const MODEL_FINAL = 'gemini-3-pro-image-preview';  // Nano Banana Pro — best quality & text

// Your Fixed Brand Asset Links
const BOY_URL = 'https://drive.google.com/file/d/1qCyOQcZmmyaawBp_hTrXj13by_Vo9WQL/view?usp=share_link';
const GIRL_URL = 'https://drive.google.com/file/d/1tJYDdoIKR25FCj3FDQNvN_fjrnGL7TXy/view?usp=share_link';
const LOGO_URL = 'https://drive.google.com/file/d/1v0QpKEP8_INkMTgpjWfEGDhw1uPDnrz7/view?usp=share_link';
const TEACHER_CREAM_URL = 'https://drive.google.com/file/d/13bD5cWvRLarNMAf2Cd5gX_NOJ7av0a09/view?usp=share_link';
const TEACHER_BLACK_URL = 'https://drive.google.com/file/d/1Lqflo7gHMf3Oa7XWDp0pDCKsccxuxmS-/view?usp=share_link';

const ASSET_URLS = {
  boy: BOY_URL,
  girl: GIRL_URL,
  logo: LOGO_URL,
  teacherCream: TEACHER_CREAM_URL,
  teacherBlack: TEACHER_BLACK_URL
};

// ============ COLUMN MAP (1-based) ============
const COL = {
  TITLE: 1,        // A
  CONTENT_TYPE: 2, // B
  SCENE: 3,        // C
  CHARACTERS: 4,   // D
  LOCATION: 5,     // E
  CAMERA: 6,       // F
  LOGO: 7,         // G
  TEXT_OVERLAY: 8, // H
  MOOD: 9,         // I
  QUALITY: 10,     // J
  STATUS: 11,      // K
  LINK: 12         // L
};
const LAST_INPUT_COL = COL.QUALITY;

// ============ DROPDOWN PRESETS ============
// Content Type -> aspect ratio sent to the API
const CONTENT_TYPES = {
  'IG Post (1:1)':          { ratio: '1:1',  label: 'square Instagram feed post' },
  'IG Portrait (4:5)':      { ratio: '4:5',  label: 'portrait Instagram feed post' },
  'Story / Reel (9:16)':    { ratio: '9:16', label: 'vertical Instagram story / reel cover' },
  'Event Poster (3:4)':     { ratio: '3:4',  label: 'printable portrait event poster' },
  'Banner / Web (16:9)':    { ratio: '16:9', label: 'wide web or presentation banner' },
  'YouTube Thumbnail (16:9)': { ratio: '16:9', label: 'YouTube thumbnail' }
};
const DEFAULT_CONTENT_TYPE = 'IG Post (1:1)';

// Characters -> which reference assets are attached to the API call
const CHARACTER_OPTIONS = {
  'None (no people)':         [],
  'Boy only':                 ['boy'],
  'Girl only':                ['girl'],
  'Boy + Girl':               ['boy', 'girl'],
  'Teacher (Cream)':          ['teacherCream'],
  'Teacher (Black)':          ['teacherBlack'],
  'Both Teachers':            ['teacherCream', 'teacherBlack'],
  'Kids + Teacher (Cream)':   ['boy', 'girl', 'teacherCream'],
  'Kids + Teacher (Black)':   ['boy', 'girl', 'teacherBlack'],
  'Everyone':                 ['boy', 'girl', 'teacherCream', 'teacherBlack']
};
const DEFAULT_CHARACTERS = 'None (no people)';

const REF_LABELS = {
  boy: 'REFERENCE ASSET: BOY REFERENCE (the main young boy — match his face, hair and modest outfit exactly)',
  girl: 'REFERENCE ASSET: GIRL REFERENCE (the main young girl — always wears her hijab; match her face and outfit exactly)',
  teacherCream: 'REFERENCE ASSET: TEACHER 1 (CREAM) (female teacher in cream/beige outfit and hijab — match exactly)',
  teacherBlack: 'REFERENCE ASSET: TEACHER 2 (BLACK) (female teacher in black outfit and hijab — match exactly)',
  logo: 'REFERENCE ASSET: LQK BRAND LOGO (reproduce accurately — never distort, recolor or redraw it)'
};

const CAMERA_PRESETS = [
  'Eye-level medium shot',
  'Close-up on faces',
  'Wide establishing shot',
  'Low angle (child\'s perspective)',
  'Over-the-shoulder',
  'Overhead / flat lay',
  'Slight 3/4 angle (Pixar poster style)'
];

const MOOD_PRESETS = [
  'Warm morning light',
  'Soft golden hour',
  'Bright & cheerful daylight',
  'Cozy evening lamp light',
  'Calm & serene',
  'Festive & celebratory'
];

const QUALITY_OPTIONS = ['Draft (cheap)', 'Final (best)'];
const DEFAULT_QUALITY = 'Draft (cheap)';

// ============ BRAND RULES ============
function getBrandInstructions_() {
  return `
--- BRAND IDENTITY: LITTLE QURAN KIDS (LQK) ---
Little Quran Kids is an Islamic enrichment weekend class for children, focusing on teaching Juz Amma. All generated images must serve this brand with warmth, calm, and inspiration.

--- CORE VISUAL CRITERIA (MANDATORY) ---
1. ART STYLE: Every render must follow a consistent, high-quality, friendly DISNEY PIXAR 3D style matching the references.
2. COLOR PALETTE: Colors revolve around the LQK logo orange. All other colors must be cream and pastel, complementing the main orange. Class walls must always use cream pastel colors. Use gender-neutral and gender-specific colors only when contextually appropriate.
3. LOGO INTEGRATION: The provided LQK LOGO must appear in every single render, placed exactly as the LOGO PLACEMENT instruction in the scene brief describes. If no placement is given, make it a subtle background add-on (e.g., an engraved pattern, a subtle wall decal, a logo on a mug).

--- CHARACTER CAST & DRESS CODE ---
- Only include the characters listed in the CHARACTERS section of the scene brief. Do not add the main cast to scenes that do not request them.
- BOY REFERENCE: The main young boy character.
- GIRL REFERENCE: The main young girl character (always wears a hijab).
- TEACHER 1 (CREAM): The female teacher wearing a cream/beige outfit and hijab.
- TEACHER 2 (BLACK): The female teacher wearing a black outfit and hijab.
- Other Characters: Any extra characters requested in the brief must have unique facial features but must strictly follow the modest dress codes set by these main characters.
- EXPRESSIONS: All characters must look happy, inquisitive, calm, and warm.
- NO TOUCHING: There must be zero physical contact between boys and girls, or between the teachers and boys.

--- TEXT RULES ---
1. IN-SCENE TEXT (walls, boards, wall art, decor): must be references to Quranic Quotes or Hadith, written strictly in ARABIC ONLY. No English text on walls or boards inside the scene.
2. MARKETING TEXT OVERLAY: If the scene brief contains a TEXT OVERLAY section, render that text EXACTLY as written, letter-perfect, with zero spelling changes. Use clean, friendly, rounded typography that matches the brand (orange / cream palette), sized and placed for the stated format. This overlay text is graphic-design text on top of the artwork, not part of the scene's wall decor, and it may be in English.
3. If there is NO TEXT OVERLAY section, do not add any marketing text, captions or watermarks.

--- CULTURAL & ISLAMIC RULES ---
1. ISLAMIC ARCHITECTURE: All buildings, furniture, paintings, and walls must be inspired by Islamic shapes (e.g., arches) or contain a repeated Islamic pattern.
2. CONSTRAINTS (NO CROSSES): Avoid anything that looks like a cross, including cross-panes on windows. Use vertical or arched window designs instead.
3. RESPECT FOR BOOKS: Never put books on the floor. Books must always be placed on tables, shelves, desks, or held in hands.
4. CLEANLINESS: Classrooms must be tidy. No messy floors, no clutter, and no messy board scribbles.

--- REFERENCES INCLUDED IN THIS CALL ---
Use the attached reference images labeled below to maintain perfect visual asset consistency. The scene brief follows after the references.
`;
}

// ============ MENU ============
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🖼️ LQK Images')
    .addItem('▶️ Generate All Pending', 'generateAllImages')
    .addItem('▶️ Generate Selected Rows', 'generateSelectedRows')
    .addSeparator()
    .addItem('🧹 Reset All Statuses', 'resetStatuses')
    .addItem('🛠️ Setup / Repair Sheet', 'setupSheet')
    .addItem('🔑 Set API Key', 'setApiKey')
    .addToUi();
}

// ============ API KEY (Script Properties, not hardcoded) ============
function setApiKey() {
  const ui = SpreadsheetApp.getUi();
  const res = ui.prompt('Gemini API Key',
    'Paste your Google AI Studio API key. It is stored in Script Properties, not in the sheet or code.',
    ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;
  const key = res.getResponseText().trim();
  if (!key) { ui.alert('No key entered — nothing saved.'); return; }
  PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', key);
  ui.alert('API key saved.');
}

function getApiKey_() {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) throw new Error('No API key set. Use menu: 🖼️ LQK Images → Set API Key.');
  return key;
}

// ============ SHEET SETUP ============
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME, 0);

  const headers = [
    'Image Title', 'Content Type', 'Scene & Action', 'Characters',
    'Location & Setting', 'Camera Angle & Framing', 'Logo Placement',
    'Text Overlay (exact text)', 'Mood & Lighting', 'Quality', 'Status', 'Image Link'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
    .setFontWeight('bold')
    .setBackground('#F57C00')
    .setFontColor('#FFFFFF')
    .setWrap(true);
  sheet.setFrozenRows(1);

  const maxRows = Math.max(sheet.getMaxRows() - 1, 100);

  // Dropdown validations
  setDropdown_(sheet, maxRows, COL.CONTENT_TYPE, Object.keys(CONTENT_TYPES), false);
  setDropdown_(sheet, maxRows, COL.CHARACTERS, Object.keys(CHARACTER_OPTIONS), false);
  setDropdown_(sheet, maxRows, COL.CAMERA, CAMERA_PRESETS, true);   // free text allowed
  setDropdown_(sheet, maxRows, COL.MOOD, MOOD_PRESETS, true);       // free text allowed
  setDropdown_(sheet, maxRows, COL.QUALITY, QUALITY_OPTIONS, false);

  // Column widths for readability
  const widths = [170, 150, 320, 170, 220, 180, 220, 220, 160, 120, 150, 200];
  widths.forEach(function (w, i) { sheet.setColumnWidth(i + 1, w); });
  sheet.getRange(2, 1, maxRows, headers.length).setWrap(true).setVerticalAlignment('top');

  // Example row (only if the sheet is empty)
  if (sheet.getLastRow() < 2) {
    sheet.getRange(2, 1, 1, LAST_INPUT_COL).setValues([[
      'Eid Open House Poster',
      'Event Poster (3:4)',
      'The boy and girl joyfully decorating the classroom with paper lanterns for Eid, standing on opposite sides of a table',
      'Boy + Girl',
      'Bright LQK classroom with cream pastel walls, arched windows, tidy bookshelves',
      'Eye-level medium shot',
      'Logo printed on a banner hanging above the whiteboard',
      'Eid Open House — Sunday 2PM | Little Quran Kids',
      'Bright & cheerful daylight',
      'Draft (cheap)'
    ]]).setFontStyle('italic').setFontColor('#888888');
  }

  buildInstructionsSheet_(ss);
  SpreadsheetApp.getUi().alert('Sheet is set up! Read the "Instructions" tab, then fill rows from row 2 and use 🖼️ LQK Images → Generate.');
}

function setDropdown_(sheet, numRows, col, values, allowOther) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(allowOther)
    .build();
  sheet.getRange(2, col, numRows, 1).setDataValidation(rule);
}

function buildInstructionsSheet_(ss) {
  let sheet = ss.getSheetByName(INSTRUCTIONS_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(INSTRUCTIONS_SHEET_NAME);
  sheet.clear();

  const rows = [
    ['LQK IMAGE GENERATOR — HOW TO USE', ''],
    ['', ''],
    ['1. Fill one row per image on the "Prompts" tab (start at row 2).', ''],
    ['2. Columns C (Scene & Action) is REQUIRED. Everything else has sensible defaults.', ''],
    ['3. Use Quality = Draft (cheap) while iterating. Switch to Final (best) for the real render — Final is better at poster text.', ''],
    ['4. Menu: 🖼️ LQK Images → Generate All Pending. Rows marked DONE are skipped; clear the Status cell to re-run a row.', ''],
    ['', ''],
    ['COLUMN', 'WHAT TO WRITE'],
    ['A — Image Title', 'File name for the image, e.g. "Eid Open House Poster".'],
    ['B — Content Type', 'Pick the format. This automatically sets the image ratio (IG Post 1:1, Story/Reel 9:16, Poster 3:4, etc.).'],
    ['C — Scene & Action', 'REQUIRED. What is happening, in one or two sentences. Focus on the action and emotion, e.g. "The girl proudly reciting from her mushaf while the teacher listens".'],
    ['D — Characters', 'Pick who appears. Only the chosen characters\' reference images are sent, so the AI won\'t sneak the others in. Choose "None (no people)" for scenery/object shots.'],
    ['E — Location & Setting', 'Where it happens, e.g. "LQK classroom, cream pastel walls, arched windows" or "outdoor garden picnic".'],
    ['F — Camera Angle & Framing', 'Pick a preset or type your own, e.g. "Close-up on faces" or "Wide establishing shot".'],
    ['G — Logo Placement', 'Where the LQK logo should appear, e.g. "on the boy\'s t-shirt", "banner above the door", "subtle wall decal". Leave blank for a subtle background placement.'],
    ['H — Text Overlay (exact text)', 'OPTIONAL. The exact headline/date/CTA to render on the image, e.g. "Eid Open House — Sunday 2PM". Spelling is copied letter-for-letter. Leave blank for no marketing text. Keep it SHORT — long text renders badly.'],
    ['I — Mood & Lighting', 'Pick a preset or type your own, e.g. "Warm morning light".'],
    ['J — Quality', 'Draft (cheap) = Nano Banana, fast + low cost, good for testing. Final (best) = Nano Banana Pro, best detail and accurate poster text.'],
    ['K — Status', 'Filled by the script: Working… / DONE / ERROR. Clear it to regenerate a row.'],
    ['L — Image Link', 'Filled by the script: Google Drive link to the finished image.'],
    ['', ''],
    ['BRAND RULES (AUTOMATIC — you don\'t need to type these)', 'Pixar 3D style, LQK orange + cream pastel palette, logo in every image, hijab/modesty dress code, no boy–girl contact, Arabic-only wall text, Islamic arches, no cross shapes, no books on floors, tidy rooms.']
  ];

  sheet.getRange(1, 1, rows.length, 2).setValues(rows).setWrap(true).setVerticalAlignment('top');
  sheet.getRange(1, 1).setFontWeight('bold').setFontSize(14).setFontColor('#F57C00');
  sheet.getRange(8, 1, 1, 2).setFontWeight('bold').setBackground('#FFE0B2');
  sheet.setColumnWidth(1, 260);
  sheet.setColumnWidth(2, 700);
}

// ============ GENERATION ============
function generateAllImages() {
  runGeneration_(null);
}

function generateSelectedRows() {
  const sheet = getSheet_();
  const ranges = sheet.getActiveRangeList();
  if (!ranges) { SpreadsheetApp.getUi().alert('Select the rows you want to generate first.'); return; }
  const rowSet = {};
  ranges.getRanges().forEach(function (r) {
    for (let row = r.getRow(); row <= r.getLastRow(); row++) {
      if (row >= 2) rowSet[row] = true;
    }
  });
  const rows = Object.keys(rowSet).map(Number);
  if (!rows.length) { SpreadsheetApp.getUi().alert('Select data rows (row 2 or below).'); return; }
  runGeneration_(rowSet);
}

function runGeneration_(onlyRows) {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('No prompts found. Add data starting at row 2 (run Setup / Repair Sheet first if needed).');
    return;
  }

  getApiKey_(); // fail fast with a clear message before touching any row

  const folder = getOrCreateFolder_(FOLDER_NAME);
  const refCache = {}; // lazy-loaded Drive reference images, keyed by asset name
  const data = sheet.getRange(2, 1, lastRow - 1, COL.STATUS).getValues();
  const startTime = Date.now();
  let doneCount = 0;

  for (let i = 0; i < data.length; i++) {
    const row = i + 2;
    if (onlyRows && !onlyRows[row]) continue;

    const brief = readBrief_(data[i]);
    const status = String(data[i][COL.STATUS - 1]).trim();

    if (!brief.scene) continue;                       // nothing to generate
    if (!onlyRows && status === 'DONE') continue;     // "Generate Selected" forces a re-run

    if (Date.now() - startTime > MAX_RUN_MS) {
      SpreadsheetApp.getUi().alert(
        'Paused to avoid the Apps Script timeout. ' + doneCount +
        ' images done this run. Run Generate again to continue — DONE rows are skipped.'
      );
      return;
    }

    sheet.getRange(row, COL.STATUS).setValue('Working...');
    SpreadsheetApp.flush();

    try {
      const parts = buildParts_(brief, refCache);
      const imageBlob = callGeminiImage_(parts, brief.model, brief.ratio);

      const safeName = (brief.title || 'image_row' + row)
        .replace(/[^a-zA-Z0-9 _-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 80);
      const file = folder.createFile(imageBlob.setName(safeName + '.png'));
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      sheet.getRange(row, COL.STATUS).setValue('DONE');
      sheet.getRange(row, COL.LINK).setValue(file.getUrl());
      doneCount++;
    } catch (err) {
      sheet.getRange(row, COL.STATUS).setValue('ERROR: ' + String(err.message).substring(0, 400));
    }

    SpreadsheetApp.flush();
    Utilities.sleep(DELAY_MS);
  }

  SpreadsheetApp.getUi().alert('Finished! ' + doneCount + ' images generated this run.');
}

/** Reads one sheet row into a clean brief object with defaults applied. */
function readBrief_(rowValues) {
  const get = function (col) { return String(rowValues[col - 1] || '').trim(); };

  const contentTypeKey = CONTENT_TYPES[get(COL.CONTENT_TYPE)] ? get(COL.CONTENT_TYPE) : DEFAULT_CONTENT_TYPE;
  const contentType = CONTENT_TYPES[contentTypeKey];

  const charKey = CHARACTER_OPTIONS.hasOwnProperty(get(COL.CHARACTERS)) ? get(COL.CHARACTERS) : DEFAULT_CHARACTERS;

  const quality = get(COL.QUALITY) || DEFAULT_QUALITY;
  const isFinal = quality.toLowerCase().indexOf('final') === 0;

  return {
    title: get(COL.TITLE),
    contentTypeKey: contentTypeKey,
    formatLabel: contentType.label,
    ratio: contentType.ratio,
    scene: get(COL.SCENE),
    charKey: charKey,
    refKeys: CHARACTER_OPTIONS[charKey],
    location: get(COL.LOCATION),
    camera: get(COL.CAMERA),
    logoPlacement: get(COL.LOGO),
    textOverlay: get(COL.TEXT_OVERLAY),
    mood: get(COL.MOOD),
    model: isFinal ? MODEL_FINAL : MODEL_DRAFT
  };
}

/** Assembles the full multimodal parts array: brand rules + needed references + scene brief. */
function buildParts_(brief, refCache) {
  const parts = [{ text: getBrandInstructions_() }];

  // Character references — only the ones this scene needs
  brief.refKeys.forEach(function (key) {
    const part = getRefPart_(key, refCache);
    if (part) {
      parts.push({ text: REF_LABELS[key] });
      parts.push(part);
    }
  });

  // Logo goes into every render
  const logoPart = getRefPart_('logo', refCache);
  if (logoPart) {
    parts.push({ text: REF_LABELS.logo });
    parts.push(logoPart);
  }

  parts.push({ text: buildSceneBrief_(brief) });
  return parts;
}

/** Builds the structured scene brief text from the row's columns. */
function buildSceneBrief_(brief) {
  const lines = [];
  lines.push('--- SCENE BRIEF — follow every line exactly ---');
  lines.push('FORMAT: ' + brief.contentTypeKey + ' — compose the image as a ' + brief.formatLabel + '.');
  lines.push('SCENE & ACTION: ' + brief.scene);
  lines.push('CHARACTERS: ' + (brief.refKeys.length
    ? brief.charKey + ' — use ONLY the attached character references listed above; do not invent or add other main cast members.'
    : 'No people in this scene. Do not add any characters.'));
  if (brief.location) lines.push('LOCATION & SETTING: ' + brief.location);
  if (brief.camera) lines.push('CAMERA ANGLE & FRAMING: ' + brief.camera);
  lines.push('LOGO PLACEMENT: ' + (brief.logoPlacement ||
    'Subtle background placement (e.g., wall decal, engraved pattern, or logo on an object).'));
  if (brief.textOverlay) {
    lines.push('TEXT OVERLAY: Render this EXACT text on the image, spelled letter-for-letter with no changes: "' +
      brief.textOverlay + '". Style it as clean brand typography (orange/cream palette) suited to a ' +
      brief.formatLabel + ', with high readability.');
  } else {
    lines.push('TEXT OVERLAY: None. Do not add any marketing text, captions or watermarks.');
  }
  if (brief.mood) lines.push('MOOD & LIGHTING: ' + brief.mood);
  lines.push('Now create this scene, matching all reference features and following every brand rule perfectly.');
  return lines.join('\n');
}

// ============ REFERENCE ASSETS (lazy + cached per run) ============
function getRefPart_(key, refCache) {
  if (refCache.hasOwnProperty(key)) return refCache[key];
  refCache[key] = driveImagePart_(ASSET_URLS[key]);
  return refCache[key];
}

/** Converts one Drive link into an inlineData part, or null if placeholder/empty. */
function driveImagePart_(url) {
  if (!url || url.indexOf('PASTE_') === 0 || url.trim() === '') return null;
  const fileId = extractDriveId_(url);
  if (!fileId) throw new Error('Could not read a file ID from link: ' + url);
  try {
    const blob = DriveApp.getFileById(fileId).getBlob();
    return {
      inlineData: {
        mimeType: blob.getContentType(),
        data: Utilities.base64Encode(blob.getBytes())
      }
    };
  } catch (e) {
    throw new Error('Failed to access Drive file ID ' + fileId + '. Verify permissions.');
  }
}

function extractDriveId_(url) {
  let m = url.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (m) return m[1];
  m = url.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (m) return m[1];
  m = url.match(/^([a-zA-Z0-9_-]{20,})$/);
  return m ? m[1] : null;
}

// ============ GEMINI CALL ============
function callGeminiImage_(parts, model, aspectRatio) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
              model + ':generateContent?key=' + getApiKey_();

  const payload = {
    contents: [{ parts: parts }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { aspectRatio: aspectRatio }
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  // Retry transient errors (rate limit / server) with backoff
  let response, code;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = UrlFetchApp.fetch(url, options);
    code = response.getResponseCode();
    if (code === 200) break;
    if (code === 429 || code >= 500) {
      Utilities.sleep(Math.pow(2, attempt) * 5000); // 5s, 10s, 20s
      continue;
    }
    break; // 4xx other than 429 won't fix itself
  }

  if (code !== 200) {
    let msg = 'HTTP ' + code;
    try {
      const errJson = JSON.parse(response.getContentText());
      if (errJson.error && errJson.error.message) msg = errJson.error.message;
    } catch (e) { }
    throw new Error(msg);
  }

  const json = JSON.parse(response.getContentText());
  const outParts = (((json.candidates || [])[0] || {}).content || {}).parts || [];

  for (const part of outParts) {
    if (part.inlineData && part.inlineData.data) {
      const bytes = Utilities.base64Decode(part.inlineData.data);
      return Utilities.newBlob(bytes, part.inlineData.mimeType || 'image/png');
    }
  }
  throw new Error('No image returned — the model may have refused this prompt.');
}

// ============ HOUSEKEEPING ============
function resetStatuses() {
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    sheet.getRange(2, COL.STATUS, lastRow - 1, 2).clearContent();
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

function getOrCreateFolder_(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}
