(() => {
  const source = window.CONFERENCE_PROGRAMME;
  if (!source || !Array.isArray(source.days)) {
    document.body.innerHTML = '<main class="fatal-error">Programme data could not be loaded.</main>';
    return;
  }

  const STORAGE_KEY = 'intconf2026-programme-draft-v1';
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const originalData = clone(source);

  let data = clone(source);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.days)) data = parsed;
    }
  } catch (error) {
    console.warn('Local programme draft could not be loaded.', error);
  }

  const root = document.getElementById('programme-root');
  const tabs = document.getElementById('day-tabs');
  const meta = document.getElementById('conference-meta');
  const title = document.getElementById('conference-title');
  const organisers = document.getElementById('conference-organisers');
  const printButton = document.getElementById('print-programme');
  const showAllButton = document.getElementById('show-all');
  const editButton = document.getElementById('edit-programme');
  const exportButton = document.getElementById('export-data');
  const resetButton = document.getElementById('reset-edits');
  const editBanner = document.getElementById('edit-banner');

  let activeDay = data.days[0]?.id || 'day-1';
  let showingAll = false;
  let editing = false;

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const decorateDraft = (text = '') => {
    const safe = escapeHtml(text);
    return safe.replace(/\b(TBC|TBA|TBD)\b/g, '<span class="draft-token">$1</span>');
  };

  const renderValue = (value = '') => editing ? escapeHtml(value) : decorateDraft(value);

  const editAttrs = (path, placeholder = 'Click to edit') => editing
    ? `contenteditable="true" spellcheck="true" data-edit-path="${escapeHtml(path)}" data-placeholder="${escapeHtml(placeholder)}" tabindex="0"`
    : '';

  const setByPath = (object, path, value) => {
    const parts = path.split('.');
    let cursor = object;
    parts.forEach((part, index) => {
      const key = /^\d+$/.test(part) ? Number(part) : part;
      if (index === parts.length - 1) {
        cursor[key] = value;
      } else {
        if (cursor[key] == null) cursor[key] = /^\d+$/.test(parts[index + 1]) ? [] : {};
        cursor = cursor[key];
      }
    });
  };

  const saveLocal = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Programme draft could not be saved locally.', error);
    }
  };

  const renderConference = () => {
    const c = data.conference;
    document.title = `${c.title} — Conference Programme`;
    title.innerHTML = renderValue(c.title);
    title.setAttribute('data-placeholder', 'Conference title');
    if (editing) {
      title.setAttribute('contenteditable', 'true');
      title.setAttribute('spellcheck', 'true');
      title.setAttribute('data-edit-path', 'conference.title');
      title.setAttribute('tabindex', '0');
    } else {
      title.removeAttribute('contenteditable');
      title.removeAttribute('spellcheck');
      title.removeAttribute('data-edit-path');
      title.removeAttribute('tabindex');
    }

    organisers.innerHTML = renderValue(c.organisers);
    organisers.setAttribute('data-placeholder', 'Organisers');
    if (editing) {
      organisers.setAttribute('contenteditable', 'true');
      organisers.setAttribute('spellcheck', 'true');
      organisers.setAttribute('data-edit-path', 'conference.organisers');
      organisers.setAttribute('tabindex', '0');
    } else {
      organisers.removeAttribute('contenteditable');
      organisers.removeAttribute('spellcheck');
      organisers.removeAttribute('data-edit-path');
      organisers.removeAttribute('tabindex');
    }

    meta.innerHTML = `
      <span ${editAttrs('conference.dateLabel', 'Conference dates')}>${renderValue(c.dateLabel)}</span>
      <span ${editAttrs('conference.placeLabel', 'Location')}>${renderValue(c.placeLabel)}</span>
      <span class="status-pill" ${editAttrs('conference.status', 'Status')}>${renderValue(c.status)}</span>
    `;
  };

  const renderTabs = () => {
    tabs.innerHTML = data.days.map((day) => `
      <button
        class="day-tab${day.id === activeDay && !showingAll ? ' is-active' : ''}"
        type="button"
        data-day="${escapeHtml(day.id)}"
        aria-pressed="${day.id === activeDay && !showingAll ? 'true' : 'false'}">
        <span>${escapeHtml(day.shortLabel)}</span>
        <small>${escapeHtml(day.title)}</small>
      </button>
    `).join('');

    tabs.querySelectorAll('[data-day]').forEach((button) => {
      button.addEventListener('click', () => {
        activeDay = button.dataset.day;
        showingAll = false;
        render();
        document.getElementById(activeDay)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const renderMeta = (items = [], dayIndex) => {
    if (!items.length) return '';
    return `<dl class="day-meta">${items.map((item, metaIndex) => `
      <div>
        <dt ${editAttrs(`days.${dayIndex}.meta.${metaIndex}.label`, 'Label')}>${renderValue(item.label)}</dt>
        <dd ${editAttrs(`days.${dayIndex}.meta.${metaIndex}.value`, 'Value')}>${renderValue(item.value)}</dd>
      </div>
    `).join('')}</dl>`;
  };

  const renderItem = (item, dayIndex, sectionIndex, itemIndex) => {
    const base = `days.${dayIndex}.sections.${sectionIndex}.items.${itemIndex}`;
    const topic = item.topic || '';
    const remarks = item.remarks || '';

    return `
      <article class="programme-item">
        <div class="programme-item__time" ${editAttrs(`${base}.time`, 'Time')}>${editing ? renderValue(item.time || '') : decorateDraft(item.time || '—')}</div>
        <div class="programme-item__main">
          <h4 ${editAttrs(`${base}.activity`, 'Activity')}>${renderValue(item.activity || '')}</h4>
          ${topic || editing ? `<p class="programme-item__topic" ${editAttrs(`${base}.topic`, 'Optional session title')}>${renderValue(topic)}</p>` : ''}
        </div>
        <div class="programme-item__remarks" ${editAttrs(`${base}.remarks`, 'Remarks / speaker')}>${editing ? renderValue(remarks) : (remarks ? decorateDraft(remarks) : '<span class="muted">—</span>')}</div>
      </article>
    `;
  };

  const renderSection = (section, dayIndex, sectionIndex) => `
    <section class="programme-section programme-section--${escapeHtml(section.type || 'standard')}">
      <div class="programme-section__heading">
        <h3 ${editAttrs(`days.${dayIndex}.sections.${sectionIndex}.title`, 'Section title')}>${renderValue(section.title)}</h3>
      </div>
      <div class="programme-table" role="table" aria-label="${escapeHtml(section.title)}">
        <div class="programme-table__head" role="row">
          <span role="columnheader">Time</span>
          <span role="columnheader">Activity</span>
          <span role="columnheader">Remarks / Speaker</span>
        </div>
        ${section.items.map((item, itemIndex) => renderItem(item, dayIndex, sectionIndex, itemIndex)).join('')}
      </div>
    </section>
  `;

  const renderDay = (day, dayIndex) => `
    <section class="day-panel" id="${escapeHtml(day.id)}" data-day-panel="${escapeHtml(day.id)}" ${!showingAll && day.id !== activeDay ? 'hidden' : ''}>
      <header class="day-header">
        <div>
          <p class="kicker" ${editAttrs(`days.${dayIndex}.date`, 'Date')}>${renderValue(day.date)}</p>
          <h2 ${editAttrs(`days.${dayIndex}.title`, 'Day title')}>${renderValue(day.title)}</h2>
        </div>
        ${renderMeta(day.meta, dayIndex)}
      </header>
      <div class="day-sections">
        ${day.sections.map((section, sectionIndex) => renderSection(section, dayIndex, sectionIndex)).join('')}
      </div>
    </section>
  `;

  const updateEditorUI = () => {
    document.body.classList.toggle('is-editing', editing);
    editButton.textContent = editing ? 'Done editing' : 'Edit programme';
    editButton.setAttribute('aria-pressed', editing ? 'true' : 'false');
    exportButton.hidden = !editing;
    resetButton.hidden = !editing;
    editBanner.hidden = !editing;
  };

  const render = () => {
    if (!data.days.some((day) => day.id === activeDay)) activeDay = data.days[0]?.id || '';
    renderConference();
    renderTabs();
    root.innerHTML = data.days.map(renderDay).join('');
    showAllButton.textContent = showingAll ? 'Show one day' : 'Show all days';
    showAllButton.setAttribute('aria-pressed', showingAll ? 'true' : 'false');
    updateEditorUI();
  };

  document.addEventListener('input', (event) => {
    const field = event.target.closest('[data-edit-path]');
    if (!editing || !field) return;

    const value = field.innerText
      .replace(/\u00a0/g, ' ')
      .replace(/\s*\n+\s*/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .trim();

    setByPath(data, field.dataset.editPath, value);
    saveLocal();
  });

  document.addEventListener('keydown', (event) => {
    const field = event.target.closest('[data-edit-path]');
    if (!editing || !field) return;
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      field.blur();
    }
  });

  showAllButton.addEventListener('click', () => {
    showingAll = !showingAll;
    render();
  });

  editButton.addEventListener('click', () => {
    editing = !editing;
    if (editing) showingAll = true;
    render();
  });

  exportButton.addEventListener('click', () => {
    const fileText = `window.CONFERENCE_PROGRAMME = ${JSON.stringify(data, null, 2)};\n`;
    const blob = new Blob([fileText], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'programme.js';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  resetButton.addEventListener('click', () => {
    if (!window.confirm('Reset all browser edits and return to the programme stored in the repository?')) return;
    data = clone(originalData);
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    activeDay = data.days[0]?.id || '';
    render();
  });

  printButton.addEventListener('click', () => window.print());

  window.addEventListener('beforeprint', () => {
    document.querySelectorAll('[data-day-panel]').forEach((panel) => {
      panel.dataset.wasHidden = panel.hidden ? 'true' : 'false';
      panel.hidden = false;
    });
  });

  window.addEventListener('afterprint', () => {
    document.querySelectorAll('[data-day-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.wasHidden === 'true';
      delete panel.dataset.wasHidden;
    });
  });

  render();
})();
