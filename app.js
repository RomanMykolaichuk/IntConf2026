(() => {
  const data = window.CONFERENCE_PROGRAMME;
  if (!data || !Array.isArray(data.days)) {
    document.body.innerHTML = '<main class="fatal-error">Programme data could not be loaded.</main>';
    return;
  }

  const root = document.getElementById('programme-root');
  const tabs = document.getElementById('day-tabs');
  const meta = document.getElementById('conference-meta');
  const printButton = document.getElementById('print-programme');
  const showAllButton = document.getElementById('show-all');

  let activeDay = data.days[0].id;
  let showingAll = false;

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const decorateDraft = (text) => {
    const safe = escapeHtml(text);
    return safe.replace(/\b(TBC|TBA|TBD)\b/g, '<span class="draft-token">$1</span>');
  };

  const renderConferenceMeta = () => {
    const c = data.conference;
    meta.innerHTML = `
      <span>${escapeHtml(c.dateLabel)}</span>
      <span>${escapeHtml(c.placeLabel)}</span>
      <span class="status-pill">${escapeHtml(c.status)}</span>
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

  const renderMeta = (items = []) => {
    if (!items.length) return '';
    return `<dl class="day-meta">${items.map((item) => `
      <div><dt>${escapeHtml(item.label)}</dt><dd>${decorateDraft(item.value)}</dd></div>
    `).join('')}</dl>`;
  };

  const renderItem = (item) => `
    <article class="programme-item">
      <div class="programme-item__time">${decorateDraft(item.time || '—')}</div>
      <div class="programme-item__main">
        <h4>${decorateDraft(item.activity)}</h4>
        ${item.topic ? `<p class="programme-item__topic">${decorateDraft(item.topic)}</p>` : ''}
      </div>
      <div class="programme-item__remarks">${item.remarks ? decorateDraft(item.remarks) : '<span class="muted">—</span>'}</div>
    </article>
  `;

  const renderSection = (section) => `
    <section class="programme-section programme-section--${escapeHtml(section.type || 'standard')}">
      <div class="programme-section__heading">
        <h3>${decorateDraft(section.title)}</h3>
      </div>
      <div class="programme-table" role="table" aria-label="${escapeHtml(section.title)}">
        <div class="programme-table__head" role="row">
          <span role="columnheader">Time</span>
          <span role="columnheader">Activity</span>
          <span role="columnheader">Remarks / Speaker</span>
        </div>
        ${section.items.map(renderItem).join('')}
      </div>
    </section>
  `;

  const renderDay = (day) => `
    <section class="day-panel" id="${escapeHtml(day.id)}" data-day-panel="${escapeHtml(day.id)}" ${!showingAll && day.id !== activeDay ? 'hidden' : ''}>
      <header class="day-header">
        <div>
          <p class="kicker">${escapeHtml(day.date)}</p>
          <h2>${escapeHtml(day.title)}</h2>
        </div>
        ${renderMeta(day.meta)}
      </header>
      <div class="day-sections">
        ${day.sections.map(renderSection).join('')}
      </div>
    </section>
  `;

  const render = () => {
    renderConferenceMeta();
    renderTabs();
    root.innerHTML = data.days.map(renderDay).join('');
    showAllButton.textContent = showingAll ? 'Show one day' : 'Show all days';
    showAllButton.setAttribute('aria-pressed', showingAll ? 'true' : 'false');
  };

  showAllButton.addEventListener('click', () => {
    showingAll = !showingAll;
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
