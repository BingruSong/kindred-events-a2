(() => {
  'use strict';
  const API = '/api';
  const page = document.body.dataset.page;
  const assets = new Set(['riverbank-planting','lantern-library','coastal-cleanup','makers-market','sunrise-run','community-kitchen','storybook-festival','reef-art-auction','youth-music-night','urban-garden']);
  const fallback = 'community-fallback';
  const $ = id => document.getElementById(id);
  const text = value => value == null ? '' : String(value);
  const el = (tag, className, content) => { const node = document.createElement(tag); if (className) node.className = className; if (content != null) node.textContent = text(content); return node; };
  const append = (parent, ...children) => { children.forEach(child => parent.append(child)); return parent; };
  const money = value => { const n = Number(value); return Number.isFinite(n) ? new Intl.NumberFormat('en-AU', {style:'currency',currency:'AUD',maximumFractionDigits:n % 1 ? 2 : 0}).format(n) : '—'; };
  const instant = value => { const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d; };
  const formatDate = value => { const d = instant(value); return d ? new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Brisbane',weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(d) : 'Date to be confirmed'; };
  const formatTime = value => { const d = instant(value); return d ? new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Brisbane',hour:'numeric',minute:'2-digit',hour12:true}).format(d) : 'Time to be confirmed'; };
  const sameBrisbaneDay = (a,b) => { const f = new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Brisbane',year:'numeric',month:'2-digit',day:'2-digit'}); return instant(a) && instant(b) && f.format(instant(a)) === f.format(instant(b)); };
  function imageFor(event) {
    const raw = text(event.image).split('/').pop().replace(/\.svg$/i,'');
    return `assets/${assets.has(raw) ? raw : fallback}.svg`;
  }
  function illustration(event, className) {
    const frame = el('div',className);
    const img = el('img'); img.src = imageFor(event); img.alt = `Original illustration for ${text(event.name) || 'a community event'}`; img.loading = className === 'card-image' ? 'lazy' : 'eager';
    img.onerror = () => { if (!img.src.endsWith(`/${fallback}.svg`)) img.src = `assets/${fallback}.svg`; };
    append(frame,img,el('span','image-credit','Illustration · Kindred'));
    return frame;
  }
  async function getJSON(path, signal) {
    const response = await fetch(API + path,{headers:{Accept:'application/json'},signal});
    let body; try { body = await response.json(); } catch { throw new Error('The server returned an unreadable response.'); }
    if (!response.ok) { const error = new Error(body?.error?.message || `Request failed (${response.status}).`); error.status=response.status; throw error; }
    return body;
  }
  const arrayFrom = (body, key) => Array.isArray(body) ? body : Array.isArray(body?.[key]) ? body[key] : [];
  function setStatus(container, kind, title, detail, onRetry) {
    container.replaceChildren();
    if (kind === 'loading') { container.append(el('div','loading',detail || 'Loading events…')); return; }
    const box=el('div','status-panel'); append(box,el('h3','',title),el('p','',detail));
    if (onRetry) { const button=el('button','button button-dark','Try again ↗'); button.type='button'; button.addEventListener('click',onRetry); box.append(button); }
    container.append(box);
  }
  function card(event) {
    const article=el('article','event-card');
    const link=el('a'); link.href=`detail.html?id=${encodeURIComponent(event.id)}`; link.setAttribute('aria-label',`View ${text(event.name)} details`); link.append(illustration(event,'card-image'));
    const body=el('div','card-body');
    const category=el('span','card-category',event.category?.name || 'Community');
    const title=el('h3'); const titleLink=el('a','',event.name || 'Untitled event'); titleLink.href=link.href; title.append(titleLink);
    const purpose=el('p','card-purpose',event.purpose || 'A gathering for a good cause.');
    const meta=el('div','card-meta');
    const date=el('span'); append(date,el('b','','◷'),document.createTextNode(formatDate(event.startsAt)));
    const place=el('span'); append(place,el('b','','⌖'),document.createTextNode([event.venue,event.city].filter(Boolean).join(', ') || 'Location to be confirmed'));
    append(meta,date,place);
    const arrow=el('a','card-arrow','Explore event ↗'); arrow.href=link.href;
    append(body,category,title,purpose,meta,arrow); append(article,link,body); return article;
  }
  function renderCards(container, events) { container.replaceChildren(...events.map(card)); }
  async function initHome() {
    const status=$('featured-status'), grid=$('featured-events');
    async function load() {
      grid.replaceChildren(); setStatus(status,'loading','','Finding upcoming events…');
      try {
        const events=arrayFrom(await getJSON('/events?upcoming=1'),'events');
        status.replaceChildren();
        if (!events.length) { setStatus(status,'empty','Good things are coming','There are no upcoming events right now. Come back soon, or explore all events.'); return; }
        renderCards(grid,events.slice(0,3));
      } catch(error) { setStatus(status,'error','We could not load events','Please check your connection and try again.',load); }
    }
    await load();
  }
  function readFilters() {
    const q=new URLSearchParams(location.search);
    return {date:q.get('date')||'',location:q.get('location')||'',category:q.get('category')||''};
  }
  function updateInputs(filters) { $('filter-date').value=filters.date; $('filter-location').value=filters.location; $('filter-category').value=filters.category; }
  function filterPath(filters) {
    const q=new URLSearchParams({upcoming:'1'});
    for (const [key,value] of Object.entries(filters)) if (value) q.set(key,value);
    return `/events?${q}`;
  }
  function updateURL(filters, replace=false) {
    const q=new URLSearchParams(); for (const [key,value] of Object.entries(filters)) if (value) q.set(key,value);
    const url=`search.html${q.size ? `?${q}` : ''}`;
    history[replace ? 'replaceState' : 'pushState'](null,'',url);
  }
  async function initSearch() {
    const form=$('filters'), status=$('search-status'), grid=$('search-events'), count=$('result-count');
    let version=0, controller=null;
    let filters=readFilters(); updateInputs(filters);
    async function loadCategories() {
      const select=$('filter-category');
      try {
        const categories=arrayFrom(await getJSON('/categories'),'categories');
        for (const category of categories) {
          const option=el('option','',category.name); option.value=text(category.id); select.append(option);
        }
        select.value=filters.category;
      } catch { const option=el('option','','Causes unavailable'); option.disabled=true; select.append(option); }
    }
    async function load() {
      const current=++version; controller?.abort(); controller=new AbortController();
      grid.replaceChildren(); count.textContent=''; setStatus(status,'loading','','Finding events for you…');
      try {
        const events=arrayFrom(await getJSON(filterPath(filters),controller.signal),'events');
        if (current!==version) return;
        status.replaceChildren();
        count.textContent=`${events.length} ${events.length===1?'event':'events'}`;
        if (!events.length) { setStatus(status,'empty','No events found','Try another date, place or cause to discover more gatherings.'); return; }
        renderCards(grid,events);
      } catch(error) {
        if (error.name==='AbortError'||current!==version) return;
        setStatus(status,'error','Events are unavailable','Please check your connection and try again.',load);
      }
    }
    form.addEventListener('submit',event=>{
      event.preventDefault();
      filters={date:$('filter-date').value,location:$('filter-location').value.trim(),category:$('filter-category').value};
      updateURL(filters); load();
    });
    $('clear-filters').addEventListener('click',()=>{ filters={date:'',location:'',category:''}; updateInputs(filters); updateURL(filters); load(); });
    window.addEventListener('popstate',()=>{ filters=readFilters(); updateInputs(filters); load(); });
    await Promise.all([loadCategories(),load()]);
  }
  function fact(label,value) { const row=el('div','fact'); append(row,el('dt','',label),el('dd','',value)); return row; }
  function renderDetail(event) {
    const article=$('event-detail'); article.replaceChildren();
    document.title=`${text(event.name)} · Kindred`;
    const hero=el('div','detail-hero'); const summary=el('div','detail-summary');
    append(summary,el('span','tag',event.category?.name || 'Community'),el('p','eyebrow','A MOMENT FOR GOOD'),el('h1','detail-title',event.name || 'Community event'),el('p','detail-purpose',event.purpose || 'A gathering for a good cause.'));
    const facts=el('dl','detail-facts');
    const dateText=sameBrisbaneDay(event.startsAt,event.endsAt) ? `${formatDate(event.startsAt)} · ${formatTime(event.startsAt)}–${formatTime(event.endsAt)}` : `${formatDate(event.startsAt)} ${formatTime(event.startsAt)} – ${formatDate(event.endsAt)} ${formatTime(event.endsAt)}`;
    append(facts,fact('When',dateText),fact('Where',[event.venue,event.city].filter(Boolean).join(', ') || 'Location to be confirmed'),fact('Ticket',Number(event.ticketPrice)===0?'Free':money(event.ticketPrice)));
    const register=el('button','button button-dark','Register ↗'); register.type='button'; register.addEventListener('click',()=>{ const dialog=$('register-dialog'); if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open',''); });
    append(summary,facts,register); append(hero,illustration(event,'detail-image'),summary);
    const lower=el('div','detail-lower'); const about=el('section'); append(about,el('p','eyebrow','BEHIND THE EVENT'),el('h2','','About this gathering'),el('p','detail-description',event.description || event.purpose || 'Details will be available soon.'));
    const impact=el('aside','impact-card'); append(impact,el('p','eyebrow','THE IMPACT'),el('strong','',money(event.fundraisingGoal)),el('p','','Fundraising goal'));
    const raised=Math.max(0,Number(event.amountRaised)||0), goal=Math.max(0,Number(event.fundraisingGoal)||0);
    const track=el('div','progress-track'); track.setAttribute('role','progressbar'); track.setAttribute('aria-label','Fundraising progress'); track.setAttribute('aria-valuemin','0'); track.setAttribute('aria-valuemax',String(goal)); track.setAttribute('aria-valuenow',String(Math.min(raised,goal)));
    const fill=el('div','progress-fill'); fill.style.width=`${goal ? Math.min(100,raised/goal*100) : 0}%`; track.append(fill);
    const numbers=el('div','impact-numbers'); append(numbers,el('span','',`${money(raised)} raised`),el('span','',`${goal ? Math.round(raised/goal*100) : 0}% of goal`)); append(impact,track,numbers);
    append(lower,about,impact); append(article,hero,lower); article.hidden=false;
  }
  async function initDetail() {
    const status=$('detail-status'), article=$('event-detail');
    const raw=new URLSearchParams(location.search).get('id');
    const valid=raw && /^[1-9]\d*$/.test(raw) && Number.isSafeInteger(Number(raw));
    if (!valid) { setStatus(status,'error','Event not found','This event link is invalid. Browse all events to find a gathering.'); return; }
    async function load() {
      article.hidden=true; setStatus(status,'loading','','Loading event details…');
      try { const body=await getJSON(`/events/${encodeURIComponent(raw)}`); const event=body?.event || body; status.replaceChildren(); renderDetail(event); }
      catch(error) {
        if (error.status===404) setStatus(status,'empty','Event not found','This event may have ended or is no longer available. Explore other upcoming events.');
        else setStatus(status,'error','Details are unavailable','Please check your connection and try again.',load);
      }
    }
    $('close-dialog').addEventListener('click',()=>$('register-dialog').close());
    $('dialog-done').addEventListener('click',()=>$('register-dialog').close());
    await load();
  }
  $('year').textContent=new Date().getFullYear();
  if (page==='home') initHome();
  if (page==='search') initSearch();
  if (page==='detail') initDetail();
})();
