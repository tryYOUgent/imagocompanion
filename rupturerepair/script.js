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
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    })();

(function(){
  var params=new URLSearchParams(window.location.search);
  var fields={};
  var paramMap={
    'first_name':'firstName','last_name':'lastName','full_name':'fullName',
    'email':'email','phone':'phone','company':'company',
    'city':'city','state':'state','country':'country'
  };
  var skipTags={'SCRIPT':1,'STYLE':1,'NOSCRIPT':1,'TEXTAREA':1,'CODE':1,'PRE':1};
  var hasUrlFields=false;
  for(var p in paramMap){
    var v=params.get(p);
    if(v){fields[paramMap[p]]=v;hasUrlFields=true;}
  }
  var contactId=params.get('contact_id');
  function esc(s){
    if(!s)return s;
    var d=document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }
  function doReplace(data){
    var r={};
    r['{{full_name}}']=esc(((data.firstName||'')+' '+(data.lastName||'')).trim()||((data.fullName||data.name)||''));
    r['{{first_name}}']=esc(data.firstName||(data.name?data.name.split(' ')[0]:'')||'');
    r['{{last_name}}']=esc(data.lastName||(data.name&&data.name.indexOf(' ')>-1?data.name.substring(data.name.indexOf(' ')+1):'')||'');
    r['{{email}}']=esc(data.email||'');
    r['{{phone}}']=esc(data.phone||'');
    r['{{company}}']=esc(data.company||'');
    r['{{city}}']=esc(data.city||'');
    r['{{state}}']=esc(data.state||'');
    r['{{country}}']=esc(data.country||'');
    r['{{date}}']=new Date().toLocaleDateString();
    r['{{time}}']=new Date().toLocaleTimeString();
    r['{{location}}']=[data.city,data.state,data.country].filter(Boolean).join(', ');
    r['{{tracking_id}}']=esc(data.trackingId||'');
    r['{{lastClickedProduct}}']=esc(data.lastClickedProduct||'');
    r['{{lastProductClickDate}}']=esc(data.lastProductClickDate||'');
    r['{{lastClickedProductPrice}}']=esc(data.lastClickedProductPrice||'');
    r['{{lastClickedProductURL}}']=esc(data.lastClickedProductURL||'');
    r['{{productsClickedCount}}']=esc(data.productsClickedCount||'0');
    r['{{ip_address}}']=esc(data.ipAddress||'');
    r['{{ip}}']=esc(data.ipAddress||'');
    if(data.customFields){
      for(var k in data.customFields){
        r['{{'+k+'}}']=esc(String(data.customFields[k]||''));
      }
    }
    params.forEach(function(v,k){
      if(!paramMap[k]&&k!=='contact_id'&&k!=='page_id'&&k.indexOf('utm_')!==0){
        r['{{'+k+'}}']=esc(v);
      }
    });
    var hasValues=false;
    for(var key in r){if(r[key]){hasValues=true;break;}}
    if(!hasValues)return;
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
      acceptNode:function(n){
        var p=n.parentNode;
        if(p&&skipTags[p.nodeName])return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while(node=walker.nextNode()){
      var txt=node.nodeValue;
      if(txt&&txt.indexOf('{{')>-1){
        var changed=txt;
        for(var ph in r){
          if(r[ph]&&changed.indexOf(ph)>-1){
            changed=changed.split(ph).join(r[ph]);
          }
        }
        if(changed!==txt)node.nodeValue=changed;
      }
    }
    var attrs=['value','placeholder','content','alt','title'];
    attrs.forEach(function(attr){
      var els=document.querySelectorAll('['+attr+'*="{{"]');
      for(var i=0;i<els.length;i++){
        var tag=els[i].tagName;
        if(skipTags[tag])continue;
        var val=els[i].getAttribute(attr);
        if(val){
          var nv=val;
          for(var ph in r){
            if(r[ph]&&nv.indexOf(ph)>-1){
              nv=nv.split(ph).join(r[ph]);
            }
          }
          if(nv!==val)els[i].setAttribute(attr,nv);
        }
      }
    });
  }
  function run(){
    if(contactId){
      var xhr=new XMLHttpRequest();
      xhr.open('GET','https://paymegpt.com/api/landing/context/'+encodeURIComponent(contactId)+'?page_id=1792');
      xhr.onload=function(){
        if(xhr.status===200){
          try{
            var resp=JSON.parse(xhr.responseText);
            if(resp.success&&resp.contact){
              var merged=resp.contact;
              for(var k in fields){merged[k]=fields[k];}
              doReplace(merged);
              return;
            }
          }catch(e){}
        }
        if(hasUrlFields)doReplace(fields);
      };
      xhr.onerror=function(){if(hasUrlFields)doReplace(fields);};
      xhr.send();
    }else if(hasUrlFields){
      doReplace(fields);
    }
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}
  else{run();}
})();

// ===== THEME TOGGLE =====
  // Purpose: Toggle dark/light mode and persist preference
  document.getElementById('themeToggle').addEventListener('click', () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  // ===== EXAMPLES PANEL TOGGLE =====
  // Purpose: Expand/collapse inline examples panels on toggle button click
  document.querySelectorAll('.examples-toggle').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      const panelId = this.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      this.setAttribute('aria-expanded', String(!isExpanded));
      if (!isExpanded) {
        panel.classList.add('open');
      } else {
        panel.classList.remove('open');
      }
    });
  });

  // ===== REQUIRED FIELDS CONFIGURATION =====
  const REQUIRED_FIELDS = {
    q1: 'Please describe what happened.',
    q4: 'Please name the feeling you had.',
    q6: 'Please describe your protective reaction.',
    q7: 'Repair begins with ownership. Please complete this prompt.',
    q8: 'Naming what your reaction was protecting helps your partner feel safe. Please complete this prompt.'
  };
  const REQUIRED_IDS = Object.keys(REQUIRED_FIELDS);

  // ===== PROGRESS TRACKER =====
  // Purpose: Enable/disable submit button based on required field completion
  function updateProgress() {
    let completed = 0;
    REQUIRED_IDS.forEach(function(id) {
      const el = document.getElementById(id);
      if (el && el.value.trim().length > 0) completed++;
    });
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = (completed < REQUIRED_IDS.length);
  }

  document.querySelectorAll('textarea').forEach(function(ta) {
    ta.addEventListener('input', updateProgress);
  });
  updateProgress();

  // ===== FORM VALIDATION =====
  // Purpose: Validate required fields, show inline supportive error messages
  function validateForm() {
    let valid = true;
    REQUIRED_IDS.forEach(function(id) {
      const el = document.getElementById(id);
      const fieldWrapper = document.getElementById('field-' + id);
      const errEl = document.getElementById('err-' + id);
      if (!el || !el.value.trim()) {
        valid = false;
        if (fieldWrapper) fieldWrapper.classList.add('field-error');
        if (errEl) errEl.style.display = 'block';
      } else {
        if (fieldWrapper) fieldWrapper.classList.remove('field-error');
        if (errEl) errEl.style.display = 'none';
      }
    });
    return valid;
  }

  // ===== COLLECT FORM DATA =====
  function collectFormData() {
    const responses = {};
    ['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10','q11'].forEach(function(id) {
      const el = document.getElementById(id);
      responses[id] = el ? el.value.trim().substring(0, 600) : '';
    });
    return responses;
  }

  // ===== SHOW/HIDE UI STATES =====
  // Purpose: Manage visibility of form, loading, output, and error states.
  //          When returning to form, the form is shown WITHOUT clearing field values.
  function showState(state) {
    const form = document.getElementById('rupture-form');
    const loading = document.getElementById('loading-state');
    const output = document.getElementById('output-section');
    const error = document.getElementById('error-state');
    const generalError = document.getElementById('general-error');
    form.style.display = state === 'form' ? '' : 'none';
    loading.classList.toggle('hidden', state !== 'loading');
    output.classList.toggle('hidden', state !== 'output');
    error.classList.toggle('hidden', state !== 'error');
    if (generalError) generalError.classList.add('hidden');
  }

  // ============================================================================
  // RETURN TO FORM HANDLERS
  // Purpose: Allow user to navigate back to form after generation to revise
  //          and regenerate. All field values are preserved (no reset).
  //          "Return to Form" scrolls to form top.
  //          "Edit & Regenerate" scrolls to form AND focuses the first field.
  // ============================================================================
  function returnToForm(focusFirst) {
    showState('form');
    const formEl = document.getElementById('rupture-form');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (focusFirst) {
      setTimeout(function() {
        const firstField = document.getElementById('q1');
        if (firstField) {
          firstField.focus();
          firstField.setSelectionRange(firstField.value.length, firstField.value.length);
        }
      }, 350);
    }
  }

  document.getElementById('return-to-form-btn').addEventListener('click', function() { returnToForm(false); });
  document.getElementById('edit-regenerate-btn').addEventListener('click', function() { returnToForm(true); });
  document.getElementById('return-to-form-btn-bottom').addEventListener('click', function() { returnToForm(false); });

  // ===== RENDER PREFACE =====
  // Purpose: Render preface text into output section as paragraphs
  function renderPreface(text) {
    const el = document.getElementById('preface-content');
    const lines = text.split(/\n+/).filter(function(l) { return l.trim(); });
    el.innerHTML = lines.map(function(line) {
      return '<p>' + escapeHtml(line.trim()) + '</p>';
    }).join('');
  }

  // ===== HTML ESCAPE UTILITY =====
  // Purpose: Prevent XSS by escaping user-derived content before innerHTML insertion
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ============================================================================
  // MIRROR ENGINE (DETERMINISTIC)
  // Purpose: Apply controlled pronoun shifts to a Sender line to produce a
  //          Receiver mirror. Word-boundary replacements only. Handles
  //          contractions explicitly to prevent "you'm" / "you've" errors.
  // ============================================================================
  function applyMirrorShift(sentence) {
    let s = sentence.replace(/\bi\b/g, 'I');
    s = s.replace(/\bI'm\b/g, 'you\u2019re_TEMP');
    s = s.replace(/\bI've\b/g, 'you\u2019ve_TEMP');
    s = s.replace(/\bI'd\b/g, 'you\u2019d_TEMP');
    s = s.replace(/\bI'll\b/g, 'you\u2019ll_TEMP');
    s = s.replace(/\bI\b/g, 'you');
    s = s.replace(/\bmy\b/gi, 'your');
    s = s.replace(/\bmine\b/gi, 'yours');
    s = s.replace(/\bmyself\b/gi, 'yourself');
    s = s.replace(/\bme\b/g, 'you');
    s = s.replace(/you\u2019re_TEMP/g, "you're");
    s = s.replace(/you\u2019ve_TEMP/g, "you've");
    s = s.replace(/you\u2019d_TEMP/g, "you'd");
    s = s.replace(/you\u2019ll_TEMP/g, "you'll");
    s = s.charAt(0).toUpperCase() + s.slice(1);
    return s;
  }

  // ============================================================================
  // TEXT SANITISER
  // Purpose: Mechanical cleanup — does NOT rewrite meaning.
  // ============================================================================
  function sanitiseLine(line) {
    if (!line) return line;
    let s = line.replace(/\bi\b/g, 'I');
    s = s.replace(/  +/g, ' ').trim();
    s = s.replace(/\byou'm\b/gi, "you're");
    s = s.replace(/\byou're're\b/gi, "you're");
    s = s.replace(/\byou've've\b/gi, "you've");
    s = s.replace(/^(["'])(.+)\1$/, function(match, q, inner) {
      return q + inner.replace(/["]/g, '') + q;
    });
    if (!/^".*"$/.test(s)) {
      s = s.replace(/"/g, '');
    }
    // Strip single quotes that wrap the entire string
    if (/^'.*'$/.test(s)) {
      s = s.replace(/^'|'$/g, '');
    }
    if (s && !/[.!?,;:]$/.test(s)) {
      s = s + '.';
    }
    s = s.replace(/\.\s+([a-z])/g, function(m, c) { return '. ' + c.toUpperCase(); });
    return s;
  }

  // ============================================================================
  // SUMMARY GENERATOR (DETERMINISTIC)
  // Purpose: Build Receiver summary from Sender segments without adding meaning.
  // ============================================================================
  function buildSummary(senderSegments) {
    const summaryParts = senderSegments.map(function(seg) {
      const base = seg.replace(/[.!?]+$/, '').trim();
      const shifted = applyMirrorShift(base);
      return shifted;
    });
    if (summaryParts.length === 0) return 'You shared something important with me, and I want to make sure I understood you.';
    if (summaryParts.length === 1) return summaryParts[0] + '.';
    const first = summaryParts[0];
    const rest = summaryParts.slice(1);
    const joined = rest.join('. ');
    return first + '. ' + joined + '.';
  }

  // ============================================================================
  // ROLE CARD RENDERER
  // Purpose: Render a single role card (Sender or Receiver) as an HTML element.
  // ============================================================================
  function renderCard(role, text, isMirror) {
    const isSender = role === 'sender';
    const cardClass = isSender ? 'role-card-sender' : 'role-card-receiver';
    const labelClass = isSender ? 'role-label-sender' : 'role-label-receiver';
    const label = isSender ? 'SENDER' : 'RECEIVER';
    const textClass = 'card-text' + (isMirror ? ' mirror-text' : '');
    return '<div class="' + cardClass + '">'
      + '<span class="' + labelClass + '">' + label + '</span>'
      + '<p class="' + textClass + '">' + escapeHtml(text) + '</p>'
      + '</div>';
  }

  // ============================================================================
  // SECTION HEADER RENDERER
  // Purpose: Render a labelled section divider for sections A–G
  // ============================================================================
  function renderSectionHeader(label, title) {
    return '<p class="script-section-header">' + escapeHtml(label + ' ' + title) + '</p>';
  }

  // ============================================================================
  // POST-CHECK: VALIDATE APPOINTMENT TOPIC PHRASE
  // Purpose: Enforce Hybrid B-Lite constraints on the AI-generated topic phrase.
  //
  // Checks performed:
  //   1) Word count: must be 10–16 words. Returns flag if out of range.
  //   2) Tone/voice mention rule: "tone" or "voice" must not appear unless Q1
  //      contains one of: tone, voice, critical, criticism, sharp, snappy,
  //      yell, yelling.
  //   3) Forbidden characters: strip any single or double quote characters.
  //
  // Returns: { phrase: string, needsWordCountRegen: bool, needsToneRegen: bool }
  // ============================================================================
  function validateAppointmentTopicPhrase(phrase, q1) {
    let cleaned = phrase.trim();

    // ===== POST-CHECK 3: Strip forbidden quote characters =====
    cleaned = cleaned.replace(/['""\u2018\u2019\u201C\u201D]/g, '');
    cleaned = cleaned.trim();

    // ===== POST-CHECK 1: Word count validation =====
    const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
    const needsWordCountRegen = (wordCount < 10 || wordCount > 16);

    // ===== POST-CHECK 2: Tone/voice mention rule =====
    // Only allow "tone" or "voice" in the phrase if Q1 actually references them
    const toneKeywords = ['tone', 'voice', 'critical', 'criticism', 'sharp', 'snappy', 'yell', 'yelling'];
    const q1Lower = (q1 || '').toLowerCase();
    const q1HasToneRef = toneKeywords.some(function(kw) { return q1Lower.indexOf(kw) !== -1; });
    const phraseHasToneRef = /\b(tone|voice)\b/i.test(cleaned);
    const needsToneRegen = (phraseHasToneRef && !q1HasToneRef);

    return {
      phrase: cleaned,
      needsWordCountRegen: needsWordCountRegen,
      needsToneRegen: needsToneRegen
    };
  }

  // ============================================================================
  // POST-CHECK: VALIDATE SENDER SEGMENTS FOR NESTED QUOTES
  // Purpose: Strip or flag any Sender segment that contains quotation marks.
  //          Returns cleaned segments array.
  // ============================================================================
  function validateSenderSegments(segments) {
    return segments.map(function(seg) {
      // Strip all quote characters from segments
      let cleaned = seg.replace(/['""\u2018\u2019\u201C\u201D]/g, '');
      // Normalise standalone "i" → "I"
      cleaned = cleaned.replace(/\bi\b/g, 'I');
      // Ensure sentence punctuation
      cleaned = cleaned.trim();
      if (cleaned && !/[.!?,;:]$/.test(cleaned)) {
        cleaned = cleaned + '.';
      }
      return cleaned;
    }).filter(function(s) { return s.length > 0; });
  }

  // ============================================================================
  // RENDER SCRIPT (MAIN OUTPUT RENDERER)
  // Purpose: Takes structured data { senderSegments, validation, empathy,
  //          appointmentTopicPhrase } and renders the complete A–G IMAGO script.
  //
  // HYBRID B-LITE: Section A appointment line uses AI-generated topic phrase
  //   from Q1, formatted via fixed code template:
  //   SENDER: "I want to talk about {appointmentTopicPhrase}. Is now a good time?"
  //   RECEIVER: "Yes, now is a good time." (fixed, code-controlled)
  //
  // Mirror loops, summary, and closing are all generated deterministically.
  // ============================================================================
  function renderScript(data) {
    const el = document.getElementById('script-content');
    let html = '';

    const segments = data.senderSegments || [];
    const validation = sanitiseLine(data.validation || 'You make sense to me. Given what you were feeling, your response was a form of self-protection, not a failure.');
    const empathy = sanitiseLine(data.empathy || 'I can only imagine how hard that felt.');

    // ===== HYBRID B-LITE: AI-generated appointment topic phrase =====
    // Phrase is Q1-driven, validated by validateAppointmentTopicPhrase().
    // Falls back to generic phrase if AI output was unusable.
    const appointmentTopicPhrase = data.appointmentTopicPhrase || 'something that happened between us that I want to come back to together';

    // ===== SECTION A: MAKE AN APPOINTMENT =====
    // Sender line uses fixed template with AI-generated topic phrase embedded.
    // Receiver line is fixed — code-controlled, never AI-generated.
    html += renderSectionHeader('A)', 'MAKE AN APPOINTMENT');
    html += renderCard('sender', 'I want to talk about ' + appointmentTopicPhrase + '. Is now a good time?', false);
    html += renderCard('receiver', 'Yes, now is a good time.', false);

    // ===== SECTION B: INTENTION =====
    html += renderSectionHeader('B)', 'INTENTION');
    html += renderCard('sender', 'I want to share my experience with you. My intention is to help you understand me \u2014 not to criticise or blame you.', false);
    html += renderCard('receiver', 'My intention is to listen and understand you fully. I\'m not here to defend myself or fix anything. I just want to hear you.', false);

    // ===== SECTION C: DIALOGUE — SHARING + MIRROR =====
    html += renderSectionHeader('C)', 'DIALOGUE \u2014 SHARING + MIRROR');

    segments.forEach(function(seg, i) {
      const cleanSeg = sanitiseLine(seg);
      const mirrored = applyMirrorShift(cleanSeg);
      const isLast = (i === segments.length - 1);

      html += renderCard('sender', cleanSeg, false);
      html += renderCard('receiver', 'What I hear you saying is: ' + mirrored, true);
      html += renderCard('receiver', 'Did I get you?', false);
      html += renderCard('sender', 'Yes.', false);
      html += renderCard('receiver', 'Is there more?', false);

      if (isLast) {
        html += renderCard('sender', 'No. Not for now.', false);
      }
    });

    // ===== SECTION D: SUMMARY =====
    html += renderSectionHeader('D)', 'SUMMARY');
    const summaryText = buildSummary(segments);
    html += renderCard('receiver', summaryText, false);
    html += renderCard('sender', 'Yes.', false);
    html += renderCard('receiver', 'Is there more?', false);
    html += renderCard('sender', 'No. Not for now.', false);

    // ===== SECTION E: VALIDATION =====
    html += renderSectionHeader('E)', 'VALIDATION');
    html += renderCard('receiver', validation, false);

    // ===== SECTION F: EMPATHY =====
    html += renderSectionHeader('F)', 'EMPATHY');
    html += renderCard('receiver', empathy, false);

    // ===== SECTION G: CLOSING (FIXED) =====
    html += renderSectionHeader('G)', 'CLOSING');
    html += renderCard('sender', 'Thank you for listening.', false);
    html += renderCard('receiver', 'Thank you for sharing.', false);
    html += renderCard('sender', 'I care about you and I care about us.', false);
    html += renderCard('receiver', 'I care about you too, and I want us to feel close and safe together.', false);

    el.innerHTML = html;
  }

  // ============================================================================
  // BUILD PLAIN TEXT FOR COPY
  // Purpose: Produce a clean plain-text version of preface + script for clipboard
  // ============================================================================
  function buildPlainText() {
    const preface = document.getElementById('preface-content').innerText || '';
    const script = document.getElementById('script-content').innerText || '';
    return 'A NOTE BEFORE YOU BEGIN\n\n' + preface + '\n\n---\n\n' + script;
  }

  // ===== COPY BUTTON HANDLER =====
  function handleCopy(btn) {
    const text = buildPlainText();
    navigator.clipboard.writeText(text).then(function() {
      const original = btn.innerHTML;
      btn.innerHTML = '✓ Copied!';
      btn.classList.add('bg-brand', 'text-white', 'border-brand');
      setTimeout(function() {
        btn.innerHTML = original;
        btn.classList.remove('bg-brand', 'text-white', 'border-brand');
      }, 2000);
    }).catch(function() {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  }

  document.getElementById('copy-btn').addEventListener('click', function() { handleCopy(this); });
  document.getElementById('copy-btn-bottom').addEventListener('click', function() { handleCopy(this); });
  document.getElementById('print-btn').addEventListener('click', function() { window.print(); });
  document.getElementById('print-btn-bottom').addEventListener('click', function() { window.print(); });

  // ===== START OVER BUTTON =====
  // Purpose: Full reset — clears form fields and returns to fresh state
  document.getElementById('start-over-btn').addEventListener('click', function() {
    document.getElementById('rupture-form').reset();
    document.querySelectorAll('textarea').forEach(function(ta) {
      ta.style.height = 'auto';
    });
    updateProgress();
    showState('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== RETRY BUTTON =====
  document.getElementById('retry-btn').addEventListener('click', function() {
    showState('form');
  });

  // ============================================================================
  // BUILD PROMPT — HYBRID B-LITE
  // Purpose: Build LLM prompt that requests FIVE components:
  //   1) APPOINTMENT_TOPIC — Q1-driven, 10–16 words, neutral, non-blaming
  //   2) PREFACE — 3–6 lines of warm reassurance
  //   3) SENDER_SEGMENTS — 5–8 meaning-based segments for Section C
  //   4) VALIDATION — single warm statement for Section E
  //   5) EMPATHY — single line for Section F
  //
  // APPOINTMENT_TOPIC rules enforced in prompt:
  //   - Primarily derived from Q1 (what happened)
  //   - Q6/Q7 may inform clarity only if Q1 is sparse
  //   - 10–16 words, neutral, no "you always/you never"
  //   - No clinical terms
  //   - No quotes inside the phrase
  //   - "tone" only if Q1 contains: tone/voice/critical/criticism/sharp/snappy/yell/yelling
  //
  // Output format: labeled plain-text blocks for reliable parsing
  // ============================================================================
  function buildPrompt(responses) {
    // ===== Determine if Q1 contains tone/voice references =====
    // Used to construct a conditional instruction for the LLM
    const toneKeywords = ['tone', 'voice', 'critical', 'criticism', 'sharp', 'snappy', 'yell', 'yelling'];
    const q1Lower = (responses.q1 || '').toLowerCase();
    const q1HasToneRef = toneKeywords.some(function(kw) { return q1Lower.indexOf(kw) !== -1; });
    const toneInstruction = q1HasToneRef
      ? 'Q1 references tone/voice — you MAY use tone-related language in APPOINTMENT_TOPIC if it fits naturally.'
      : 'Q1 does NOT reference tone or voice — do NOT use the words "tone" or "voice" in APPOINTMENT_TOPIC.';

    const systemPrompt = `You are an expert IMAGO Relationship Therapy dialogue writer.

Your task is to generate FIVE specific components from the user's reflective responses. The rest of the script is assembled by code — you do NOT write the full script.

WHAT YOU MUST GENERATE:

1. APPOINTMENT_TOPIC
A short, neutral, non-blaming topic phrase (10–16 words) derived primarily from Q1 (what happened).
This phrase will be embedded in the fixed Sender appointment line:
"I want to talk about [APPOINTMENT_TOPIC]. Is now a good time?"
Rules for APPOINTMENT_TOPIC:
- Primary source is Q1. Reference Q6/Q7 only if Q1 is too sparse to work with.
- Exactly 10–16 words. Count carefully.
- Neutral and non-blaming — no "you always", "you never", no accusations.
- No clinical terms (no "rupture", "dysregulation", "attachment").
- No quotation marks (single or double) inside the phrase.
- ${toneInstruction}
- Write in warm, conversational language.
- Examples of acceptable phrases:
  "the moment earlier when our conversation about plans got tense and disconnected"
  "the moment today when we were texting and it felt cold between us"
  "the moment when we talked about money and I got snappy and distant"

2. PREFACE
3 to 6 short lines of warm, honest reassurance. Acknowledge courage. Remind them this is a starting point, not a performance. Encourage gentleness.

3. SENDER_SEGMENTS
5 to 8 complete Sender dialogue segments for Section C. Each segment is 1–2 sentences. Together they should cover: the moment of disconnection, the feeling, the protective reaction, ownership, and what the reaction was protecting from. Optional: longing, small support.

4. VALIDATION
One warm statement beginning with "You make sense to me…" (2–3 sentences). Validate why the Sender's experience makes sense.

5. EMPATHY
One sentence naming the feelings present for the Sender. Phrased warmly as a Receiver empathy statement.

ABSOLUTE RULES:
- Do NOT echo the user's wording or reflection stem phrasing verbatim.
- Do NOT quote the user's input inside Sender lines or APPOINTMENT_TOPIC.
- Do NOT copy example phrases verbatim.
- Do NOT reuse the reflection prompt labels ("What happened", "What I felt", etc.).
- Paraphrase freely. Write like an emotionally mature, calm partner speaking aloud.
- Sender lines must feel warm, relational, and natural — not clinical or worksheet-like.
- No nested quotation marks (single or double) inside Sender segments or APPOINTMENT_TOPIC.
- No stacked fragments ("and… and… and…"). Choose one coherent phrasing per segment.
- No run-on sentences. One clear idea per sentence.
- Standalone "i" must always be capitalised as "I".
- Every sentence must end with punctuation.
- Write in warm, human language. Prefer clarity over fidelity to wording.

OUTPUT FORMAT — use EXACTLY these labeled blocks, nothing else:

APPOINTMENT_TOPIC: <topic phrase — 10 to 16 words, no quotes>

PREFACE:
<line 1>
<line 2>
<line 3>
<add more as needed, max 6>

SENDER_SEGMENTS:
1) <segment>
2) <segment>
3) <segment>
4) <segment>
5) <segment>
<add more as needed, max 8>

VALIDATION:
<validation statement>

EMPATHY:
<empathy line>`;

    const parts = [];
    if (responses.q1) parts.push('Q1 — What happened: ' + responses.q1);
    if (responses.q2) parts.push('Q2 — The story that started: ' + responses.q2);
    if (responses.q3) parts.push('Q3 — What stung most: ' + responses.q3);
    if (responses.q4) parts.push('Q4 — The feeling: ' + responses.q4);
    if (responses.q5) parts.push('Q5 — The softer feeling underneath: ' + responses.q5);
    if (responses.q6) parts.push('Q6 — The protective reaction: ' + responses.q6);
    if (responses.q7) parts.push('Q7 — What I can own: ' + responses.q7);
    if (responses.q8) parts.push('Q8 — What my reaction was protecting from: ' + responses.q8);
    if (responses.q9) parts.push('Q9 — What I long for: ' + responses.q9);
    if (responses.q10) parts.push('Q10 — What I would want to say if I could redo it: ' + responses.q10);
    if (responses.q11) parts.push('Q11 — A small support that would help: ' + responses.q11);

    const userPrompt = 'Here are my reflections. Please generate all five components:\n\n' + parts.join('\n');

    return { systemPrompt, userPrompt };
  }

  // ============================================================================
  // PARSE LLM RESPONSE — HYBRID B-LITE FORMAT
  // Purpose: Extract all five structured components from the LLM's labeled output.
  //   Returns: { appointmentTopicPhrase, preface, senderSegments, validation, empathy }
  //
  // Parsing strategy:
  //   - APPOINTMENT_TOPIC: single-line label "APPOINTMENT_TOPIC: <phrase>"
  //   - PREFACE: block between "PREFACE:" and next labeled block
  //   - SENDER_SEGMENTS: numbered list "1) … 2) …" between "SENDER_SEGMENTS:" and next block
  //   - VALIDATION: block between "VALIDATION:" and next labeled block
  //   - EMPATHY: block between "EMPATHY:" and end of text
  // ============================================================================
  function parseLLMResponse(text) {
    // ===== Parse APPOINTMENT_TOPIC (single-line label) =====
    let appointmentTopicPhrase = '';
    const topicMatch = text.match(/APPOINTMENT_TOPIC:\s*(.+)/i);
    if (topicMatch) {
      appointmentTopicPhrase = topicMatch[1].trim();
      // Strip any surrounding quotes that may have been included despite instructions
      appointmentTopicPhrase = appointmentTopicPhrase.replace(/^['""\u2018\u2019\u201C\u201D]|['""\u2018\u2019\u201C\u201D]$/g, '').trim();
    }

    // ===== Helper: extract block between two markers =====
    // Finds content between startTag and the next known block header or end of string
    function extractBlock(startTag) {
      const blockHeaders = ['APPOINTMENT_TOPIC:', 'PREFACE:', 'SENDER_SEGMENTS:', 'VALIDATION:', 'EMPATHY:'];
      const startIdx = text.indexOf(startTag);
      if (startIdx === -1) return '';
      const contentStart = startIdx + startTag.length;
      // Find the next block header after this one
      let endIdx = text.length;
      blockHeaders.forEach(function(header) {
        if (header === startTag) return;
        const idx = text.indexOf(header, contentStart);
        if (idx !== -1 && idx < endIdx) {
          endIdx = idx;
        }
      });
      return text.slice(contentStart, endIdx).trim();
    }

    // ===== Parse PREFACE =====
    const prefaceRaw = extractBlock('PREFACE:');

    // ===== Parse SENDER_SEGMENTS =====
    // Segments are numbered: "1) text", "2) text", etc.
    const segmentsRaw = extractBlock('SENDER_SEGMENTS:');
    const senderSegments = [];
    if (segmentsRaw) {
      // Match numbered items: "1) text" or "1. text"
      const numberedPattern = /^\s*\d+[).]\s+(.+)$/gm;
      let match;
      while ((match = numberedPattern.exec(segmentsRaw)) !== null) {
        const seg = match[1].trim();
        if (seg.length > 0) {
          senderSegments.push(seg);
        }
      }
      // Fallback: if no numbered items found, split on newlines
      if (senderSegments.length === 0) {
        segmentsRaw.split('\n').forEach(function(line) {
          const trimmed = line.trim();
          if (trimmed.length > 0) {
            senderSegments.push(trimmed);
          }
        });
      }
    }

    // ===== Parse VALIDATION =====
    const validationRaw = extractBlock('VALIDATION:');

    // ===== Parse EMPATHY =====
    const empathyRaw = extractBlock('EMPATHY:');

    return {
      appointmentTopicPhrase: appointmentTopicPhrase,
      preface: prefaceRaw,
      senderSegments: senderSegments,
      validation: validationRaw,
      empathy: empathyRaw
    };
  }

  // ============================================================================
  // MOCK COMPONENT GENERATOR — HYBRID B-LITE (Demo / Offline Mode)
  // Purpose: Synthesise all five structured components from form responses
  //          without an API. Produces:
  //          { appointmentTopicPhrase, preface, senderSegments, validation, empathy }
  //
  // APPOINTMENT_TOPIC generation:
  //   - Primarily derived from Q1 (what happened) — synthesised, not echoed
  //   - Respects tone/voice restriction based on Q1 content
  //   - Target: 10–16 words
  //   - No quotes, no blame language
  // ============================================================================
  function generateMockComponents(r) {
    const q1 = (r.q1 || '').trim();
    const q2 = (r.q2 || '').trim();
    const q3 = (r.q3 || '').trim();
    const q4 = (r.q4 || 'hurt').trim();
    const q5 = (r.q5 || '').trim();
    const q6 = (r.q6 || 'pulled back').trim();
    const q7 = (r.q7 || 'how I responded').trim();
    const q8 = (r.q8 || 'feeling unseen').trim();
    const q9 = (r.q9 || '').trim();
    const q10 = (r.q10 || '').trim();
    const q11 = (r.q11 || '').trim();

    // Normalise feeling words for natural embedding
    function normalise(str) {
      return str.replace(/[.!?,;:]+$/, '').trim().toLowerCase();
    }

    const feelingNorm = normalise(q4);
    const softerNorm = q5 ? normalise(q5) : '';
    const reactionNorm = normalise(q6);
    const ownerNorm = normalise(q7);
    const protectNorm = normalise(q8);

    // ===== HYBRID B-LITE: Build appointment topic phrase from Q1 =====
    // Primary source: Q1. Tone/voice only if Q1 references them.
    // Target: 10–16 words, neutral, non-blaming, no quotes.
    const toneKeywords = ['tone', 'voice', 'critical', 'criticism', 'sharp', 'snappy', 'yell', 'yelling'];
    const q1Lower = q1.toLowerCase();
    const q1HasToneRef = toneKeywords.some(function(kw) { return q1Lower.indexOf(kw) !== -1; });

    // Keyword-driven topic phrase map — Q1-content-based
    // Each entry: { keywords (Q1 substrings to match), phrase (10–16 words) }
    const topicPhraseMap = [
      {
        keywords: ['text', 'texting', 'message', 'messages', 'phone'],
        phrase: 'the moment when we were texting and something between us felt cold and distant'
      },
      {
        keywords: ['plan', 'plans', 'schedule', 'calendar', 'weekend', 'trip'],
        phrase: 'the moment when we were talking about plans and tension started to rise between us'
      },
      {
        keywords: ['money', 'finances', 'financial', 'budget', 'spending', 'cost'],
        phrase: 'the moment when we talked about money and I got distant and pulled away'
      },
      {
        keywords: ['argument', 'argued', 'fight', 'fighting', 'fought', 'conflict'],
        phrase: 'the moment earlier when things escalated between us and we both got stuck'
      },
      {
        keywords: ['silence', 'silent', 'quiet', 'went quiet', 'stopped talking'],
        phrase: 'the moment when the silence between us grew and I felt us pulling apart'
      },
      {
        keywords: ['work', 'job', 'career', 'stress', 'busy', 'overwhelmed'],
        phrase: 'the moment when stress came between us and I got distant instead of close'
      },
      {
        keywords: ['dinner', 'meal', 'eating', 'kitchen', 'home', 'house'],
        phrase: 'the moment at home when something shifted between us and we disconnected'
      },
      {
        keywords: ['escalat', 'heated', 'got heated', 'raised'],
        phrase: 'the moment when things escalated between us and I responded in a way I want to revisit'
      },
      {
        keywords: ['misread', 'misunderstood', 'miscommunication', 'misread each other'],
        phrase: 'the moment when we misread each other and I want us to find our way back'
      },
      {
        keywords: ['distance', 'disconnected', 'disconnect', 'apart', 'drifted'],
        phrase: 'the moment when I felt us grow distant and I want to close that gap together'
      }
    ];

    // Tone/voice specific phrases — only used when Q1 references them
    const toneTopicPhraseMap = [
      {
        keywords: ['tone', 'sharp', 'snappy'],
        phrase: 'the moment when my tone got sharp and I want to come back to it with more care'
      },
      {
        keywords: ['critical', 'criticism'],
        phrase: 'the moment when I got critical and I want to repair how that landed'
      },
      {
        keywords: ['yell', 'yelling', 'raised'],
        phrase: 'the moment when I raised my voice and I want to come back to it differently'
      },
      {
        keywords: ['voice'],
        phrase: 'the moment when my voice shifted and things got harder between us'
      }
    ];

    let appointmentTopicPhrase = '';

    // Check tone map first if Q1 has tone references
    if (q1HasToneRef) {
      for (let i = 0; i < toneTopicPhraseMap.length; i++) {
        const entry = toneTopicPhraseMap[i];
        if (entry.keywords.some(function(kw) { return q1Lower.indexOf(kw) !== -1; })) {
          appointmentTopicPhrase = entry.phrase;
          break;
        }
      }
    }

    // Check general topic map
    if (!appointmentTopicPhrase) {
      for (let i = 0; i < topicPhraseMap.length; i++) {
        const entry = topicPhraseMap[i];
        if (entry.keywords.some(function(kw) { return q1Lower.indexOf(kw) !== -1; })) {
          appointmentTopicPhrase = entry.phrase;
          break;
        }
      }
    }

    // Fallback: build from Q1 content — synthesised, not echoed
    if (!appointmentTopicPhrase) {
      if (q1.length > 0) {
        // Use a generic relational framing — Q1-informed but not verbatim
        appointmentTopicPhrase = 'the moment between us when something shifted and I felt us move apart';
      } else {
        appointmentTopicPhrase = 'something that happened between us that I want to come back to together';
      }
    }

    // ===== Build Sender segments =====
    const segments = [];

    // Segment 1: The moment of disconnection (required)
    if (q1.length > 0) {
      const momentCore = q1.length > 70
        ? q1.substring(0, 70).replace(/\s\S+$/, '') + '\u2026'
        : q1.replace(/[.!?]+$/, '');
      segments.push('Something shifted between us \u2014 ' + momentCore.charAt(0).toLowerCase() + momentCore.slice(1) + ' \u2014 and I felt us move apart from each other.');
    } else {
      segments.push('There was a moment between us where something shifted, and I felt the distance grow.');
    }

    // Segment 2: The story / what stung (optional)
    if (q2 && q2.length > 3) {
      segments.push('In that moment, a part of me started to wonder whether I still mattered to you.');
    } else if (q3 && q3.length > 3) {
      segments.push('What landed hardest was a sense of being unseen in that moment.');
    }

    // Segment 3: The primary feeling (required)
    if (softerNorm) {
      segments.push('I felt ' + feelingNorm + ', and underneath that, something quieter \u2014 ' + softerNorm + '.');
    } else {
      segments.push('I felt ' + feelingNorm + ' in that moment.');
    }

    // Segment 4: The protective reaction (required)
    segments.push('When that happened, my instinct was to ' + reactionNorm + '. I know that created more distance between us, even though it wasn\'t my intention.');

    // Segment 5: Ownership (required)
    segments.push('I want to own ' + ownerNorm + '. That part was mine, and I can see how it affected you.');

    // Segment 6: What the reaction was protecting from (required)
    segments.push('What I was really trying to protect myself from was ' + protectNorm + '. That fear is old, and it showed up here between us.');

    // Segment 7: Longing or redo (optional)
    if (q9 && q9.length > 3) {
      const longingNorm = normalise(q9);
      segments.push('What I most want is ' + longingNorm + '.');
    } else if (q10 && q10.length > 3) {
      segments.push('If I could go back to that moment, I would want to stay softer and stay close to you.');
    }

    // Segment 8: Small support (optional)
    if (q11 && q11.length > 3) {
      const supportNorm = normalise(q11);
      segments.push('Something small that would help me feel safer between us is ' + supportNorm + '.');
    }

    // ===== Build validation =====
    const validation = 'You make sense to me. Given what you were feeling and what you feared, it makes complete sense that you responded the way you did. Your reaction was a form of self-protection \u2014 not a failure, and not a reflection of how much you care.';

    // ===== Build empathy =====
    let empathy = 'I imagine you felt ' + feelingNorm;
    if (softerNorm) {
      empathy += ', and underneath that, ' + softerNorm;
    }
    empathy += '. I can feel that.';

    // ===== Build preface =====
    const preface = [
      'What you\'ve just written took honesty and courage \u2014 that matters.',
      'This script is a starting point, not a performance. Read it gently, at your own pace.',
      'If something doesn\'t feel exactly right, that\'s okay. Let your own words come through.',
      'There is no perfect way to do this. The willingness to try is already repair.',
      'Breathe. You\'ve got this.'
    ].join('\n');

    return {
      appointmentTopicPhrase: appointmentTopicPhrase,
      preface: preface,
      senderSegments: segments,
      validation: validation,
      empathy: empathy
    };
  }

  // ============================================================================
  // API CALL — HYBRID B-LITE
  // Purpose: Send form data to backend, receive all five structured components.
  //          Falls back to client-side mock if API unavailable.
  //
  // Post-checks applied after receiving AI output:
  //   1) appointmentTopicPhrase word count (10–16 words)
  //   2) Tone/voice mention rule against Q1 content
  //   3) Forbidden characters stripped from topic phrase
  //   4) Sender segments validated for nested quotes
  //   5) Capitalisation and punctuation cleanup across all text fields
  //
  // Regeneration: if post-checks fail, the mock fallback handles correction
  //   client-side (server-side regeneration would require additional API round-trip).
  // ============================================================================
  async function callGenerateAPI(responses) {
    const totalLength = Object.values(responses).join('').length;
    if (totalLength > 5000) {
      throw new Error('Your responses are too long. Please shorten some fields and try again.');
    }

    let result = null;

    try {
      const res = await fetch('/api/generate-rupture-repair-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses })
      });

      if (res.ok) {
        const data = await res.json();

        // ===== Handle new Hybrid B-Lite format =====
        if (data.appointmentTopicPhrase && data.senderSegments && Array.isArray(data.senderSegments)) {
          result = data;
        }
        // ===== Handle legacy senderSegments format (no appointmentTopicPhrase) =====
        else if (data.senderSegments && Array.isArray(data.senderSegments)) {
          result = data;
          // appointmentTopicPhrase will be filled by mock fallback below
        }
        // ===== Handle rawLLM string format — parse it =====
        else if (data.rawLLM) {
          result = parseLLMResponse(data.rawLLM);
        }
      }

      if (!res.ok && res.status !== 404 && res.status !== 405) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Server error. Please try again.');
      }
    } catch (err) {
      if (err.message && err.message.includes('Server error')) throw err;
      // Network error or 404/405 — fall through to mock
    }

    // ===== CLIENT-SIDE MOCK (Demo / Offline Mode) =====
    if (!result) {
      result = generateMockComponents(responses);
    }

    // ============================================================================
    // POST-CHECKS (applied to both API and mock results)
    // ============================================================================

    // ===== POST-CHECK 3 + 1 + 2: Validate appointmentTopicPhrase =====
    if (result.appointmentTopicPhrase) {
      const check = validateAppointmentTopicPhrase(result.appointmentTopicPhrase, responses.q1);
      result.appointmentTopicPhrase = check.phrase;

      // If word count or tone check failed, regenerate topic from mock
      if (check.needsWordCountRegen || check.needsToneRegen) {
        // Generate a fresh mock result to get a valid topic phrase
        const mockFallback = generateMockComponents(responses);
        result.appointmentTopicPhrase = mockFallback.appointmentTopicPhrase;
      }
    } else {
      // No topic phrase at all — generate from mock
      const mockFallback = generateMockComponents(responses);
      result.appointmentTopicPhrase = mockFallback.appointmentTopicPhrase;
    }

    // ===== POST-CHECK 4: Validate Sender segments for nested quotes =====
    if (result.senderSegments && Array.isArray(result.senderSegments)) {
      result.senderSegments = validateSenderSegments(result.senderSegments);
    }

    // ===== POST-CHECK 5: Capitalisation cleanup across all text fields =====
    // Normalise standalone "i" → "I" in validation and empathy
    if (result.validation) {
      result.validation = result.validation.replace(/\bi\b/g, 'I');
    }
    if (result.empathy) {
      result.empathy = result.empathy.replace(/\bi\b/g, 'I');
    }
    if (result.preface) {
      result.preface = result.preface.replace(/\bi\b/g, 'I');
    }

    return result;
  }

  // ============================================================================
  // FORM SUBMIT HANDLER — HYBRID B-LITE
  // Purpose: Validate form, call API, apply post-checks, render output.
  //          appointmentTopicPhrase is AI-generated (Q1-driven) and passed
  //          directly to renderScript() for embedding in Section A template.
  //          Regeneration overwrites previous output with latest result.
  // ============================================================================
  document.getElementById('rupture-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) {
      document.getElementById('general-error').classList.remove('hidden');
      const firstError = document.querySelector('.field-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    document.getElementById('general-error').classList.add('hidden');
    const responses = collectFormData();

    showState('loading');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      // ===== Call API (or mock) — receives all five components =====
      const result = await callGenerateAPI(responses);

      // ===== Render preface =====
      renderPreface(result.preface || '');

      // ===== Render script using hybrid role-card renderer =====
      // appointmentTopicPhrase: AI-generated from Q1, post-checked, passed to Section A template
      // senderSegments: AI-generated, post-checked for quotes
      // validation + empathy: AI-generated, capitalisation-cleaned
      renderScript({
        appointmentTopicPhrase: result.appointmentTopicPhrase || 'something that happened between us that I want to come back to together',
        senderSegments: result.senderSegments || [],
        validation: result.validation || '',
        empathy: result.empathy || ''
      });

      showState('output');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      document.getElementById('error-message').textContent = err.message || 'Unable to generate your script. Please try again.';
      showState('error');
    }
  });

  // ===== TEXTAREA AUTO-RESIZE =====
  document.querySelectorAll('textarea').forEach(function(ta) {
    ta.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
  });

  // ===== CLEAR FIELD ERRORS ON INPUT =====
  REQUIRED_IDS.forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function() {
        const fieldWrapper = document.getElementById('field-' + id);
        const errEl = document.getElementById('err-' + id);
        if (this.value.trim()) {
          if (fieldWrapper) fieldWrapper.classList.remove('field-error');
          if (errEl) errEl.style.display = 'none';
        }
      });
    }
  });