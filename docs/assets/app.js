let current='intro', eventStep=0, repositoryChoice=0;
const collapsedGroups = new Set();

function nav() {
  document.getElementById('navigation').innerHTML = groups.map((g, gi) => `
    <section class="group">
      <button class="group-title" data-group="${gi}" aria-expanded="${!collapsedGroups.has(gi)}">${esc(g.name)}<span>−</span></button>
      <div id="group-${gi}" ${collapsedGroups.has(gi) ? 'hidden' : ''}>${g.ids.map(id => {
        const c = chapters.find(x => x.id === id);
        return `<button class="chapter ${id === current ? 'active' : ''}" data-chapter="${id}" ${id === current ? 'aria-current="page"' : ''}>${esc(c.short)}</button>`;
      }).join('')}</div>
    </section>`).join('');
  document.querySelectorAll('[data-chapter]').forEach(b => b.onclick = () => go(b.dataset.chapter));
  document.querySelectorAll('[data-group]').forEach(b => b.onclick = () => {
    const panel = document.getElementById('group-' + b.dataset.group);
    const open = panel.hidden;
    panel.hidden = !open;
    if (open) collapsedGroups.delete(Number(b.dataset.group));
    else collapsedGroups.add(Number(b.dataset.group));
    b.setAttribute('aria-expanded', open);
    b.lastElementChild.textContent = open ? '−' : '+';
  });
}

function render() {
  const c = chapters.find(x => x.id === current);
  const i = chapters.indexOf(c);
  const g = groups.find(x => x.ids.includes(current));
  document.title = c.short + ' — ns-3 / LTE';
  document.getElementById('breadcrumb').textContent = g.name;
  const quiz = c.quiz ? `<div class="quiz">
    <div class="eyebrow" style="font-size:9px">ВОПРОС ДЛЯ ПРОВЕРКИ</div>
    <h3>${esc(c.quiz.q)}</h3>
    ${c.quiz.options.map((a, j) => `<button class="quiz-option" data-answer="${j}">${String.fromCharCode(65 + j)} &nbsp; ${esc(a)}</button>`).join('')}
    <div class="quiz-answer" id="quizFeedback" aria-live="polite"></div>
  </div>` : '';
  document.getElementById('main').innerHTML = `
    <div class="chapter-meta"><span>${esc(g.name)}</span><span>ns-3.45</span></div>
    <h1 tabindex="-1">${c.title}</h1>
    <p class="lead">${esc(c.lead)}</p>
    <div class="hero-rule"><span class="tag">${esc(c.tag || 'Обзор')}</span><span>Архитектура · исходники · эксперименты</span></div>
    <div class="chapter-body">
      <article class="prose">
        ${c.sections.map((s, j) => `<section><h2 id="section-${j}">${esc(s[0])}</h2>${s[1]}</section>`).join('')}
        ${quiz}
        <div class="chapter-footer">
          <span>${i + 1} / ${chapters.length} материалов</span>
          <div class="footer-links">
            <button class="btn" id="prev" ${i === 0 ? 'disabled' : ''}>← Назад</button>
            <button class="btn" id="next" ${i === chapters.length - 1 ? 'disabled' : ''}>Дальше →</button>
          </div>
        </div>
      </article>
      <aside class="aside">
        <p class="aside-title">НА ЭТОЙ СТРАНИЦЕ</p>
        ${c.sections.map((s, j) => `<a href="#${current}/section-${j}" data-section="${j}">${esc(s[0])}</a>`).join('')}
        <div class="aside-note"><strong>Версия проекта</strong>ns-3.45</div>
      </aside>
    </div>
    <footer class="page-footer"><span>NS-3 / LTE · БАЗА ЗНАНИЙ</span><span>ОБЗОРЫ / КОД / СХЕМЫ</span></footer>`;
  document.getElementById('prev').onclick = () => go(chapters[i - 1].id);
  document.getElementById('next').onclick = () => go(chapters[i + 1].id);
  document.querySelectorAll('[data-answer]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-answer]').forEach(x => x.classList.remove('correct', 'wrong'));
    const ok = Number(b.dataset.answer) === c.quiz.correct;
    b.classList.add(ok ? 'correct' : 'wrong');
    document.getElementById('quizFeedback').textContent = (ok ? 'Верно. ' : 'Попробуйте ещё раз. ') + c.quiz.why;
  });
  document.querySelectorAll('.copy').forEach(b => b.onclick = async () => {
    const value = b.parentElement.querySelector('code').textContent;
    try {
      await navigator.clipboard.writeText(value);
      b.textContent = 'Скопировано';
    } catch {
      const sel = window.getSelection(), r = document.createRange();
      r.selectNodeContents(b.parentElement.querySelector('code'));
      sel.removeAllRanges(); sel.addRange(r);
      b.textContent = 'Выделено';
    }
    setTimeout(() => { if (b.isConnected) b.textContent = 'Копировать'; }, 1800);
  });
  document.querySelectorAll('[data-section]').forEach(a => a.onclick = e => {
    e.preventDefault();
    window.history.pushState(null, '', '#' + current + '/section-' + a.dataset.section);
    document.getElementById('section-' + a.dataset.section).scrollIntoView({ behavior: 'smooth' });
  });
  document.querySelectorAll('[data-route]').forEach(a => a.onclick = e => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(a.dataset.route);
    document.querySelector('h1').focus({ preventScroll: true });
  });
  if (current === 'intro') drawEvents();
  if (current === 'architecture') drawRepository();
}

function go(route, push = true) {
  let [id, section] = route.split('/');
  if (!chapters.some(c => c.id === id)) id = 'intro';
  current = id;
  if (push) window.history.pushState(null, '', '#' + id + (section ? '/' + section : ''));
  closeMobile(); nav(); render();
  const target = /^section-\d+$/.test(section || '') ? document.getElementById(section) : null;
  if (target) target.scrollIntoView();
  else window.scrollTo(0, 0);
}
const eventSequence = [
  { time: '0 мс', title: 'Создание пакета', text: 'Приложение на узле A создаёт пакет и начинает передачу. В очередь добавляется событие окончания передачи.' },
  { time: '1 мс', title: 'Окончание передачи', text: 'Передача 1000 байт при 8 Мбит/с заняла 1 мс. До получателя пакет ещё проходит канал.' },
  { time: '3 мс', title: 'Приём на узле B', text: 'Прошло ещё 2 мс задержки распространения. Обработчик приёма передаёт данные следующим компонентам.' },
  { time: '3 мс', title: 'Получение приложением', text: 'В упрощённой схеме дополнительной задержки обработки нет: следующее действие происходит в тот же момент модельного времени.' },
];

function drawEvents() {
  const item = eventSequence[eventStep];
  document.getElementById('eventLab').innerHTML = `
    <div class="lab">
      <div class="lab-head"><span>ПРИМЕР ПОСЛЕДОВАТЕЛЬНОСТИ СОБЫТИЙ</span><span class="tiny">${eventStep + 1} / ${eventSequence.length}</span></div>
      <ol class="event-timeline">${eventSequence.map((event, i) => `
        <li class="${i === eventStep ? 'current' : i < eventStep ? 'past' : ''}">
          <span>${esc(event.time)}</span><span>${esc(event.title)}</span>
        </li>`).join('')}</ol>
      <div class="event-explanation" aria-live="polite"><strong>${esc(item.time)} · ${esc(item.title)}</strong><p>${esc(item.text)}</p></div>
      <div class="lab-controls"><button class="btn primary" id="eventNext">${eventStep === eventSequence.length - 1 ? 'Повторить' : 'Следующее событие →'}</button><button class="btn" id="eventReset">Сначала</button></div>
      <p class="lab-caption">Учебная схема: 1000 байт, 8 Мбит/с, задержка 2 мс. Заголовки и другие задержки опущены. Эта демонстрация в браузере не запускает ns-3.</p>
    </div>`;
  document.getElementById('eventNext').onclick = () => { eventStep = (eventStep + 1) % eventSequence.length; drawEvents(); };
  document.getElementById('eventReset').onclick = () => { eventStep = 0; drawEvents(); };
}

function drawRepository() {
  const item = repositoryEntries[repositoryChoice];
  document.getElementById('repositoryLab').innerHTML = `
    <div class="repository-browser">
      <div class="repository-tree" role="group" aria-label="Каталоги репозитория">
        <div class="repository-root">ns-3-dev-git/</div>
        ${repositoryEntries.map((entry, i) => `<button class="repository-entry ${i === repositoryChoice ? 'selected' : ''}" data-directory="${i}" aria-pressed="${i === repositoryChoice}"><span aria-hidden="true">▱</span> ${esc(entry.path)}</button>`).join('')}
      </div>
      <div class="repository-description" aria-live="polite">
        <span class="tag">${esc(item.kind)}</span>
        <h3>${esc(item.path)}</h3>
        <strong>${esc(item.title)}</strong>
        <p>${esc(item.text)}</p>
        <pre><code>${esc(item.example)}</code></pre>
        <p class="repository-hint">${esc(item.next)}</p>
      </div>
    </div>`;
  document.querySelectorAll('[data-directory]').forEach(button => button.onclick = () => {
    repositoryChoice = Number(button.dataset.directory); drawRepository();
    document.querySelector(`[data-directory="${repositoryChoice}"]`).focus({ preventScroll: true });
  });
}

function closeMobile(){document.getElementById('sidebar').classList.remove('open');document.getElementById('overlay').classList.remove('open');document.getElementById('menu').setAttribute('aria-expanded','false');}
document.getElementById('menu').onclick=()=>{const on=document.getElementById('sidebar').classList.toggle('open');document.getElementById('overlay').classList.toggle('open',on);document.getElementById('menu').setAttribute('aria-expanded',on);};document.getElementById('overlay').onclick=closeMobile;
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobile();
});
window.addEventListener('popstate', () => go(location.hash.slice(1) || 'intro', false));
go(location.hash.slice(1) || 'intro', false);
