/**
 * ============================================================
 *  LQK CONTENT ENGINE  —  v3.0
 *  Event-driven TikTok/Instagram content system for
 *  Little Quran Kids
 * ============================================================
 *  WHAT'S NEW IN v3 (vs v2)
 *  - "Setup Sheet" now opens ONE form dialog (not typed pop-ups):
 *        1) EVENT TYPE — dropdown (10 options)
 *        2) FOCUS      — what to centre this batch on (suggestions
 *                        tailored to the event type + free text)
 *        3) DAYS       — how many days of content (1–60)
 *        4) START DATE — radio buttons (Next Monday / Monday after
 *                        next / First Monday of next month / Custom)
 *  - The event type + focus "flavour everything": woven into every
 *    planned topic AND sent to Claude with every generation, always
 *    grounded in the LQK brand identity.
 *  - The weekly surah still runs in the background so the Playbook,
 *    Friday shareable and Kid-Proof pillars stay concrete.
 *  - Each Setup builds a NEW, auto-named tab, so nothing is overwritten.
 *  - API key + model live in Script Properties, NOT in the code.
 *
 *  ONE-TIME SETUP
 *  a. LQK Content menu → "Set / update API key" → paste your key.
 *  b. "1. Setup Sheet" → fill in the form.
 *  c. "2. Generate All PLANNED rows".
 * ============================================================
 */

// ─────────────────────────  CONFIG  ─────────────────────────
const CONFIG = {
  MODEL: 'claude-sonnet-4-6',    // default model; override via "Set generation model"
  DEFAULT_DAYS: 30,
  MAX_DAYS: 60,
  DELAY_MS: 3000,                // Pause between API calls
  BRAND_COLOR: '#B4571C',
  API_KEY_PROP: 'ANTHROPIC_API_KEY',
  MODEL_PROP: 'ANTHROPIC_MODEL'
};

const MODEL_CHOICES = [
  'claude-sonnet-4-6',
  'claude-opus-4-8',
  'claude-haiku-4-5-20251001'
];

// ───────────────────────  BRAND BRIEF  ──────────────────────
// Sent to Claude with every generation request.
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

// ─────────────────────  EVENT TYPES  ────────────────────────
// Drives the Setup dropdown. `blurb` is fed to Claude; `suggestions`
// populate the focus field's type-ahead list for that event type.
const EVENT_TYPES = [
  { id: 'holiday', label: 'Islamic holiday / observance',
    blurb: 'This batch centres on an Islamic holiday or observance. Tie content warmly ' +
      'to the occasion and how LQK families can mark it with their kids.',
    suggestions: ['Ramadan', 'Eid al-Fitr', 'Eid al-Adha', 'Muharram / Hijri New Year',
      'Mawlid an-Nabi', "Isra' Mi'raj", 'Last 10 nights', 'Day of Arafah'] },
  { id: 'registration', label: 'Class registration campaign',
    blurb: 'This batch is a registration/enrolment campaign for upcoming classes. Build ' +
      'desire and trust across the batch and drive toward the waitlist/registration, ' +
      'using real per-branch class caps as honest scarcity. Keep the one-CTA rule.',
    suggestions: ['2027 enrolment open', 'Early-bird pricing', 'Branch caps / limited seats',
      'Waitlist priority', 'Trial class offer', 'New branch launch'] },
  { id: 'product', label: 'Product promotion',
    blurb: 'This batch promotes a specific LQK product or resource. Show it in real family ' +
      'use, make the benefit obvious, and give one clear next step.',
    suggestions: ['Juz Amma at Home Tracker', 'Memorization kit', 'Storybook / Sirah book',
      'Daff / percussion set', 'Digital download', 'Bundle offer'] },
  { id: 'event', label: 'Thematic event promotion',
    blurb: 'This batch promotes a specific LQK event. Build anticipation, show what ' +
      'attendees experience, and drive sign-ups/attendance.',
    suggestions: ['Open house', 'Parent workshop', 'Recital / showcase', 'Holiday camp',
      'Competition / challenge', 'Community gathering'] },
  { id: 'surah', label: 'Weekly surah update',
    blurb: 'This batch is the ongoing weekly surah memorization series. Focus on teaching ' +
      'and momentum around each week\'s surah.',
    suggestions: ['An-Nas', 'Al-Falaq', 'Al-Ikhlas', 'Al-Kafirun', 'Al-Masad', 'Al-Fil',
      'Quraysh', 'Al-Qadr'] },
  { id: 'brand', label: 'General brand awareness',
    blurb: 'This batch is top-of-funnel brand storytelling. Show the LQK method, values and ' +
      'personality; grow reach and warmth without a hard offer.',
    suggestions: ['The LQK method', 'Play vs rote drilling', 'Meet the teachers',
      'A day at LQK', 'Why percussion', 'Our story'] },
  { id: 'milestone', label: 'Milestone / achievement',
    blurb: 'This batch celebrates student and centre milestones. Use real proof and pride ' +
      'to build trust and social proof.',
    suggestions: ['Juz Amma completion', 'Graduation', 'Batch results',
      'Youngest to finish a surah', 'Term wrap-up', 'Anniversary'] },
  { id: 'seasonal', label: 'Seasonal / school term',
    blurb: 'This batch is tied to the Singapore school calendar. Position LQK around the ' +
      'season\'s parent needs.',
    suggestions: ['Back to school', 'June holidays', 'December holidays',
      'Exam-season balance', 'New year reset', 'School holiday programme'] },
  { id: 'community', label: 'Community & testimonials',
    blurb: 'This batch is a testimonial / community drive. Let parent voices and student ' +
      'stories lead, and invite shares and referrals.',
    suggestions: ['Parent testimonial', 'Student story', 'Referral drive', 'Reviews',
      'Community shoutout', 'Family spotlight'] },
  { id: 'fundraising', label: 'Fundraising / charity',
    blurb: 'This batch supports a charitable / fundraising cause (e.g. zakat, sadaqah, ' +
      'bursary). Keep it sincere, transparent and never guilt-driven; one clear way to give.',
    suggestions: ['Bursary fund', 'Zakat eligible', 'Sadaqah jariyah', 'Sponsor a child',
      'Ramadan giving', 'Community drive'] }
];

function eventById_(id) { return EVENT_TYPES.find(t => t.id === id) || null; }

// ─────────────────  PER-EVENT PILLAR MIX  ───────────────────
// Each event type can reshape the weekly rhythm (Option 1). Only the
// "flex" days are overridden; Mon/Tue/Wed and Friday stay fixed so the
// core growth+trust spine is always present.
//   sundayAlways : force the Sunday pillar every week (else base:
//                  soft P5S weeks 1..n-1, hard P5H final week)
//   thu          : override Thursday (base P4 Hot Take)
//   sat          : override Saturday (base alternates P3/P1 by week)
const EVENT_MIX = {
  holiday:      { note: 'Balanced awareness; soft doors on Sundays.', sundayAlways: 'P5S' },
  registration: { note: 'Conversion-heavy: hard doors every Sunday, proof/results on Saturdays.',
                  sundayAlways: 'P5H', sat: 'P5S' },
  product:      { note: 'Soft product doors every Sunday.', sundayAlways: 'P5S' },
  event:        { note: 'Drives attendance with soft doors every Sunday.', sundayAlways: 'P5S' },
  surah:        { note: 'Playbook + proof heavy around the weekly surah.', thu: 'P1', sat: 'P2' },
  brand:        { note: 'Awareness-led; keep doors soft, no hard sell.', sundayAlways: 'P5S' },
  milestone:    { note: 'Proof and pride heavy (extra Kid-Proof).', thu: 'P1', sundayAlways: 'P5S' },
  seasonal:     { note: 'Seasonal balance with soft Sunday doors.', sundayAlways: 'P5S' },
  community:    { note: 'Testimonial + proof heavy.', thu: 'P5S', sat: 'P1', sundayAlways: 'P5S' },
  fundraising:  { note: 'Sincere giving doors on a soft cadence.', thu: 'P5S', sundayAlways: 'P5S' }
};

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

// Weekly rhythm: index 0 = Monday ... 6 = Sunday.
// Base: Sat alternates P1/P3 by week; Sun is P5 soft, going HARD only in
// the final week. The chosen event type may override the flex days (Thu,
// Sat, Sun) via EVENT_MIX.
function pillarForDay_(dayIdx, weekNum, totalWeeks, eventId) {
  const mix = EVENT_MIX[eventId] || {};
  switch (dayIdx) {
    case 0: return 'P1';
    case 1: return 'P2';
    case 2: return 'P3';
    case 3: return mix.thu || 'P4';
    case 4: return 'P2S';
    case 5: return mix.sat || ((weekNum % 2 === 1) ? 'P3' : 'P1');
    case 6: return mix.sundayAlways || ((weekNum === totalWeeks) ? 'P5H' : 'P5S');
  }
}

// ─────────────────────  TOPIC SEEDS  ────────────────────────
// Background weekly surah keeps the Playbook / Friday / Kid-Proof pillars
// concrete no matter which event type is chosen.
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
      .addItem('1. Setup Sheet (choose event + days)', 'setupSheet')
      .addItem('2. Generate All PLANNED rows', 'generateAll')
      .addItem('3. Generate This Row only', 'generateSelected')
      .addSeparator()
      .addItem('Mark selected row POSTED', 'markPosted')
      .addSeparator()
      .addItem('Set / update API key', 'setApiKey')
      .addItem('Set generation model', 'setModel')
      .addToUi();
  } catch (e) { Logger.log('onOpen: ' + e); }
}

function notify_(msg) {
  try { SpreadsheetApp.getActiveSpreadsheet().toast(msg, 'LQK Content', 8); }
  catch (e) { Logger.log('NOTIFY: ' + msg); }
}

// ───────────────────  API KEY + MODEL  ──────────────────────
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

function setModel() {
  const ui = SpreadsheetApp.getUi();
  const current = getModel_();
  const menu = MODEL_CHOICES.map((m, i) => (i + 1) + '. ' + m).join('\n');
  const resp = ui.prompt(
    'Set generation model',
    'Current: ' + current + '\n\nType a number to choose, or paste any model ID:\n' + menu,
    ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  let val = resp.getResponseText().trim();
  if (!val) return;
  const asNum = parseInt(val, 10);
  if (!isNaN(asNum) && asNum >= 1 && asNum <= MODEL_CHOICES.length) {
    val = MODEL_CHOICES[asNum - 1];
  }
  PropertiesService.getScriptProperties().setProperty(CONFIG.MODEL_PROP, val);
  notify_('Generation model set to ' + val + '.');
}

function getModel_() {
  return PropertiesService.getScriptProperties().getProperty(CONFIG.MODEL_PROP) || CONFIG.MODEL;
}

// ───────────────────  1. SETUP (form dialog)  ───────────────
const HEADERS = ['Day', 'Date', 'Weekday', 'Pillar', 'Job', 'Format',
  'Filming?', 'Topic', 'Hook', 'Script / Shot List / Slides',
  'Caption', 'Hashtags', 'Status', 'Posted Link / Notes'];

const META_EVENT = 'lqk_event_id';
const META_FOCUS = 'lqk_focus';

// Opens the setup form. The form calls buildCalendar() on submit.
function setupSheet() {
  const html = HtmlService.createHtmlOutput(buildSetupHtml_())
    .setWidth(440).setHeight(620);
  SpreadsheetApp.getUi().showModalDialog(html, 'Set up a content batch');
}

// Date helpers ------------------------------------------------
function nextMonday_() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const add = (8 - today.getDay()) % 7 || 7;   // days until the next Monday
  return new Date(today.getTime() + add * 86400000);
}
function firstMondayOfNextMonth_() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const add = (8 - first.getDay()) % 7;        // 0 if the 1st is already Monday
  return new Date(first.getTime() + add * 86400000);
}
function isoDate_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

// Builds the dialog HTML (single self-contained string, no extra files).
function buildSetupHtml_() {
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const fmt = d => Utilities.formatDate(d, tz, 'EEE, dd MMM yyyy');

  const nm = nextMonday_();
  const man = new Date(nm.getTime() + 7 * 86400000);
  const fmn = firstMondayOfNextMonth_();
  const presets = [
    { v: isoDate_(nm),  label: 'Next Monday — ' + fmt(nm) },
    { v: isoDate_(man), label: 'Monday after next — ' + fmt(man) },
    { v: isoDate_(fmn), label: 'First Monday of next month — ' + fmt(fmn) }
  ];

  const data = JSON.stringify({
    events: EVENT_TYPES.map(t => ({
      id: t.id, label: t.label, suggestions: t.suggestions,
      note: (EVENT_MIX[t.id] && EVENT_MIX[t.id].note) || ''
    })),
    presets: presets,
    defaultDays: CONFIG.DEFAULT_DAYS,
    maxDays: CONFIG.MAX_DAYS,
    brand: CONFIG.BRAND_COLOR
  });

  return `
<!DOCTYPE html><html><head><base target="_top">
<style>
  :root { --brand: ${CONFIG.BRAND_COLOR}; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; color: #202124;
         margin: 0; padding: 16px; }
  h2 { margin: 0 0 4px; font-size: 16px; color: var(--brand); }
  p.sub { margin: 0 0 14px; color: #5f6368; }
  label { display: block; font-weight: bold; margin: 12px 0 4px; }
  select, input[type=text], input[type=number], input[type=date] {
    width: 100%; padding: 8px; border: 1px solid #dadce0; border-radius: 6px; font-size: 13px; }
  .radio { display: flex; align-items: center; margin: 6px 0; }
  .radio input { margin-right: 8px; }
  .hint { color: #5f6368; font-size: 11px; margin-top: 3px; }
  #customWrap { margin-top: 6px; display: none; }
  .actions { margin-top: 20px; display: flex; gap: 8px; }
  button { padding: 9px 16px; border-radius: 6px; border: none; font-size: 13px; cursor: pointer; }
  button.primary { background: var(--brand); color: #fff; font-weight: bold; }
  button.ghost { background: #f1f3f4; color: #202124; }
  #err { color: #c5221f; margin-top: 10px; min-height: 16px; }
  #busy { display: none; margin-top: 12px; color: #5f6368; }
</style></head>
<body>
  <h2>Set up a content batch</h2>
  <p class="sub">Pick what this batch is about. Content is planned to the weekly
  rhythm and flavoured to your choice, always grounded in the LQK brand.</p>

  <label for="event">Event / theme type</label>
  <select id="event"></select>
  <div class="hint" id="mixNote"></div>

  <label for="focus">Focus for this batch</label>
  <input type="text" id="focus" list="focusList" autocomplete="off"
         placeholder="Pick a suggestion or type your own">
  <datalist id="focusList"></datalist>
  <div class="hint">What to centre the batch on. Leave blank to revolve around the
  core LQK brand identity only.</div>

  <label for="days">How many days?</label>
  <input type="number" id="days" min="1" max="60">
  <div class="hint">1–60 days. The weekly rhythm adapts automatically.</div>

  <label>Start date (Day 1)</label>
  <div id="presets"></div>
  <div class="radio">
    <input type="radio" name="start" id="startCustom" value="custom">
    <label for="startCustom" style="font-weight:normal;margin:0;">Custom date…</label>
  </div>
  <div id="customWrap"><input type="date" id="customDate"></div>

  <div id="err"></div>
  <div id="busy">Building calendar… please wait.</div>

  <div class="actions">
    <button class="primary" id="go">Build calendar</button>
    <button class="ghost" id="cancel">Cancel</button>
  </div>

<script>
  var DATA = ${data};

  // Populate event dropdown
  var ev = document.getElementById('event');
  DATA.events.forEach(function(e){
    var o = document.createElement('option');
    o.value = e.id; o.textContent = e.label; ev.appendChild(o);
  });

  // Focus suggestions follow the selected event type
  function refreshSuggestions(){
    var e = DATA.events.filter(function(x){ return x.id === ev.value; })[0];
    var dl = document.getElementById('focusList');
    dl.innerHTML = '';
    (e ? e.suggestions : []).forEach(function(s){
      var o = document.createElement('option'); o.value = s; dl.appendChild(o);
    });
    document.getElementById('focus').value = '';
    document.getElementById('mixNote').textContent = (e && e.note) ? ('Plan: ' + e.note) : '';
  }
  ev.addEventListener('change', refreshSuggestions);
  refreshSuggestions();

  // Days default
  document.getElementById('days').value = DATA.defaultDays;

  // Start-date presets
  var pr = document.getElementById('presets');
  DATA.presets.forEach(function(p, i){
    var row = document.createElement('div'); row.className = 'radio';
    var input = document.createElement('input');
    input.type = 'radio'; input.name = 'start'; input.value = p.v; input.id = 'p'+i;
    if (i === 0) input.checked = true;
    var lab = document.createElement('label');
    lab.htmlFor = 'p'+i; lab.textContent = p.label;
    lab.style.fontWeight = 'normal'; lab.style.margin = '0';
    row.appendChild(input); row.appendChild(lab); pr.appendChild(row);
  });

  // Show custom date field only when "Custom" is chosen
  document.querySelectorAll('input[name=start]').forEach(function(r){
    r.addEventListener('change', function(){
      document.getElementById('customWrap').style.display =
        (this.value === 'custom' && this.checked) ? 'block' : 'none';
    });
  });

  document.getElementById('cancel').addEventListener('click', function(){
    google.script.host.close();
  });

  document.getElementById('go').addEventListener('click', function(){
    var err = document.getElementById('err'); err.textContent = '';
    var days = parseInt(document.getElementById('days').value, 10);
    if (isNaN(days) || days < 1 || days > DATA.maxDays) {
      err.textContent = 'Enter a number of days between 1 and ' + DATA.maxDays + '.'; return;
    }
    var sel = document.querySelector('input[name=start]:checked');
    var startDate = sel ? sel.value : '';
    if (startDate === 'custom') {
      startDate = document.getElementById('customDate').value;
      if (!startDate) { err.textContent = 'Please pick a custom date.'; return; }
    }
    var payload = {
      eventId: ev.value,
      focus: document.getElementById('focus').value.trim(),
      days: days,
      startDate: startDate
    };
    document.getElementById('go').disabled = true;
    document.getElementById('busy').style.display = 'block';
    google.script.run
      .withSuccessHandler(function(msg){ google.script.host.close(); })
      .withFailureHandler(function(e){
        document.getElementById('go').disabled = false;
        document.getElementById('busy').style.display = 'none';
        err.textContent = e && e.message ? e.message : 'Something went wrong.';
      })
      .buildCalendar(payload);
  });
</script>
</body></html>`;
}

// Called from the dialog (must NOT end in "_" so google.script.run can reach it).
// Builds the versioned calendar tab.
function buildCalendar(form) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone();

  const evt = eventById_(form.eventId) || EVENT_TYPES[0];
  const focus = String(form.focus || '').trim();
  let days = parseInt(form.days, 10);
  if (isNaN(days)) days = CONFIG.DEFAULT_DAYS;
  days = Math.max(1, Math.min(CONFIG.MAX_DAYS, days));

  const start = new Date(String(form.startDate) + 'T00:00:00');
  if (isNaN(start.getTime())) throw new Error('Could not read the start date.');

  const totalWeeks = Math.ceil(days / 7);
  const sheetName = uniqueSheetName_(ss, (focus || evt.label), start, tz);
  const sh = ss.insertSheet(sheetName);

  // Remember what this batch is about, for generation.
  sh.addDeveloperMetadata(META_EVENT, evt.id);
  sh.addDeveloperMetadata(META_FOCUS, focus);

  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setFontWeight('bold').setFontColor('#FFFFFF').setBackground(CONFIG.BRAND_COLOR);
  sh.setFrozenRows(1);

  const tag = focus ? (evt.label + ': ' + focus) : evt.label;
  const rows = [];
  const seedCount = { P1: 0, P3: 0, P4: 0, P5S: 0, P5H: 0 };

  for (let d = 0; d < days; d++) {
    const date = new Date(start.getTime() + d * 86400000);
    const dayIdx = (date.getDay() + 6) % 7;
    const weekNum = Math.floor(d / 7) + 1;
    const key = pillarForDay_(dayIdx, weekNum, totalWeeks, evt.id);
    const p = PILLARS[key];
    const surah = WEEK_SURAHS[Math.min(weekNum - 1, WEEK_SURAHS.length - 1)];

    let topic;
    if (key === 'P2')       topic = 'How to memorize Surah ' + surah + ' in 7 days (this week\'s surah)';
    else if (key === 'P2S') topic = 'Jumu\'ah shareable tied to Surah ' + surah + ' / family Friday habit';
    else {
      const list = SEEDS[key];
      topic = list[seedCount[key] % list.length];
      seedCount[key]++;
      if (key === 'P1') topic += ' (Surah ' + surah + ')';
    }
    topic = topic + '  —  [' + tag + ']';

    rows.push([
      d + 1,
      Utilities.formatDate(date, tz, 'dd MMM yyyy'),
      Utilities.formatDate(date, tz, 'EEE'),
      p.name, p.job, p.format, p.filming, topic,
      '', '', '', '', 'PLANNED', ''
    ]);
  }

  sh.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);

  sh.setColumnWidths(1, 3, 70);
  sh.setColumnWidth(4, 150); sh.setColumnWidth(8, 260);
  sh.setColumnWidth(9, 260); sh.setColumnWidth(10, 380);
  sh.setColumnWidth(11, 300); sh.setColumnWidth(12, 200);
  sh.getRange(2, 1, rows.length, HEADERS.length).setWrap(true).setVerticalAlignment('top');

  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['PLANNED', 'GENERATED', 'APPROVED', 'POSTED', 'SKIP'], true).build();
  sh.getRange(2, 13, rows.length, 1).setDataValidation(rule);

  sh.activate();
  notify_(days + '-day "' + evt.label + '" calendar built as "' + sheetName +
    '". Now run "Generate All PLANNED rows".');
  return 'ok';
}

// Build a safe, unique tab name.
function uniqueSheetName_(ss, label, start, tz) {
  let base = label + ' — ' + Utilities.formatDate(start, tz, 'dd MMM yyyy');
  base = base.replace(/[:\\\/\?\*\[\]]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90);
  let name = base, n = 2;
  while (ss.getSheetByName(name)) { name = base + ' (' + n + ')'; n++; }
  return name;
}

// ───────────────  2. GENERATE (Claude API)  ─────────────────
function generateAll() {
  const sh = activeCalendar_(); if (!sh) return;
  const ctx = getSheetContext_(sh);
  const data = sh.getDataRange().getValues();
  let done = 0, failed = 0;

  for (let r = 1; r < data.length; r++) {
    if (String(data[r][12]).trim() !== 'PLANNED') continue;
    const ok = generateRow_(sh, r + 1, data[r], ctx);
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
  const ok = generateRow_(sh, row, vals, getSheetContext_(sh));
  notify_(ok ? 'Row ' + row + ' generated.' : 'Row ' + row + ' failed — see Notes column.');
}

function generateRow_(sh, rowNum, vals, ctx) {
  const [dayNo, date, weekday, pillarName, job, format, filming, topic] = vals;
  const key = Object.keys(PILLARS).find(k => PILLARS[k].name === pillarName);
  const p = PILLARS[key] || PILLARS.P2;

  const evt = ctx.eventId ? eventById_(ctx.eventId) : null;
  const lines = [];
  if (evt)       lines.push('EVENT TYPE FOR THIS BATCH: ' + evt.label + ' — ' + evt.blurb);
  if (ctx.focus) lines.push('SPECIFIC FOCUS / ANGLE: ' + ctx.focus);
  const contextLine = lines.length
    ? '\n' + lines.join('\n') +
      '\nGround every post in the LQK brand identity above, and weave this ' +
      'event/focus in naturally where it fits — without breaking the pillar\'s ' +
      'job or forcing it where it feels unnatural.' +
      '\nIf this event type implies a different call-to-action than the pillar\'s ' +
      'default (e.g. donate, register, attend, buy), use the event-appropriate ' +
      'CTA instead — but still exactly ONE CTA.'
    : '';

  const prompt =
    BRAND +
    contextLine +
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
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    payload: JSON.stringify({
      model: getModel_(),
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

function getSheetContext_(sh) {
  function md(key) {
    try {
      const m = sh.createDeveloperMetadataFinder().withKey(key).find();
      return (m && m.length) ? String(m[0].getValue()) : '';
    } catch (e) { return ''; }
  }
  return { eventId: md(META_EVENT), focus: md(META_FOCUS) };
}

function markPosted() {
  const sh = activeCalendar_(); if (!sh) return;
  const row = sh.getActiveCell().getRow();
  if (row < 2) { notify_('Select a content row first.'); return; }
  sh.getRange(row, 13).setValue('POSTED');
  notify_('Row ' + row + ' marked POSTED.');
}
