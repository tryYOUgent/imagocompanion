(function(){
  const SHEET_URL='https://paymegpt.com/api/public/landing-pages/6089/sheet-data';
  const RETRY_MS=750;
  const MAX_WAIT_MS=90000;

  const els={
    missing:document.getElementById('missingState'),
    error:document.getElementById('errorState'),
    results:document.getElementById('resultsState'),
    why:document.getElementById('whyHere'),
    forward:document.getElementById('lookingForward'),
    show:document.getElementById('howShowUp'),
    practice:document.getElementById('intentionalPractice'),
    hope:document.getElementById('hopeForward'),
    narrative:document.getElementById('narrative')
  };

  function submissionId(){
    return (new URLSearchParams(window.location.search).get('submission_id')||'').trim();
  }

  function rowsFrom(payload){
    if(Array.isArray(payload))return payload;
    if(payload&&Array.isArray(payload.rows))return payload.rows;
    if(payload&&Array.isArray(payload.data))return payload.data;
    return [];
  }

  function renderNarrative(text){
    els.narrative.replaceChildren();
    const value=String(text||'').trim();
    const parts=value.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean);
    (parts.length?parts:[value]).filter(Boolean).forEach(part=>{
      const p=document.createElement('p');
      p.textContent=part;
      els.narrative.appendChild(p);
    });
  }

  function render(row){
    els.why.textContent=String(row.wi_why_here||'');
    els.forward.textContent=String(row.wi_looking_forward||'');
    els.show.textContent=String(row.wi_how_show_up||'');
    els.practice.textContent=String(row.wi_intentional_practice||'');
    els.hope.textContent=String(row.wi_hope_forward||'');
    renderNarrative(row.wi_narrative||'');
    els.missing.classList.add('hidden');
    els.error.classList.add('hidden');
    els.results.classList.remove('hidden');
  }

  async function loadResults(){
    const id=submissionId();
    if(!id){els.missing.classList.remove('hidden');return;}

    const started=Date.now();
    while(Date.now()-started<MAX_WAIT_MS){
      try{
        const response=await fetch(SHEET_URL,{cache:'no-store',credentials:'same-origin'});
        if(response.ok){
          const payload=await response.json();
          const rows=rowsFrom(payload);
          const row=rows.find(item=>String(item&&item.submission_id!=null?item.submission_id:'').trim()===id);
          if(row&&String(row.status||'').toLowerCase()==='completed'){
            render(row);
            return;
          }
          if(row&&(String(row.wi_narrative||'').trim()||String(row.wi_why_here||'').trim())){
            render(row);
            return;
          }
        }
      }catch(error){console.debug('Waiting for completed reflection row.');}
      await new Promise(resolve=>setTimeout(resolve,RETRY_MS));
    }
    els.error.classList.remove('hidden');
  }

  const themeButton=document.getElementById('themeToggle');
  const themeIcon=document.getElementById('themeIcon');
  const themeLabel=document.getElementById('themeLabel');
  function applyTheme(theme){
    const dark=theme==='dark';
    document.documentElement.classList.toggle('dark',dark);
    themeIcon.textContent=dark?'☀️':'🌙';
    themeLabel.textContent=dark?'Light':'Dark';
  }
  const savedTheme=localStorage.getItem('workshop_intentions_theme');
  applyTheme(savedTheme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'));
  themeButton.addEventListener('click',()=>{
    const next=document.documentElement.classList.contains('dark')?'light':'dark';
    localStorage.setItem('workshop_intentions_theme',next);
    applyTheme(next);
  });

  loadResults();
})();