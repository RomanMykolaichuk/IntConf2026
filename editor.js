(() => {
  const STORAGE_KEY = 'intconf2026-programme-draft';
  const original = JSON.parse(JSON.stringify(window.CONFERENCE_PROGRAMME));
  let state = load();

  const conferenceRoot = document.getElementById('conference-editor');
  const daysRoot = document.getElementById('days-editor');

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(original));
    } catch {
      return JSON.parse(JSON.stringify(original));
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function esc(value='') {
    return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  }

  function input(label, value, path, wide=false, textarea=false) {
    const tag = textarea
      ? `<textarea data-path="${path}">${esc(value)}</textarea>`
      : `<input data-path="${path}" value="${esc(value)}">`;
    return `<div class="field ${wide ? 'field--wide' : ''}"><label>${label}</label>${tag}</div>`;
  }

  function renderConference() {
    const c = state.conference;
    conferenceRoot.innerHTML = `
      <div class="day-editor__head"><div><p class="kicker">Conference details</p><h2>Header information</h2></div></div>
      <div class="editor-grid">
        ${input('Title', c.title, 'conference.title', true)}
        ${input('Organisers', c.organisers, 'conference.organisers', true)}
        ${input('Date label', c.dateLabel, 'conference.dateLabel')}
        ${input('Place label', c.placeLabel, 'conference.placeLabel')}
        ${input('Status', c.status, 'conference.status', true)}
      </div>`;
  }

  function renderDays() {
    daysRoot.innerHTML = state.days.map((day, di) => `
      <section class="day-editor">
        <div class="day-editor__head">
          <div><p class="kicker">Day ${di+1}</p><h2>${esc(day.date)} — ${esc(day.title)}</h2></div>
          <div class="mini-actions">
            <button class="mini-button mini-button--danger" data-remove-day="${di}">Remove day</button>
          </div>
        </div>
        <div class="editor-grid">
          ${input('Short label', day.shortLabel, `days.${di}.shortLabel`)}
          ${input('Date', day.date, `days.${di}.date`)}
          ${input('Title', day.title, `days.${di}.title`, true)}
        </div>

        <div class="sections">
          ${day.sections.map((section, si) => renderSection(section, di, si)).join('')}
        </div>
        <button class="mini-button add-row" data-add-section="${di}">+ Add section</button>
      </section>
    `).join('') + '<button class="button add-row" id="add-day" type="button">+ Add conference day</button>';
  }

  function renderSection(section, di, si) {
    return `
      <section class="section-editor">
        <div class="section-editor__head">
          <h3>${esc(section.title)}</h3>
          <div class="mini-actions">
            <button class="mini-button mini-button--danger" data-remove-section="${di},${si}">Remove section</button>
          </div>
        </div>
        <div class="editor-grid">
          ${input('Section title', section.title, `days.${di}.sections.${si}.title`, true)}
          <div class="field">
            <label>Section type</label>
            <select class="section-type" data-path="days.${di}.sections.${si}.type">
              ${['standard','panel','break','keynote','dinner'].map(v => `<option value="${v}" ${section.type===v?'selected':''}>${v}</option>`).join('')}
            </select>
          </div>
        </div>
        <div>
          ${section.items.map((item, ii) => renderItem(item, di, si, ii)).join('')}
        </div>
        <button class="mini-button add-row" data-add-item="${di},${si}">+ Add programme item</button>
      </section>`;
  }

  function renderItem(item, di, si, ii) {
    const base = `days.${di}.sections.${si}.items.${ii}`;
    return `
      <div class="item-editor">
        <div class="item-editor__head">
          <strong>Item ${ii+1}</strong>
          <div class="mini-actions">
            <button class="mini-button" type="button" data-copy-item="${di},${si},${ii}" title="Duplicate this item">Copy</button>
            <button class="mini-button" type="button" data-move-item-up="${di},${si},${ii}" ${ii === 0 ? 'disabled' : ''} title="Move item up">↑ Up</button>
            <button class="mini-button" type="button" data-move-item-down="${di},${si},${ii}" ${ii === state.days[di].sections[si].items.length - 1 ? 'disabled' : ''} title="Move item down">↓ Down</button>
            <button class="mini-button mini-button--danger" type="button" data-remove-item="${di},${si},${ii}">Remove</button>
          </div>
        </div>
        <div class="editor-grid">
          ${input('Time', item.time || '', base+'.time')}
          ${input('Activity', item.activity || '', base+'.activity')}
          ${input('Topic / subtitle', item.topic || '', base+'.topic', true)}
          ${input('Remarks / speaker', item.remarks || '', base+'.remarks', true, true)}
        </div>
      </div>`;
  }

  function setByPath(path, value) {
    const parts = path.split('.');
    let ref = state;
    for (let i=0; i<parts.length-1; i++) ref = ref[parts[i]];
    ref[parts.at(-1)] = value;
    save();
  }

  function bind() {
    document.querySelectorAll('[data-path]').forEach(el => {
      el.addEventListener('input', e => setByPath(e.target.dataset.path, e.target.value));
      el.addEventListener('change', e => setByPath(e.target.dataset.path, e.target.value));
    });

    document.querySelectorAll('[data-add-item]').forEach(btn => btn.addEventListener('click', () => {
      const [di,si] = btn.dataset.addItem.split(',').map(Number);
      state.days[di].sections[si].items.push({time:'',activity:'New item',topic:'',remarks:''});
      save(); render();
    }));
    document.querySelectorAll('[data-copy-item]').forEach(btn => btn.addEventListener('click', () => {
      const [di,si,ii] = btn.dataset.copyItem.split(',').map(Number);
      const items = state.days[di].sections[si].items;
      const copy = JSON.parse(JSON.stringify(items[ii]));
      items.splice(ii + 1, 0, copy);
      save(); render();
    }));

    document.querySelectorAll('[data-move-item-up]').forEach(btn => btn.addEventListener('click', () => {
      const [di,si,ii] = btn.dataset.moveItemUp.split(',').map(Number);
      if (ii <= 0) return;
      const items = state.days[di].sections[si].items;
      [items[ii - 1], items[ii]] = [items[ii], items[ii - 1]];
      save(); render();
    }));

    document.querySelectorAll('[data-move-item-down]').forEach(btn => btn.addEventListener('click', () => {
      const [di,si,ii] = btn.dataset.moveItemDown.split(',').map(Number);
      const items = state.days[di].sections[si].items;
      if (ii >= items.length - 1) return;
      [items[ii], items[ii + 1]] = [items[ii + 1], items[ii]];
      save(); render();
    }));

    document.querySelectorAll('[data-remove-item]').forEach(btn => btn.addEventListener('click', () => {
      const [di,si,ii] = btn.dataset.removeItem.split(',').map(Number);
      state.days[di].sections[si].items.splice(ii,1);
      save(); render();
    }));
    document.querySelectorAll('[data-add-section]').forEach(btn => btn.addEventListener('click', () => {
      const di = Number(btn.dataset.addSection);
      state.days[di].sections.push({title:'New section',type:'standard',items:[]});
      save(); render();
    }));
    document.querySelectorAll('[data-remove-section]').forEach(btn => btn.addEventListener('click', () => {
      const [di,si] = btn.dataset.removeSection.split(',').map(Number);
      state.days[di].sections.splice(si,1);
      save(); render();
    }));
    document.querySelectorAll('[data-remove-day]').forEach(btn => btn.addEventListener('click', () => {
      state.days.splice(Number(btn.dataset.removeDay),1);
      save(); render();
    }));

    document.getElementById('add-day')?.addEventListener('click', () => {
      const n = state.days.length + 1;
      state.days.push({id:'day-'+n,shortLabel:'New day',date:'Date',title:'New conference day',meta:[],sections:[]});
      save(); render();
    });
  }

  function render() {
    renderConference();
    renderDays();
    bind();
  }

  document.getElementById('download-js').addEventListener('click', () => {
    const payload = 'window.CONFERENCE_PROGRAMME = ' + JSON.stringify(state, null, 2) + ';\n';
    const blob = new Blob([payload], {type:'text/javascript'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'programme.js';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('reset-data').addEventListener('click', () => {
    if (!confirm('Reset all browser edits to the repository version?')) return;
    state = JSON.parse(JSON.stringify(original));
    localStorage.removeItem(STORAGE_KEY);
    render();
  });

  render();
})();