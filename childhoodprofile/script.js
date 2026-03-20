tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '#5B7FA6',
            brandLight: '#7FA8CC',
            brandDark: '#3D5A7A',
            accent: '#8B9E6E',
            accentLight: '#A8BB8A',
            warm: '#C4956A',
          },
          boxShadow: {
            soft: '0 4px 20px rgba(0,0,0,.06)',
            card: '0 2px 12px rgba(0,0,0,.08)',
          }
        }
      }
    };

/* ===== THEME INITIALIZER ===== */
    /* Runs before paint to prevent flash of wrong theme */
    (function () {
      const saved = localStorage.getItem('imago-theme');
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
      xhr.open('GET','https://paymegpt.com/api/landing/context/'+encodeURIComponent(contactId)+'?page_id=1843');
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

// ============================================================================
    // LOCAL STORAGE AUTOSAVE
    // ============================================================================
    // Namespace key for all saved form data
    const STORAGE_KEY = 'imago_childhood_profile_v1';

    // ===== TRACKED FIELDS LIST =====
    // Defined early so saveToLocalStorage and restoreFromLocalStorage can use it.
    // Includes first_name and email collected for PMG redirect.
    const ALL_FIELDS = [
      'first_name','email',
      'caregiver_label_a','caregiver_label_b',
      'affirming_traits_a','affirming_traits_b',
      'negating_traits_a','negating_traits_b',
      'positive_experiences_a','positive_experience_weight_a',
      'positive_experiences_b','positive_experience_weight_b',
      'positive_feelings_a','positive_feeling_weight_a',
      'positive_feelings_b','positive_feeling_weight_b',
      'painful_experiences_a','painful_experience_weight_a',
      'painful_experiences_b','painful_experience_weight_b',
      'negative_feelings_a','negative_feeling_weight_a',
      'negative_feelings_b','negative_feeling_weight_b',
      'fears_a','fear_weight_a',
      'fears_b','fear_weight_b',
      'unmet_longings_a','unmet_longing_weight_a',
      'unmet_longings_b','unmet_longing_weight_b',
      'top3_painful_traits_overall','overall_difficult_experience',
      'overall_negative_feeling','overall_fear',
      'top3_affirming_traits_overall','unmet_longing_overall',
      'favorite_positive_feeling_overall','overall_worst_fear'
    ];

    // ===== SAVE ALL FIELDS TO LOCALSTORAGE =====
    // Collects values from all inputs, textareas, and the consent checkbox,
    // then serializes to JSON and writes to localStorage.
    // Called on every input/change event and at the top of the submit handler.
    function saveToLocalStorage() {
      const data = {};
      ALL_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.type === 'checkbox') {
          data[id] = el.checked;
        } else {
          data[id] = el.value;
        }
      });
      // Also save the consent checkbox separately since it is not in ALL_FIELDS
      const cb = document.getElementById('consent_checkbox');
      if (cb) data['consent_checkbox'] = cb.checked;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
    }

    // ===== RESTORE ALL FIELDS FROM LOCALSTORAGE =====
    // Reads saved JSON, repopulates all fields, then triggers UI updates.
    // Called once on page load (DOMContentLoaded equivalent).
    function restoreFromLocalStorage() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;
        const data = JSON.parse(saved);
        Object.keys(data).forEach(id => {
          const el = document.getElementById(id);
          if (!el) return;
          if (el.type === 'checkbox') {
            el.checked = data[id];
          } else {
            el.value = data[id];
          }
        });
        // After restore, update all dependent UI
        updateCaregiverLabels();
        updateProgress();
        updateRefPanels();
        updateActiveSectionIndicator();
      } catch (e) {
        console.warn('LocalStorage restore failed:', e);
      }
    }

    // ===== CLEAR LOCALSTORAGE AND RESET FORM =====
    // Called ONLY by the "Clear saved answers" button.
    // NOT called on submit — localStorage is preserved across redirects.
    function clearLocalStorage() {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn('LocalStorage clear failed:', e);
      }
    }

    // ===== THEME TOGGLE =====
    document.getElementById('themeToggle').addEventListener('click', () => {
      const root = document.documentElement;
      const isDark = root.classList.toggle('dark');
      localStorage.setItem('imago-theme', isDark ? 'dark' : 'light');
    });

    // ===== EXAMPLES PANEL TOGGLE =====
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.examples-toggle');
      if (!btn) return;
      const targetId = btn.getAttribute('data-target');
      const panel = document.getElementById(targetId);
      if (!panel) return;
      const isOpen = panel.classList.toggle('open');
      const label = btn.querySelector('.toggle-label');
      if (label) label.textContent = isOpen ? 'Examples ↑' : 'Examples ↓';
    });

    // ===== CAREGIVER LABEL UPDATER =====
    function updateCaregiverLabels() {
      const labelA = document.getElementById('caregiver_label_a').value.trim() || 'Caregiver A';
      const labelB = document.getElementById('caregiver_label_b').value.trim() || 'Caregiver B';
      document.querySelectorAll('.caregiver-a-label').forEach(el => { el.textContent = labelA; });
      document.querySelectorAll('.caregiver-b-label').forEach(el => { el.textContent = labelB; });
      document.querySelectorAll('.caregiver-a-label-ref').forEach(el => { el.textContent = labelA + ':'; });
      document.querySelectorAll('.caregiver-b-label-ref').forEach(el => { el.textContent = labelB + ':'; });
    }

    document.getElementById('caregiver_label_a').addEventListener('input', updateCaregiverLabels);
    document.getElementById('caregiver_label_b').addEventListener('input', updateCaregiverLabels);

    // ===== FIELD COMPLETION DOTS =====
    function updateFieldDot(fieldId) {
      const field = document.getElementById(fieldId);
      if (!field) return;
      const dot = document.querySelector(`.field-complete-dot[data-for="${fieldId}"]`);
      if (!dot) return;
      dot.classList.toggle('visible', field.value.trim().length > 0);
    }

    // ===== SECTION 10 REQUIRED FIELDS =====
    // These 8 fields must be non-empty (after trim) to submit.
    const SECTION_10_REQUIRED = [
      'top3_painful_traits_overall',
      'overall_difficult_experience',
      'overall_negative_feeling',
      'overall_fear',
      'top3_affirming_traits_overall',
      'unmet_longing_overall',
      'favorite_positive_feeling_overall',
      'overall_worst_fear'
    ];

    // ===== PROGRESS TRACKING =====
    function updateProgress() {
      let filled = 0;
      ALL_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.value && el.value.trim().length > 0) filled++;
        updateFieldDot(id);
      });
      const pct = Math.round((filled / ALL_FIELDS.length) * 100);
      document.getElementById('progress-bar-fill').style.width = pct + '%';
      document.getElementById('progress-percent').textContent = pct + '% complete';
    }

    // ===== ACTIVE SECTION DETECTION =====
    function updateActiveSectionIndicator() {
      const sections = document.querySelectorAll('[data-section]');
      let currentSection = 1;
      sections.forEach(sec => {
        sec.classList.remove('active-section');
        const rect = sec.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom > 120) {
          currentSection = parseInt(sec.getAttribute('data-section'));
          sec.classList.add('active-section');
        }
      });
      document.getElementById('section-indicator').textContent = `Section ${currentSection} of 10`;
    }

    window.addEventListener('scroll', updateActiveSectionIndicator, { passive: true });

    // ===== SECTION 10 REFERENCE PANEL UPDATER =====
    const REF_PANEL_MAP = [
      { aEl: 'negating_traits_a',            bEl: 'negating_traits_b',            refA: 'ref-q31-a', refB: 'ref-q31-b' },
      { aEl: 'painful_experience_weight_a',  bEl: 'painful_experience_weight_b',  refA: 'ref-q32-a', refB: 'ref-q32-b' },
      { aEl: 'negative_feeling_weight_a',    bEl: 'negative_feeling_weight_b',    refA: 'ref-q33-a', refB: 'ref-q33-b' },
      { aEl: 'fear_weight_a',                bEl: 'fear_weight_b',                refA: 'ref-q34-a', refB: 'ref-q34-b' },
      { aEl: 'affirming_traits_a',           bEl: 'affirming_traits_b',           refA: 'ref-q35-a', refB: 'ref-q35-b' },
      { aEl: 'unmet_longing_weight_a',       bEl: 'unmet_longing_weight_b',       refA: 'ref-q36-a', refB: 'ref-q36-b' },
      { aEl: 'positive_feeling_weight_a',    bEl: 'positive_feeling_weight_b',    refA: 'ref-q37-a', refB: 'ref-q37-b' },
      { aEl: 'fear_weight_a',                bEl: 'fear_weight_b',                refA: 'ref-q38-a', refB: 'ref-q38-b' },
    ];

    function updateRefPanels() {
      REF_PANEL_MAP.forEach(({ aEl, bEl, refA, refB }) => {
        const valA = (document.getElementById(aEl) || {}).value || '';
        const valB = (document.getElementById(bEl) || {}).value || '';
        const spanA = document.getElementById(refA);
        const spanB = document.getElementById(refB);
        if (spanA) {
          if (valA.trim()) {
            spanA.innerHTML = '';
            spanA.textContent = valA.trim();
          } else {
            spanA.innerHTML = '<span class="prior-ref-empty">Not yet entered…</span>';
          }
        }
        if (spanB) {
          if (valB.trim()) {
            spanB.innerHTML = '';
            spanB.textContent = valB.trim();
          } else {
            spanB.innerHTML = '<span class="prior-ref-empty">Not yet entered…</span>';
          }
        }
      });
    }

    // ===== SECTION 10 INLINE VALIDATION: CLEAR ERROR ON INPUT =====
    // As soon as a Section 10 field becomes non-empty, clear its error state.
    SECTION_10_REQUIRED.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        if (el.value.trim().length > 0) {
          clearFieldError(id);
        }
      });
    });

    // ===== SHOW / CLEAR FIELD ERROR HELPERS =====
    function showFieldError(id) {
      const el = document.getElementById(id);
      const errEl = document.getElementById('err-' + id);
      if (el) el.classList.add('field-invalid');
      if (errEl) errEl.classList.add('visible');
    }

    function clearFieldError(id) {
      const el = document.getElementById(id);
      const errEl = document.getElementById('err-' + id);
      if (el) el.classList.remove('field-invalid');
      if (errEl) errEl.classList.remove('visible');
    }

    // ===== ATTACH ALL INPUT LISTENERS (progress + autosave + ref panels) =====
    // Each field gets input and change listeners that:
    //   1) Save to localStorage immediately
    //   2) Update progress bar and completion dots
    //   3) Update Section 10 reference panels
    ALL_FIELDS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        saveToLocalStorage();
        updateProgress();
        updateRefPanels();
      });
      el.addEventListener('change', () => {
        saveToLocalStorage();
        updateProgress();
        updateRefPanels();
      });
    });

    // Also save on consent checkbox change
    const consentCb = document.getElementById('consent_checkbox');
    if (consentCb) {
      consentCb.addEventListener('change', saveToLocalStorage);
    }

    // ===== CLEAR SAVED ANSWERS BUTTON =====
    document.getElementById('clear-saved-btn').addEventListener('click', () => {
      if (!confirm('Clear all saved answers? This cannot be undone.')) return;
      clearLocalStorage();
      // Reset the form
      document.getElementById('imago-form').reset();
      // Re-check consent (default checked)
      const cb = document.getElementById('consent_checkbox');
      if (cb) cb.checked = true;
      // Clear all Section 10 errors
      SECTION_10_REQUIRED.forEach(id => clearFieldError(id));
      // Update UI
      updateCaregiverLabels();
      updateProgress();
      updateRefPanels();
    });

    // ===== HELPER: GET FIELD VALUE =====
    function fieldVal(id) {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }

    // ===== CAPITALIZE HELPER =====
    function capPhrase(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ===== TRAIT LIST FORMATTER =====
    function formatTraitList(raw) {
      if (!raw) return raw;
      const items = raw
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
      if (items.length === 0) return raw;
      return items.join(' · ');
    }

    // ===== UNMET LONGING GRAMMAR FIXER =====
    function fixLongingGrammar(raw) {
      if (!raw) return raw;
      if (/^to be\b/i.test(raw))       return 'being' + raw.slice('to be'.length);
      if (/^to have\b/i.test(raw))      return 'having' + raw.slice('to have'.length);
      if (/^to feel\b/i.test(raw))      return 'feeling' + raw.slice('to feel'.length);
      if (/^to know\b/i.test(raw))      return 'knowing' + raw.slice('to know'.length);
      if (/^to receive\b/i.test(raw))   return 'receiving' + raw.slice('to receive'.length);
      if (/^to get\b/i.test(raw))       return 'getting' + raw.slice('to get'.length);
      if (/^to see\b/i.test(raw))       return 'seeing' + raw.slice('to see'.length);
      if (/^to hear\b/i.test(raw))      return 'hearing' + raw.slice('to hear'.length);
      if (/^to experience\b/i.test(raw)) return 'experiencing' + raw.slice('to experience'.length);
      if (/^to \w/i.test(raw)) {
        const withoutTo = raw.slice(3);
        const spaceIdx = withoutTo.search(/[\s,]/);
        const verb = spaceIdx === -1 ? withoutTo : withoutTo.slice(0, spaceIdx);
        const rest = spaceIdx === -1 ? '' : withoutTo.slice(spaceIdx);
        return makeGerund(verb) + rest;
      }
      return raw;
    }

    // ===== SIMPLE GERUND HELPER =====
    function makeGerund(verb) {
      if (!verb) return verb;
      const v = verb.toLowerCase();
      if (v.endsWith('ing')) return verb;
      if (v.endsWith('e') && !v.endsWith('ee') && !v.endsWith('oe') && v.length > 2) {
        return verb.slice(0, -1) + 'ing';
      }
      const cvcPattern = /[^aeiou][aeiou][^aeiouwxy]$/;
      if (cvcPattern.test(v) && v.length >= 3) {
        return verb + verb.slice(-1) + 'ing';
      }
      return verb + 'ing';
    }

    // ===== STABLE HASH FUNCTION =====
    function stableHash(str) {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
      }
      return Math.abs(h);
    }

    // ===== DERIVE SECONDARY RESULTING FEELING =====
    function deriveSecondaryFeelingDisplay(data) {
      const primary  = (data.overall_negative_feeling || '').trim().toLowerCase();
      const weightA  = (data.negative_feeling_weight_a || '').trim();
      const weightB  = (data.negative_feeling_weight_b || '').trim();
      if (weightA && weightB) {
        const aLower = weightA.toLowerCase();
        const bLower = weightB.toLowerCase();
        if (aLower !== primary && bLower === primary) return weightA;
        if (bLower !== primary && aLower === primary) return weightB;
        if (aLower !== primary) return weightA;
        return weightB;
      }
      if (weightA) return weightA;
      if (weightB) return weightB;
      return data.overall_negative_feeling || 'deeply unsettled';
    }

    // ============================================================================
    // GENERATE RESULTS (Page 2 — kept intact per spec)
    // Called locally if needed; primary submit flow redirects instead.
    // ============================================================================
    function generateResults(data) {
      const cgA = data.caregiver_label_a || 'Caregiver A';
      const cgB = data.caregiver_label_b || 'Caregiver B';

      const rawNegTraits   = data.top3_painful_traits_overall      || 'sometimes difficult to be with';
      const rawAffTraits   = data.top3_affirming_traits_overall     || 'warm, consistent, and supportive';
      const rawLonging     = data.unmet_longing_overall             || 'to feel truly seen and valued';
      const rawPosFeel     = data.favorite_positive_feeling_overall || 'safe and loved';
      const rawOftenFelt   = data.overall_negative_feeling          || 'overwhelmed and alone';
      const rawDiffExp     = data.overall_difficult_experience      || 'feeling unseen and unheard';
      const rawOverallFear = data.overall_fear                      || 'not being enough';
      const rawWorstFear   = data.overall_worst_fear                || rawOverallFear;

      const negTraitsDisplay = formatTraitList(rawNegTraits).toLowerCase();
      const affTraitsDisplay = formatTraitList(rawAffTraits).toLowerCase();
      const longingFixed     = fixLongingGrammar(rawLonging).toLowerCase();
      const oftenFelt        = rawOftenFelt.toLowerCase();
      const diffExp          = rawDiffExp.toLowerCase();
      const overallFear      = rawOverallFear.toLowerCase();
      const worstFear        = rawWorstFear.toLowerCase();
      const posFeel          = rawPosFeel.toLowerCase();
      const secondaryFeel    = deriveSecondaryFeelingDisplay(data).toLowerCase();

      const hashSeed = [rawNegTraits, rawLonging, rawWorstFear, rawPosFeel].join('|');
      const hash = stableHash(hashSeed);

      // ── I. CANONICAL SYNTHESIS ──
      const canonicalHTML =
        `My longing was to get my caregivers who were sometimes <em>${negTraitsDisplay}</em>, ` +
        `and with whom I often felt <em>${oftenFelt}</em>, ` +
        `because they frustrated me by <em>${diffExp}</em>, ` +
        `which made me feel <em>${secondaryFeel}</em>, ` +
        `and made me fear experiencing <em>${worstFear}</em>. ` +
        `I wanted instead caregivers who were always <em>${affTraitsDisplay}</em>, ` +
        `rather than <em>${negTraitsDisplay}</em>, ` +
        `so that I could experience <em>${longingFixed}</em>, ` +
        `and always feel <em>${posFeel}</em>.`;

      document.getElementById('canonical-synthesis').innerHTML = capPhrase(canonicalHTML);

      // ── II. PARTNER VERSION ──
      const contextOpeners = [
        'Something I want you to understand about how I grew up is this:',
        'I want to share something with you about my early life, because I think it matters for us:',
        'There\'s something about my childhood that I\'ve been learning to put into words:',
        'What I\'m about to share took me a long time to see clearly, and I\'m grateful to be able to say it now:',
      ];
      const impactBridges = [
        'What I didn\'t fully realize until later was how much that shaped me.',
        'I carried those feelings for a long time without knowing how to name them.',
        'For a long time, I thought that was just how things were — how I was.',
        'I didn\'t always have language for it, but the weight of it stayed with me.',
      ];
      const longingIntros = [
        'What I was really aching for, underneath all of it, was',
        'At the center of all of it was a longing —',
        'What I needed most, and what I kept reaching for, was',
        'Beneath the surface of all those feelings, there was a deep wish:',
      ];
      const affirmingBridges = [
        'I wanted to be with someone who was',
        'I was longing for caregivers who could be',
        'What I was searching for was someone who was',
        'I needed the presence of someone who was',
      ];
      const presentBridges = [
        'I notice now that those old patterns can still show up — sometimes in how I respond to you, or in what I need but don\'t always know how to ask for.',
        'That longing didn\'t disappear when I grew up. It came with me. And sometimes, without meaning to, I look for it in you — or brace for the fear that I won\'t find it.',
        'I\'m still learning what it means to trust that closeness is safe. Some of what I do in our relationship — pulling back, or holding on too tight — comes from that place.',
        'I share this not to explain away my reactions, but because I think understanding where I come from helps us understand each other better.',
      ];
      const closingLines = [
        `What helps me most is knowing you\'re still here — that I don\'t have to earn your presence or brace for it to disappear. When I feel <em>${posFeel}</em> with you, something in me begins to trust that it\'s real.`,
        `What I\'m learning to ask for is simple, even if it hasn\'t always felt available to me: just to feel <em>${posFeel}</em> — steadily, reliably, without conditions. That\'s what heals the old wound.`,
        `I\'m grateful you\'re willing to hear this. When you offer me <em>${posFeel}</em>, you\'re giving me something I\'ve needed for a very long time. I don\'t take that lightly.`,
        `More than anything, I\'m learning that what I longed for as a child — <em>${posFeel}</em> — is something I can ask for now. And I\'m learning to believe I deserve it.`,
      ];

      const opener     = contextOpeners[hash % contextOpeners.length];
      const bridge     = impactBridges[(hash + 1) % impactBridges.length];
      const longingInt = longingIntros[(hash + 2) % longingIntros.length];
      const affBridge  = affirmingBridges[(hash + 3) % affirmingBridges.length];
      const presentB   = presentBridges[(hash + 4) % presentBridges.length];
      const closing    = closingLines[(hash + 5) % closingLines.length];

      const cgA_raw = data.caregiver_label_a || '';
      const cgB_raw = data.caregiver_label_b || '';
      let cgPhrase;
      if (cgA_raw && cgB_raw && cgA_raw !== 'Caregiver A' && cgB_raw !== 'Caregiver B') {
        cgPhrase = `<em>${cgA_raw}</em> and <em>${cgB_raw}</em>`;
      } else if (cgA_raw && cgA_raw !== 'Caregiver A') {
        cgPhrase = `<em>${cgA_raw}</em> and the other people who raised me`;
      } else if (cgB_raw && cgB_raw !== 'Caregiver B') {
        cgPhrase = `<em>${cgB_raw}</em> and the other people who raised me`;
      } else {
        cgPhrase = 'the people who raised me';
      }

      const paraA =
        `${opener} ${cgPhrase} were, at times, <em>${negTraitsDisplay}</em>. ` +
        `That wasn\'t every moment — and I know they had their own struggles. ` +
        `But those were the qualities that left a mark.`;
      const paraB =
        `${bridge} I often found myself feeling <em>${oftenFelt}</em>. ` +
        `A lot of that came from <em>${diffExp}</em> — ` +
        `the kind of thing that, when it happens again and again, leaves you feeling <em>${secondaryFeel}</em>. ` +
        `It wasn\'t something I could always name. It was just the water I swam in.`;
      const paraC =
        `And underneath all of it was a fear I carried quietly: <em>${worstFear}</em>. ` +
        `It shaped how I learned to move through the world — ` +
        `what I reached for, what I avoided, how much of myself I let people see.`;
      const paraD =
        `${longingInt} <em>${longingFixed}</em>. ` +
        `${affBridge} <em>${affTraitsDisplay}</em> — ` +
        `someone whose presence could help me feel <em>${posFeel}</em> in a way that was steady and real, ` +
        `not something I had to work for or worry about losing.`;
      const paraE = presentB;
      const paraF = closing;

      document.getElementById('partner-version').innerHTML = capPhrase([paraA, paraB, paraC, paraD, paraE, paraF].join('\n\n'));

      // ── III. INSIGHT BULLETS ──
      const insights = [
        `Early experiences with caregivers who were sometimes <em>${negTraitsDisplay}</em> may have shaped how you learned to manage closeness, vulnerability, and trust — not just then, but in every relationship that followed.`,
        `The repeated feeling of <em>${oftenFelt}</em> in childhood can become a familiar emotional baseline. You may notice this feeling surfacing in adult relationships even when the circumstances are genuinely different.`,
        `The fear of <em>${worstFear}</em> is a common wound that arises when early caregiving felt inconsistent or unsafe. This fear can quietly influence how you respond to conflict, intimacy, or perceived rejection — often below conscious awareness.`,
        `Your deepest unmet longing — <em>${longingFixed}</em> — points toward a core relational need. When this need goes unmet in childhood, we often spend adult life unconsciously seeking it, sometimes in ways that recreate the original wound rather than heal it.`,
        `The positive qualities you most valued — <em>${affTraitsDisplay}</em> — may represent what you are most drawn to, and most hungry for, in close relationships today. These longings are not weaknesses; they are a map of your deepest relational needs.`,
        `The feeling you most wished had been consistent — <em>${posFeel}</em> — is still available to you. Part of the IMAGO process is learning to ask for what you need, and to receive it when it is genuinely offered.`,
        `Patterns formed in childhood are not permanent. Awareness of them — as you are practicing now — is often the first meaningful step toward changing how they show up in your present relationships.`
      ];

      const ul = document.getElementById('insight-bullets');
      ul.innerHTML = '';
      insights.forEach(text => {
        const li = document.createElement('li');
        li.className = 'insight-bullet';
        li.innerHTML = `<span class="insight-dot"></span><p>${capPhrase(text)}</p>`;
        ul.appendChild(li);
      });

      document.getElementById('assessment-view').classList.add('hidden');
      document.getElementById('results-view').classList.remove('hidden');
      document.getElementById('progress-header').classList.add('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===== RETURN TO ASSESSMENT =====
    function returnToAssessment() {
      document.getElementById('results-view').classList.add('hidden');
      document.getElementById('assessment-view').classList.remove('hidden');
      document.getElementById('progress-header').classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ============================================================================
    // FORM SUBMISSION
    // Order of operations:
    //   1) Save current state to localStorage (ensures last keystroke is captured)
    //   2) Run Section 10 required validation (non-empty check only)
    //   3) Collect all field values + consent
    //   4) Build PMG payload with mapped field names
    //   5) POST to webhook (non-blocking — continue on failure)
    //   6) Redirect to PMG URL with URL-encoded parameters
    //
    // NOTE: localStorage is NOT cleared on submit.
    //       Data persists so the user can return to Page 1 with answers intact.
    // ============================================================================
    document.getElementById('imago-form').addEventListener('submit', async function(e) {
      e.preventDefault();

      // ── STEP 1: Save current state before any further processing ──
      // Guarantees the most recent keystroke is captured even if the user
      // typed just before clicking submit.
      saveToLocalStorage();

      // ── STEP 2: Section 10 required validation ──
      // Each of the 8 Section 10 fields must be non-empty after trim.
      // Clear all errors first, then re-validate.
      SECTION_10_REQUIRED.forEach(id => clearFieldError(id));

      let firstFailId = null;
      SECTION_10_REQUIRED.forEach(id => {
        const el = document.getElementById(id);
        if (!el || el.value.trim().length === 0) {
          showFieldError(id);
          if (!firstFailId) firstFailId = id;
        }
      });

      if (firstFailId) {
        // Scroll to first failing field
        const failEl = document.getElementById(firstFailId);
        if (failEl) {
          failEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => failEl.focus(), 400);
        }
        return; // Halt submission
      }

      // ── STEP 3: Collect all field values ──
      const data = {};
      ALL_FIELDS.forEach(id => {
        data[id] = fieldVal(id);
      });

      // Consent value: "yes" if checked, "no" if not
      const consentChecked = document.getElementById('consent_checkbox').checked;
      data.consent_research_use = consentChecked ? 'yes' : 'no';

      // ── STEP 4: Build PMG-mapped payload ──
      // Maps HTML element IDs to PMG custom field names per spec section C.
      const pmgPayload = {
        // Identity fields
        first_name:                          data.first_name             || '',
        email:                               data.email                  || '',
        caregiver_label_a:                   data.caregiver_label_a      || '',
        caregiver_label_b:                   data.caregiver_label_b      || '',
        consent_research_use:                data.consent_research_use,
        // Section 10 → PMG custom field names
        overall_negating_traits:             data.top3_painful_traits_overall,
        overall_difficult_childhood_feelings: data.overall_negative_feeling,
        overall_difficult_experience:        data.overall_difficult_experience,
        overall_negative_feelings:           data.overall_negative_feeling,
        overall_worst_fear:                  data.overall_worst_fear,
        overall_affirming_traits:            data.top3_affirming_traits_overall,
        overall_unmet_longing:               data.unmet_longing_overall,
        overall_favorite_positive_feeling:   data.favorite_positive_feeling_overall,
      };

      // ── STEP 5: POST to webhook (non-blocking) ──
      const WEBHOOK_URL = 'https://paymegpt.com/api/webhooks/flow/fwvu2z88/b48372687891c273adcf0b6715eb0684c4c5d2b6e135b64b461482a4799a2590';

      try {
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pmgPayload),
          // Use keepalive so the request survives the page unload
          keepalive: true,
        });
      } catch (webhookErr) {
        // Non-blocking: log warning and continue to redirect
        console.warn('Webhook POST failed (continuing to redirect):', webhookErr);
      }

      // ── STEP 6: Build redirect URL and navigate ──
      // localStorage is intentionally NOT cleared here.
      // The user's answers remain saved so they can return to Page 1
      // and find their work intact.
      const REDIRECT_TEMPLATE = 'https://paymegpt.com/p/3p9aK2/synthesis-build?agent=45165377&first_name={{first_name}}&email={{email}}&caregiver_label_a={{caregiver_label_a}}&caregiver_label_b={{caregiver_label_b}}&consent_research_use={{consent_research_use}}&overall_affirming_traits={{overall_affirming_traits}}&overall_difficult_childhood_feelings={{overall_difficult_childhood_feelings}}&overall_difficult_experience={{overall_difficult_experience}}&overall_favorite_positive_feeling={{overall_favorite_positive_feeling}}&overall_negating_traits={{overall_negating_traits}}&overall_negative_feelings={{overall_negative_feelings}}&overall_unmet_longing={{overall_unmet_longing}}&overall_worst_fear={{overall_worst_fear}}';

      const redirectUrl = REDIRECT_TEMPLATE
        .replace('{{first_name}}',                        encodeURIComponent(pmgPayload.first_name))
        .replace('{{email}}',                             encodeURIComponent(pmgPayload.email))
        .replace('{{caregiver_label_a}}',                 encodeURIComponent(pmgPayload.caregiver_label_a))
        .replace('{{caregiver_label_b}}',                 encodeURIComponent(pmgPayload.caregiver_label_b))
        .replace('{{consent_research_use}}',              encodeURIComponent(pmgPayload.consent_research_use))
        .replace('{{overall_affirming_traits}}',          encodeURIComponent(pmgPayload.overall_affirming_traits))
        .replace('{{overall_difficult_childhood_feelings}}', encodeURIComponent(pmgPayload.overall_difficult_childhood_feelings))
        .replace('{{overall_difficult_experience}}',      encodeURIComponent(pmgPayload.overall_difficult_experience))
        .replace('{{overall_favorite_positive_feeling}}', encodeURIComponent(pmgPayload.overall_favorite_positive_feeling))
        .replace('{{overall_negating_traits}}',           encodeURIComponent(pmgPayload.overall_negating_traits))
        .replace('{{overall_negative_feelings}}',         encodeURIComponent(pmgPayload.overall_negative_feelings))
        .replace('{{overall_unmet_longing}}',             encodeURIComponent(pmgPayload.overall_unmet_longing))
        .replace('{{overall_worst_fear}}',                encodeURIComponent(pmgPayload.overall_worst_fear));

      window.location.href = redirectUrl;
    });

    // ============================================================================
    // INITIAL SETUP
    // Run on page load: restore saved data, then update all UI.
    // restoreFromLocalStorage() calls updateCaregiverLabels, updateProgress,
    // updateRefPanels, and updateActiveSectionIndicator internally.
    // ============================================================================
    restoreFromLocalStorage();

    // Ensure consent checkbox starts checked if no saved state exists
    const cbEl = document.getElementById('consent_checkbox');
    if (cbEl && !localStorage.getItem(STORAGE_KEY)) {
      cbEl.checked = true;
    }

    // Final UI sync in case restore didn't trigger all updates
    updateProgress();
    updateRefPanels();
    updateActiveSectionIndicator();
    updateCaregiverLabels();