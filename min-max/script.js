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
      xhr.open('GET','https://paymegpt.com/api/landing/context/'+encodeURIComponent(contactId)+'?page_id=1794');
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

// ===== CONSTANTS: ASSESSMENT QUESTIONS =====
  // 10 Likert questions in exact order specified.
  // Odd-indexed (1-based: Q1,Q3,Q5,Q7,Q9) → Minimizer score
  // Even-indexed (1-based: Q2,Q4,Q6,Q8,Q10) → Maximizer score
  const QUESTIONS = [
    "When something is upsetting, I usually pull inward and process it alone.",           // Q1  → Minimizer
    "When something feels off, I feel a strong need to talk or reconnect immediately.",   // Q2  → Maximizer
    "I often act like I don't need much, even though I actually do.",                     // Q3  → Minimizer
    "I tend to express emotions intensely so others can see how much it matters.",        // Q4  → Maximizer
    "I prefer control, structure, and independence, and struggle to let people in emotionally.", // Q5 → Minimizer
    "I often feel driven to fix things, reconnect, or make it emotionally \"okay\" again.", // Q6 → Maximizer
    "I constrict or downplay my emotional expression when I'm overwhelmed.",              // Q7  → Minimizer
    "When I feel ignored or rejected, I may react impulsively or intensely.",             // Q8  → Maximizer
    "Sometimes I come across as distant or emotionally unavailable, even when I care deeply.", // Q9 → Minimizer
    "I lose track of my own feelings and become centered on others' emotions and responses."  // Q10 → Maximizer
  ];

  // ===== LIKERT SCALE LABELS =====
  const SCALE_LABELS = [
    "Not at all like me",
    "A little like me",
    "Somewhat like me",
    "Mostly like me",
    "Very much like me"
  ];

  // ===== PAGE 2 REDIRECT DESTINATION =====
  // After POST completes, user is redirected here with query parameters.
  const RESULTS_PAGE_URL = 'https://paymegpt.com/p/YZ8A4j/imago-minimizer-maximizer-assessment-copy-1772125126996';

  // ===== PMG AGENT ID =====
  // Required for contact attribution in the PMG platform.
  const PMG_AGENT_ID = '7068010';

  // ===== APPLICATION STATE =====
  const state = {
    currentQuestion: 0,
    answers: Array(10).fill(null),
    theme: 'light',
    phase: 'intro',
    isSubmitting: false
  };

  // ===== ELEMENT REFERENCES =====
  const introSection       = document.getElementById('introSection');
  const assessmentSection  = document.getElementById('assessmentSection');
  const startBtn           = document.getElementById('startBtn');
  const backBtn            = document.getElementById('backBtn');
  const nextBtn            = document.getElementById('nextBtn');
  const submitBtn          = document.getElementById('submitBtn');
  const resetBtnAssessment = document.getElementById('resetBtnAssessment');
  const themeToggle        = document.getElementById('themeToggle');
  const themeLabel         = document.getElementById('themeLabel');
  const questionNumber     = document.getElementById('questionNumber');
  const questionHeading    = document.getElementById('questionHeading');
  const likertGroup        = document.getElementById('likertGroup');
  const validationMsg      = document.getElementById('validationMsg');
  const submittingMsg      = document.getElementById('submittingMsg');
  const progressText       = document.getElementById('progressText');
  const progressPct        = document.getElementById('progressPct');
  const progressFill       = document.getElementById('progressFill');
  const progressBar        = document.getElementById('progressBar');

  // ===== THEME MANAGEMENT =====
  // Function: initTheme()
  // Purpose: Load saved theme from localStorage or use system preference
  function initTheme() {
    const saved = localStorage.getItem('imago_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  }

  // Function: setTheme(theme)
  // Purpose: Apply theme to document root and update toggle label
  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    themeLabel.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    localStorage.setItem('imago_theme', theme);
  }

  themeToggle.addEventListener('click', () => {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  // ===== PHASE TRANSITIONS =====
  // Function: showPhase(phase)
  // Purpose: Show/hide major sections based on current phase
  function showPhase(phase) {
    state.phase = phase;
    introSection.classList.toggle('hidden', phase !== 'intro');
    assessmentSection.classList.toggle('hidden', phase !== 'assessment');
    document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ===== ASSESSMENT RENDERING =====
  // Function: renderQuestion(index)
  // Purpose: Render the question card for the given question index
  function renderQuestion(index) {
    const qNum  = index + 1;
    const total = QUESTIONS.length;
    const pct   = Math.round((index / total) * 100);

    progressText.textContent = `Question ${qNum} of ${total}`;
    progressPct.textContent  = `${pct}%`;
    progressFill.style.width = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', qNum);

    questionNumber.textContent  = `Question ${qNum} of ${total}`;
    questionHeading.textContent = QUESTIONS[index];

    validationMsg.classList.remove('visible');

    backBtn.classList.toggle('hidden', index === 0);

    const isLast = index === total - 1;
    nextBtn.classList.toggle('hidden', isLast);
    submitBtn.classList.toggle('hidden', !isLast);

    renderLikert(index);

    const card = document.getElementById('questionCard');
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';

    questionHeading.setAttribute('tabindex', '-1');
    questionHeading.focus();
  }

  // Function: renderLikert(index)
  // Purpose: Build radio button options for the current question
  function renderLikert(index) {
    likertGroup.innerHTML = '';
    const currentAnswer = state.answers[index];

    for (let val = 1; val <= 5; val++) {
      const label = document.createElement('label');
      label.className = 'likert-option' + (currentAnswer === val ? ' selected' : '');
      label.setAttribute('for', `q${index}_r${val}`);

      const input = document.createElement('input');
      input.type    = 'radio';
      input.name    = `question_${index}`;
      input.id      = `q${index}_r${val}`;
      input.value   = val;
      input.checked = currentAnswer === val;
      input.setAttribute('aria-label', `${val} — ${SCALE_LABELS[val - 1]}`);

      input.addEventListener('change', () => {
        state.answers[index] = val;
        persistAnswers();
        document.querySelectorAll('.likert-option').forEach(opt => opt.classList.remove('selected'));
        label.classList.add('selected');
        validationMsg.classList.remove('visible');
      });

      const radioVisual = document.createElement('span');
      radioVisual.className = 'radio-visual';
      radioVisual.setAttribute('aria-hidden', 'true');

      const labelText = document.createElement('span');
      labelText.className   = 'likert-label-text';
      labelText.textContent = SCALE_LABELS[val - 1];

      const valueText = document.createElement('span');
      valueText.className = 'likert-value';
      valueText.setAttribute('aria-hidden', 'true');
      valueText.textContent = val;

      label.appendChild(input);
      label.appendChild(radioVisual);
      label.appendChild(labelText);
      label.appendChild(valueText);
      likertGroup.appendChild(label);
    }
  }

  // ===== NAVIGATION HANDLERS =====

  startBtn.addEventListener('click', () => {
    showPhase('assessment');
    renderQuestion(state.currentQuestion);
  });

  nextBtn.addEventListener('click', () => {
    if (state.answers[state.currentQuestion] === null) {
      validationMsg.classList.add('visible');
      return;
    }
    state.currentQuestion++;
    renderQuestion(state.currentQuestion);
  });

  backBtn.addEventListener('click', () => {
    if (state.currentQuestion > 0) {
      state.currentQuestion--;
      renderQuestion(state.currentQuestion);
    }
  });

  // ===== SUBMIT HANDLER =====
  // Triggered on the final question's Submit button.
  // Validates, scores, POSTs to PMG, then redirects to Page 2.
  submitBtn.addEventListener('click', () => {
    // ---- Validate final answer ----
    if (state.answers[state.currentQuestion] === null) {
      validationMsg.classList.add('visible');
      return;
    }

    // ---- Prevent double-submit ----
    if (state.isSubmitting) return;

    // ---- Full validation pass: all 10 answers must be integers 1–5 ----
    for (let i = 0; i < 10; i++) {
      const ans = state.answers[i];
      if (ans === null || !Number.isInteger(ans) || ans < 1 || ans > 5) {
        // Should not normally happen due to sequential navigation,
        // but guard defensively.
        validationMsg.classList.add('visible');
        return;
      }
    }

    handleSubmit();
  });

  // ===== RESET HANDLER =====
  // Function: resetAssessment()
  // Purpose: Clear all state and return to intro screen
  function resetAssessment() {
    state.currentQuestion = 0;
    state.answers         = Array(10).fill(null);
    state.isSubmitting    = false;
    localStorage.removeItem('imago_answers');
    localStorage.removeItem('imago_phase');
    submittingMsg.classList.remove('visible');
    submitBtn.disabled = false;
    nextBtn.disabled   = false;
    showPhase('intro');
  }

  resetBtnAssessment.addEventListener('click', resetAssessment);

  // ===== SCORING LOGIC =====
  // Function: computeScores()
  // Purpose: Compute all PMG custom field values from state.answers.
  //          Returns an object with mm_q1..mm_q10, mm_min_total,
  //          mm_max_total, mm_gap, mm_result.
  //          Scores are NEVER displayed to the user.
  //
  // Minimizer indices (0-based): 0, 2, 4, 6, 8  (Q1,Q3,Q5,Q7,Q9)
  // Maximizer indices (0-based): 1, 3, 5, 7, 9  (Q2,Q4,Q6,Q8,Q10)
  function computeScores() {
    const minimizerIndices = [0, 2, 4, 6, 8];
    const maximizerIndices = [1, 3, 5, 7, 9];

    const minTotal = minimizerIndices.reduce((sum, i) => sum + state.answers[i], 0);
    const maxTotal = maximizerIndices.reduce((sum, i) => sum + state.answers[i], 0);
    const gap      = Math.abs(minTotal - maxTotal);

    let result;
    if ((minTotal - maxTotal) >= 5 && minTotal >= 16) {
      result = 'minimizer';
    } else if ((maxTotal - minTotal) >= 5 && maxTotal >= 16) {
      result = 'maximizer';
    } else {
      result = 'balanced';
    }

    return {
      mm_q1:        state.answers[0],
      mm_q2:        state.answers[1],
      mm_q3:        state.answers[2],
      mm_q4:        state.answers[3],
      mm_q5:        state.answers[4],
      mm_q6:        state.answers[5],
      mm_q7:        state.answers[6],
      mm_q8:        state.answers[7],
      mm_q9:        state.answers[8],
      mm_q10:       state.answers[9],
      mm_min_total: minTotal,
      mm_max_total: maxTotal,
      mm_gap:       gap,
      mm_result:    result
    };
  }

  // ===== MAIN SUBMIT HANDLER =====
  // Function: handleSubmit()
  // Purpose:
  //   1) Compute scores
  //   2) Show submitting state (disable buttons, show message)
  //   3) POST FormData to PMG via fetch (current page URL)
  //   4) Build redirect URL with all params + agent
  //   5) Redirect to Page 2 after POST resolves
  //      (redirect happens regardless of POST success/failure
  //       to ensure user always reaches Page 2)
  async function handleSubmit() {
    state.isSubmitting = true;

    // ---- Compute all field values ----
    const scores = computeScores();

    // ---- Update UI: disable nav, show submitting message ----
    submitBtn.disabled = true;
    backBtn.disabled   = true;
    nextBtn.disabled   = true;
    submittingMsg.classList.add('visible');
    validationMsg.classList.remove('visible');

    // ---- Persist result type to localStorage ----
    try {
      localStorage.setItem('imago_result', scores.mm_result);
    } catch (e) { /* silently continue */ }

    // ---- Build FormData for POST ----
    // Field names must match PMG custom field snake_case keys exactly.
    const formData = new FormData();
    formData.append('mm_q1',        String(scores.mm_q1));
    formData.append('mm_q2',        String(scores.mm_q2));
    formData.append('mm_q3',        String(scores.mm_q3));
    formData.append('mm_q4',        String(scores.mm_q4));
    formData.append('mm_q5',        String(scores.mm_q5));
    formData.append('mm_q6',        String(scores.mm_q6));
    formData.append('mm_q7',        String(scores.mm_q7));
    formData.append('mm_q8',        String(scores.mm_q8));
    formData.append('mm_q9',        String(scores.mm_q9));
    formData.append('mm_q10',       String(scores.mm_q10));
    formData.append('mm_min_total', String(scores.mm_min_total));
    formData.append('mm_max_total', String(scores.mm_max_total));
    formData.append('mm_gap',       String(scores.mm_gap));
    formData.append('mm_result',    scores.mm_result);
    formData.append('agent',        PMG_AGENT_ID);

    // ---- Attempt POST to PMG (current page endpoint) ----
    // Redirect to Page 2 happens in both .then() and .catch()
    // so the user is never stranded if the POST fails.
    try {
      await fetch(window.location.href, {
        method: 'POST',
        body: formData
      });
    } catch (postError) {
      // POST failed (network error, CORS, etc.) — proceed to redirect anyway
      // so user always reaches Page 2 with their data in the URL.
      console.warn('PMG POST failed:', postError);
    }

    // ---- Build Page 2 redirect URL with all values as query params ----
    // Uses URL + URLSearchParams for safe encoding of all values.
    const redirectUrl = new URL(RESULTS_PAGE_URL);
    redirectUrl.searchParams.set('mm_q1',        String(scores.mm_q1));
    redirectUrl.searchParams.set('mm_q2',        String(scores.mm_q2));
    redirectUrl.searchParams.set('mm_q3',        String(scores.mm_q3));
    redirectUrl.searchParams.set('mm_q4',        String(scores.mm_q4));
    redirectUrl.searchParams.set('mm_q5',        String(scores.mm_q5));
    redirectUrl.searchParams.set('mm_q6',        String(scores.mm_q6));
    redirectUrl.searchParams.set('mm_q7',        String(scores.mm_q7));
    redirectUrl.searchParams.set('mm_q8',        String(scores.mm_q8));
    redirectUrl.searchParams.set('mm_q9',        String(scores.mm_q9));
    redirectUrl.searchParams.set('mm_q10',       String(scores.mm_q10));
    redirectUrl.searchParams.set('mm_min_total', String(scores.mm_min_total));
    redirectUrl.searchParams.set('mm_max_total', String(scores.mm_max_total));
    redirectUrl.searchParams.set('mm_gap',       String(scores.mm_gap));
    redirectUrl.searchParams.set('mm_result',    scores.mm_result);
    redirectUrl.searchParams.set('agent',        PMG_AGENT_ID);

    // ---- Clear localStorage before leaving ----
    try {
      localStorage.removeItem('imago_answers');
      localStorage.removeItem('imago_phase');
    } catch (e) { /* silently continue */ }

    // ---- Redirect to Page 2 ----
    window.location.assign(redirectUrl.toString());
  }

  // ===== PERSISTENCE =====
  // Function: persistAnswers()
  // Purpose: Save current answers and phase to localStorage
  //          so in-progress assessments survive page refresh.
  function persistAnswers() {
    try {
      localStorage.setItem('imago_answers', JSON.stringify(state.answers));
      localStorage.setItem('imago_phase', state.phase);
    } catch (e) {
      // localStorage may be unavailable; silently continue
    }
  }

  // Function: restoreState()
  // Purpose: Attempt to restore in-progress assessment from localStorage
  function restoreState() {
    try {
      const savedAnswers = localStorage.getItem('imago_answers');
      const savedPhase   = localStorage.getItem('imago_phase');
      if (savedAnswers && savedPhase === 'assessment') {
        const parsed = JSON.parse(savedAnswers);
        if (Array.isArray(parsed) && parsed.length === 10) {
          state.answers = parsed;
          const firstNull = parsed.findIndex(a => a === null);
          state.currentQuestion = firstNull === -1 ? 9 : firstNull;
          showPhase('assessment');
          renderQuestion(state.currentQuestion);
          return;
        }
      }
    } catch (e) {
      // Ignore restore errors
    }
  }

  // ===== KEYBOARD NAVIGATION =====
  // Allow Enter/Space on Likert labels for accessibility
  document.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('likert-option')) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const input = e.target.querySelector('input[type="radio"]');
        if (input) {
          input.click();
          input.focus();
        }
      }
    }
  });

  // ===== INITIALIZATION =====
  // Function: init()
  // Purpose: Initialize theme, restore state if available, show appropriate phase
  function init() {
    initTheme();
    restoreState();
  }

  init();