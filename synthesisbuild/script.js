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
      xhr.open('GET','https://paymegpt.com/api/landing/context/'+encodeURIComponent(contactId)+'?page_id=1807');
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
    // Function: themeToggle click handler
    // Purpose: Toggle dark/light mode and persist preference to localStorage
    document.getElementById('themeToggle').addEventListener('click', () => {
      const root = document.documentElement;
      const isDark = root.classList.toggle('dark');
      localStorage.setItem('imago-theme', isDark ? 'dark' : 'light');
    });

    // ===== HELPER: GET HIDDEN FIELD VALUE =====
    // Function: fieldVal(id)
    // Purpose: Read the value of a hidden input by ID (replaces form textarea reads)
    // Returns: trimmed string or empty string
    function fieldVal(id) {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }

    // ===== CAPITALIZE HELPER =====
    // Function: capPhrase(str)
    // Purpose: Uppercase the first character of a string
    function capPhrase(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ===== TRAIT LIST FORMATTER =====
    // Function: formatTraitList(raw)
    // Purpose: Converts comma/newline-separated trait lists into middot-separated display string
    // Example: "critical, distant\ncontrolling" → "critical · distant · controlling"
    // Only applied at output time — never modifies stored values
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
    // Function: fixLongingGrammar(raw)
    // Purpose: Converts "to be …" → "being …", "to have …" → "having …", etc.
    // so that "so that I could experience {LONGING}" is always grammatically correct.
    // Applied at output time only — input values are never mutated.
    function fixLongingGrammar(raw) {
      if (!raw) return raw;
      if (/^to be\b/i.test(raw))         return 'being'        + raw.slice('to be'.length);
      if (/^to have\b/i.test(raw))        return 'having'       + raw.slice('to have'.length);
      if (/^to feel\b/i.test(raw))        return 'feeling'      + raw.slice('to feel'.length);
      if (/^to know\b/i.test(raw))        return 'knowing'      + raw.slice('to know'.length);
      if (/^to receive\b/i.test(raw))     return 'receiving'    + raw.slice('to receive'.length);
      if (/^to get\b/i.test(raw))         return 'getting'      + raw.slice('to get'.length);
      if (/^to see\b/i.test(raw))         return 'seeing'       + raw.slice('to see'.length);
      if (/^to hear\b/i.test(raw))        return 'hearing'      + raw.slice('to hear'.length);
      if (/^to experience\b/i.test(raw))  return 'experiencing' + raw.slice('to experience'.length);
      // Generic fallback: strip leading "to " and attempt gerund
      if (/^to \w/i.test(raw)) {
        const withoutTo = raw.slice(3);
        const spaceIdx  = withoutTo.search(/[\s,]/);
        const verb      = spaceIdx === -1 ? withoutTo : withoutTo.slice(0, spaceIdx);
        const rest      = spaceIdx === -1 ? '' : withoutTo.slice(spaceIdx);
        return makeGerund(verb) + rest;
      }
      return raw;
    }

    // ===== SIMPLE GERUND HELPER =====
    // Function: makeGerund(verb)
    // Purpose: Converts a bare verb to its -ing form using basic English rules.
    // Used as fallback in fixLongingGrammar for unrecognized "to X" patterns.
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
    // Function: stableHash(str)
    // Purpose: Produces a deterministic integer from a string.
    // Used to select phrase variants without randomness — same inputs always yield same output.
    function stableHash(str) {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
      }
      return Math.abs(h);
    }

    // ===== GENERATE RESULTS =====
    // Function: generateResults(data)
    // Purpose: Builds all three result cards from hidden-input field data.
    // Data source: hidden inputs populated with PMG template variables.
    // Edit E: rawOverallFear now reads from data.overall_worst_fear directly
    //         (overall_fear hidden input also maps to {{overall_worst_fear}}, so both
    //          routes converge — simplest option chosen per edit E option 1).
    // Edit 4/5/6/7: deriveSecondaryFeelingDisplay removed; rawOftenFelt now prefers
    //         overall_difficult_childhood_feelings; secondaryFeel clause removed from
    //         canonical synthesis and paraB.
    function generateResults(data) {
      const cgA = data.caregiver_label_a || 'Caregiver A';
      const cgB = data.caregiver_label_b || 'Caregiver B';

      // ── RAW VALUES ──
      const rawNegTraits   = data.top3_painful_traits_overall       || 'sometimes difficult to be with';
      const rawAffTraits   = data.top3_affirming_traits_overall      || 'warm, consistent, and supportive';
      const rawLonging     = data.unmet_longing_overall              || 'to feel truly seen and valued';
      const rawPosFeel     = data.favorite_positive_feeling_overall  || 'safe and loved';
      // Edit 5: rawOftenFelt now prefers overall_difficult_childhood_feelings
      const rawOftenFelt   = data.overall_difficult_childhood_feelings
                             || data.overall_negative_feeling
                             || 'overwhelmed and alone';
      const rawDiffExp     = data.overall_difficult_experience       || 'feeling unseen and unheard';
      // Edit E (option 1): rawOverallFear and rawWorstFear both read from overall_worst_fear
      // This removes dependence on the overall_fear field for the fallback chain.
      const rawWorstFear   = data.overall_worst_fear                 || 'not being enough';
      const rawOverallFear = rawWorstFear;

      // ── FORMATTED / FIXED VALUES ──
      const negTraitsDisplay = formatTraitList(rawNegTraits).toLowerCase();
      const affTraitsDisplay = formatTraitList(rawAffTraits).toLowerCase();
      const longingFixed     = fixLongingGrammar(rawLonging).toLowerCase();
      const oftenFelt        = rawOftenFelt.toLowerCase();
      const diffExp          = rawDiffExp.toLowerCase();
      const overallFear      = rawOverallFear.toLowerCase();
      const worstFear        = rawWorstFear.toLowerCase();
      const posFeel          = rawPosFeel.toLowerCase();

      // ── STABLE HASH for phrase variation (deterministic, not random) ──
      const hashSeed = [rawNegTraits, rawLonging, rawWorstFear, rawPosFeel].join('|');
      const hash     = stableHash(hashSeed);

      // ============================================================
      // I. CANONICAL IMAGO INFORMATION SYNTHESIS
      // Exact workbook sentence order — secondaryFeel clause removed per edit 6
      // ============================================================
      const canonicalHTML =
        `My longing was to get my caregivers who were sometimes <em>${negTraitsDisplay}</em>, ` +
        `and with whom I often felt <em>${oftenFelt}</em>, ` +
        `because they frustrated me by <em>${diffExp}</em>, ` +
        `and made me fear experiencing <em>${worstFear}</em>. ` +
        `I wanted instead caregivers who were always <em>${affTraitsDisplay}</em>, ` +
        `rather than <em>${negTraitsDisplay}</em>, ` +
        `so that I could experience <em>${longingFixed}</em>, ` +
        `and always feel <em>${posFeel}</em>.`;

      document.getElementById('canonical-synthesis').innerHTML = capPhrase(canonicalHTML);

      // ============================================================
      // II. VERSION TO READ TO YOUR PARTNER
      // Deeply human, warm, speakable. 4–6 paragraphs.
      // Uses stable hash to select connective phrase variants deterministically.
      // secondaryFeel reference removed from paraB per edit 7.
      // ============================================================

      // Phrase bank: connective openers and transitions
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

      // Select variants deterministically via hash
      const opener     = contextOpeners[hash % contextOpeners.length];
      const bridge     = impactBridges[(hash + 1) % impactBridges.length];
      const longingInt = longingIntros[(hash + 2) % longingIntros.length];
      const affBridge  = affirmingBridges[(hash + 3) % affirmingBridges.length];
      const presentB   = presentBridges[(hash + 4) % presentBridges.length];
      const closing    = closingLines[(hash + 5) % closingLines.length];

      // Build caregiver reference phrase
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

      // Assemble partner version paragraphs
      const paraA =
        `${opener} ${cgPhrase} were, at times, <em>${negTraitsDisplay}</em>. ` +
        `That wasn\'t every moment — and I know they had their own struggles. ` +
        `But those were the qualities that left a mark.`;

      // Edit 7: secondaryFeel clause removed from paraB
      const paraB =
        `${bridge} I often found myself feeling <em>${oftenFelt}</em>. ` +
        `A lot of that came from <em>${diffExp}</em>. ` +
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

      const partnerHTML = [paraA, paraB, paraC, paraD, paraE, paraF].join('\n\n');
      document.getElementById('partner-version').innerHTML = capPhrase(partnerHTML);

      // ============================================================
      // III. PARTICIPANT INSIGHT SUMMARY — IMAGO LENS
      // Logic unchanged from original. Longing grammar fix applied where longing appears.
      // ============================================================
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
    }

    // ===== INITIAL RESULTS GENERATION ON PAGE LOAD =====
    // Reads all values from hidden inputs (populated by PMG template variables)
    // and immediately renders the three result cards.
    // Edit D: first_name and email added to ALL_FIELDS array.
    // Edit 3: negative_feeling_weight_a and negative_feeling_weight_b removed;
    //         overall_difficult_childhood_feelings added near Section 10 fields.
    (function initResults() {
      const ALL_FIELDS = [
        // Identity fields (added per edit D)
        'first_name', 'email',
        // Section 1: Caregivers
        'caregiver_label_a', 'caregiver_label_b',
        // Section 2: Affirming Traits
        'affirming_traits_a', 'affirming_traits_b',
        // Section 3: Negating Traits
        'negating_traits_a', 'negating_traits_b',
        // Section 4: Positive Experiences
        'positive_experiences_a', 'positive_experience_weight_a',
        'positive_experiences_b', 'positive_experience_weight_b',
        // Section 5: Positive Feelings
        'positive_feelings_a', 'positive_feeling_weight_a',
        'positive_feelings_b', 'positive_feeling_weight_b',
        // Section 6: Painful Experiences
        'painful_experiences_a', 'painful_experience_weight_a',
        'painful_experiences_b', 'painful_experience_weight_b',
        // Section 7: Negative Feelings
        // negative_feeling_weight_a and negative_feeling_weight_b removed per edit 3
        'negative_feelings_a',
        'negative_feelings_b',
        // Section 8: Fears
        'fears_a', 'fear_weight_a',
        'fears_b', 'fear_weight_b',
        // Section 9: Unmet Longings
        'unmet_longings_a', 'unmet_longing_weight_a',
        'unmet_longings_b', 'unmet_longing_weight_b',
        // Section 10: Overall Integration (IDs unchanged; tokens updated in HTML per edit C)
        'top3_painful_traits_overall', 'overall_difficult_experience',
        'overall_negative_feeling', 'overall_fear',
        'top3_affirming_traits_overall', 'unmet_longing_overall',
        'favorite_positive_feeling_overall', 'overall_worst_fear',
        // New field added per edit 3
        'overall_difficult_childhood_feelings'
      ];

      const data = {};
      ALL_FIELDS.forEach(id => {
        data[id] = fieldVal(id);
      });

      generateResults(data);
    })();