// ─── THEME INITIALIZER ───
    (function() {
      const stored = localStorage.getItem('imago-companion-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = stored || (prefersDark ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', theme);
    })();

    document.getElementById('themeToggle').addEventListener('click', function() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('imago-companion-theme', next);
    });

    // ─── CONSTANTS ───
    const DRAFT_KEY = 'imago-zero-negativity-draft';
    const SUBMISSION_KEY = 'imago-zero-negativity-submission';
    const TOOL_ID = 'zero-negativity';
    const TOOL_NAME = 'Zero Negativity';
    const TOOL_VERSION = '1.0.0';

    // ─── RESULTS ROUTE ───
    // INTEGRATION POINT: Update this path when the Zero Negativity results page is deployed.
    const RESULTS_ROUTE = 'https://paymegpt.com/p/VGMJMSK8';

    // ─── EXAMPLES TOGGLE ───
    const panels = {};

    function initExamples() {
      for (let i = 1; i <= 5; i++) {
        const toggle = document.getElementById('toggle-' + i);
        const panel = document.getElementById('panel-' + i);
        if (!toggle || !panel) continue;

        panels[i] = { toggle, panel, open: false };

        toggle.addEventListener('click', function() {
          togglePanel(i);
        });

        toggle.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            togglePanel(i);
          }
        });
      }
    }

    function togglePanel(idx) {
      const p = panels[idx];
      if (!p) return;
      p.open = !p.open;
      p.toggle.setAttribute('aria-expanded', p.open ? 'true' : 'false');

      if (p.open) {
        p.panel.classList.add('open');
        p.panel.style.maxHeight = p.panel.scrollHeight + 'px';
      } else {
        p.panel.style.maxHeight = '0';
        p.panel.classList.remove('open');
      }
    }

    // ─── PROGRESS ───
    function updateProgress() {
      let completed = 0;
      let firstIncomplete = null;

      for (let i = 1; i <= 5; i++) {
        const el = document.getElementById('answer' + i);
        const dot = document.getElementById('dot-' + i);
        const card = document.getElementById('card-' + i);
        const val = el ? el.value.trim() : '';
        const complete = val.length > 0;

        if (complete) {
          completed++;
          dot && dot.classList.add('complete');
          card && card.classList.remove('active');
        } else {
          dot && dot.classList.remove('complete');
          if (!firstIncomplete) {
            firstIncomplete = card;
          }
        }
      }

      if (firstIncomplete) {
        document.querySelectorAll('.section-card').forEach(c => c.classList.remove('active'));
        firstIncomplete.classList.add('active');
      } else {
        document.querySelectorAll('.section-card').forEach(c => c.classList.remove('active'));
      }

      const pct = Math.round((completed / 5) * 100);
      const fill = document.getElementById('progressFill');
      const meta = document.getElementById('progressMeta');
      const bar = document.getElementById('progressBar');

      if (fill) fill.style.width = pct + '%';
      if (meta) {
        const sectionNum = Math.min(completed + 1, 5);
        meta.textContent = 'Section ' + (completed < 5 ? (completed + 1) : '5') + ' of 5 · ' + pct + '%';
      }
      if (bar) bar.setAttribute('aria-valuenow', pct);
    }

    // ─── LOCAL STORAGE DRAFT ───
    function saveDraft() {
      try {
        const draft = {
          answer1: document.getElementById('answer1')?.value || '',
          answer2: document.getElementById('answer2')?.value || '',
          answer3: document.getElementById('answer3')?.value || '',
          answer4: document.getElementById('answer4')?.value || '',
          answer5: document.getElementById('answer5')?.value || '',
          deliveryEmail: document.getElementById('deliveryEmail')?.value || '',
          savedAt: new Date().toISOString()
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch(e) { /* storage unavailable */ }
    }

    function loadDraft() {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        const draft = JSON.parse(raw);
        if (draft.answer1) document.getElementById('answer1').value = draft.answer1;
        if (draft.answer2) document.getElementById('answer2').value = draft.answer2;
        if (draft.answer3) document.getElementById('answer3').value = draft.answer3;
        if (draft.answer4) document.getElementById('answer4').value = draft.answer4;
        if (draft.answer5) document.getElementById('answer5').value = draft.answer5;
        if (draft.deliveryEmail) document.getElementById('deliveryEmail').value = draft.deliveryEmail;
      } catch(e) { /* corrupt draft */ }
    }

    function clearDraft() {
      const confirmed = window.confirm('Clear all saved answers? This cannot be undone.');
      if (!confirmed) return;

      ['answer1','answer2','answer3','answer4','answer5'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

      const emailEl = document.getElementById('deliveryEmail');
      if (emailEl) emailEl.value = '';

      // Reset commit
      const chk = document.getElementById('commitCheckbox');
      const custom = document.getElementById('customCheckbox');
      if (chk) chk.checked = false;
      if (custom) {
        custom.classList.remove('checked');
        custom.setAttribute('aria-checked', 'false');
      }

      // Clear errors
      document.querySelectorAll('.field-error, .commit-error, .email-error, .submit-error, .validation-summary')
        .forEach(el => el.classList.remove('visible'));

      // Clear dots
      document.querySelectorAll('.completion-dot').forEach(d => d.classList.remove('complete'));

      try { localStorage.removeItem(DRAFT_KEY); } catch(e) {}

      updateProgress();
    }

    // ─── CHECKBOX ───
    function toggleCommit() {
      const chk = document.getElementById('commitCheckbox');
      const custom = document.getElementById('customCheckbox');
      if (!chk || !custom) return;
      chk.checked = !chk.checked;
      custom.classList.toggle('checked', chk.checked);
      custom.setAttribute('aria-checked', chk.checked ? 'true' : 'false');
      if (chk.checked) {
        document.getElementById('commit-error').classList.remove('visible');
      }
    }

    document.getElementById('customCheckbox').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCommit();
      }
    });

    // ─── VALIDATION ───
    function validateField(idx) {
      const el = document.getElementById('answer' + idx);
      const err = document.getElementById('error-' + idx);
      if (!el || !err) return true;
      const valid = el.value.trim().length > 0;
      err.classList.toggle('visible', !valid);
      return valid;
    }

    function validateEmail(val) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }

    function validateAll() {
      let valid = true;
      for (let i = 1; i <= 5; i++) {
        if (!validateField(i)) valid = false;
      }

      const chk = document.getElementById('commitCheckbox');
      const commitErr = document.getElementById('commit-error');
      if (!chk.checked) {
        commitErr.classList.add('visible');
        valid = false;
      } else {
        commitErr.classList.remove('visible');
      }

      const emailEl = document.getElementById('deliveryEmail');
      const emailErr = document.getElementById('email-error');
      if (!emailEl.value.trim() || !validateEmail(emailEl.value.trim())) {
        emailErr.classList.add('visible');
        valid = false;
      } else {
        emailErr.classList.remove('visible');
      }

      return valid;
    }

    // ─── SCROLL TO FIRST ERROR ───
    function scrollToFirstError() {
      const firstErr = document.querySelector('.field-error.visible, .commit-error.visible, .email-error.visible');
      if (firstErr) {
        const target = firstErr.closest('.section-card, .commitment-card, .email-card') || firstErr;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // ─── BUILD PAYLOAD ───
    function buildPayload() {
      const now = new Date().toISOString();
      const uniqueId = TOOL_ID + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

      return {
        toolId: TOOL_ID,
        toolName: TOOL_NAME,
        toolVersion: TOOL_VERSION,
        submissionId: uniqueId,
        completedAt: now,
        originalResponses: {
          disconnectingInteractions: document.getElementById('answer1').value.trim(),
          chosenSignal: document.getElementById('answer2').value.trim(),
          repairSupports: document.getElementById('answer3').value.trim(),
          intendedResponse: document.getElementById('answer4').value.trim(),
          appreciationPractice: document.getElementById('answer5').value.trim()
        },
        summary: {},
        commitment: {
          accepted: document.getElementById('commitCheckbox').checked,
          acceptedAt: now
        },
        delivery: {
          email: document.getElementById('deliveryEmail').value.trim(),
          requestedAt: now,
          status: 'pending',
          pdfStatus: 'pending'
        }
      };
    }

    // ─── SUBMISSION ───
    let isSubmitting = false;

    document.getElementById('reflectionForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      if (isSubmitting) return;

      const summaryEl = document.getElementById('validationSummary');
      summaryEl.classList.remove('visible');

      const valid = validateAll();
      if (!valid) {
        summaryEl.classList.add('visible');
        scrollToFirstError();
        return;
      }

      isSubmitting = true;
      const submitBtn = document.getElementById('submitBtn');
      const submitError = document.getElementById('submitError');
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      submitError.classList.remove('visible');
      document.getElementById('loadingOverlay').classList.add('active');

      const payload = buildPayload();

      // Store completed submission
      try {
        localStorage.setItem(SUBMISSION_KEY, JSON.stringify(payload));
      } catch(err) { /* storage full */ }

      try {
        // Simulate async generation (replace with real API call)
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Pass payload to results page via sessionStorage (no URL exposure)
        sessionStorage.setItem('imago_zn_result', JSON.stringify(payload));
        localStorage.setItem('imago_zn_result', JSON.stringify(payload));
        try {
          sessionStorage.setItem('imago-zero-negativity-result', JSON.stringify(payload));
          localStorage.setItem('imago-zero-negativity-result', JSON.stringify(payload));
        } catch(err) { /* compatibility storage best-effort */ }

        // Clear draft on successful submission
        try { localStorage.removeItem(DRAFT_KEY); } catch(err) {}

        // Redirect to results page
        window.location.assign(RESULTS_ROUTE);

      } catch(err) {
        // Error — restore form state, preserve all answers
        isSubmitting = false;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        document.getElementById('loadingOverlay').classList.remove('active');
        submitError.classList.add('visible');
        submitError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    // ─── FIELD LISTENERS ───
    function initFieldListeners() {
      for (let i = 1; i <= 5; i++) {
        const el = document.getElementById('answer' + i);
        if (!el) continue;

        el.addEventListener('input', function() {
          updateProgress();
          saveDraft();
          // Clear error on input once touched
          const err = document.getElementById('error-' + i);
          if (el.value.trim().length > 0 && err) err.classList.remove('visible');
        });

        el.addEventListener('blur', function() {
          validateField(i);
        });
      }

      const emailEl = document.getElementById('deliveryEmail');
      if (emailEl) {
        emailEl.addEventListener('input', function() {
          saveDraft();
          if (validateEmail(emailEl.value.trim())) {
            document.getElementById('email-error').classList.remove('visible');
          }
        });
        emailEl.addEventListener('blur', function() {
          const emailErr = document.getElementById('email-error');
          if (!emailEl.value.trim() || !validateEmail(emailEl.value.trim())) {
            emailErr.classList.add('visible');
          } else {
            emailErr.classList.remove('visible');
          }
        });
      }
    }

    // ─── CLEAR BUTTON ───
    document.getElementById('clearBtn').addEventListener('click', clearDraft);

    // ─── ACTIVE SECTION TRACKING (INTERSECTION) ───
    function initActiveTracking() {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const idx = entry.target.getAttribute('data-card');
            if (idx) {
              // lightweight visual feedback only; progress dots handle completion
            }
          }
        });
      }, { threshold: 0.3 });

      for (let i = 1; i <= 5; i++) {
        const card = document.getElementById('card-' + i);
        if (card) observer.observe(card);
      }
    }

    // ─── INIT ───
    document.addEventListener('DOMContentLoaded', function() {
      initExamples();
      loadDraft();
      updateProgress();
      initFieldListeners();
      initActiveTracking();
    });

    // Handle panels resize on window resize
    window.addEventListener('resize', function() {
      for (let i = 1; i <= 5; i++) {
        if (panels[i] && panels[i].open) {
          panels[i].panel.style.maxHeight = panels[i].panel.scrollHeight + 'px';
        }
      }
    });