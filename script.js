tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '#7C9EB2',
            brandDeep: '#5A7F96',
            brandSoft: '#E8F0F5',
            warm: '#C4A882',
            warmSoft: '#F5EFE6',
          },
          boxShadow: {
            soft: '0 4px 24px rgba(0,0,0,.06)',
            card: '0 2px 16px rgba(0,0,0,.07), 0 1px 4px rgba(0,0,0,.04)',
            cardHover: '0 12px 40px rgba(0,0,0,.12), 0 4px 12px rgba(0,0,0,.06)',
          },
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            serif: ['Georgia', 'Cambria', 'serif'],
          }
        }
      }
    };

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
      xhr.open('GET','https://paymegpt.com/api/landing/context/'+encodeURIComponent(contactId)+'?page_id=1871');
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

// ── Year ──────────────────────────────────────────────
    document.getElementById('year').textContent = new Date().getFullYear();

    // ── Theme init (runs immediately, before paint) ───────
    (function () {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    })();

    // ── Theme toggle ──────────────────────────────────────
    document.getElementById('themeToggle').addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // ── Hero fade-up on DOMContentLoaded ─────────────────
    // Uses double rAF to ensure the browser has painted the
    // initial opacity:0 state before adding .visible, so the
    // CSS transition actually fires on every page load.
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.querySelectorAll('.fade-up').forEach(el => {
            el.classList.add('visible');
          });
        });
      });
    });

    // ── Unified IntersectionObserver ──────────────────────
    // Handles: .section-entry, .scroll-fade, .tool-card, .start-card
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        // section-entry and scroll-fade both use the .in-view class
        if (el.classList.contains('section-entry') || el.classList.contains('scroll-fade')) {
          el.classList.add('in-view');
          io.unobserve(el);
          return;
        }

        // tool-card and start-card use inline style opacity/transform
        // (set during stagger registration below)
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        io.unobserve(el);
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    // Observe .section-entry blocks
    document.querySelectorAll('.section-entry').forEach(el => io.observe(el));

    // Observe .scroll-fade blocks
    document.querySelectorAll('.scroll-fade').forEach(el => io.observe(el));

    // Register and observe tool cards with staggered delay
    document.querySelectorAll('.tool-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(18px)';
      // Preserve all existing hover/active transitions alongside the stagger
      card.style.transition = [
        `opacity 0.55s ease ${i * 0.09}s`,
        `transform 0.55s cubic-bezier(0.22,1,0.36,1) ${i * 0.09}s`,
        'box-shadow 0.28s cubic-bezier(0.22,1,0.36,1)',
        'border-color 0.28s ease'
      ].join(', ');
      io.observe(card);
    });

    // Register and observe start cards with staggered delay
    document.querySelectorAll('.start-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      // Preserve all existing hover/active transitions alongside the stagger
      card.style.transition = [
        `opacity 0.60s ease ${i * 0.11}s`,
        `transform 0.60s cubic-bezier(0.22,1,0.36,1) ${i * 0.11}s`,
        'box-shadow 0.30s cubic-bezier(0.22,1,0.36,1)',
        'border-color 0.30s ease'
      ].join(', ');
      io.observe(card);
    });

    // ── Smooth scroll for all internal anchor links ───────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href').slice(1);
        if (!targetId) return;
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });