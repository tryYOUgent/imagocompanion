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
      } else {
        document.documentElement.classList.remove('dark');
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
      xhr.open('GET','https://paymegpt.com/api/landing/context/'+encodeURIComponent(contactId)+'?page_id=1879');
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

// ===== FIELD NAMES =====
  // All localStorage keys used by this page for autosave/restore
  const FIELD_NAMES = [
    'lf_thinking_message',
    'lf_thinking_example',
    'lf_thinking_protection_or_decision',
    'lf_thinking_relationship_playout',
    'lf_thinking_new_self_message',
    'lf_feeling_message',
    'lf_feeling_example',
    'lf_feeling_protection_or_decision',
    'lf_feeling_relationship_playout',
    'lf_feeling_new_self_message',
    'lf_acting_message',
    'lf_acting_example',
    'lf_acting_protection_or_decision',
    'lf_acting_relationship_playout',
    'lf_acting_new_self_message',
    'lf_sensing_message',
    'lf_sensing_example',
    'lf_sensing_protection_or_decision',
    'lf_sensing_relationship_playout',
    'lf_sensing_new_self_message',
    'lf_being_message',
    'lf_being_example',
    'lf_being_protection_or_decision',
    'lf_being_relationship_playout',
    'lf_being_new_self_message',
    'lf_summary_most_blocked_domain',
    'lf_summary_most_alive_domain',
    'lf_summary_core_pattern',
    'lf_summary_one_growth_intention',
    'lf_notes_optional'
  ];

  document.addEventListener('DOMContentLoaded', function () {

    // =========================================================================
    // THEME TOGGLE
    // Purpose: Toggle dark/light mode, persist to localStorage as 'pmg_theme'
    // Updates button icon and label to always reflect the NEXT action
    // =========================================================================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('theme-icon-moon');
    const themeLabel = document.getElementById('theme-label-text');

    function updateThemeButton() {
      // If currently dark → button offers to switch to light
      // If currently light → button offers to switch to dark
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        themeIcon.textContent = '☀️';
        themeLabel.textContent = 'Light';
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
      } else {
        themeIcon.textContent = '🌙';
        themeLabel.textContent = 'Dark';
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
      }
    }

    // Initialize button state on load
    updateThemeButton();

    themeToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const isDark = document.documentElement.classList.contains('dark');
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('pmg_theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('pmg_theme', 'dark');
      }
      updateThemeButton();
    });

    // =========================================================================
    // EXAMPLES TOGGLE — Delegated click handler
    // Purpose: Open/close example panels without triggering form submit or scroll
    // Uses event delegation on document to catch all .examples-toggle buttons
    // =========================================================================
    document.addEventListener('click', function (e) {
      const toggle = e.target.closest('.examples-toggle');
      if (!toggle) return;

      // Prevent any form submission or default behavior
      e.preventDefault();
      e.stopPropagation();

      const controlsId = toggle.getAttribute('aria-controls');
      if (!controlsId) return;

      const panel = document.getElementById(controlsId);
      if (!panel) return;

      const arrow = toggle.querySelector('.examples-arrow');
      const isOpen = panel.classList.contains('open');

      if (isOpen) {
        // Close
        panel.classList.remove('open');
        if (arrow) arrow.classList.remove('rotated');
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        // Open
        panel.classList.add('open');
        if (arrow) arrow.classList.add('rotated');
        toggle.setAttribute('aria-expanded', 'true');
      }
    });

    // =========================================================================
    // AUTOSAVE — Save all field values to localStorage on input/change
    // Purpose: Prevent data loss on accidental navigation or page refresh
    // =========================================================================
    function saveField(name, value) {
      localStorage.setItem('pmg_imago_' + name, value);
    }

    function restoreAllFields() {
      FIELD_NAMES.forEach(function (name) {
        const saved = localStorage.getItem('pmg_imago_' + name);
        if (saved === null) return;
        const el = document.getElementById(name) || document.querySelector('[name="' + name + '"]');
        if (!el) return;
        el.value = saved;
      });
    }

    // Attach autosave listeners to all fields
    FIELD_NAMES.forEach(function (name) {
      const el = document.getElementById(name) || document.querySelector('[name="' + name + '"]');
      if (!el) return;
      const eventType = (el.tagName === 'SELECT') ? 'change' : 'input';
      el.addEventListener(eventType, function () {
        saveField(name, el.value);
      });
    });

    // Restore on load
    restoreAllFields();

    // =========================================================================
    // CLEAR ALL ANSWERS
    // Purpose: Wipe all saved answers from localStorage and reset form UI
    // Requires confirm() before clearing
    // =========================================================================
    function clearAllAnswers() {
      if (!confirm('Are you sure you want to clear all saved answers? This cannot be undone.')) return;
      FIELD_NAMES.forEach(function (name) {
        localStorage.removeItem('pmg_imago_' + name);
        const el = document.getElementById(name) || document.querySelector('[name="' + name + '"]');
        if (el) el.value = '';
      });
    }

    const clearBtn = document.getElementById('clearAllBtn');
    const clearBtnMobile = document.getElementById('clearAllBtnMobile');
    if (clearBtn) clearBtn.addEventListener('click', clearAllAnswers);
    if (clearBtnMobile) clearBtnMobile.addEventListener('click', clearAllAnswers);

    // =========================================================================
    // SUBMIT REDIRECT
    // =========================================================================
    // Purpose: On submit button click, read all field values, build an absolute
    //          URL using the URL constructor (guarantees no relative-path issues),
    //          append agent ID, all assessment fields, and tags, then redirect
    //          via window.location.assign() to avoid any router 404 on app subdomain.
    //
    // Destination: https://paymegpt.com/p/f9t4gpn/lost-functions-results
    //   - Uses paymegpt.com (NOT app.paymegpt.com)
    //   - agent=19268246 (required for contact attribution)
    //   - tags=Lostfunction
    //   - All 30 assessment field values appended as search params
    //   - url.searchParams.set() handles all encoding automatically
    // =========================================================================
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', function (e) {
        // Prevent any native form submission or page reload
        e.preventDefault();
        e.stopPropagation();

        // Build the destination URL using the URL constructor
        // This guarantees an absolute URL — no relative-path routing issues
        const url = new URL('https://paymegpt.com/p/f9t4gpn/lost-functions-results');

        // Required agent parameter for contact attribution
        url.searchParams.set('agent', '19268246');

        // Tag this submission for segmentation
        url.searchParams.set('tags', 'Lostfunction');

        // Append all assessment field values
        // url.searchParams.set() handles encodeURIComponent automatically
        FIELD_NAMES.forEach(function (name) {
          const el = document.getElementById(name) || document.querySelector('[name="' + name + '"]');
          const value = el ? (el.value || '') : '';
          url.searchParams.set(name, value);
        });

        // Redirect using assign() — full navigation, no history manipulation
        window.location.assign(url.toString());
      });
    }

    // =========================================================================
    // INTERSECTION OBSERVER — WHERE AM I + PROGRESS BAR + NAV ACTIVE STATE
    // Purpose: Track which section is in view and update header indicator,
    //          progress bar, and left nav active item
    // =========================================================================
    const sections = document.querySelectorAll('section[data-section]');
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    const progressBar = document.getElementById('progress-bar');
    const waiLabel = document.getElementById('wai-label');
    const waiTitle = document.getElementById('wai-title');

    const sectionCount = 6;

    function updateActiveSection(sectionNum, sectionTitle) {
      // Update where-am-i indicator
      if (waiLabel) waiLabel.textContent = 'Section ' + sectionNum + ' of ' + sectionCount;
      if (waiTitle) waiTitle.textContent = '— ' + sectionTitle;

      // Update progress bar
      if (progressBar) {
        const pct = (sectionNum / sectionCount) * 100;
        progressBar.style.width = pct.toFixed(2) + '%';
      }

      // Update nav active states
      navItems.forEach(function (item) {
        const itemSection = parseInt(item.getAttribute('data-section'), 10);
        if (itemSection === sectionNum) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    // Use IntersectionObserver to detect which section is most visible
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const sectionNum = parseInt(entry.target.getAttribute('data-section'), 10);
          const sectionTitle = entry.target.getAttribute('data-section-title') || '';
          updateActiveSection(sectionNum, sectionTitle);
        }
      });
    }, observerOptions);

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });

    // Initialize with section 1
    updateActiveSection(1, 'Thinking');

  }); // end DOMContentLoaded