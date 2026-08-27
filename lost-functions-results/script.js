tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '#36D6B5'
          },
          boxShadow: {
            soft: '0 10px 30px rgba(0,0,0,.08)'
          }
        }
      }
    };

(function () {
      const saved = localStorage.getItem('pmg_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    })();

// ===== THEME TOGGLE =====
// Mirrors Page 1 behavior exactly; uses 'pmg_theme' key
document.getElementById('themeToggle').addEventListener('click', () => {
  const root = document.documentElement;
  const isDark = root.classList.toggle('dark');
  localStorage.setItem('pmg_theme', isDark ? 'dark' : 'light');
});

// ===== PRINT BUTTON =====
document.getElementById('btn-print').addEventListener('click', () => {
  window.print();
});

const urlParams = new URLSearchParams(window.location.search);
const submissionId = (urlParams.get('submission_id') || '').trim();
const submissionMode = submissionId !== '';
let savedRow = null;

// ============================================================================
// DATA MODEL
// Parse all URL query parameters into a clean data object.
// Handles both '+' (form-encoded space) and '%20' (percent-encoded space).
// ============================================================================

/**
 * getVal(key)
 * Returns trimmed string value for a URL param, or "" if missing/empty.
 * URLSearchParams.get() already handles %20 and + decoding.
 */
function getVal(key) {
  if (submissionMode) {
    if (!savedRow) return '';
    const val = savedRow[key];
    if (val === null || val === undefined) return '';
    const trimmed = String(val).trim();
    return trimmed === '—' ? '' : trimmed;
  }

  const params = new URLSearchParams(window.location.search);
  const val = params.get(key);
  if (!val) return '';
  const trimmed = val.trim();
  return trimmed === '—' ? '' : trimmed;
}

/**
 * hasAny(keys)
 * Returns true if at least one key has a non-empty value.
 */
function hasAny(keys) {
  return keys.some(k => getVal(k) !== '');
}

/**
 * loadSavedSubmission()
 * Loads the saved reflection row from the linked sheet-data endpoint.
 */
async function loadSavedSubmission() {
  try {
    const meta = document.querySelector('meta[name="sheet-data-url"]');
    const endpoint = (meta && meta.content) ? meta.content.trim() : '/api/public/landing-pages/5500/sheet-data';
    const res = await fetch(endpoint, { cache: 'no-store' });
    if (!res.ok) return false;

    const payload = await res.json();
    const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.rows) ? payload.rows : (Array.isArray(payload?.data) ? payload.data : []));
    const row = rows.find(row => String(row?.submission_id || '').trim() === submissionId);

    if (!row) return false;
    savedRow = row;
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * showSubmissionLoading()
 * Displays a calm loading state while the saved reflection is fetched.
 */
function showSubmissionLoading() {
  const banner = document.getElementById('results-banner');
  if (banner) {
    banner.innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" aria-hidden="true"></span><span class="text-slate-700 dark:text-slate-200 font-medium">Loading your reflection…</span>';
  }

  ['overview', 'summary', 'integration', 'dialogue', 'print-save', 'sidebar-nav'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
}

/**
 * showSubmissionError()
 * Displays a dedicated calm error state when the saved reflection cannot be loaded.
 */
function showSubmissionError() {
  const banner = document.getElementById('results-banner');
  if (banner) {
    banner.style.display = 'none';
  }

  ['overview', 'summary', 'integration', 'dialogue', 'print-save', 'sidebar-nav'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const globalEmpty = document.getElementById('global-empty');
  if (!globalEmpty) return;

  globalEmpty.classList.remove('hidden');
  globalEmpty.innerHTML = `
    <div class="text-4xl mb-4" aria-hidden="true">🔍</div>
    <h2 class="text-xl font-bold mb-2">We couldn’t load this reflection</h2>
    <p class="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-md mx-auto">
      Your saved reflection could not be found right now. Please return to My IMAGO Journey and try opening it again.
    </p>
    <a
      href="https://paymegpt.com/p/Bjs45P"
      class="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:opacity-90 transition"
    >
      Return to My IMAGO Journey
    </a>
  `;
}

/**
 * safeText(str)
 * Escapes HTML special characters to prevent injection.
 */
function safeText(str) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(str).replace(/[&<>"']/g, m => map[m]);
}

// ============================================================================
// TEXT CLEANING HELPERS
// ============================================================================

/**
 * stripOuterQuotes(s)
 * Trims whitespace then removes surrounding straight or curly quotation marks.
 * Handles: "...", '...', \u201c...\u201d (curly double), \u2018...\u2019 (curly single)
 */
function stripOuterQuotes(s) {
  if (!s) return s;
  s = s.trim();
  // Curly double quotes
  if (s.startsWith('\u201c') && s.endsWith('\u201d')) {
    return s.slice(1, -1).trim();
  }
  // Curly single quotes
  if (s.startsWith('\u2018') && s.endsWith('\u2019')) {
    return s.slice(1, -1).trim();
  }
  // Straight double quotes
  if (s.startsWith('"') && s.endsWith('"') && s.length > 1) {
    return s.slice(1, -1).trim();
  }
  // Straight single quotes
  if (s.startsWith("'") && s.endsWith("'") && s.length > 1) {
    return s.slice(1, -1).trim();
  }
  return s;
}

/**
 * cleanLead(text, leadPatterns)
 * Strips outer quotes, then removes any leading phrases (case-insensitive).
 * leadPatterns: array of strings to try removing from the start.
 * Patterns are sorted longest-first to avoid partial matches.
 * After removing a pattern, strips any following comma, colon, or whitespace.
 * Capitalises the first character of the result.
 */
function cleanLead(text, leadPatterns) {
  if (!text) return '';
  let s = stripOuterQuotes(text.trim());

  // Sort longest first to prevent partial matches
  const sorted = [...leadPatterns].sort((a, b) => b.length - a.length);

  for (const pattern of sorted) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('^' + escaped + '[,:\\s]*', 'i');
    const match = s.match(re);
    if (match) {
      s = s.slice(match[0].length).trim();
      break; // only strip one lead-in
    }
  }

  // Capitalise first character if it is a letter
  if (s.length > 0 && /[a-z]/i.test(s[0])) {
    s = s[0].toUpperCase() + s.slice(1);
  }

  return s;
}

/**
 * ensureTerminalPeriod(s)
 * Adds a period to the end of a string if it does not already end with
 * a sentence-terminal punctuation mark (. ! ?).
 * Used only on sender lines that need a clean terminal before the receiver responds.
 */
function ensureTerminalPeriod(s) {
  if (!s) return s;
  const trimmed = s.trim();
  if (/[.!?]$/.test(trimmed)) return trimmed;
  return trimmed + '.';
}

// ============================================================================
// CHANNEL CONFIGURATION
// Defines the five channels, their field keys, icons, and display labels.
// ============================================================================
const CHANNELS = [
  {
    id: 'thinking',
    label: 'Thinking',
    icon: '🧠',
    color: 'blue',
    keys: {
      message:                'lf_thinking_message',
      example:                'lf_thinking_example',
      protection_or_decision: 'lf_thinking_protection_or_decision',
      relationship_playout:   'lf_thinking_relationship_playout',
      new_self_message:       'lf_thinking_new_self_message',
    }
  },
  {
    id: 'feeling',
    label: 'Feeling',
    icon: '💛',
    color: 'yellow',
    keys: {
      message:                'lf_feeling_message',
      example:                'lf_feeling_example',
      protection_or_decision: 'lf_feeling_protection_or_decision',
      relationship_playout:   'lf_feeling_relationship_playout',
      new_self_message:       'lf_feeling_new_self_message',
    }
  },
  {
    id: 'acting',
    label: 'Acting',
    icon: '⚡',
    color: 'orange',
    keys: {
      message:                'lf_acting_message',
      example:                'lf_acting_example',
      protection_or_decision: 'lf_acting_protection_or_decision',
      relationship_playout:   'lf_acting_relationship_playout',
      new_self_message:       'lf_acting_new_self_message',
    }
  },
  {
    id: 'sensing',
    label: 'Sensing',
    icon: '🌿',
    color: 'green',
    keys: {
      message:                'lf_sensing_message',
      example:                'lf_sensing_example',
      protection_or_decision: 'lf_sensing_protection_or_decision',
      relationship_playout:   'lf_sensing_relationship_playout',
      new_self_message:       'lf_sensing_new_self_message',
    }
  },
  {
    id: 'being',
    label: 'Being',
    icon: '✨',
    color: 'purple',
    keys: {
      message:                'lf_being_message',
      example:                'lf_being_example',
      protection_or_decision: 'lf_being_protection_or_decision',
      relationship_playout:   'lf_being_relationship_playout',
      new_self_message:       'lf_being_new_self_message',
    }
  }
];

// ============================================================================
// DOMAIN LABEL MAPPING
// ============================================================================
const DOMAIN_LABELS = {
  thinking:   'Thinking',
  feeling:    'Feeling',
  acting:     'Acting',
  sensing:    'Sensing',
  being:      'Being',
  not_sure:   'Not Sure',
  Thinking:   'Thinking',
  Feeling:    'Feeling',
  Acting:     'Acting',
  Sensing:    'Sensing',
  Being:      'Being',
  'Not Sure': 'Not Sure',
};

function mapDomainLabel(raw) {
  if (!raw) return '';
  return DOMAIN_LABELS[raw] || safeText(raw);
}

// ============================================================================
// CHANNEL DATA HELPERS
// ============================================================================
function getChannelData(channel) {
  const d = {};
  Object.entries(channel.keys).forEach(([field, key]) => {
    d[field] = getVal(key);
  });
  return d;
}

function channelHasData(channel) {
  return Object.values(channel.keys).some(key => getVal(key) !== '');
}

// ============================================================================
// ADAPTATION / DECISION SENDER LINE BUILDER
// Purpose: Determine whether the cleaned adaptation text already begins with
//          a first-person subject phrase. If it does, use the text verbatim
//          (prefixed only with "To stay safe or connected, "). If it does not,
//          append "I learned to" as the grammatical bridge.
//
// This prevents malformed outputs such as:
//   "To stay safe or connected, I learned to I became very quiet."
//
// Patterns that indicate the text is already a full clause:
//   "I ", "I'm", "I\u2019m", "I am", "I was", "I became", "I learned", "I decided"
// ============================================================================

/**
 * buildAdaptationSenderLine(cleanedText)
 * Returns the full sender sentence for the Adaptation / Decision step.
 * @param {string} cleanedText - Already cleaned (lead stripped, capitalised) adaptation text.
 * @returns {string} Full sender sentence, terminated with a period.
 */
function buildAdaptationSenderLine(cleanedText) {
  if (!cleanedText) return '';

  // Patterns indicating the text already contains its own subject + verb
  const selfStartPatterns = [
    /^I\s/i,
    /^I'm\b/i,
    /^I\u2019m\b/i,
    /^I am\b/i,
    /^I was\b/i,
    /^I became\b/i,
    /^I learned\b/i,
    /^I decided\b/i,
  ];

  const alreadyHasSubject = selfStartPatterns.some(re => re.test(cleanedText));

  let sentence;
  if (alreadyHasSubject) {
    // Text is already a full clause — use verbatim after the prefix
    sentence = `To stay safe or connected, ${cleanedText}`;
  } else {
    // Text is a predicate fragment — bridge with "I learned to"
    // Lowercase the first character so it flows naturally after "I learned to"
    const lowered = cleanedText.charAt(0).toLowerCase() + cleanedText.slice(1);
    sentence = `To stay safe or connected, I learned to ${lowered}`;
  }

  return ensureTerminalPeriod(sentence);
}

// ============================================================================
// BUBBLE BUILDER
// Creates DOM elements for sender and receiver bubbles.
// Uses textContent assignment (never innerHTML with raw user data).
// ============================================================================

/**
 * createBubble(role, labelText, contentText)
 * role: 'sender' | 'receiver'
 */
function createBubble(role, labelText, contentText) {
  const wrap = document.createElement('div');
  wrap.className = 'rounded-2xl p-4 ' + (role === 'sender' ? 'bubble-sender' : 'bubble-receiver');

  const label = document.createElement('div');
  label.className = 'text-xs font-bold uppercase tracking-widest mb-2 ' +
    (role === 'sender' ? 'text-brand' : 'text-slate-400 dark:text-slate-500');
  label.textContent = labelText;

  const content = document.createElement('p');
  content.className = 'text-sm leading-relaxed text-slate-700 dark:text-slate-200';
  content.textContent = contentText;

  wrap.appendChild(label);
  wrap.appendChild(content);
  return wrap;
}

/**
 * createStepHeader(stepLabel)
 * Creates a visual section divider for each dialogue step.
 */
function createStepHeader(stepLabel) {
  const div = document.createElement('div');
  div.className = 'dialogue-step-header';
  div.setAttribute('aria-hidden', 'true');
  div.textContent = stepLabel;
  return div;
}

// ============================================================================
// DIALOGUE STEP RENDERERS
// Each returns an array of DOM elements, or [] if content is absent.
// ============================================================================

/**
 * buildVerbatimMirrorStep(stepLabel, senderText)
 * IMAGO-faithful mirrored step: sender bubble + receiver bubble.
 * The receiver repeats the sender's sentence VERBATIM — no pronoun swapping.
 * Format: "What I hear you saying is: {senderSentence} Did I get that?"
 * Applied to steps C, D, E, F, G only.
 */
function buildVerbatimMirrorStep(stepLabel, senderText) {
  if (!senderText || !senderText.trim()) return [];

  const els = [];
  els.push(createStepHeader(stepLabel));
  els.push(createBubble('sender', 'Sender', senderText));

  // IMAGO verbatim mirror — sender sentence is quoted exactly as spoken
  const receiverText = `What I hear you saying is: ${senderText} Did I get that?`;
  els.push(createBubble('receiver', 'Receiver \u2014 Mirror', receiverText));

  return els;
}

/**
 * buildFixedStep(stepLabel, senderText, fixedReceiverText)
 * Step where both sender and receiver lines are fixed (no mirroring, no user data).
 * Used for: Make an Appointment, Intention, Closing.
 */
function buildFixedStep(stepLabel, senderText, fixedReceiverText) {
  const els = [];
  els.push(createStepHeader(stepLabel));
  els.push(createBubble('sender', 'Sender', senderText));
  els.push(createBubble('receiver', 'Receiver', fixedReceiverText));
  return els;
}

// ============================================================================
// DIALOGUE GENERATOR
// Builds the complete IMAGO dialogue DOM for a given channel.
//
// Step A — Make an Appointment: fixed sender + fixed receiver (no mirror)
// Step B — Intention:           fixed sender + fixed receiver (no mirror)
// Steps C–G:                    user data (cleaned) + verbatim mirror receiver
// Step H — Closing:             fixed sender + fixed receiver (no mirror)
// ============================================================================

/**
 * generateDialogue(channel)
 * Returns a <div> containing all steps for the selected channel.
 */
function generateDialogue(channel) {
  const data = getChannelData(channel);
  const container = document.createElement('div');
  container.className = 'flex flex-col gap-3';

  // Title
  const title = document.createElement('h3');
  title.className = 'text-base font-bold mb-1';
  title.textContent = `Lost Functions Dialogue \u2014 ${channel.label}`;
  container.appendChild(title);

  const sub = document.createElement('p');
  sub.className = 'text-xs text-slate-500 dark:text-slate-400 mb-2';
  sub.textContent = 'Read each line aloud with your partner. Focus on one area at a time.';
  container.appendChild(sub);

  // ── A: MAKE AN APPOINTMENT ──────────────────────────────────────────────
  // Fixed sender + fixed receiver. No mirroring. No user data.
  const stepA = buildFixedStep(
    'A \u2014 Make an Appointment',
    "I\u2019d like to share something personal to help you understand me better. Is now a good time?",
    "I hear you saying you\u2019d like to share something personal to help me understand you better. Yes, now is a good time."
  );
  stepA.forEach(el => container.appendChild(el));

  // ── B: INTENTION ────────────────────────────────────────────────────────
  // Fixed sender + fixed receiver. No mirroring.
  const stepB = buildFixedStep(
    'B \u2014 Intention',
    'My intention in sharing this is understanding and connection \u2014 not blame or criticism.',
    'My intention in listening is to put my perspective aside and hear you.'
  );
  stepB.forEach(el => container.appendChild(el));

  // ── C: CHILDHOOD MESSAGE ─────────────────────────────────────────────────
  // User data cleaned, then verbatim mirror.
  if (data.message) {
    const cleaned = cleanLead(data.message, [
      'growing up, i received messages about ' + channel.label.toLowerCase() + ' such as',
      'growing up, i received messages such as',
      'growing up, i received messages about ' + channel.label.toLowerCase(),
      'growing up, i received messages',
      'i received messages such as',
      'i received messages about ' + channel.label.toLowerCase() + ' such as',
      'i received messages about ' + channel.label.toLowerCase(),
      'i received messages',
      'messages such as',
      'such as',
      'growing up',
    ]);
    if (cleaned) {
      const senderText = ensureTerminalPeriod(
        `Growing up, I received messages about ${channel.label} such as: ${cleaned}`
      );
      buildVerbatimMirrorStep('C \u2014 Childhood Message', senderText)
        .forEach(el => container.appendChild(el));
    }
  }

  // ── D: EXAMPLE ───────────────────────────────────────────────────────────
  // User data cleaned, then verbatim mirror.
  if (data.example) {
    const cleaned = cleanLead(data.example, [
      'one example i remember is',
      'i remember',
      'example:',
      'example',
    ]);
    if (cleaned) {
      const senderText = ensureTerminalPeriod(`One example I remember is: ${cleaned}`);
      buildVerbatimMirrorStep('D \u2014 Example', senderText)
        .forEach(el => container.appendChild(el));
    }
  }

  // ── E: ADAPTATION / DECISION ─────────────────────────────────────────────
  // User data cleaned with grammar-aware subject detection, then verbatim mirror.
  if (data.protection_or_decision) {
    const cleaned = cleanLead(data.protection_or_decision, [
      'to stay safe or connected, i learned to',
      'to stay safe or connected, i learned',
      'to stay safe or connected, i decided to',
      'to stay safe or connected, i decided',
      'to stay safe or connected,',
      'to stay safe or connected',
      'to stay safe, i learned to',
      'to stay safe, i learned',
      'to stay safe,',
      'to stay safe',
      'to stay connected, i learned to',
      'to stay connected, i learned',
      'to stay connected,',
      'to stay connected',
      'i learned to',
      'i learned',
      'i decided to',
      'i decided',
    ]);
    if (cleaned) {
      const senderText = buildAdaptationSenderLine(cleaned);
      buildVerbatimMirrorStep('E \u2014 Adaptation / Decision', senderText)
        .forEach(el => container.appendChild(el));
    }
  }

  // ── F: HOW IT SHOWS UP NOW ───────────────────────────────────────────────
  // User data cleaned, then verbatim mirror.
  if (data.relationship_playout) {
    const cleaned = cleanLead(data.relationship_playout, [
      'today, this can show up in our relationship as',
      'today, this shows up in our relationship as',
      'today, it shows up in our relationship as',
      'this can show up in our relationship as',
      'this shows up in our relationship as',
      'it shows up in our relationship as',
      'in our relationship',
      'it shows up',
      'this shows up',
      'today',
    ]);
    if (cleaned) {
      const senderText = ensureTerminalPeriod(
        `Today, this can show up in our relationship as: ${cleaned}`
      );
      buildVerbatimMirrorStep('F \u2014 How It Shows Up Now', senderText)
        .forEach(el => container.appendChild(el));
    }
  }

  // ── G: NEW PERMISSION MESSAGE ────────────────────────────────────────────
  // User data cleaned, then verbatim mirror.
  if (data.new_self_message) {
    const cleaned = cleanLead(data.new_self_message, [
      'i am beginning to give myself a new message',
      "i'm beginning to give myself a new message",
      '\u2019m beginning to give myself a new message',
      'i am beginning to',
      "i'm beginning to",
      'new message:',
      'i can tell myself',
    ]);
    if (cleaned) {
      const senderText = ensureTerminalPeriod(
        `I am beginning to give myself a new message: ${cleaned}`
      );
      buildVerbatimMirrorStep('G \u2014 New Permission Message', senderText)
        .forEach(el => container.appendChild(el));
    }
  }

  // ── H: CLOSING ───────────────────────────────────────────────────────────
  // Fixed sender + fixed receiver. No mirroring.
  const stepH = buildFixedStep(
    'H \u2014 Closing',
    'Thank you for listening. I\u2019m sharing this because I want to be closer.',
    'Thank you for sharing.'
  );
  stepH.forEach(el => container.appendChild(el));

  return container;
}

// ============================================================================
// PLAIN TEXT DIALOGUE GENERATOR
// Builds a plain-text version for clipboard copy.
// Must exactly mirror the DOM dialogue output — same fixed lines, same
// cleaned sender text, same verbatim mirror format for steps C–G.
// ============================================================================

/**
 * generatePlainTextDialogue(channel)
 * Returns a multi-line string representing the full dialogue for clipboard copy.
 */
function generatePlainTextDialogue(channel) {
  const data = getChannelData(channel);
  const lines = [];

  lines.push(`LOST FUNCTIONS DIALOGUE \u2014 ${channel.label.toUpperCase()}`);
  lines.push('='.repeat(50));
  lines.push('');

  // ── Helper: verbatim mirror step (steps C–G) ──
  function addVerbatimMirrorStep(label, senderText) {
    if (!senderText || !senderText.trim()) return;
    lines.push(`\u2500\u2500 ${label} \u2500\u2500`);
    lines.push(`SENDER:   ${senderText}`);
    // IMAGO verbatim mirror — sender sentence quoted exactly as spoken
    lines.push(`RECEIVER: What I hear you saying is: ${senderText} Did I get that?`);
    lines.push('');
  }

  // ── Helper: fixed receiver step (A, B, H) ──
  function addFixedStep(label, senderText, fixedReceiverText) {
    lines.push(`\u2500\u2500 ${label} \u2500\u2500`);
    lines.push(`SENDER:   ${senderText}`);
    lines.push(`RECEIVER: ${fixedReceiverText}`);
    lines.push('');
  }

  // A — Make an Appointment (fixed, no user data, no mirror)
  addFixedStep(
    'A \u2014 Make an Appointment',
    "I\u2019d like to share something personal to help you understand me better. Is now a good time?",
    "I hear you saying you\u2019d like to share something personal to help me understand you better. Yes, now is a good time."
  );

  // B — Intention (fixed, no user data, no mirror)
  addFixedStep(
    'B \u2014 Intention',
    'My intention in sharing this is understanding and connection \u2014 not blame or criticism.',
    'My intention in listening is to put my perspective aside and hear you.'
  );

  // C — Childhood Message (user data + verbatim mirror)
  if (data.message) {
    const cleaned = cleanLead(data.message, [
      'growing up, i received messages about ' + channel.label.toLowerCase() + ' such as',
      'growing up, i received messages such as',
      'growing up, i received messages about ' + channel.label.toLowerCase(),
      'growing up, i received messages',
      'i received messages such as',
      'i received messages about ' + channel.label.toLowerCase() + ' such as',
      'i received messages about ' + channel.label.toLowerCase(),
      'i received messages',
      'messages such as',
      'such as',
      'growing up',
    ]);
    if (cleaned) {
      addVerbatimMirrorStep(
        'C \u2014 Childhood Message',
        ensureTerminalPeriod(`Growing up, I received messages about ${channel.label} such as: ${cleaned}`)
      );
    }
  }

  // D — Example (user data + verbatim mirror)
  if (data.example) {
    const cleaned = cleanLead(data.example, [
      'one example i remember is',
      'i remember',
      'example:',
      'example',
    ]);
    if (cleaned) {
      addVerbatimMirrorStep(
        'D \u2014 Example',
        ensureTerminalPeriod(`One example I remember is: ${cleaned}`)
      );
    }
  }

  // E — Adaptation / Decision (user data + grammar-aware builder + verbatim mirror)
  if (data.protection_or_decision) {
    const cleaned = cleanLead(data.protection_or_decision, [
      'to stay safe or connected, i learned to',
      'to stay safe or connected, i learned',
      'to stay safe or connected, i decided to',
      'to stay safe or connected, i decided',
      'to stay safe or connected,',
      'to stay safe or connected',
      'to stay safe, i learned to',
      'to stay safe, i learned',
      'to stay safe,',
      'to stay safe',
      'to stay connected, i learned to',
      'to stay connected, i learned',
      'to stay connected,',
      'to stay connected',
      'i learned to',
      'i learned',
      'i decided to',
      'i decided',
    ]);
    if (cleaned) {
      addVerbatimMirrorStep(
        'E \u2014 Adaptation / Decision',
        buildAdaptationSenderLine(cleaned)
      );
    }
  }

  // F — How It Shows Up Now (user data + verbatim mirror)
  if (data.relationship_playout) {
    const cleaned = cleanLead(data.relationship_playout, [
      'today, this can show up in our relationship as',
      'today, this shows up in our relationship as',
      'today, it shows up in our relationship as',
      'this can show up in our relationship as',
      'this shows up in our relationship as',
      'it shows up in our relationship as',
      'in our relationship',
      'it shows up',
      'this shows up',
      'today',
    ]);
    if (cleaned) {
      addVerbatimMirrorStep(
        'F \u2014 How It Shows Up Now',
        ensureTerminalPeriod(`Today, this can show up in our relationship as: ${cleaned}`)
      );
    }
  }

  // G — New Permission Message (user data + verbatim mirror)
  if (data.new_self_message) {
    const cleaned = cleanLead(data.new_self_message, [
      'i am beginning to give myself a new message',
      "i'm beginning to give myself a new message",
      '\u2019m beginning to give myself a new message',
      'i am beginning to',
      "i'm beginning to",
      'new message:',
      'i can tell myself',
    ]);
    if (cleaned) {
      addVerbatimMirrorStep(
        'G \u2014 New Permission Message',
        ensureTerminalPeriod(`I am beginning to give myself a new message: ${cleaned}`)
      );
    }
  }

  // H — Closing (fixed, no user data, no mirror)
  addFixedStep(
    'H \u2014 Closing',
    'Thank you for listening. I\u2019m sharing this because I want to be closer.',
    'Thank you for sharing.'
  );

  return lines.join('\n');
}

// ============================================================================
// CHANNEL SUMMARY RENDERER
// Renders mini-cards for each channel that has data.
// ============================================================================
function renderChannelSummary() {
  const grid = document.getElementById('channel-summary-grid');
  const emptyEl = document.getElementById('summary-empty');
  let anyRendered = false;

  CHANNELS.forEach(channel => {
    if (!channelHasData(channel)) return;
    anyRendered = true;

    const data = getChannelData(channel);

    const card = document.createElement('div');
    card.className = 'rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-soft card-print flex flex-col gap-3';

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between gap-2';

    const iconTitle = document.createElement('div');
    iconTitle.className = 'flex items-center gap-2';

    const iconEl = document.createElement('span');
    iconEl.className = 'text-xl';
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.textContent = channel.icon;

    const titleEl = document.createElement('span');
    titleEl.className = 'font-semibold text-sm';
    titleEl.textContent = channel.label;

    iconTitle.appendChild(iconEl);
    iconTitle.appendChild(titleEl);
    header.appendChild(iconTitle);

    const buildBtn = document.createElement('button');
    buildBtn.className = 'no-print text-xs font-medium rounded-lg bg-brand/10 dark:bg-brand/20 text-brand px-3 py-1.5 hover:bg-brand/20 dark:hover:bg-brand/30 transition';
    buildBtn.textContent = 'Build Dialogue';
    buildBtn.setAttribute('aria-label', `Build dialogue for ${channel.label}`);
    buildBtn.addEventListener('click', () => {
      selectChannel(channel.id);
      document.getElementById('dialogue').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    header.appendChild(buildBtn);

    card.appendChild(header);

    const divider = document.createElement('div');
    divider.className = 'border-t border-slate-100 dark:border-slate-800';
    card.appendChild(divider);

    const fields = [
      { label: 'Childhood Message',   value: data.message },
      { label: 'How It Shows Up Now', value: data.relationship_playout },
      { label: 'New Permission',      value: data.new_self_message },
    ];

    fields.forEach(({ label, value }) => {
      if (!value) return;
      const row = document.createElement('div');

      const lbl = document.createElement('div');
      lbl.className = 'text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5';
      lbl.textContent = label;

      const val = document.createElement('p');
      val.className = 'text-sm text-slate-700 dark:text-slate-200 leading-relaxed';
      val.textContent = value;

      row.appendChild(lbl);
      row.appendChild(val);
      card.appendChild(row);
    });

    grid.appendChild(card);
  });

  if (!anyRendered) {
    emptyEl.classList.remove('hidden');
  }
}

// ============================================================================
// INTEGRATION SECTION RENDERER
// ============================================================================
function renderIntegration() {
  const card = document.getElementById('integration-card');

  const mostBlocked = getVal('lf_summary_most_blocked_domain');
  const mostAlive   = getVal('lf_summary_most_alive_domain');
  const corePattern = getVal('lf_summary_core_pattern');
  const growthInt   = getVal('lf_summary_one_growth_intention');
  const notes       = getVal('lf_notes_optional');

  const hasData = mostBlocked || mostAlive || corePattern || growthInt || notes;

  if (!hasData) {
    const empty = document.createElement('p');
    empty.className = 'text-sm text-slate-400 dark:text-slate-500 text-center py-4';
    empty.textContent = 'No integration responses were found. Complete the integration section on Page 1 to see insights here.';
    card.appendChild(empty);
    return;
  }

  const fields = [
    { label: 'Most Restricted Domain', value: mapDomainLabel(mostBlocked), icon: '🔒' },
    { label: 'Most Alive Domain',      value: mapDomainLabel(mostAlive),   icon: '🌱' },
    { label: 'Core Pattern',           value: corePattern,                  icon: '🔄' },
    { label: 'One Growth Intention',   value: growthInt,                    icon: '🎯' },
    { label: 'Additional Notes',       value: notes,                        icon: '📝' },
  ];

  const grid = document.createElement('div');
  grid.className = 'grid sm:grid-cols-2 gap-4';

  fields.forEach(({ label, value, icon }) => {
    if (!value) return;

    const cell = document.createElement('div');
    cell.className = 'rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4';

    const lbl = document.createElement('div');
    lbl.className = 'flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5';

    const iconSpan = document.createElement('span');
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = icon;

    const lblText = document.createElement('span');
    lblText.textContent = label;

    lbl.appendChild(iconSpan);
    lbl.appendChild(lblText);

    const val = document.createElement('p');
    val.className = 'text-sm text-slate-700 dark:text-slate-200 leading-relaxed';
    val.textContent = value;

    cell.appendChild(lbl);
    cell.appendChild(val);
    grid.appendChild(cell);
  });

  card.appendChild(grid);
}

// ============================================================================
// DIALOGUE BUILDER: Channel Selector + Output
// ============================================================================

// Track currently selected channel id
let activeChannelId = null;

/**
 * selectChannel(channelId)
 * Selects a channel, updates button states, and renders dialogue.
 */
function selectChannel(channelId) {
  const channel = CHANNELS.find(c => c.id === channelId);
  if (!channel || !channelHasData(channel)) return;

  activeChannelId = channelId;

  // Update button states
  document.querySelectorAll('.channel-btn').forEach(btn => {
    if (btn.dataset.channelId === channelId) {
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
    } else {
      btn.classList.remove('selected');
      btn.setAttribute('aria-pressed', 'false');
    }
  });

  // Render dialogue
  const output = document.getElementById('dialogue-output');
  output.innerHTML = '';
  output.appendChild(generateDialogue(channel));
}

/**
 * renderDialogueBuilder()
 * Builds the channel selector buttons and sets the default channel.
 * Default preference: the channel identified as most blocked, if it has data.
 * Fallback: the first channel with any data.
 */
function renderDialogueBuilder() {
  const bar = document.getElementById('channel-selector-bar');

  const mostBlockedRaw = getVal('lf_summary_most_blocked_domain');
  const mostBlockedId  = mostBlockedRaw ? mostBlockedRaw.toLowerCase().replace(/\s+/g, '_') : '';

  let defaultChannelId = null;

  const blockedChannel = CHANNELS.find(c => c.id === mostBlockedId && channelHasData(c));
  if (blockedChannel) {
    defaultChannelId = blockedChannel.id;
  } else {
    const firstWithData = CHANNELS.find(c => channelHasData(c));
    if (firstWithData) defaultChannelId = firstWithData.id;
  }

  CHANNELS.forEach(channel => {
    const hasData = channelHasData(channel);

    const btn = document.createElement('button');
    btn.className = 'channel-btn inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium transition';
    btn.dataset.channelId = channel.id;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', `${hasData ? 'Select' : 'No data for'} ${channel.label} channel`);

    if (!hasData) {
      btn.classList.add('disabled-channel');
      btn.disabled = true;
    } else {
      btn.classList.add('hover:bg-slate-50', 'dark:hover:bg-slate-800');
      btn.addEventListener('click', () => selectChannel(channel.id));
    }

    const iconSpan = document.createElement('span');
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = channel.icon;

    const labelSpan = document.createElement('span');
    labelSpan.textContent = channel.label;

    btn.appendChild(iconSpan);
    btn.appendChild(labelSpan);
    bar.appendChild(btn);
  });

  if (defaultChannelId) {
    selectChannel(defaultChannelId);
  } else {
    const output = document.getElementById('dialogue-output');
    output.innerHTML = '';

    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'flex flex-col items-center justify-center py-12 gap-4 text-center';

    const emptyText = document.createElement('p');
    emptyText.className = 'text-slate-400 dark:text-slate-500 text-sm';
    emptyText.textContent = 'No channel data is available to build a dialogue.';

    const returnBtn = document.createElement('a');
    returnBtn.href = 'https://paymegpt.com/p/GnMF3P/lost-functions';
    returnBtn.className = 'inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition';
    returnBtn.textContent = 'Return to Form';

    emptyDiv.appendChild(emptyText);
    emptyDiv.appendChild(returnBtn);
    output.appendChild(emptyDiv);
  }
}

// ============================================================================
// COPY DIALOGUE BUTTON
// Generates plain-text version and writes it to the clipboard.
// Falls back to execCommand for browsers without Clipboard API.
// ============================================================================
document.getElementById('btn-copy').addEventListener('click', () => {
  if (!activeChannelId) return;

  const channel = CHANNELS.find(c => c.id === activeChannelId);
  if (!channel) return;

  const text = generatePlainTextDialogue(channel);

  navigator.clipboard.writeText(text).then(() => {
    const feedback = document.getElementById('copy-feedback');
    feedback.classList.remove('hidden');
    setTimeout(() => feedback.classList.add('hidden'), 2500);
  }).catch(() => {
    // Fallback for browsers without clipboard API
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);

    const feedback = document.getElementById('copy-feedback');
    feedback.classList.remove('hidden');
    setTimeout(() => feedback.classList.add('hidden'), 2500);
  });
});

// ============================================================================
// GLOBAL EMPTY STATE CHECK
// If absolutely no data exists in the URL, show the global empty state
// and hide all other sections.
// ============================================================================
function checkGlobalEmpty() {
  const allKeys = CHANNELS.flatMap(c => Object.values(c.keys)).concat([
    'lf_summary_most_blocked_domain',
    'lf_summary_most_alive_domain',
    'lf_summary_core_pattern',
    'lf_summary_one_growth_intention',
    'lf_notes_optional',
  ]);

  const anyData = allKeys.some(k => getVal(k) !== '');

  if (!anyData) {
    document.getElementById('global-empty').classList.remove('hidden');
    document.getElementById('overview').style.display = 'none';
    document.getElementById('summary').style.display = 'none';
    document.getElementById('integration').style.display = 'none';
    document.getElementById('dialogue').style.display = 'none';
    document.getElementById('print-save').style.display = 'none';
    document.getElementById('results-banner').style.display = 'none';
    document.getElementById('sidebar-nav').style.display = 'none';
    return true;
  }
  return false;
}

// ============================================================================
// SIDEBAR ACTIVE STATE: IntersectionObserver
// Highlights the sidebar link corresponding to the visible section.
// ============================================================================
function initSidebarObserver() {
  const sections = document.querySelectorAll('section[data-section]');
  const links    = document.querySelectorAll('.sidebar-link[data-section]');

  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.dataset.section;
        links.forEach(link => {
          if (link.dataset.section === id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
}

// ============================================================================
// INIT: Run all renderers on DOMContentLoaded
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  if (submissionMode) {
    showSubmissionLoading();
    const loaded = await loadSavedSubmission();
    if (!loaded) {
      showSubmissionError();
      return;
    }

    const banner = document.getElementById('results-banner');
    if (banner) {
      banner.style.display = '';
      banner.innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-500 shrink-0" aria-hidden="true"></span><span class="text-slate-700 dark:text-slate-200 font-medium">Results ready — scroll down to explore your assessment</span>';
    }

    ['overview', 'summary', 'integration', 'dialogue', 'print-save', 'sidebar-nav'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = '';
    });

    const isEmpty = checkGlobalEmpty();
    if (isEmpty) return;

    renderChannelSummary();
    renderIntegration();
    renderDialogueBuilder();
    initSidebarObserver();
  } else {
    const isEmpty = checkGlobalEmpty();
    if (isEmpty) return;

    renderChannelSummary();
    renderIntegration();
    renderDialogueBuilder();
    initSidebarObserver();
  }
});